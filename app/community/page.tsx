import { auth } from "@/auth";
import { AppHeader } from "@/components/AppHeader";
import { CommunityRoom } from "@/components/CommunityRoom";
import { supabaseAdmin } from "@/lib/supabase";
import type { Message } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const session = await auth();
  const email = session?.user?.email ?? "";

  let initialMessages: Message[] = [];
  try {
    const { data } = await supabaseAdmin()
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(100);
    initialMessages = (data as Message[]) ?? [];
  } catch {
    // env not set
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-gradient-to-br from-[#e5f0eb] via-[#eef3f0] to-[#e8e6f2] dark:from-[#080a09] dark:via-[#0d1210] dark:to-[#0a0c14]">
      <AppHeader email={email} active="community" />
      <div className="mx-auto w-full max-w-3xl flex-1 flex-col">
        <div className="px-4 pt-6 sm:px-6">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            Community Room
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            A supportive space. Be kind — there are real people on the other side.
          </p>
        </div>
        <CommunityRoom initialMessages={initialMessages} currentUserEmail={email} />
      </div>
    </div>
  );
}
