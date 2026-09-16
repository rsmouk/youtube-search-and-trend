-- نفّذ هذا في Supabase → SQL Editor
-- يضبط الأدمن حتى لو لم يُنشأ صف profiles أو كان البريد مختلفاً

-- 1) دوال مساعدة (إن لم تكن موجودة)
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

-- 2) ترقية المستخدم إلى أدمن (يُطابق auth.users بالبريد)
insert into public.profiles (id, email, role)
select u.id, u.email, 'admin'
from auth.users u
where lower(u.email) = lower('asfarfordev@gmail.com')
on conflict (id) do update
set role = 'admin', email = excluded.email;

-- 3) تحقق
select u.id, u.email as auth_email, p.email as profile_email, p.role
from auth.users u
left join public.profiles p on p.id = u.id
where lower(u.email) = lower('asfarfordev@gmail.com');
