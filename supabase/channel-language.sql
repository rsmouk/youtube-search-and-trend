-- Channel content language for locale-scoped suggested channels
-- Run in Supabase SQL Editor

alter table public.site_channels
  add column if not exists language text;

create index if not exists idx_site_channels_language_featured
  on public.site_channels (language, featured, like_count desc);

-- Existing channels default to English (root locale)
update public.site_channels
set language = 'en'
where language is null;

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
      language, search_count, first_seen_at, last_seen_at
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
      nullif(ch->>'language', ''),
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
      language = coalesce(site_channels.language, excluded.language),
      search_count = site_channels.search_count + 1,
      last_seen_at = now();
  end loop;
end;
$$;

grant execute on function public.upsert_site_channels(jsonb) to authenticated, anon;

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
    language, search_count, first_seen_at, last_seen_at
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
    nullif(ch->>'language', ''),
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
    language = coalesce(site_channels.language, excluded.language),
    last_seen_at = now();
end;
$$;

grant execute on function public.ensure_site_channel(jsonb) to authenticated;
