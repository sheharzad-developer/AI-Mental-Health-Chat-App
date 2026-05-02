import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Message = {
  id: string;
  content: string;
  user_email: string;
  user_name: string | null;
  created_at: string;
};

function getEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `${name} is not set. Add it in your .env file (and Vercel env vars for deploys).`
    );
  }
  return value;
}

// Browser-safe client (anon key) — used for the realtime subscription.
// Lazy so missing env vars don't crash the build.
let browserClient: SupabaseClient | null = null;
export function getSupabaseBrowser(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(
      getEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
      getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      { auth: { persistSession: false } }
    );
  }
  return browserClient;
}

// Server-only client (service role) — used to insert/select messages on the server.
// NEVER import from client components.
export function supabaseAdmin(): SupabaseClient {
  return createClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    getEnv("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY),
    { auth: { persistSession: false } }
  );
}
