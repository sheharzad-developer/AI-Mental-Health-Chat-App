import Link from "next/link";
import { auth, signOut } from "@/auth";
import { WellnessChat } from "@/components/WellnessChat";

export default async function ChatPage() {
  const session = await auth();

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none absolute right-3 top-3 z-20 flex items-center gap-2 sm:right-5 sm:top-5">
        <Link
          href="/community"
          className="pointer-events-auto rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-teal-700 shadow-sm backdrop-blur transition hover:bg-white dark:bg-stone-900/80 dark:text-teal-300 dark:hover:bg-stone-900"
        >
          Community →
        </Link>
        <span className="pointer-events-auto hidden rounded-full bg-white/80 px-3 py-1.5 text-xs text-stone-600 shadow-sm backdrop-blur sm:inline dark:bg-stone-900/70 dark:text-stone-300">
          {session?.user?.email ?? "guest"}
        </span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
          className="pointer-events-auto"
        >
          <button
            type="submit"
            className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm backdrop-blur transition hover:bg-white dark:bg-stone-900/80 dark:text-stone-200 dark:hover:bg-stone-900"
          >
            Sign out
          </button>
        </form>
      </div>
      <WellnessChat />
    </div>
  );
}
