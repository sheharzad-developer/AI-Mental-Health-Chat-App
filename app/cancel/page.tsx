import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center bg-gradient-to-br from-stone-50 via-white to-stone-100 px-4 dark:from-stone-950 dark:via-stone-950 dark:to-stone-900">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white/80 p-10 text-center shadow-xl backdrop-blur dark:border-stone-800 dark:bg-stone-900/70">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-stone-200 dark:bg-stone-800">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-stone-500 dark:text-stone-400"
          >
            <path d="M12 8v4M12 16h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Checkout cancelled
        </h1>
        <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
          No charge was made. You can upgrade any time when you&apos;re ready.
        </p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/pricing"
            className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            Try again
          </Link>
          <Link
            href="/chat"
            className="flex-1 rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Back to chat
          </Link>
        </div>
      </div>
    </main>
  );
}
