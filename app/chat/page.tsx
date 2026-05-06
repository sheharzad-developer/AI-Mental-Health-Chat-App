import Link from "next/link";
import { auth, signOut } from "@/auth";
import { WellnessChat } from "@/components/WellnessChat";

export default async function ChatPage() {
  const session = await auth();

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none fixed right-3 top-3 z-30 flex items-center gap-1.5 sm:right-5 sm:top-5">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-stone-200/70 bg-white/80 px-1.5 py-1 shadow-md backdrop-blur dark:border-stone-700/60 dark:bg-stone-900/70">
          <Link
            href="/doctors"
            className="rounded-full px-3 py-1 text-xs font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
          >
            Doctors
          </Link>
          <Link
            href="/community"
            className="rounded-full px-3 py-1 text-xs font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
          >
            Community
          </Link>
          <Link
            href="/bookings"
            className="rounded-full px-3 py-1 text-xs font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
          >
            Bookings
          </Link>
        </div>
        <Link
          href="/pricing"
          className="pointer-events-auto rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:shadow-md"
        >
          ✨ Upgrade
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
          className="pointer-events-auto"
          title={session?.user?.email ?? ""}
        >
          <button
            type="submit"
            className="rounded-full border border-stone-300/70 bg-white/80 px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm backdrop-blur transition hover:bg-white dark:border-stone-700/70 dark:bg-stone-900/70 dark:text-stone-200 dark:hover:bg-stone-900"
          >
            Sign out
          </button>
        </form>
      </div>
      <WellnessChat />
    </div>
  );
}
