import Link from "next/link";
import { signOut } from "@/auth";

const NAV = [
  { href: "/chat", label: "Chat" },
  { href: "/doctors", label: "Doctors" },
  { href: "/community", label: "Community" },
  { href: "/bookings", label: "Bookings" },
];

type Props = {
  email: string;
  active?: "chat" | "doctors" | "community" | "bookings";
};

export function AppHeader({ email, active }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/60 bg-white/75 backdrop-blur-xl dark:border-stone-800/60 dark:bg-stone-950/70">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/chat" className="flex shrink-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 text-sm font-bold text-white shadow-sm">
            ✦
          </span>
          <span className="hidden text-sm font-semibold text-stone-900 sm:inline dark:text-stone-100">
            Wellness
          </span>
        </Link>

        <nav className="flex flex-1 items-center justify-center gap-1 overflow-x-auto sm:gap-2">
          {NAV.map((item) => {
            const isActive = active === item.href.slice(1);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                  isActive
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/pricing"
            className="hidden rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:shadow md:inline-flex"
          >
            ✨ Upgrade
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
              className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
