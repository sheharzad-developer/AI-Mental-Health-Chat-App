"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";
import type { ChatThread } from "@/lib/chats";

type Props = {
  email: string;
  chats: ChatThread[];
  activeChatId: string | null;
};

export function ChatSidebar({ email, chats, activeChatId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile: hamburger toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open menu"
        className="fixed left-3 top-3 z-50 grid h-10 w-10 place-items-center rounded-full border border-stone-200/70 bg-white/90 shadow-md backdrop-blur lg:hidden dark:border-stone-700/60 dark:bg-stone-900/80"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {open ? <path d="M18 6 6 18M6 6l12 12" /> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
        </svg>
      </button>

      {/* Backdrop on mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-stone-200 bg-white/95 backdrop-blur-xl transition-transform duration-200 lg:static lg:translate-x-0 dark:border-stone-800 dark:bg-stone-950/95 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand + New chat */}
        <div className="flex shrink-0 items-center gap-2 border-b border-stone-200 p-3 dark:border-stone-800">
          <Link href="/chat" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 text-sm font-bold text-white shadow-sm">
              ✦
            </span>
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              Wellness
            </span>
          </Link>
          <Link
            href="/chat"
            onClick={() => setOpen(false)}
            className="ml-auto inline-flex items-center gap-1 rounded-full bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700"
            aria-label="New chat"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New
          </Link>
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto p-3">
          <p className="mb-2 px-2 text-[0.65rem] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            History
          </p>
          {chats.length === 0 ? (
            <p className="px-2 text-xs text-stone-500 dark:text-stone-400">
              Your past conversations will show here.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {chats.map((c) => {
                const isActive = c.id === activeChatId;
                return (
                  <li key={c.id}>
                    <Link
                      href={`/chat?id=${c.id}`}
                      onClick={() => setOpen(false)}
                      className={`block truncate rounded-lg px-3 py-2 text-sm transition ${
                        isActive
                          ? "bg-teal-50 font-medium text-teal-800 dark:bg-teal-900/40 dark:text-teal-200"
                          : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                      }`}
                      title={c.title}
                    >
                      {c.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Quick nav */}
        <nav className="shrink-0 border-t border-stone-200 p-2 dark:border-stone-800">
          <NavItem href="/doctors" label="Doctors" icon="doctors" onClick={() => setOpen(false)} />
          <NavItem href="/community" label="Community" icon="community" onClick={() => setOpen(false)} />
          <NavItem href="/bookings" label="Bookings" icon="bookings" onClick={() => setOpen(false)} />
          <NavItem href="/pricing" label="Upgrade" icon="upgrade" onClick={() => setOpen(false)} accent />
        </nav>

        {/* User */}
        <div className="shrink-0 border-t border-stone-200 p-3 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-stone-200 text-xs font-semibold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
              {email.charAt(0).toUpperCase()}
            </div>
            <span className="min-w-0 flex-1 truncate text-xs text-stone-600 dark:text-stone-400" title={email}>
              {email}
            </span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-md p-1.5 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
              aria-label="Sign out"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavItem({
  href,
  label,
  icon,
  onClick,
  accent = false,
}: {
  href: string;
  label: string;
  icon: "doctors" | "community" | "bookings" | "upgrade";
  onClick?: () => void;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
        accent
          ? "text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
          : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
      }`}
    >
      <NavIcon name={icon} />
      <span>{label}</span>
    </Link>
  );
}

function NavIcon({ name }: { name: "doctors" | "community" | "bookings" | "upgrade" }) {
  const props = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "doctors") {
    return (
      <svg {...props}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  if (name === "community") {
    return (
      <svg {...props}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (name === "bookings") {
    return (
      <svg {...props}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
