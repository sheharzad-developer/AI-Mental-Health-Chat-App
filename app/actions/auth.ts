"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { createUser } from "@/lib/users";

export async function signUpAction(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    await createUser(email, password, name);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Sign-up failed." };
  }

  // Auto-signin after successful signup
  try {
    await signIn("credentials", { email, password, redirectTo: "/chat" });
  } catch (e) {
    // signIn throws a redirect — re-throw so Next handles it
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    redirect(`/?mode=signin&error=${encodeURIComponent("Account created — please sign in.")}`);
  }
  return { error: null };
}

export async function signInAction(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/chat" });
  } catch (e) {
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    // Surface the underlying message in dev/logs, but show a friendly one to the user
    const message = e instanceof Error ? e.message : "";
    if (message.includes("Database error")) {
      return { error: message };
    }
    if (message.toLowerCase().includes("does not exist")) {
      return {
        error:
          "Setup needed: the `users` table doesn't exist. Run users.sql on Supabase.",
      };
    }
    return { error: "Invalid email or password." };
  }
  return { error: null };
}
