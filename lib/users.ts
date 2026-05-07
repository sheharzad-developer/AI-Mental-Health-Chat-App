import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";

export type AppUser = {
  id: string;
  email: string;
  name: string | null;
};

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
    // Surface DB errors (e.g. missing table) so they aren't masked as "invalid password"
    throw new Error(`Database error: ${error.message}`);
  }
  if (!data) return null;

  const ok = await bcrypt.compare(password, data.password_hash as string);
  if (!ok) return null;

  return { id: data.id, email: data.email, name: data.name };
}
