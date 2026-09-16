-- Run in Supabase SQL Editor

create table if not exists public.youtube_api_usage (
  id uuid primary key default gen_random_uuid(),
  usage_date date not null,
  key_suffix text not null,
  key_hash text not null,
  units_used integer not null default 0,
  request_count integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (usage_date, key_hash)
);

create index if not exists idx_youtube_api_usage_date
  on public.youtube_api_usage (usage_date desc);

alter table public.youtube_api_usage enable row level security;

-- Server uses service role; no direct client access
drop policy if exists "youtube_api_usage_no_client" on public.youtube_api_usage;
create policy "youtube_api_usage_no_client" on public.youtube_api_usage
  for all using (false);

create or replace function public.increment_youtube_quota(
  p_usage_date date,
  p_key_suffix text,
  p_key_hash text,
  p_units integer,
  p_requests integer default 1
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.youtube_api_usage (
    usage_date, key_suffix, key_hash, units_used, request_count, updated_at
  ) values (
    p_usage_date, p_key_suffix, p_key_hash, greatest(p_units, 0), greatest(p_requests, 0), now()
  )
  on conflict (usage_date, key_hash) do update set
    units_used = youtube_api_usage.units_used + excluded.units_used,
    request_count = youtube_api_usage.request_count + excluded.request_count,
    key_suffix = excluded.key_suffix,
    updated_at = now();
end;
$$;

-- Callable only via service role in practice; revoke from anon/authenticated
revoke all on function public.increment_youtube_quota(date, text, text, integer, integer) from public;
grant execute on function public.increment_youtube_quota(date, text, text, integer, integer) to service_role;
