import { GoogleGenerativeAI, type Content } from "@google/generative-ai";
import { traceable } from "langsmith/traceable";
import { WELLNESS_SYSTEM_PROMPT } from "@/lib/wellness-system-prompt";

type ChatMessage = { role: "user" | "assistant"; content: string };

// LangSmith tracing is opt-in via env. When LANGSMITH_TRACING !== "true" or
// LANGSMITH_API_KEY is unset, `traceable` becomes a thin pass-through and no
// data leaves the process. When enabled, full user + assistant messages are
// shipped to smith.langchain.com — make sure that's compatible with the
// wellness app's privacy posture before turning it on in production.

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

async function runGeminiChatInner(
  apiKey: string,
  modelName: string,
  messages: ChatMessage[],
): Promise<string> {
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

export const runGeminiChat = traceable(runGeminiChatInner, {
  name: "gemini.chat",
  run_type: "llm",
  processInputs: redactApiKey,
}) as typeof runGeminiChatInner;

async function* streamGeminiChatInner(
  apiKey: string,
  modelName: string,
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const { systemInstruction, history, lastUserText } = buildGeminiTurns(messages);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
  const chat = model.startChat({
    history,
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
  });

  const result = await chat.sendMessageStream(lastUserText);
  for await (const chunk of result.stream) {
    const t = chunk.text();
    if (t) yield t;
  }
}

export const streamGeminiChat = traceable(streamGeminiChatInner, {
  name: "gemini.stream",
  run_type: "llm",
  processInputs: redactApiKey,
  aggregator: (chunks: string[]) => chunks.join(""),
}) as typeof streamGeminiChatInner;

// Strip the Gemini apiKey before LangSmith ships inputs to its servers.
// The wrapped functions are called with positional args (apiKey, modelName,
// messages), so LangSmith's default input shape is { args: [...] }.
function redactApiKey(inputs: { args?: unknown[] } | Record<string, unknown>) {
  if ("args" in inputs && Array.isArray(inputs.args)) {
    const [, modelName, messages] = inputs.args as [unknown, string, ChatMessage[]];
    return { modelName, messages };
  }
  return inputs as Record<string, unknown>;
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

/**
 * Streaming variant of the fallback ladder. Falls back to the next model only
 * if the failure happens before any token has been yielded — once we've started
 * streaming to the client, mid-stream errors are propagated.
 */
export async function* streamGeminiChatWithFallback(
  apiKey: string,
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const primary = process.env.GEMINI_MODEL?.trim() || GEMINI_DEFAULT_MODEL;
  const fromEnv = (process.env.GEMINI_FALLBACK_MODELS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const ordered = [primary, ...fromEnv, ...DEFAULT_FALLBACK_MODELS];
  const models = [...new Set(ordered)];

  let lastError: Error | undefined;

  for (const modelName of models) {
    let yielded = false;
    try {
      for await (const chunk of streamGeminiChat(apiKey, modelName, messages)) {
        yielded = true;
        yield chunk;
      }
      if (yielded) return;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      lastError = err;
      if (yielded) throw err;
      if (!isQuotaOrRateLimitError(err.message)) throw err;
    }
  }

  throw new Error(
    lastError?.message ??
      "All Gemini models failed. Check quota at https://ai.google.dev/gemini-api/docs/rate-limits — you may need to wait, pick another model via GEMINI_MODEL, enable billing, or use OPENAI_API_KEY as fallback.",
  );
}
