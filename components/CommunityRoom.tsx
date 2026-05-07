"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { sendMessage } from "@/app/community/actions";
import { getSupabaseBrowser, type Message } from "@/lib/supabase";

type Props = {
  initialMessages: Message[];
  currentUserEmail: string;
};

export function CommunityRoom({ initialMessages, currentUserEmail }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const content = draft;
    setDraft("");
    startTransition(async () => {
      const res = await sendMessage(content);
      if (res?.error) {
        setError(res.error);
        setDraft(content);
      }
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Title bar */}
      <div className="shrink-0 border-b border-stone-200/60 bg-white/40 px-4 py-3 backdrop-blur dark:border-stone-800/60 dark:bg-stone-900/30 sm:px-6 sm:py-4">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-base font-bold text-stone-900 sm:text-lg dark:text-stone-100">
            Community Room
          </h1>
          <p className="mt-0.5 text-xs text-stone-600 sm:text-sm dark:text-stone-400">
            A supportive space. Be kind — there are real people on the other side.
          </p>
        </div>
      </div>

      {/* Messages — scrollable */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:gap-4">
          {messages.length === 0 && (
            <p className="text-center text-sm text-stone-500 dark:text-stone-400">
              No messages yet. Be the first to share.
            </p>
          )}
          {messages.map((m) => {
            const mine = m.user_email === currentUserEmail;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                <span className="mb-1 px-1 text-[0.7rem] text-stone-500 dark:text-stone-400">
                  {m.user_name || m.user_email.split("@")[0]}
                </span>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm sm:max-w-[80%] ${
                    mine
                      ? "bg-teal-600 text-white"
                      : "bg-white text-stone-800 ring-1 ring-stone-200 dark:bg-stone-900 dark:text-stone-100 dark:ring-stone-800"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input — extra bottom padding on mobile to clear the tab bar */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-stone-200 bg-white/80 px-3 pb-[calc(env(safe-area-inset-bottom)+4.75rem)] pt-3 backdrop-blur sm:px-4 sm:pb-3 dark:border-stone-800 dark:bg-stone-900/70"
      >
        <div className="mx-auto flex max-w-2xl gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={isPending}
            placeholder="Share something supportive…"
            maxLength={1000}
            className="flex-1 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 disabled:opacity-60 dark:border-stone-700 dark:bg-stone-950"
          />
          <button
            type="submit"
            disabled={isPending || !draft.trim()}
            className="shrink-0 rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
          >
            Send
          </button>
        </div>
        {error && (
          <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
