import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/AppHeader";
import { supabaseAdmin, type Doctor } from "@/lib/supabase";
import { bookSession } from "./actions";

export const dynamic = "force-dynamic";

const TIME_SLOTS = [
  { value: "09:00", label: "9:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "16:00", label: "4:00 PM" },
];

export default async function DoctorProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const session = await auth();
  const email = session?.user?.email ?? "";

  let doctor: Doctor | null = null;
  try {
    const { data } = await supabaseAdmin()
      .from("doctors")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    doctor = (data as Doctor) ?? null;
  } catch {
    // surface as 404
  }

  if (!doctor) notFound();

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-gradient-to-br from-[#e5f0eb] via-[#eef3f0] to-[#e8e6f2] dark:from-[#080a09] dark:via-[#0d1210] dark:to-[#0a0c14]">
      <AppHeader email={email} active="doctors" />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-6 sm:px-6 sm:pb-10 sm:pt-8">
        <Link
          href="/doctors"
          className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-stone-600 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          ← All doctors
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Profile card */}
          <article className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="relative h-72 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doctor.photo_url}
                alt={doctor.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] opacity-90">
                  {doctor.specialty}
                </p>
                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                  {doctor.name}
                </h1>
              </div>
            </div>
            <div className="p-7">
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {doctor.credentials}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Stat label="Experience" value={`${doctor.years_experience}+ yrs`} />
                <Stat label="Languages" value={doctor.languages.join(", ")} />
              </div>

              <h2 className="mt-7 text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                About
              </h2>
              <p className="mt-2 whitespace-pre-line text-[0.95rem] leading-relaxed text-stone-700 dark:text-stone-300">
                {doctor.bio}
              </p>
            </div>
          </article>

          {/* Booking sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-teal-200 bg-gradient-to-br from-white to-teal-50/40 p-7 shadow-sm dark:border-teal-900/60 dark:from-stone-900 dark:to-teal-950/30">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Book a session
                </h2>
                <span className="text-2xl font-bold text-teal-700 dark:text-teal-300">
                  $9.99
                </span>
              </div>
              <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                30-minute video session · Reserved on payment
              </p>

              {error && (
                <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                  {error}
                </p>
              )}

              <form
                action={bookSession.bind(null, doctor.id)}
                className="mt-5 space-y-4"
              >
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-700 dark:text-stone-300">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    min={tomorrow}
                    defaultValue={tomorrow}
                    required
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-stone-700 dark:bg-stone-950"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-700 dark:text-stone-300">
                    Time
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_SLOTS.map((s, i) => (
                      <label
                        key={s.value}
                        className="cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="time"
                          value={s.value}
                          defaultChecked={i === 1}
                          className="peer sr-only"
                          required
                        />
                        <span className="block rounded-lg border border-stone-300 bg-white px-3 py-2 text-center text-sm text-stone-700 transition peer-checked:border-teal-500 peer-checked:bg-teal-600 peer-checked:text-white peer-checked:shadow-sm hover:border-stone-400 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300">
                          {s.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-stone-700 dark:text-stone-300">
                    Notes <span className="font-normal text-stone-400">(optional)</span>
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    maxLength={500}
                    placeholder="Anything the doctor should know in advance?"
                    className="w-full resize-none rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-stone-700 dark:bg-stone-950"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                >
                  Continue to payment →
                </button>
                <p className="text-center text-[0.7rem] text-stone-500 dark:text-stone-500">
                  Secured by Stripe · Cancel anytime
                </p>
              </form>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/40">
      <p className="text-[0.65rem] font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-stone-900 dark:text-stone-100">
        {value}
      </p>
    </div>
  );
}
