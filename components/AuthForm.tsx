"use client";

import { useActionState, useState } from "react";
import { signInAction, signUpAction } from "@/app/actions/auth";

type Mode = "signin" | "signup";

export function AuthForm({ initialMode = "signin" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const isSignup = mode === "signup";

  const action = isSignup ? signUpAction : signInAction;
  const [state, formAction, isPending] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="mt-5 space-y-3" key={mode}>
      {isSignup && (
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-700 dark:text-stone-300">
            Name <span className="text-stone-400">(optional)</span>
          </label>
          <input
            name="name"
            type="text"
            placeholder="Your name"
            maxLength={80}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-stone-700 dark:bg-stone-950"
          />
        </div>
      )}
      <div>
        <label className="mb-1 block text-xs font-medium text-stone-700 dark:text-stone-300">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-stone-700 dark:bg-stone-950"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-stone-700 dark:text-stone-300">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={isSignup ? "new-password" : "current-password"}
          placeholder="At least 6 characters"
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-stone-700 dark:bg-stone-950"
        />
      </div>

      {state?.error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
      </button>

      <div className="text-center text-xs text-stone-600 dark:text-stone-400">
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={() => setMode(isSignup ? "signin" : "signup")}
          className="font-medium text-teal-700 underline-offset-2 hover:underline dark:text-teal-300"
        >
          {isSignup ? "Sign in" : "Sign up"}
        </button>
      </div>
    </form>
  );
}
