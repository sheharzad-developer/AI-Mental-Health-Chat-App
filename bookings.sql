-- Run in Supabase Dashboard → SQL Editor → New query

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  scheduled_for timestamptz not null,
  notes text,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'cancelled')),
  stripe_session_id text,
  created_at timestamptz not null default now()
);

create index bookings_user_idx on public.bookings (user_email, scheduled_for desc);
create index bookings_doctor_idx on public.bookings (doctor_id, scheduled_for);

alter table public.bookings enable row level security;
-- All access via server (service role bypasses RLS); keep RLS on as a safety net.
