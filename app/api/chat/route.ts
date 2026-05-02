import OpenAI from "openai";
import { CRISIS_RESPONSE, mayIndicateAcuteRisk } from "@/lib/crisis";
import { runGeminiChatWithFallback } from "@/lib/gemini-chat";
import { WELLNESS_SYSTEM_PROMPT } from "@/lib/wellness-system-prompt";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = (body as { messages?: ChatMessage[] }).messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages[] required" }, { status: 400 });
  }

  const last = messages[messages.length - 1];
  if (last?.role === "user" && typeof last.content === "string" && mayIndicateAcuteRisk(last.content)) {
    return Response.json({ message: CRISIS_RESPONSE, crisis: true });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    return Response.json(
      {
        error:
          "Server missing GEMINI_API_KEY or OPENAI_API_KEY. Add one to .env.local to enable chat.",
      },
      { status: 503 },
    );
  }

  const sanitized: ChatMessage[] = messages
    .filter(
      (m): m is ChatMessage =>
        (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, 12000) }));

  try {
    let text: string;

    if (geminiKey) {
      text = await runGeminiChatWithFallback(geminiKey, sanitized);
    } else {
      const openai = new OpenAI({ apiKey: openaiKey! });
      const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
      const completion = await openai.chat.completions.create({
        model,
        temperature: 0.7,
        max_completion_tokens: 2048,
        messages: [{ role: "system", content: WELLNESS_SYSTEM_PROMPT }, ...sanitized],
      });
      const t = completion.choices[0]?.message?.content?.trim();
      if (!t) {
        return Response.json({ error: "Empty model response" }, { status: 502 });
      }
      text = t;
    }

    return Response.json({ message: text, crisis: false });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chat request failed";
    return Response.json({ error: msg }, { status: 502 });
  }
}
