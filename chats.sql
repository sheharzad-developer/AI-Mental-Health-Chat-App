-- Run in Supabase Dashboard → SQL Editor → New query

create table public.chats (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index chats_user_idx on public.chats (user_email, updated_at desc);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  crisis boolean default false,
  created_at timestamptz not null default now()
);

create index chat_messages_chat_idx on public.chat_messages (chat_id, created_at);

alter table public.chats enable row level security;
alter table public.chat_messages enable row level security;
-- All access via server (service role bypasses RLS).
