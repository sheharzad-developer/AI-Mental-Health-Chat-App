-- Run in Supabase Dashboard → SQL Editor → New query

create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text,
  created_at timestamptz not null default now()
);

create index users_email_idx on public.users (email);

alter table public.users enable row level security;
-- All access via server (service role bypasses RLS).
