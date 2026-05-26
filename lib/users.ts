import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";

// Normalize errors coming back from Supabase before they reach UI / redirect
// URLs. The Cloudflare-fronted REST endpoint returns full HTML pages on 5xx
// (e.g. "521 Web server is down" when a free-tier project is paused), and
// supabase-js surfaces that HTML verbatim as `error.message`. Without this
// helper, the raw HTML ends up encoded into the error query param of the
// redirect URL — both ugly and a leak of internals. We log the real message
// server-side and return a short, user-safe replacement.
function sanitizeDbError(raw: string | undefined | null, context: string): string {
  const original = (raw ?? "").trim();
  if (original) {
    console.error(`[${context}] supabase error:`, original.slice(0, 2000));
  }

  const looksLikeHtml =
    original.startsWith("<") ||
    /<!doctype/i.test(original) ||
    /<html[\s>]/i.test(original);
  const looksLikeNetwork =
    /fetch failed|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|getaddrinfo|socket hang up/i.test(
      original
    );
  const looksLikeServerDown =
    /\b(5\d\d)\b|web server is down|cloudflare/i.test(original);

  if (!original || looksLikeHtml || looksLikeNetwork || looksLikeServerDown) {
    return "The database is temporarily unavailable. Please try again shortly.";
  }
  if (original.length > 240) return original.slice(0, 240) + "…";
  return original;
}

export type AppUser = {
  id: string;
  email: string;
  name: string | null;
};

// Public demo credentials surfaced on the sign-in screen so visitors can try
// the app without creating a personal account. Override via env in production.
export const DEMO_EMAIL = (process.env.DEMO_EMAIL ?? "demo@wellness.app")
  .trim()
  .toLowerCase();
export const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "demo1234";
export const DEMO_NAME = process.env.DEMO_NAME ?? "Demo User";

// Idempotent: ensures the demo account exists with the expected password hash.
// Safe to call on every demo-login attempt; only writes when missing.
// Retries once on transient 5xx / network errors to absorb cold-start hiccups
// after a paused free-tier project wakes up on the first request.
export async function ensureDemoUser(): Promise<AppUser> {
  const lookup = async () => {
    const db = supabaseAdmin();
    return db
      .from("users")
      .select("id, email, name")
      .eq("email", DEMO_EMAIL)
      .maybeSingle();
  };

  let { data: existing, error: lookupErr } = await lookup();
  if (lookupErr && isTransient(lookupErr.message)) {
    await sleep(400);
    ({ data: existing, error: lookupErr } = await lookup());
  }
  if (lookupErr) {
    throw new Error(sanitizeDbError(lookupErr.message, "ensureDemoUser/lookup"));
  }
  if (existing) return existing as AppUser;

  const password_hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const { data, error } = await supabaseAdmin()
    .from("users")
    .insert({ email: DEMO_EMAIL, password_hash, name: DEMO_NAME })
    .select("id, email, name")
    .single();

  if (error) {
    // Race: another request created it in the meantime — re-read and return.
    if (error.code === "23505") {
      const { data: again } = await supabaseAdmin()
        .from("users")
        .select("id, email, name")
        .eq("email", DEMO_EMAIL)
        .single();
      if (again) return again as AppUser;
    }
    throw new Error(sanitizeDbError(error.message, "ensureDemoUser/insert"));
  }
  return data as AppUser;
}

function isTransient(message: string | undefined | null): boolean {
  if (!message) return false;
  return (
    /<!doctype|<html|web server is down|cloudflare/i.test(message) ||
    /\b(5\d\d)\b/.test(message) ||
    /fetch failed|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|socket hang up/i.test(message)
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createUser(
  email: string,
  password: string,
  name?: string
): Promise<AppUser> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("Invalid email.");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabaseAdmin()
    .from("users")
    .insert({
      email: cleanEmail,
      password_hash,
      name: name?.trim() || null,
    })
    .select("id, email, name")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("An account with this email already exists.");
    }
    throw new Error(error.message);
  }
  return data as AppUser;
}

export async function verifyUser(
  email: string,
  password: string
): Promise<AppUser | null> {
  const cleanEmail = email.trim().toLowerCase();

  const { data, error } = await supabaseAdmin()
    .from("users")
    .select("id, email, name, password_hash")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (error) {
    // Surface DB errors (e.g. missing table) but never leak HTML / network
    // crash output into the caller — sanitize before re-throwing.
    throw new Error(sanitizeDbError(error.message, "verifyUser"));
  }
  if (!data) return null;

  const ok = await bcrypt.compare(password, data.password_hash as string);
  if (!ok) return null;

  return { id: data.id, email: data.email, name: data.name };
}
