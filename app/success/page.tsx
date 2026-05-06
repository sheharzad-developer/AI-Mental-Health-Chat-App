import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 dark:from-emerald-950/40 dark:via-stone-950 dark:to-teal-950/40">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white/80 p-10 text-center shadow-xl backdrop-blur dark:border-stone-800 dark:bg-stone-900/70">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          You&apos;re Premium! 🎉
        </h1>
        <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
          Thanks for upgrading. Your subscription is now active. You&apos;ll get
          a confirmation email from Stripe with the receipt.
        </p>
        <Link
          href="/chat"
          className="mt-8 inline-block w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          Continue to chat
        </Link>
      </div>
    </main>
  );
}
