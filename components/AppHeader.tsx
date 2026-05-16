import Link from "next/link";
import { signOut } from "@/auth";

const NAV = [
  { href: "/chat", label: "Chat", key: "chat" as const },
  { href: "/doctors", label: "Doctors", key: "doctors" as const },
  { href: "/community", label: "Community", key: "community" as const },
  { href: "/bookings", label: "Bookings", key: "bookings" as const },
];

type Props = {
  email: string;
  active?: "chat" | "doctors" | "community" | "bookings";
};

export function AppHeader({ email, active }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/60 bg-white/80 backdrop-blur-xl dark:border-stone-800/60 dark:bg-stone-950/75">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-3 sm:gap-4 sm:px-4">
        <Link href="/chat" className="flex shrink-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/Logo.svg"
            alt="AuraAi logo"
            className="h-8 w-8 rounded-xl shadow-sm"
          />
          <span className="hidden text-sm font-semibold text-stone-900 sm:inline dark:text-stone-100">
            AuraAi
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-1 sm:flex sm:gap-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                active === item.key
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile: page label fills space */}
        <span className="flex-1 text-center text-sm font-semibold text-stone-700 sm:hidden dark:text-stone-300">
          {active ? NAV.find((n) => n.key === active)?.label : "AuraAi"}
        </span>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/pricing"
            className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:shadow sm:px-3"
            aria-label="Upgrade to Premium"
          >
            ✨ <span className="hidden sm:inline">Upgrade</span>
          </Link>
          <span
            className="hidden max-w-[10rem] truncate rounded-full bg-stone-100 px-3 py-1.5 text-xs text-stone-600 lg:inline dark:bg-stone-800 dark:text-stone-400"
            title={email}
          >
            {email}
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="rounded-full border border-stone-300 px-2.5 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 sm:px-3 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
              aria-label="Sign out"
            >
              <span className="hidden sm:inline">Sign out</span>
              <svg
                className="sm:hidden"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t border-stone-200 bg-white/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] sm:hidden dark:border-stone-800 dark:bg-stone-950/95">
        {NAV.map((item) => {
          const isActive = active === item.key;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[0.65rem] font-medium transition ${
                isActive
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-stone-500 dark:text-stone-500"
              }`}
            >
              <TabIcon name={item.key} active={isActive} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

function TabIcon({
  name,
  active,
}: {
  name: "chat" | "doctors" | "community" | "bookings";
  active: boolean;
}) {
  const stroke = active ? 2.4 : 1.8;
  const props = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "chat") {
    return (
      <svg {...props}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  if (name === "doctors") {
    return (
      <svg {...props}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  if (name === "community") {
    return (
      <svg {...props}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
