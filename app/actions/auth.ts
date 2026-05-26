"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  createUser,
  ensureDemoUser,
} from "@/lib/users";

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

export async function signInAsDemoAction() {
  try {
    await ensureDemoUser();
  } catch (e) {
    redirect(`/?mode=signin&error=${encodeURIComponent(toUiError(e, "Could not prepare demo account."))}`);
  }

  try {
    await signIn("credentials", {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      redirectTo: "/chat",
    });
  } catch (e) {
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    redirect(
      `/?mode=signin&error=${encodeURIComponent(toUiError(e, "Could not sign in to demo account."))}`
    );
  }
}

// Bound the error message we put into the URL. ensureDemoUser already
// sanitizes DB errors, but this is a final safety net so a future error
// path can never leak a multi-kB payload into the query string.
function toUiError(e: unknown, fallback: string): string {
  const raw = e instanceof Error ? e.message : "";
  if (!raw || raw === "NEXT_REDIRECT") return fallback;
  const clean = raw.replace(/\s+/g, " ").trim();
  if (clean.length > 160) return clean.slice(0, 160) + "…";
  return clean;
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
