-- نفّذ هذا في Supabase → SQL Editor (يصلح أخطاء 500)
-- السبب: تكرار RLS + غياب سياسة UPDATE للمحفوظات

-- 1) دالة is_admin بدون تكرار
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.get_my_profile()
returns table (id uuid, email text, role text)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.email, p.role
  from public.profiles p
  where p.id = auth.uid();
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.get_my_profile() to authenticated;

-- 2) إزالة السياسات القديمة التي تسبب 500
drop policy if exists "profiles_read_admin" on public.profiles;
drop policy if exists "saved_admin_read" on public.user_saved_channels;
drop policy if exists "site_channels_admin_update" on public.site_channels;
drop policy if exists "saved_update_own" on public.user_saved_channels;

-- 3) إعادة إنشاء السياسات الصحيحة
create policy "profiles_read_admin" on public.profiles
  for select using (public.is_admin());

create policy "site_channels_admin_update" on public.site_channels
  for update using (public.is_admin())
  with check (public.is_admin());

create policy "saved_admin_read" on public.user_saved_channels
  for select using (public.is_admin());

-- upsert يحتاج UPDATE وليس INSERT فقط
create policy "saved_update_own" on public.user_saved_channels
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4) RPC لتعيين القناة كمقترحة (أكثر موثوقية)
create or replace function public.set_channel_featured(
  p_channel_id text,
  p_featured boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;

  update public.site_channels
  set featured = p_featured
  where channel_id = p_channel_id;
end;
$$;

grant execute on function public.set_channel_featured(text, boolean) to authenticated;
