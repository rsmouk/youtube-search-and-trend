-- Run in Supabase SQL Editor (migration for likes system)

-- Like count on site channels
alter table public.site_channels
  add column if not exists like_count integer not null default 0;

create index if not exists idx_site_channels_like_count
  on public.site_channels (like_count desc);

create index if not exists idx_site_channels_featured_likes
  on public.site_channels (featured, like_count desc);

-- Channel likes (one like per user per channel)
create table if not exists public.channel_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  channel_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, channel_id)
);

create index if not exists idx_channel_likes_channel
  on public.channel_likes (channel_id);

create index if not exists idx_channel_likes_user
  on public.channel_likes (user_id);

alter table public.channel_likes enable row level security;

drop policy if exists "likes_read_own" on public.channel_likes;
create policy "likes_read_own" on public.channel_likes
  for select using (auth.uid() = user_id);

drop policy if exists "likes_read_admin" on public.channel_likes;
create policy "likes_read_admin" on public.channel_likes
  for select using (public.is_admin());

drop policy if exists "likes_insert_own" on public.channel_likes;
create policy "likes_insert_own" on public.channel_likes
  for insert with check (auth.uid() = user_id);

drop policy if exists "likes_delete_own" on public.channel_likes;
create policy "likes_delete_own" on public.channel_likes
  for delete using (auth.uid() = user_id);

-- Maintain like_count + auto-feature when reaching 2 likes (once)
create or replace function public.handle_channel_like_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
  threshold integer := 2;
begin
  if tg_op = 'INSERT' then
    update public.site_channels
    set like_count = like_count + 1
    where channel_id = new.channel_id
    returning like_count into new_count;

    if new_count = threshold then
      update public.site_channels
      set featured = true
      where channel_id = new.channel_id;
    end if;

    return new;
  elsif tg_op = 'DELETE' then
    update public.site_channels
    set like_count = greatest(like_count - 1, 0)
    where channel_id = old.channel_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists on_channel_like_change on public.channel_likes;
create trigger on_channel_like_change
  after insert or delete on public.channel_likes
  for each row execute procedure public.handle_channel_like_change();

-- Ensure channel row exists before liking (no search_count bump)
create or replace function public.ensure_site_channel(ch jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.site_channels (
    channel_id, title, thumbnail_url, subscriber_count, description,
    custom_url, country, view_count, video_count, hidden_subscriber_count,
    search_count, first_seen_at, last_seen_at
  ) values (
    ch->>'channel_id',
    coalesce(ch->>'title', 'Unknown'),
    ch->>'thumbnail_url',
    coalesce(ch->>'subscriber_count', '0'),
    coalesce(ch->>'description', ''),
    ch->>'custom_url',
    ch->>'country',
    coalesce(ch->>'view_count', '0'),
    coalesce(ch->>'video_count', '0'),
    coalesce((ch->>'hidden_subscriber_count')::boolean, false),
    0,
    now(),
    now()
  )
  on conflict (channel_id) do update set
    title = excluded.title,
    thumbnail_url = coalesce(excluded.thumbnail_url, site_channels.thumbnail_url),
    subscriber_count = excluded.subscriber_count,
    description = excluded.description,
    custom_url = excluded.custom_url,
    country = excluded.country,
    view_count = excluded.view_count,
    video_count = excluded.video_count,
    hidden_subscriber_count = excluded.hidden_subscriber_count,
    last_seen_at = now();
end;
$$;

grant execute on function public.ensure_site_channel(jsonb) to authenticated;

-- Backfill like_count from existing likes (if any)
update public.site_channels sc
set like_count = coalesce((
  select count(*)::integer from public.channel_likes cl
  where cl.channel_id = sc.channel_id
), 0);
