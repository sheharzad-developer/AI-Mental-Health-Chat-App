import { supabaseAdmin } from "@/lib/supabase";

export type ChatThread = {
  id: string;
  user_email: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type ChatMessageRow = {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  crisis: boolean;
  created_at: string;
};

export async function listChats(userEmail: string): Promise<ChatThread[]> {
  const { data } = await supabaseAdmin()
    .from("chats")
    .select("*")
    .eq("user_email", userEmail)
    .order("updated_at", { ascending: false })
    .limit(50);
  return (data as ChatThread[]) ?? [];
}

export async function getChat(
  chatId: string,
  userEmail: string
): Promise<{ chat: ChatThread; messages: ChatMessageRow[] } | null> {
  const { data: chat } = await supabaseAdmin()
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .eq("user_email", userEmail)
    .maybeSingle();

  if (!chat) return null;

  const { data: messages } = await supabaseAdmin()
    .from("chat_messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  return {
    chat: chat as ChatThread,
    messages: (messages as ChatMessageRow[]) ?? [],
  };
}

export async function createChat(userEmail: string, firstMessage: string): Promise<ChatThread> {
  const title = firstMessage.trim().slice(0, 60) || "New chat";
  const { data, error } = await supabaseAdmin()
    .from("chats")
    .insert({ user_email: userEmail, title })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as ChatThread;
}

export async function appendMessage(
  chatId: string,
  role: "user" | "assistant",
  content: string,
  crisis = false
) {
  await supabaseAdmin().from("chat_messages").insert({ chat_id: chatId, role, content, crisis });
  await supabaseAdmin().from("chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId);
}

export async function deleteChat(chatId: string, userEmail: string) {
  await supabaseAdmin().from("chats").delete().eq("id", chatId).eq("user_email", userEmail);
}
