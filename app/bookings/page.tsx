import Link from "next/link";
import { auth } from "@/auth";
import { AppHeader } from "@/components/AppHeader";
import { supabaseAdmin, type Booking, type Doctor } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type BookingWithDoctor = Booking & {
  doctors: Pick<Doctor, "name" | "specialty" | "photo_url"> | null;
};

export default async function BookingsPage() {
  const session = await auth();
  const email = session!.user!.email!;

  let bookings: BookingWithDoctor[] = [];
  let loadError: string | null = null;
  try {
    const { data, error } = await supabaseAdmin()
      .from("bookings")
      .select("*, doctors(name, specialty, photo_url)")
      .eq("user_email", email)
      .order("scheduled_for", { ascending: true });
    if (error) loadError = error.message;
    else bookings = (data as BookingWithDoctor[]) ?? [];
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Failed to load.";
  }

  const now = Date.now();
  const upcoming = bookings.filter((b) => new Date(b.scheduled_for).getTime() >= now);
  const past = bookings.filter((b) => new Date(b.scheduled_for).getTime() < now);

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-gradient-to-br from-[#e5f0eb] via-[#eef3f0] to-[#e8e6f2] dark:from-[#080a09] dark:via-[#0d1210] dark:to-[#0a0c14]">
      <AppHeader email={email} active="bookings" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          My bookings
        </h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
          Your upcoming and past sessions, in one place.
        </p>

        {loadError && (
          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <strong>Setup needed:</strong> {loadError}
          </div>
        )}

        {bookings.length === 0 && !loadError && (
          <div className="mt-10 rounded-3xl border border-dashed border-stone-300 p-12 text-center dark:border-stone-700">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-stone-100 dark:bg-stone-800">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              No bookings yet.
            </p>
            <Link
              href="/doctors"
              className="mt-4 inline-block rounded-full bg-teal-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-teal-700"
            >
              Browse doctors
            </Link>
          </div>
        )}

        {upcoming.length > 0 && (
          <Section title="Upcoming" items={upcoming} />
        )}
        {past.length > 0 && (
          <Section title="Past" items={past} muted />
        )}
      </main>
    </div>
  );
}

function Section({
  title,
  items,
  muted = false,
}: {
  title: string;
  items: BookingWithDoctor[];
  muted?: boolean;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
        {title} · {items.length}
      </h2>
      <ul className="space-y-3">
        {items.map((b) => (
          <BookingCard key={b.id} booking={b} muted={muted} />
        ))}
      </ul>
    </section>
  );
}

function BookingCard({
  booking,
  muted = false,
}: {
  booking: BookingWithDoctor;
  muted?: boolean;
}) {
  const date = new Date(booking.scheduled_for);
  const statusStyles =
    booking.status === "paid"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
      : booking.status === "cancelled"
      ? "bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
      : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";

  return (
    <li
      className={`flex items-start gap-4 rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow dark:bg-stone-900 ${
        muted
          ? "border-stone-200/70 opacity-80 dark:border-stone-800/70"
          : "border-stone-200 dark:border-stone-800"
      }`}
    >
      {booking.doctors?.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={booking.doctors.photo_url}
          alt={booking.doctors.name}
          className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-white dark:ring-stone-900"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-stone-900 dark:text-stone-100">
              {booking.doctors?.name ?? "Doctor"}
            </h3>
            <p className="text-xs text-teal-700 dark:text-teal-400">
              {booking.doctors?.specialty}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${statusStyles}`}
          >
            {booking.status.replace("_", " ")}
          </span>
        </div>
        <p className="mt-2 flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>
            {date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
            {" · "}
            {date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
          </span>
        </p>
        {booking.notes && (
          <p className="mt-2 rounded-lg bg-stone-50 px-3 py-2 text-xs italic text-stone-600 dark:bg-stone-800/40 dark:text-stone-400">
            “{booking.notes}”
          </p>
        )}
      </div>
    </li>
  );
}
