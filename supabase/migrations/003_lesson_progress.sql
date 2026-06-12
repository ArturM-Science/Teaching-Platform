-- Lesson-level progress: one row per lesson a user has opened.
-- Keyed by slugs (not FK ids) because lessons live in the content folder, not the DB.

create table public.lesson_progress (
  user_id uuid not null references public.users(id) on delete cascade,
  module_slug text not null,
  lesson_slug text not null,
  viewed_at timestamptz not null default now(),
  primary key (user_id, module_slug, lesson_slug)
);

alter table public.lesson_progress enable row level security;

create policy "Users can read and write their own lesson progress" on public.lesson_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
