-- نفّذ هذا الملف في Supabase → SQL Editor

-- Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_read_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_read_admin" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Site channels (discovered via search)
create table if not exists public.site_channels (
  id uuid primary key default gen_random_uuid(),
  channel_id text not null unique,
  title text not null,
  thumbnail_url text,
  subscriber_count text default '0',
  description text default '',
  custom_url text,
  country text,
  view_count text default '0',
  video_count text default '0',
  hidden_subscriber_count boolean default false,
  featured boolean not null default false,
  search_count integer not null default 1,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_site_channels_featured on public.site_channels (featured);
create index if not exists idx_site_channels_country on public.site_channels (country);
create index if not exists idx_site_channels_title on public.site_channels (title);

alter table public.site_channels enable row level security;

create policy "site_channels_read_all" on public.site_channels
  for select using (true);

create policy "site_channels_admin_update" on public.site_channels
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- User saved channels
create table if not exists public.user_saved_channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  channel_id text not null,
  title text not null,
  thumbnail_url text,
  subscriber_count text default '0',
  description text default '',
  custom_url text,
  country text,
  view_count text default '0',
  video_count text default '0',
  hidden_subscriber_count boolean default false,
  saved_at timestamptz not null default now(),
  unique (user_id, channel_id)
);

create index if not exists idx_user_saved_user on public.user_saved_channels (user_id);

alter table public.user_saved_channels enable row level security;

create policy "saved_read_own" on public.user_saved_channels
  for select using (auth.uid() = user_id);

create policy "saved_insert_own" on public.user_saved_channels
  for insert with check (auth.uid() = user_id);

create policy "saved_delete_own" on public.user_saved_channels
  for delete using (auth.uid() = user_id);

create policy "saved_admin_read" on public.user_saved_channels
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Upsert channels from search (increment search_count)
create or replace function public.upsert_site_channels(channels jsonb)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  ch jsonb;
begin
  for ch in select * from jsonb_array_elements(channels)
  loop
    insert into public.site_channels (
      channel_id, title, thumbnail_url, subscriber_count, description,
      custom_url, country, view_count, video_count, hidden_subscriber_count,
      search_count, first_seen_at, last_seen_at
    ) values (
      ch->>'channel_id',
      ch->>'title',
      ch->>'thumbnail_url',
      coalesce(ch->>'subscriber_count', '0'),
      coalesce(ch->>'description', ''),
      ch->>'custom_url',
      ch->>'country',
      coalesce(ch->>'view_count', '0'),
      coalesce(ch->>'video_count', '0'),
      coalesce((ch->>'hidden_subscriber_count')::boolean, false),
      1,
      now(),
      now()
    )
    on conflict (channel_id) do update set
      title = excluded.title,
      thumbnail_url = excluded.thumbnail_url,
      subscriber_count = excluded.subscriber_count,
      description = excluded.description,
      custom_url = excluded.custom_url,
      country = excluded.country,
      view_count = excluded.view_count,
      video_count = excluded.video_count,
      hidden_subscriber_count = excluded.hidden_subscriber_count,
      search_count = site_channels.search_count + 1,
      last_seen_at = now();
  end loop;
end;
$$;

grant execute on function public.upsert_site_channels(jsonb) to authenticated, anon;
