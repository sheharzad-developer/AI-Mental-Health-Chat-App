"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { sendMessage } from "@/app/community/actions";
import { supabaseBrowser, type Message } from "@/lib/supabase";

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

  // Subscribe to new messages in real time
  useEffect(() => {
    const channel = supabaseBrowser
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
      supabaseBrowser.removeChannel(channel);
    };
  }, []);

  // Auto-scroll on new messages
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
        setDraft(content); // restore on failure
      }
    });
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
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
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
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

      <form
        onSubmit={handleSubmit}
        className="border-t border-stone-200 bg-white/70 px-4 py-3 backdrop-blur dark:border-stone-800 dark:bg-stone-900/60"
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
            className="rounded-full bg-teal-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
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
