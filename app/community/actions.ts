"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function sendMessage(content: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: "You must be signed in to send messages." };
  }

  const trimmed = content.trim();
  if (!trimmed) return { error: "Message cannot be empty." };
  if (trimmed.length > 1000) return { error: "Message too long (max 1000 chars)." };

  const { error } = await supabaseAdmin()
    .from("messages")
    .insert({
      content: trimmed,
      user_email: session.user.email,
      user_name: session.user.name ?? null,
    });

  if (error) return { error: error.message };
  return { ok: true };
}
