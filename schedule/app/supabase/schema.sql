-- Run once in Supabase Dashboard → SQL Editor.
create table if not exists public.planner_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.planner_states enable row level security;

-- Each signed-in user can read and change only their own planner.
drop policy if exists "Users can read their own planner" on public.planner_states;
create policy "Users can read their own planner"
  on public.planner_states for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own planner" on public.planner_states;
create policy "Users can create their own planner"
  on public.planner_states for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own planner" on public.planner_states;
create policy "Users can update their own planner"
  on public.planner_states for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on public.planner_states from anon;
grant select, insert, update on public.planner_states to authenticated;
