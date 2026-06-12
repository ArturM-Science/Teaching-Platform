-- Instructor read access for the admin panel.
-- security definer so the role check doesn't recurse into the users RLS policy.

create or replace function public.is_instructor()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'instructor'
  );
$$;

create policy "Instructors can read all users" on public.users
  for select using (public.is_instructor());

create policy "Instructors can read all progress" on public.progress
  for select using (public.is_instructor());

create policy "Instructors can read all lesson progress" on public.lesson_progress
  for select using (public.is_instructor());

-- Promote an account by running (replace the email):
-- update public.users set role = 'instructor' where email = 'you@example.com';
