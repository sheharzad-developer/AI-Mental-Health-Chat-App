"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { deleteChat as deleteChatDb } from "@/lib/chats";

export async function newChatAction() {
  redirect("/chat");
}

export async function deleteChatAction(chatId: string) {
  const session = await auth();
  if (!session?.user?.email) return;
  await deleteChatDb(chatId, session.user.email);
  revalidatePath("/chat");
  redirect("/chat");
}
