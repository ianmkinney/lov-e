-- lov-e initial schema (adjust RLS for production)

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  display_name text,
  created_at timestamptz default now()
);

create table if not exists public.matches (
  id uuid primary key default uuid_generate_v4(),
  player_label text,
  opponent_label text,
  started_at timestamptz default now(),
  ended_at timestamptz,
  player_sets int default 0,
  opponent_sets int default 0,
  status text default 'live',
  video_path text,
  mode text default 'solo'
);

create table if not exists public.match_events (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references public.matches(id) on delete cascade,
  timestamp_ms bigint not null,
  video_offset_ms bigint,
  type text not null,
  shot_type text,
  landing_call text,
  hitter text,
  confidence double precision,
  contested boolean default false,
  description text,
  frame_url text,
  created_at timestamptz default now()
);

create table if not exists public.match_rooms (
  id uuid primary key default uuid_generate_v4(),
  room_code text unique not null,
  host_id text not null,
  guest_id text,
  match_id uuid references public.matches(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_match_events_match_id on public.match_events(match_id);
create index if not exists idx_match_rooms_code on public.match_rooms(room_code);

alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.match_events enable row level security;
alter table public.match_rooms enable row level security;

-- Demo: allow anon read/write (replace with auth.uid() policies in production)
create policy "profiles_all" on public.profiles for all using (true) with check (true);
create policy "matches_all" on public.matches for all using (true) with check (true);
create policy "match_events_all" on public.match_events for all using (true) with check (true);
create policy "match_rooms_all" on public.match_rooms for all using (true) with check (true);
