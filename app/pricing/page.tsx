import Link from "next/link";
import { auth } from "@/auth";
import { UpgradeButton } from "@/components/UpgradeButton";

export default async function PricingPage() {
  const session = await auth();
  const email = session?.user?.email ?? "";

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-gradient-to-br from-[#e5f0eb] via-[#eef3f0] to-[#e8e6f2] px-4 py-12 dark:from-[#080a09] dark:via-[#0d1210] dark:to-[#0a0c14]">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-10 text-center">
          <Link
            href="/chat"
            className="text-xs font-medium text-teal-700 hover:underline dark:text-teal-300"
          >
            ← Back to chat
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-stone-900 dark:text-stone-100">
            Choose your plan
          </h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Signed in as <span className="font-medium">{email}</span>
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Free plan */}
          <div className="rounded-2xl border border-stone-200 bg-white/70 p-8 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Free
            </p>
            <p className="mt-2 text-4xl font-bold text-stone-900 dark:text-stone-100">
              $0
              <span className="text-sm font-normal text-stone-500 dark:text-stone-400">
                /month
              </span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-stone-700 dark:text-stone-300">
              <Bullet>20 AI messages per day</Bullet>
              <Bullet>Basic wellness conversation</Bullet>
              <Bullet muted>No community access</Bullet>
              <Bullet muted>No priority responses</Bullet>
            </ul>
            <button
              disabled
              className="mt-8 w-full rounded-lg bg-stone-200 px-4 py-2.5 text-sm font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400"
            >
              Current plan
            </button>
          </div>

          {/* Premium plan */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400 bg-white p-8 shadow-lg dark:border-amber-500 dark:bg-stone-900">
            <div className="absolute right-0 top-0 rounded-bl-2xl bg-gradient-to-br from-amber-400 to-orange-500 px-4 py-1 text-xs font-bold text-white">
              RECOMMENDED
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              Premium
            </p>
            <p className="mt-2 text-4xl font-bold text-stone-900 dark:text-stone-100">
              $9.99
              <span className="text-sm font-normal text-stone-500 dark:text-stone-400">
                /month
              </span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-stone-700 dark:text-stone-300">
              <Bullet>Unlimited AI messages</Bullet>
              <Bullet>Community room access</Bullet>
              <Bullet>Priority responses</Bullet>
              <Bullet>Cancel anytime</Bullet>
            </ul>
            <UpgradeButton />
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-stone-500 dark:text-stone-400">
          Secured by Stripe. Test mode — use card{" "}
          <code className="rounded bg-stone-100 px-1.5 py-0.5 dark:bg-stone-800">
            4242 4242 4242 4242
          </code>
        </p>
      </div>
    </main>
  );
}

function Bullet({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <li className={`flex items-start gap-2 ${muted ? "opacity-50" : ""}`}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`mt-0.5 shrink-0 ${
          muted ? "text-stone-400" : "text-emerald-500"
        }`}
      >
        {muted ? (
          <path d="M18 6 6 18M6 6l12 12" />
        ) : (
          <path d="M20 6 9 17l-5-5" />
        )}
      </svg>
      <span>{children}</span>
    </li>
  );
}
