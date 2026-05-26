"use client";

import { useState } from "react";

type Props = {
  email: string;
  password: string;
  action: () => Promise<void>;
};

export function DemoLoginCard({ email, password, action }: Props) {
  return (
    <div className="mt-5 rounded-xl border border-teal-200/70 bg-teal-50/60 p-4 text-left dark:border-teal-900/60 dark:bg-teal-950/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-teal-900 dark:text-teal-200">
            Try the demo
          </p>
          <p className="mt-0.5 text-xs text-teal-800/80 dark:text-teal-300/80">
            No sign-up needed — use these shared credentials.
          </p>
        </div>
        <span className="rounded-full bg-teal-600/10 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
          Demo
        </span>
      </div>

      <div className="mt-3 grid gap-2">
        <CredentialRow label="Email" value={email} />
        <CredentialRow label="Password" value={password} mono />
      </div>

      <form action={action} className="mt-3">
        <button
          type="submit"
          className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500"
        >
          Sign in as demo
        </button>
      </form>
    </div>
  );
}

function CredentialRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard blocked (insecure context, permission denied) — silent.
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-teal-200/60 bg-white/70 px-3 py-2 text-xs dark:border-teal-900/50 dark:bg-stone-950/40">
      <div className="min-w-0 flex-1">
        <div className="text-[0.65rem] uppercase tracking-wider text-teal-700/80 dark:text-teal-300/70">
          {label}
        </div>
        <div
          className={`truncate text-stone-800 dark:text-stone-100 ${
            mono ? "font-mono" : ""
          }`}
        >
          {value}
        </div>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-md border border-teal-300/70 px-2 py-1 text-[0.7rem] font-medium text-teal-800 transition hover:bg-teal-100 dark:border-teal-800/70 dark:text-teal-200 dark:hover:bg-teal-900/40"
        aria-label={`Copy ${label}`}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
