import { randomUUID } from "node:crypto";
import { EventType } from "@ag-ui/core";
import OpenAI from "openai";
import { auth } from "@/auth";
import { appendMessage, createChat } from "@/lib/chats";
import { CRISIS_RESPONSE, mayIndicateAcuteRisk } from "@/lib/crisis";
import { streamGeminiChatWithFallback } from "@/lib/gemini-chat";
import { WELLNESS_SYSTEM_PROMPT } from "@/lib/wellness-system-prompt";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

// Loose superset of AG-UI's RunAgentInputSchema. We don't run zod validation
// here because we control both sides and the official schema requires every
// message to carry an id we don't strictly need server-side. Tighten this up
// (or switch to RunAgentInputSchema.parse) once the route is exposed to
// third-party AG-UI clients.
type RunAgentInputLite = {
  threadId?: string;
  runId?: string;
  messages: Array<{ id?: string; role: "user" | "assistant"; content: string }>;
  state?: { chatId?: string | null } | null;
};

type AgUiEvent = { type: EventType; [k: string]: unknown };

const encodeSse = (event: AgUiEvent): string =>
  `data: ${JSON.stringify({ ...event, timestamp: new Date().toISOString() })}\n\n`;

async function* streamReply(
  messages: ChatMessage[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    for await (const delta of streamGeminiChatWithFallback(geminiKey, messages)) {
      if (signal?.aborted) return;
      yield delta;
    }
    return;
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const openai = new OpenAI({ apiKey: openaiKey });
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    const stream = await openai.chat.completions.create(
      {
        model,
        temperature: 0.7,
        max_completion_tokens: 2048,
        stream: true,
        messages: [{ role: "system", content: WELLNESS_SYSTEM_PROMPT }, ...messages],
      },
      { signal },
    );
    for await (const part of stream) {
      if (signal?.aborted) return;
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
  let input: RunAgentInputLite;
  try {
    input = (await req.json()) as RunAgentInputLite;
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
  const reqSignal = req.signal;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AgUiEvent) => {
        controller.enqueue(encoder.encode(encodeSse(event)));
      };

      // Defeat Next.js dev-server / proxy buffering: an SSE comment line of
      // padding forces the response past most intermediate write buffers so
      // subsequent small events flush immediately instead of accumulating.
      controller.enqueue(encoder.encode(`: ${" ".repeat(2048)}\n\n`));

      const messageId = randomUUID();

      try {
        send({ type: EventType.RUN_STARTED, threadId, runId });

        // Crisis short-circuit. Emit a CUSTOM event first so the client can
        // mark the upcoming assistant message as crisis-styled, then deliver
        // the canned response as a single chunk.
        if (userText && mayIndicateAcuteRisk(userText)) {
          send({
            type: EventType.CUSTOM,
            name: "crisis_detected",
            value: { messageId, showResources: true },
          });
          send({
            type: EventType.TEXT_MESSAGE_CHUNK,
            messageId,
            role: "assistant",
            delta: CRISIS_RESPONSE,
          });
          send({ type: EventType.RUN_FINISHED, threadId, runId });
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
            send({ type: EventType.STATE_SNAPSHOT, snapshot: { chatId } });
          } catch (e) {
            console.error("[chat-persist] createChat failed:", e);
          }
        }

        send({ type: EventType.TEXT_MESSAGE_START, messageId, role: "assistant" });
        let buffered = "";

        // Defensive strip: the wellness prompt forbids the model from echoing
        // its internal mode-selection ("Word count: …", "Mode: A", "Step 1:")
        // but Gemini occasionally leaks it. Buffer the very first bytes until
        // we either match-and-trim such a prefix or accumulate enough actual
        // content to be sure no leak is coming.
        const META_PREFIX_RE =
          /^\s*(?:Word\s*count\s*:[^\n]*\n+\s*)?(?:Mode\s*:[^\n]*\n+\s*)?(?:Step\s*\d+[^\n]*\n+\s*)*/i;
        let prefixHandled = false;
        let pendingPrefix = "";

        const emitContent = (text: string) => {
          if (!text) return;
          buffered += text;
          send({ type: EventType.TEXT_MESSAGE_CONTENT, messageId, delta: text });
        };

        for await (const delta of streamReply(sanitized, reqSignal)) {
          if (reqSignal.aborted) break;

          if (prefixHandled) {
            emitContent(delta);
            continue;
          }

          pendingPrefix += delta;
          const match = pendingPrefix.match(META_PREFIX_RE);
          const stripped = match ? pendingPrefix.slice(match[0].length) : pendingPrefix;

          // Only flush once we have real content after any meta prefix, or
          // once the buffer exceeds a safety cap (no leak in sight, just
          // unusually slow first chunk).
          if (stripped.trim().length > 0 || pendingPrefix.length > 256) {
            emitContent(stripped);
            prefixHandled = true;
            pendingPrefix = "";
          }
        }

        // Flush any remaining buffered prefix (e.g. reply was only the meta
        // itself, which we'd rather show as fallback than swallow silently).
        if (!prefixHandled && pendingPrefix) {
          emitContent(pendingPrefix);
        }

        send({ type: EventType.TEXT_MESSAGE_END, messageId });

        // Client disconnected mid-stream — skip finalization and persistence;
        // we can't deliver anything further, and a half-completed reply isn't
        // worth saving.
        if (reqSignal.aborted) {
          controller.close();
          return;
        }

        if (!buffered.trim()) {
          send({
            type: EventType.RUN_ERROR,
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

        send({ type: EventType.RUN_FINISHED, threadId, runId });
      } catch (e) {
        // Aborts surface as exceptions through the OpenAI SDK; swallow them.
        if (reqSignal.aborted) {
          // no-op
        } else {
          const message = e instanceof Error ? e.message : "Chat request failed";
          send({ type: EventType.RUN_ERROR, threadId, runId, message });
        }
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
