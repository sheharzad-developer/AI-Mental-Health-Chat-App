import { signIn } from "@/auth";
import { AuthForm } from "@/components/AuthForm";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  const { error, mode } = await searchParams;
  const isAccessDenied = error === "AccessDenied";
  const initialMode = mode === "signup" ? "signup" : "signin";

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white/80 p-7 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/70">
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-xl font-bold text-white shadow-md">
            ✦
          </div>
          <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
            Welcome
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Sign in to start your wellness conversation.
          </p>
        </div>

        {isAccessDenied && (
          <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-left text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            <strong className="block">Access denied</strong>
            <span>
              This app is currently invite-only. Ask the developer to add your
              email to the allow-list.
            </span>
          </div>
        )}

        <AuthForm initialMode={initialMode} />

        <div className="my-5 flex items-center gap-3 text-[0.7rem] uppercase tracking-wider text-stone-400 dark:text-stone-500">
          <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
          or continue with
          <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/chat" });
          }}
        >
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-3 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:hover:bg-stone-900"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </form>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961l3.007 2.332C4.672 5.166 6.656 3.58 9 3.58z" />
    </svg>
  );
}
