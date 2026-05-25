-- Users are managed by Supabase Auth (auth.users)
-- This extends them with app-specific fields

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'learner' check (role in ('learner', 'instructor')),
  created_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  created_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  number int not null,
  slug text not null,
  title text not null,
  unique(course_id, number),
  unique(course_id, slug)
);

create table public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'complete')),
  checkpoint_passed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, module_id)
);

create table public.workshops (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  scheduled_at timestamptz not null,
  meeting_url text not null,
  replay_url text,
  instructor_id uuid not null references public.users(id),
  created_at timestamptz not null default now()
);

create table public.workshop_registrations (
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  registered_at timestamptz not null default now(),
  primary key (workshop_id, user_id)
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.progress enable row level security;
alter table public.workshops enable row level security;
alter table public.workshop_registrations enable row level security;

-- Policies
create policy "Users can read their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Courses are public" on public.courses
  for select using (true);

create policy "Modules are public" on public.modules
  for select using (true);

create policy "Users can read and write their own progress" on public.progress
  for all using (auth.uid() = user_id);

create policy "Workshops are public" on public.workshops
  for select using (true);

create policy "Users can read their own registrations" on public.workshop_registrations
  for select using (auth.uid() = user_id);

create policy "Users can register for workshops" on public.workshop_registrations
  for insert with check (auth.uid() = user_id);

-- Trigger: auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
