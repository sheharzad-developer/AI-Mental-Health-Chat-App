import Link from "next/link";
import { auth } from "@/auth";
import { AppHeader } from "@/components/AppHeader";
import { supabaseAdmin, type Doctor } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function DoctorsPage() {
  const session = await auth();
  const email = session?.user?.email ?? "";

  let doctors: Doctor[] = [];
  let loadError: string | null = null;
  try {
    const { data, error } = await supabaseAdmin()
      .from("doctors")
      .select("*")
      .order("name");
    if (error) loadError = error.message;
    else doctors = (data as Doctor[]) ?? [];
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Failed to load.";
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-gradient-to-br from-[#e5f0eb] via-[#eef3f0] to-[#e8e6f2] dark:from-[#080a09] dark:via-[#0d1210] dark:to-[#0a0c14]">
      <AppHeader email={email} active="doctors" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-8 sm:px-6 sm:pb-10 sm:pt-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Find your therapist
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-600 dark:text-stone-400">
            Licensed mental health professionals across specialties. Tap a card
            to read their full bio and book a session.
          </p>
        </div>

        {loadError && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <strong>Setup needed:</strong> {loadError}
          </div>
        )}

        {doctors.length === 0 && !loadError && (
          <div className="rounded-2xl border border-dashed border-stone-300 p-16 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
            No doctors listed yet.
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((d) => (
            <DoctorCard key={d.id} doctor={d} />
          ))}
        </div>
      </main>
    </div>
  );
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Link
      href={`/doctors/${doctor.id}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl dark:border-stone-800 dark:bg-stone-900 dark:hover:border-teal-700"
    >
      <div className="relative h-52 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={doctor.photo_url}
          alt={doctor.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-teal-700 shadow-sm backdrop-blur">
          {doctor.years_experience}+ yrs
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-teal-700 dark:text-teal-400">
          {doctor.specialty}
        </p>
        <h3 className="mt-1.5 text-lg font-bold text-stone-900 dark:text-stone-100">
          {doctor.name}
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {doctor.credentials}
        </p>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          {doctor.bio}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {doctor.languages.slice(0, 2).map((lang) => (
              <span
                key={lang}
                className="rounded-full bg-stone-100 px-2 py-0.5 text-[0.7rem] text-stone-600 dark:bg-stone-800 dark:text-stone-400"
              >
                {lang}
              </span>
            ))}
            {doctor.languages.length > 2 && (
              <span className="text-[0.7rem] text-stone-500 dark:text-stone-500">
                +{doctor.languages.length - 2}
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-teal-700 transition group-hover:translate-x-0.5 dark:text-teal-300">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
