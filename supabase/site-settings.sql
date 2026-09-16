-- Run this in Supabase SQL Editor if you already applied schema.sql before site_settings existed

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_no_client" on public.site_settings;
create policy "site_settings_no_client" on public.site_settings
  for all using (false);
