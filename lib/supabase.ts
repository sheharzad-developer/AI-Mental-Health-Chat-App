import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Browser-safe client (anon key) — used for the realtime subscription.
export const supabaseBrowser = createClient(url, anonKey, {
  auth: { persistSession: false },
});

// Server-only client (service role) — used to insert messages on behalf of the signed-in user.
// NEVER import this from client components.
export function supabaseAdmin() {
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export type Message = {
  id: string;
  content: string;
  user_email: string;
  user_name: string | null;
  created_at: string;
};
