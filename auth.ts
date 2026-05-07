import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Comma-separated whitelist of allowed emails. Empty = allow everyone.
// Example: ALLOWED_EMAILS="me@gmail.com,friend@gmail.com"
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user }) {
      // No whitelist set → allow anyone with a verified Google account.
      if (ALLOWED_EMAILS.length === 0) return true;

      const email = user.email?.toLowerCase();
      if (!email) return false;

      const allowed = ALLOWED_EMAILS.includes(email);
      if (!allowed) {
        // Auth.js will redirect to /?error=AccessDenied
        return "/?error=AccessDenied";
      }
      return true;
    },
  },
});
