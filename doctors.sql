-- Run this in Supabase Dashboard → SQL Editor → New query

create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text not null,
  credentials text not null,
  bio text not null,
  photo_url text not null,
  languages text[] not null default '{}',
  years_experience integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.doctors enable row level security;

-- Public read so the app's anon key could also read if you ever switch from server-side fetching
create policy "doctors are readable by everyone" on public.doctors
  for select using (true);

-- Seed data — feel free to edit/delete and add your own
insert into public.doctors (name, specialty, credentials, bio, photo_url, languages, years_experience) values
(
  'Dr. Ayesha Khan',
  'Anxiety & Depression',
  'PhD, Licensed Clinical Psychologist',
  E'Dr. Khan helps adults navigate anxiety, depression, and major life transitions using evidence-based CBT and ACT approaches.\n\nShe believes therapy works best when it''s practical, warm, and collaborative.',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80',
  '{"English","Urdu"}',
  12
),
(
  'Dr. Marcus Chen',
  'Trauma & PTSD',
  'MD, Board-Certified Psychiatrist',
  E'Dr. Chen specializes in trauma recovery, EMDR, and medication management for PTSD, complex trauma, and dissociative disorders.\n\nHe takes a gentle, paced approach focused on safety and stabilization first.',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80',
  '{"English","Mandarin"}',
  9
),
(
  'Dr. Sofía Reyes',
  'Couples & Relationships',
  'PsyD, Licensed Marriage & Family Therapist',
  E'Dr. Reyes works with couples and families using the Gottman Method and emotionally focused therapy.\n\nShe helps partners rebuild trust, repair communication, and reconnect emotionally.',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&q=80',
  '{"English","Spanish"}',
  15
),
(
  'Dr. Daniel O''Connor',
  'Addiction Recovery',
  'PhD, Licensed Addiction Counselor',
  E'Dr. O''Connor supports clients through alcohol, substance, and behavioral addictions using motivational interviewing and harm-reduction principles.\n\nHis approach is non-judgmental, practical, and goal-oriented.',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&q=80',
  '{"English"}',
  18
),
(
  'Dr. Priya Sharma',
  'Adolescents & Teens',
  'MD, Child & Adolescent Psychiatrist',
  E'Dr. Sharma works with teens and young adults on anxiety, identity, school stress, and family conflict.\n\nShe creates a calm, judgment-free space where young people feel genuinely heard.',
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&q=80',
  '{"English","Hindi","Urdu"}',
  7
),
(
  'Dr. James Holloway',
  'Mindfulness & Stress',
  'PhD, Licensed Psychologist',
  E'Dr. Holloway integrates mindfulness-based stress reduction (MBSR) with cognitive therapy to help busy professionals manage burnout, sleep, and chronic stress.\n\nExpect practical tools you can use the same day.',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=600&q=80',
  '{"English"}',
  20
);
