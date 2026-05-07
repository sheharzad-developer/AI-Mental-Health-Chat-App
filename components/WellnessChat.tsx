"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Role = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  crisis?: boolean;
};

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: `Acknowledgment:
I'm glad you're here—this is a calm space to share what's on your mind without judgment.

Insight:
I'm not a clinician—think of me as a steady companion for everyday emotional wellness, not a substitute for professional care.

Suggestion:
If it feels okay, you might take one slow breath and notice one neutral detail around you—a color, a sound, or the feeling of your feet on the floor.

Follow-up:
How are you feeling today, in a few honest words?`,
};

const SECTION_HEADINGS = [
  "Acknowledgment",
  "Insight",
  "Suggestion",
  "Follow-up",
] as const;

const HEADING_SET = new Set<string>(SECTION_HEADINGS);

// Match a heading line in any of these formats:
//   Acknowledgment:        body
//   Acknowledgment
//   **Acknowledgment**
//   ## Acknowledgment
//   - **Acknowledgment:**
function matchHeading(line: string): { heading: string; rest: string } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Strip markdown noise: leading ##, ###, *, -, **, __
  const stripped = trimmed
    .replace(/^[#*_\-\s]+/, "")
    .replace(/[*_]+$/, "")
    .trim();

  for (const heading of SECTION_HEADINGS) {
    // Match the heading word optionally followed by a colon, then any rest of the line
    const regex = new RegExp(`^${heading.replace("-", "\\-")}\\s*:?\\s*(.*)$`, "i");
    const m = stripped.match(regex);
    if (m) {
      return { heading, rest: m[1].trim() };
    }
  }
  return null;
}

function parseWellnessFormat(content: string): Array<{ heading: string; body: string }> | null {
  const lines = content.split("\n");
  const sections: Array<{ heading: string; body: string }> = [];
  let currentHeading: string | null = null;
  let currentBody: string[] = [];

  const flush = () => {
    if (currentHeading !== null) {
      const body = currentBody.join("\n").trim();
      sections.push({ heading: currentHeading, body });
      currentBody = [];
    }
  };

  for (const line of lines) {
    const m = matchHeading(line);
    if (m) {
      flush();
      currentHeading = m.heading;
      if (m.rest) currentBody.push(m.rest);
    } else if (currentHeading !== null) {
      currentBody.push(line);
    }
  }
  flush();

  const looksStructured =
    sections.length >= 2 && sections.every((s) => HEADING_SET.has(s.heading));
  if (!looksStructured) return null;
  return sections;
}

function FormattedBubbleContent({
  content,
  crisis,
}: {
  content: string;
  crisis?: boolean;
}) {
  const sections = parseWellnessFormat(content);
  if (!sections) {
    return (
      <p className="text-[0.9375rem] leading-[1.65] whitespace-pre-wrap break-words text-stone-700 dark:text-stone-200">
        {content}
      </p>
    );
  }

  const labelClass = crisis
    ? "text-amber-800/95 dark:text-amber-200/95"
    : "text-teal-800/90 dark:text-teal-200/85";

  return (
    <div className="space-y-5">
      {sections.map((s, i) => (
        <div key={i} className="relative pl-3.5">
          <span
            className={`absolute left-0 top-1.5 h-[calc(100%-0.375rem)] w-0.5 rounded-full ${crisis ? "bg-amber-400/80 dark:bg-amber-500/60" : "bg-teal-500/50 dark:bg-teal-400/45"}`}
            aria-hidden
          />
          <p
            className={`mb-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${labelClass}`}
          >
            {s.heading}
          </p>
          <p className="text-[0.9375rem] leading-[1.65] whitespace-pre-wrap break-words text-stone-700 dark:text-stone-200">
            {s.body}
          </p>
        </div>
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  return (
    <div
      className={`group flex w-full gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      role="article"
      aria-label={isUser ? "You said" : "Companion replied"}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-semibold shadow-sm ring-1 ring-black/5 dark:ring-white/10 ${
          isUser
            ? "bg-gradient-to-br from-teal-600 to-emerald-800 text-white"
            : msg.crisis
              ? "bg-gradient-to-br from-amber-400 to-orange-500 text-amber-950"
              : "bg-gradient-to-br from-stone-100 to-stone-200 text-stone-600 dark:from-stone-700 dark:to-stone-800 dark:text-stone-200"
        }`}
        aria-hidden
      >
        {isUser ? "You" : msg.crisis ? "!" : "◆"}
      </div>
      <div className={`flex min-w-0 max-w-[min(100%,32rem)] flex-col ${isUser ? "items-end" : "items-start"}`}>
        <span className="mb-1.5 block text-[0.7rem] font-medium tracking-wide text-stone-500 dark:text-stone-400">
          {isUser ? "You" : msg.crisis ? "Important" : "Companion"}
        </span>
        <div
          className={`w-full rounded-2xl px-4 py-3.5 shadow-md ring-1 transition-shadow duration-300 ${
            isUser
              ? "bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-900 text-white shadow-teal-900/15 ring-teal-950/20 dark:shadow-teal-950/25"
              : msg.crisis
                ? "border border-amber-300/60 bg-gradient-to-b from-amber-50/95 to-orange-50/90 text-stone-900 shadow-amber-900/10 ring-amber-200/50 dark:border-amber-500/35 dark:from-amber-950/50 dark:to-orange-950/40 dark:text-stone-50 dark:ring-amber-700/30"
                : "bg-[var(--chat-bot-bg)] text-[var(--chat-bot-fg)] shadow-stone-900/5 ring-stone-900/[0.06] backdrop-blur-md dark:shadow-black/30 dark:ring-white/[0.07]"
          }`}
        >
          {isUser ? (
            <p className="text-[0.9375rem] leading-[1.65] whitespace-pre-wrap break-words text-white/95">
              {msg.content}
            </p>
          ) : (
            <FormattedBubbleContent content={msg.content} crisis={msg.crisis} />
          )}
        </div>
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-3 px-1" aria-busy="true" aria-label="Companion is thinking">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-stone-200/90 text-stone-500 shadow-sm ring-1 ring-black/5 dark:bg-stone-700/90 dark:text-stone-300 dark:ring-white/10">
        ◆
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-[var(--chat-bot-bg)] px-4 py-3 shadow-md ring-1 ring-stone-900/[0.06] backdrop-blur-md dark:ring-white/[0.07]">
        <span className="text-sm text-stone-500 dark:text-stone-400">Thinking</span>
        <span className="flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-teal-500/80 dark:bg-teal-400/80"
              style={{
                animation: `wellness-dot 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

type WellnessChatProps = {
  initialChatId?: string | null;
  initialMessages?: { role: "user" | "assistant"; content: string; crisis?: boolean }[];
};

export function WellnessChat({ initialChatId = null, initialMessages = [] }: WellnessChatProps = {}) {
  const seedMessages: ChatMessage[] =
    initialMessages.length > 0
      ? initialMessages.map((m) => ({
          id: crypto.randomUUID(),
          role: m.role,
          content: m.content,
          crisis: m.crisis,
        }))
      : [WELCOME];

  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [chatId, setChatId] = useState<string | null>(initialChatId);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Skip the WELCOME message when sending to API (it's UI-only).
      const payload = [...messages, userMsg]
        .filter((m) => m.id !== "welcome")
        .map(({ role, content }) => ({ role, content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload, chatId }),
      });
      const data = (await res.json()) as {
        message?: string;
        crisis?: boolean;
        error?: string;
        chatId?: string | null;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }
      const reply = data.message;
      if (!reply) {
        throw new Error("No reply from server");
      }

      // If this was a new chat, the server created one — update local state and URL
      if (!chatId && data.chatId) {
        setChatId(data.chatId);
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", `/chat?id=${data.chatId}`);
        }
      }

      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
          crisis: Boolean(data.crisis),
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, chatId]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-stone-50 dark:bg-stone-950">
      {/* Header — full width, internal max-w content */}
      <header className="relative z-10 shrink-0 border-b border-stone-200 bg-white pt-[calc(3rem+env(safe-area-inset-top))] dark:border-stone-800 dark:bg-stone-950 lg:pt-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 pb-3 sm:px-6 sm:pb-4">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-teal-700/80 dark:text-teal-300/80">
              Wellness
            </p>
            <h1 className="text-lg font-semibold tracking-tight text-stone-900 sm:text-xl dark:text-stone-50">
              Companion
            </h1>
          </div>
          <span className="hidden rounded-full bg-teal-600/10 px-3 py-1 text-[0.7rem] font-medium text-teal-800 sm:inline-block dark:bg-teal-500/15 dark:text-teal-200">
            Supportive · Not clinical
          </span>
        </div>
      </header>

      {/* Messages — full width with internally constrained content */}
      <div
        className="relative z-10 min-h-0 flex-1 overflow-y-auto"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:px-6">
          {messages.map((m) => (
            <MessageBubble key={m.id} msg={m} />
          ))}
          {loading && <ThinkingIndicator />}
          <div ref={bottomRef} className="h-2 shrink-0" />
        </div>
      </div>

      {error && (
        <div
          className="relative z-10 mx-auto w-full max-w-3xl px-4 sm:px-6"
          role="alert"
        >
          <div className="mb-2 rounded-xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm leading-snug text-red-900 shadow-sm dark:border-red-900/50 dark:bg-red-950/55 dark:text-red-100">
            {error}
          </div>
        </div>
      )}

      {/* Input — full-width bar, internally constrained */}
      <div className="relative z-10 shrink-0 border-t border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950">
        <div className="mx-auto max-w-3xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pt-4">
          <label htmlFor="wellness-input" className="sr-only">
            Your message
          </label>
          <textarea
            id="wellness-input"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Share what's on your mind…"
            className="w-full resize-none rounded-2xl border border-stone-200/90 bg-white/90 px-4 py-3 text-[0.9375rem] text-stone-900 shadow-inner outline-none ring-0 placeholder:text-stone-400 transition-[border-color,box-shadow] focus:border-teal-500/70 focus:shadow-[0_0_0_3px_rgba(13,148,136,0.2)] dark:border-stone-600/80 dark:bg-stone-900/80 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-teal-400/60 dark:focus:shadow-[0_0_0_3px_rgba(45,212,191,0.15)]"
            disabled={loading}
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p className="hidden text-[0.7rem] text-stone-500 sm:block dark:text-stone-500">
              <kbd className="rounded border border-stone-300/80 bg-stone-100/80 px-1.5 py-0.5 font-mono text-[0.65rem] dark:border-stone-600 dark:bg-stone-800">
                Enter
              </kbd>{" "}
              to send ·{" "}
              <kbd className="rounded border border-stone-300/80 bg-stone-100/80 px-1.5 py-0.5 font-mono text-[0.65rem] dark:border-stone-600 dark:bg-stone-800">
                Shift+Enter
              </kbd>{" "}
              new line
            </p>
            <button
              type="button"
              onClick={() => void send()}
              disabled={loading || !input.trim()}
              className="ml-auto inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-600 to-emerald-700 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition-[transform,opacity,box-shadow] hover:shadow-xl hover:shadow-teal-900/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 dark:from-teal-500 dark:to-emerald-600 dark:shadow-black/40"
            >
              Send
              <svg className="h-4 w-4 opacity-90" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-center text-[0.65rem] text-stone-500 dark:text-stone-500">
            If you&apos;re struggling with self-harm or suicidal thoughts, please reach out to a crisis
            line or emergency services where you live.
          </p>
        </div>
      </div>
    </div>
  );
}
