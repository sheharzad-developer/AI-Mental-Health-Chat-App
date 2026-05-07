import Link from "next/link";
import { auth, signOut } from "@/auth";
import { WellnessChat } from "@/components/WellnessChat";

export default async function ChatPage() {
  const session = await auth();

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Floating top-right controls */}
      <div className="pointer-events-none fixed right-2.5 top-2.5 z-30 flex items-center gap-1.5 sm:right-5 sm:top-5">
        {/* Nav cluster — text on desktop, icons on mobile */}
        <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-stone-200/70 bg-white/85 p-1 shadow-md backdrop-blur sm:gap-1 sm:px-1.5 dark:border-stone-700/60 dark:bg-stone-900/75">
          <NavPill href="/doctors" label="Doctors" icon="doctors" />
          <NavPill href="/community" label="Community" icon="community" />
          <NavPill href="/bookings" label="Bookings" icon="bookings" />
        </div>
        <Link
          href="/pricing"
          className="pointer-events-auto rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:shadow-md sm:px-3"
          aria-label="Upgrade to Premium"
        >
          ✨ <span className="hidden sm:inline">Upgrade</span>
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
          className="pointer-events-auto"
          title={session?.user?.email ?? ""}
        >
          <button
            type="submit"
            className="rounded-full border border-stone-300/70 bg-white/80 px-2.5 py-1.5 text-xs font-medium text-stone-700 shadow-sm backdrop-blur transition hover:bg-white sm:px-3 dark:border-stone-700/70 dark:bg-stone-900/70 dark:text-stone-200 dark:hover:bg-stone-900"
            aria-label="Sign out"
          >
            <span className="hidden sm:inline">Sign out</span>
            <svg
              className="sm:hidden"
              width="14"
              height="14"
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

      <WellnessChat />
    </div>
  );
}

function NavPill({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: "doctors" | "community" | "bookings";
}) {
  return (
    <Link
      href={href}
      className="rounded-full p-2 text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 sm:px-3 sm:py-1 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
      aria-label={label}
    >
      <span className="hidden text-xs font-medium sm:inline">{label}</span>
      <span className="sm:hidden">
        <NavIcon name={icon} />
      </span>
    </Link>
  );
}

function NavIcon({ name }: { name: "doctors" | "community" | "bookings" }) {
  const props = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
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
