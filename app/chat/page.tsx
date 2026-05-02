import { auth, signOut } from "@/auth";
import { WellnessChat } from "@/components/WellnessChat";

export default async function ChatPage() {
  const session = await auth();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-800">
        <span className="text-sm text-stone-600 dark:text-stone-400">
          Signed in as{" "}
          <span className="font-medium text-stone-900 dark:text-stone-100">
            {session?.user?.email ?? "guest"}
          </span>
        </span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Sign out
          </button>
        </form>
      </header>
      <WellnessChat />
    </div>
  );
}
