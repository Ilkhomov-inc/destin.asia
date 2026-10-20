-- Destin Asia schema. Run in Supabase → SQL Editor (or `supabase db push`).
-- All reads/writes go through the Next.js server with the service-role key,
-- so RLS is enabled with no policies: the public anon key can't touch anything.

create table if not exists locations (
  id uuid primary key,
  slug text unique not null,
  title jsonb not null default '{"ru":"","uz":""}',
  region text not null default '',
  category text not null default 'city',
  short jsonb not null default '{"ru":"","uz":""}',
  description jsonb not null default '{"ru":"","uz":""}',
  highlights jsonb not null default '{"ru":[],"uz":[]}',
  duration jsonb not null default '{"ru":"","uz":""}',
  price_note jsonb not null default '{"ru":"","uz":""}',
  travel_min integer,
  visit_hours numeric not null default 1.5,
  lat double precision,
  lng double precision,
  cover text not null default '',
  images jsonb not null default '[]',
  status text not null default 'draft' check (status in ('published','draft')),
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists tours (
  id uuid primary key,
  slug text unique not null,
  kind text not null default 'ready' check (kind in ('ready','custom')),
  title jsonb not null default '{"ru":"","uz":""}',
  short jsonb not null default '{"ru":"","uz":""}',
  description jsonb not null default '{"ru":"","uz":""}',
  duration_days integer not null default 1,
  price_from numeric,
  price_note jsonb not null default '{"ru":"","uz":""}',
  cover text not null default '',
  images jsonb not null default '[]',
  included jsonb not null default '{"ru":[],"uz":[]}',
  not_included jsonb not null default '{"ru":[],"uz":[]}',
  program jsonb not null default '[]',
  location_ids jsonb not null default '[]',
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('published','draft')),
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists vehicles (
  id uuid primary key,
  name jsonb not null default '{"ru":"","uz":""}',
  vclass text not null default 'mpv',
  examples text not null default '',
  seats integer not null default 4,
  luggage integer not null default 2,
  description jsonb not null default '{"ru":"","uz":""}',
  features jsonb not null default '{"ru":[],"uz":[]}',
  image text not null default '',
  price_hour numeric,
  price_day numeric,
  price_transfer numeric,
  status text not null default 'draft' check (status in ('published','draft')),
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key,
  name text not null,
  country text not null default '',
  text text not null,
  rating integer not null default 5 check (rating between 1 and 5),
  photo text not null default '',
  tour_id uuid references tours(id) on delete set null,
  status text not null default 'published' check (status in ('published','draft')),
  created_at timestamptz not null default now()
);

create table if not exists inquiries (
  id uuid primary key,
  name text not null,
  contact text not null,
  channel text not null default 'telegram',
  lang text not null default 'ru',
  people integer,
  date_from text,
  date_to text,
  days integer,
  tour_id uuid references tours(id) on delete set null,
  location_ids jsonb not null default '[]',
  vehicle_id uuid references vehicles(id) on delete set null,
  message text not null default '',
  source text not null default '',
  status text not null default 'new' check (status in ('new','in_progress','done','spam')),
  note text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists inquiries_created_idx on inquiries (created_at desc);

create table if not exists settings (
  id text primary key default 'main',
  phone text not null default '',
  email text not null default '',
  telegram text not null default '',
  whatsapp text not null default '',
  instagram text not null default '',
  address text not null default '',
  hero_title jsonb not null default '{"ru":"","uz":""}',
  hero_subtitle jsonb not null default '{"ru":"","uz":""}',
  about jsonb not null default '{"ru":"","uz":""}',
  about_extra jsonb not null default '{"ru":"","uz":""}',
  about_image text not null default '',
  rates jsonb not null default '{"MYR":4.25,"UZS":12700,"KZT":515}'
);

alter table locations enable row level security;
alter table tours enable row level security;
alter table vehicles enable row level security;
alter table reviews enable row level security;
alter table inquiries enable row level security;
alter table settings enable row level security;

-- Public bucket for uploaded photos (uploads go through the server).
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
