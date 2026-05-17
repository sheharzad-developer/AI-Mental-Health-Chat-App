import { randomUUID } from "node:crypto";
import OpenAI from "openai";
import { auth } from "@/auth";
import { appendMessage, createChat } from "@/lib/chats";
import { CRISIS_RESPONSE, mayIndicateAcuteRisk } from "@/lib/crisis";
import { streamGeminiChatWithFallback } from "@/lib/gemini-chat";
import { WELLNESS_SYSTEM_PROMPT } from "@/lib/wellness-system-prompt";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

type RunAgentInput = {
  threadId?: string;
  runId?: string;
  messages: Array<{ id?: string; role: "user" | "assistant"; content: string }>;
  state?: { chatId?: string | null } | null;
  tools?: unknown[];
  context?: unknown[];
  forwardedProps?: Record<string, unknown>;
};

type AgUiEvent = { type: string; [k: string]: unknown };

const encodeSse = (event: AgUiEvent): string =>
  `data: ${JSON.stringify({ ...event, timestamp: new Date().toISOString() })}\n\n`;

async function* streamReply(messages: ChatMessage[]): AsyncGenerator<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    yield* streamGeminiChatWithFallback(geminiKey, messages);
    return;
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const openai = new OpenAI({ apiKey: openaiKey });
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    const stream = await openai.chat.completions.create({
      model,
      temperature: 0.7,
      max_completion_tokens: 2048,
      stream: true,
      messages: [{ role: "system", content: WELLNESS_SYSTEM_PROMPT }, ...messages],
    });
    for await (const part of stream) {
      const delta = part.choices[0]?.delta?.content;
      if (delta) yield delta;
    }
    return;
  }

  throw new Error(
    "Server missing GEMINI_API_KEY or OPENAI_API_KEY. Add one to .env to enable chat.",
  );
}

export async function POST(req: Request) {
  let input: RunAgentInput;
  try {
    input = (await req.json()) as RunAgentInput;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = Array.isArray(input.messages) ? input.messages : [];
  if (messages.length === 0) {
    return Response.json({ error: "messages[] required" }, { status: 400 });
  }

  const threadId = input.threadId ?? randomUUID();
  const runId = input.runId ?? randomUUID();
  const initialChatId = input.state?.chatId ?? null;

  const sanitized: ChatMessage[] = messages
    .filter(
      (m): m is { id?: string; role: "user" | "assistant"; content: string } =>
        (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, 12000) }));

  const last = sanitized[sanitized.length - 1];
  const userText = last?.role === "user" ? last.content : "";

  const session = await auth();
  const email = session?.user?.email ?? null;

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AgUiEvent) => {
        controller.enqueue(encoder.encode(encodeSse(event)));
      };

      const messageId = randomUUID();

      try {
        send({ type: "RUN_STARTED", threadId, runId });

        // Crisis short-circuit. Emit a CUSTOM event first so the client can
        // mark the upcoming assistant message as crisis-styled, then deliver
        // the canned response as a single chunk.
        if (userText && mayIndicateAcuteRisk(userText)) {
          send({
            type: "CUSTOM",
            name: "crisis_detected",
            value: { messageId, showResources: true },
          });
          send({
            type: "TEXT_MESSAGE_CHUNK",
            messageId,
            role: "assistant",
            delta: CRISIS_RESPONSE,
          });
          send({ type: "RUN_FINISHED", threadId, runId });
          controller.close();
          return;
        }

        // Resolve or create the persistent chat row for signed-in users, and
        // surface the resulting id as shared state so the client can sync.
        let chatId = initialChatId;
        if (email && !chatId) {
          try {
            const chat = await createChat(email, userText);
            chatId = chat.id;
            send({ type: "STATE_SNAPSHOT", snapshot: { chatId } });
          } catch (e) {
            console.error("[chat-persist] createChat failed:", e);
          }
        }

        send({ type: "TEXT_MESSAGE_START", messageId, role: "assistant" });
        let buffered = "";
        for await (const delta of streamReply(sanitized)) {
          buffered += delta;
          send({ type: "TEXT_MESSAGE_CONTENT", messageId, delta });
        }
        send({ type: "TEXT_MESSAGE_END", messageId });

        if (!buffered.trim()) {
          send({
            type: "RUN_ERROR",
            threadId,
            runId,
            message: "Empty model response",
          });
          controller.close();
          return;
        }

        // Persist after the run; failures non-fatal as before.
        if (email && chatId) {
          try {
            if (userText) await appendMessage(chatId, "user", userText);
            await appendMessage(chatId, "assistant", buffered);
          } catch (e) {
            console.error("[chat-persist] append failed:", e);
          }
        }

        send({ type: "RUN_FINISHED", threadId, runId });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Chat request failed";
        send({ type: "RUN_ERROR", threadId, runId, message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
