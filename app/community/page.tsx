import Link from "next/link";
import { auth, signOut } from "@/auth";
import { CommunityRoom } from "@/components/CommunityRoom";
import { supabaseAdmin } from "@/lib/supabase";
import type { Message } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const session = await auth();
  const email = session?.user?.email ?? "";

  const { data, error } = await supabaseAdmin()
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(100);

  const initialMessages: Message[] = error ? [] : (data as Message[]) ?? [];

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-gradient-to-br from-[#e5f0eb] via-[#eef3f0] to-[#e8e6f2] dark:from-[#080a09] dark:via-[#0d1210] dark:to-[#0a0c14]">
      <header className="flex items-center justify-between border-b border-stone-200/60 bg-white/60 px-4 py-3 backdrop-blur dark:border-stone-800/60 dark:bg-stone-900/40">
        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="text-xs font-medium text-teal-700 hover:underline dark:text-teal-300"
          >
            ← AI Companion
          </Link>
          <h1 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
            Community Room
          </h1>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            Sign out
          </button>
        </form>
      </header>
      <CommunityRoom initialMessages={initialMessages} currentUserEmail={email} />
    </div>
  );
}
