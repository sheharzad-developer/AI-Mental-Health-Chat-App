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
    <main className="flex-1">
      {/* Top nav */}
      <nav className="sticky top-0 z-30 border-b border-stone-200/60 bg-white/80 backdrop-blur-xl dark:border-stone-800/60 dark:bg-stone-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 text-sm font-bold text-white shadow-sm">
              ✦
            </span>
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              Wellness
            </span>
          </div>
          <a
            href="#get-started"
            className="rounded-full bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700 sm:text-sm"
          >
            Sign in
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#e5f0eb] via-[#eef3f0] to-[#e8e6f2] dark:from-[#080a09] dark:via-[#0d1210] dark:to-[#0a0c14]">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="inline-block rounded-full bg-white/70 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-wider text-teal-700 backdrop-blur dark:bg-stone-900/60 dark:text-teal-300">
            Mental wellness, made calm
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl md:text-6xl dark:text-stone-100">
            A calm space to share <br className="hidden sm:inline" />
            what you&apos;re feeling.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg dark:text-stone-400">
            An AI wellness companion that listens without judgment, plus a
            community room and licensed therapists when you&apos;re ready for
            real human support.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="#get-started"
              className="w-full rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-teal-700 hover:shadow-lg sm:w-auto"
            >
              Get started — it&apos;s free
            </a>
            <a
              href="#features"
              className="w-full rounded-full border border-stone-300 bg-white/70 px-6 py-3 text-sm font-medium text-stone-700 backdrop-blur transition hover:bg-white sm:w-auto dark:border-stone-700 dark:bg-stone-900/60 dark:text-stone-300 dark:hover:bg-stone-900"
            >
              Learn more
            </a>
          </div>
          <p className="mt-6 text-xs text-stone-500 dark:text-stone-500">
            Not a substitute for professional care · No credit card required
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-16 sm:py-20 dark:bg-stone-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              What you get
            </h2>
            <p className="mt-3 text-stone-600 dark:text-stone-400">
              Four ways to take care of yourself, in one calm app.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              }
              title="AI Companion"
              body="A thoughtful, judgment-free chat that helps you reflect on what you're feeling — anytime."
              accent="teal"
            />
            <Feature
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
              title="Community Room"
              body="A real-time space to share with others who get it. Anonymous-feeling, kind, supportive."
              accent="emerald"
            />
            <Feature
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
              title="Licensed Therapists"
              body="Browse profiles of real therapists across specialties — anxiety, trauma, relationships, and more."
              accent="violet"
            />
            <Feature
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              }
              title="Book Sessions"
              body="When you're ready, book a 30-minute video session with the therapist of your choice."
              accent="amber"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-stone-50 py-16 sm:py-20 dark:bg-stone-900/40">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              How it works
            </h2>
            <p className="mt-3 text-stone-600 dark:text-stone-400">
              Three small steps. No rush.
            </p>
          </div>
          <ol className="mt-12 space-y-6">
            <Step n={1} title="Create a free account" body="Sign up with email or Google. No credit card." />
            <Step n={2} title="Talk to your AI companion" body="Share what's on your mind. Get gentle reflection and follow-up questions." />
            <Step n={3} title="Connect with real support" body="Browse therapists, join the community room, or book a 1:1 session when you're ready." />
          </ol>
        </div>
      </section>

      {/* Safety note */}
      <section className="bg-white py-12 dark:bg-stone-950">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            <strong className="text-stone-900 dark:text-stone-100">A note on safety:</strong>{" "}
            This app is a wellness companion — not a substitute for professional
            care or crisis intervention. If you&apos;re in immediate danger,
            please contact your local emergency or crisis services.
          </p>
        </div>
      </section>

      {/* Get started — sign-in/sign-up form */}
      <section
        id="get-started"
        className="scroll-mt-20 bg-gradient-to-br from-teal-50 via-white to-emerald-50 py-16 sm:py-20 dark:from-teal-950/30 dark:via-stone-950 dark:to-emerald-950/30"
      >
        <div className="mx-auto flex max-w-md flex-col items-center px-4 sm:px-6">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-2xl font-bold text-white shadow-lg">
              ✦
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-100">
              Welcome
            </h2>
            <p className="mt-2 max-w-sm text-sm text-stone-500 dark:text-stone-400">
              Sign in to start your wellness conversation.
            </p>
          </div>

          <div className="w-full rounded-2xl border border-stone-200 bg-white/80 p-7 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/70">
            {isAccessDenied && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-left text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                <strong className="block">Access denied</strong>
                <span>This app is currently invite-only.</span>
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
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 dark:border-stone-800 dark:bg-stone-950">
        <div className="mx-auto max-w-5xl px-4 text-center text-xs text-stone-500 sm:px-6 dark:text-stone-500">
          © {new Date().getFullYear()} Wellness · Built with care
        </div>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  accent: "teal" | "emerald" | "violet" | "amber";
}) {
  const accents = {
    teal: "from-teal-400 to-teal-500",
    emerald: "from-emerald-400 to-emerald-500",
    violet: "from-violet-400 to-purple-500",
    amber: "from-amber-400 to-orange-500",
  };
  return (
    <div className="group rounded-2xl border border-stone-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:hover:border-teal-700">
      <div
        className={`mb-4 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ${accents[accent]}`}
      >
        {icon}
      </div>
      <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
        {body}
      </p>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-sm font-bold text-white shadow-sm">
        {n}
      </span>
      <div>
        <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          {body}
        </p>
      </div>
    </li>
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
