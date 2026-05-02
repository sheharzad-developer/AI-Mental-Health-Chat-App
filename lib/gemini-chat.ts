import { GoogleGenerativeAI, type Content } from "@google/generative-ai";
import { WELLNESS_SYSTEM_PROMPT } from "@/lib/wellness-system-prompt";

type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Gemini chat history must start with a user turn. Leading assistant messages
 * (e.g. a welcome bubble) are folded into the system instruction.
 */
function buildGeminiTurns(messages: ChatMessage[]): {
  systemInstruction: string;
  history: Content[];
  lastUserText: string;
} {
  let i = 0;
  const assistantPreamble: string[] = [];
  while (i < messages.length && messages[i].role === "assistant") {
    assistantPreamble.push(messages[i].content);
    i++;
  }

  const preamble =
    assistantPreamble.length > 0
      ? `\n\nPrior companion messages already shown in the app (continue consistently):\n${assistantPreamble.join("\n---\n")}`
      : "";

  const rest = messages.slice(i);
  const last = rest[rest.length - 1];
  if (!last || last.role !== "user") {
    throw new Error("Last message must be from the user");
  }

  const prior = rest.slice(0, -1);
  const history: Content[] = prior.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  return {
    systemInstruction: WELLNESS_SYSTEM_PROMPT + preamble,
    history,
    lastUserText: last.content,
  };
}

export async function runGeminiChat(apiKey: string, modelName: string, messages: ChatMessage[]): Promise<string> {
  const { systemInstruction, history, lastUserText } = buildGeminiTurns(messages);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
  });

  const chat = model.startChat({
    history,
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
  });

  const result = await chat.sendMessage(lastUserText);
  const text = result.response.text()?.trim();
  if (!text) {
    throw new Error("Empty Gemini response");
  }
  return text;
}

/** Default first: higher free-tier daily limits than gemini-2.0-flash for many projects. */
export const GEMINI_DEFAULT_MODEL = "gemini-2.5-flash-lite";

const DEFAULT_FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
] as const;

function isQuotaOrRateLimitError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("429") ||
    m.includes("too many requests") ||
    m.includes("quota") ||
    m.includes("resource exhausted") ||
    m.includes("rate limit")
  );
}

/**
 * Tries the primary model, then fallbacks on quota/rate-limit errors so one
 * exhausted free-tier model does not block the whole app.
 */
export async function runGeminiChatWithFallback(apiKey: string, messages: ChatMessage[]): Promise<string> {
  const primary = process.env.GEMINI_MODEL?.trim() || GEMINI_DEFAULT_MODEL;
  const fromEnv = (process.env.GEMINI_FALLBACK_MODELS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const ordered = [primary, ...fromEnv, ...DEFAULT_FALLBACK_MODELS];
  const models = [...new Set(ordered)];

  let lastError: Error | undefined;

  for (const modelName of models) {
    try {
      return await runGeminiChat(apiKey, modelName, messages);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      lastError = err;
      if (isQuotaOrRateLimitError(err.message)) {
        continue;
      }
      throw err;
    }
  }

  throw new Error(
    lastError?.message ??
      "All Gemini models failed. Check quota at https://ai.google.dev/gemini-api/docs/rate-limits — you may need to wait, pick another model via GEMINI_MODEL, enable billing, or use OPENAI_API_KEY as fallback.",
  );
}
