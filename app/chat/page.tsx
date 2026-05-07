import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ChatSidebar } from "@/components/ChatSidebar";
import { WellnessChat } from "@/components/WellnessChat";
import { getChat, listChats, type ChatMessageRow } from "@/lib/chats";

export const dynamic = "force-dynamic";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/");
  const email = session.user.email;
  const { id } = await searchParams;

  const chats = await listChats(email).catch(() => []);

  let initialMessages: { role: "user" | "assistant"; content: string; crisis?: boolean }[] = [];
  let activeChatId: string | null = null;
  if (id) {
    const result = await getChat(id, email).catch(() => null);
    if (result) {
      activeChatId = result.chat.id;
      initialMessages = result.messages.map((m: ChatMessageRow) => ({
        role: m.role,
        content: m.content,
        crisis: m.crisis,
      }));
    }
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden">
      <ChatSidebar email={email} chats={chats} activeChatId={activeChatId} />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <WellnessChat initialChatId={activeChatId} initialMessages={initialMessages} />
      </div>
    </div>
  );
}
