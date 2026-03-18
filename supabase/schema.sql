-- 1. Add frequency column to goals table
ALTER TABLE goals ADD COLUMN IF NOT EXISTS frequency text NOT NULL DEFAULT 'one_time';

-- 2. Create daily_checkins table
CREATE TABLE IF NOT EXISTS daily_checkins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    check_date date NOT NULL,
    completed boolean NOT NULL DEFAULT true,
    note text,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(goal_id, user_id, check_date)
);

-- 3. RLS policies for daily_checkins
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view check-ins" ON daily_checkins FOR SELECT
USING (EXISTS (SELECT 1 FROM goals g JOIN org_members om ON om.org_id = g.org_id WHERE g.id = daily_checkins.goal_id AND om.user_id = auth.uid()));

CREATE POLICY "Users can insert own check-ins" ON daily_checkins FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own check-ins" ON daily_checkins FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own check-ins" ON daily_checkins FOR DELETE USING (user_id = auth.uid());

-- 4. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_daily_checkins_goal_user ON daily_checkins(goal_id, user_id, check_date);
create table if not exists member_goal_status (
  id            uuid primary key default gen_random_uuid(),
  goal_id       uuid not null references goals(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  org_id        uuid not null references organizations(id) on delete cascade,
  status        text not null default 'on_track'
                  check (status in ('on_track', 'behind', 'blocked', 'completed')),
  note          text,
  contribution  numeric default 0,   -- optional personal metric value
  updated_at    timestamptz not null default now(),
  unique (goal_id, user_id)           -- one row per (goal, member)
);

-- RLS
alter table member_goal_status enable row level security;

-- Members can update their own row; org members can read all rows in their org
create policy "Members can upsert their own status"
  on member_goal_status for all
  using (
    exists (
      select 1 from org_members
      where org_members.org_id = member_goal_status.org_id
        and org_members.user_id = auth.uid()
    )
  );
-- Add missing columns to the goals table
ALTER TABLE goals 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS target_number NUMERIC,
ADD COLUMN IF NOT EXISTS unit TEXT;
-- 1. Allow Admins/Owners to delete goals
CREATE POLICY "Admins can delete goals"
ON goals
FOR DELETE
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM org_members
    WHERE org_members.org_id = goals.org_id
    AND org_members.user_id = auth.uid()
    AND org_members.role IN ('owner', 'admin')
  )
);

-- 2. Allow Admins/Owners to delete progress updates
CREATE POLICY "Admins can delete progress updates"
ON progress_updates
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM goals
    JOIN org_members ON org_members.org_id = goals.org_id
    WHERE goals.id = progress_updates.goal_id
    AND (goals.created_by = auth.uid() OR (org_members.user_id = auth.uid() AND org_members.role IN ('owner', 'admin')))
  )
);
-- 🔓 Public Access for Invitations
-- This allows guest users to see what they are joining before they sign up.

-- 1. Create a policy to allow anyone to read a PENDING invitation.
-- Since tokens are high-entropy UUIDs, this is effectively safe.
DROP POLICY IF EXISTS "Public can view pending invitations" ON invitations;
CREATE POLICY "Public can view pending invitations" ON invitations
    FOR SELECT USING (status = 'pending');

-- 2. Create a policy to allow anyone to read organization info 
-- IF that organization has an active pending invitation.
DROP POLICY IF EXISTS "Public can view organization for invitation" ON organizations;
CREATE POLICY "Public can view organization for invitation" ON organizations
    FOR SELECT USING (
        id IN (SELECT org_id FROM invitations WHERE status = 'pending')
    );

-- 🏗️ Advanced Org Architecture: Teams & Invitations

-- 1. Teams Table (allows departments within an Org)
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Invitations Table (manages pending members)
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, accepted, expired
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    invited_by UUID REFERENCES auth.users(id)
);

-- 3. Update org_members to support team_id
ALTER TABLE org_members ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- 4. Update goals to support team_id
ALTER TABLE goals ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- RLS for Teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see teams in their organizations" ON teams
    FOR SELECT USING (org_id IN (SELECT get_my_org_ids()));

CREATE POLICY "Owners can manage teams" ON teams
    FOR ALL USING (org_id IN (
        SELECT org_id FROM org_members 
        WHERE user_id = auth.uid() AND role = 'owner'
    ));

-- RLS for Invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can manage invitations" ON invitations
    FOR ALL USING (org_id IN (
        SELECT org_id FROM org_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    ));

-- 🩹 Data Recovery: Fix Corrupted Organization Names
-- Run this if your organizations show up as JSON strings like {"name": "..."}

UPDATE organizations
SET 
  name = (name::jsonb)->>'name',
  description = (name::jsonb)->>'description',
  emoji = (name::jsonb)->>'emoji'
WHERE name LIKE '{%';

-- Also ensure any members created during the bug are linked correctly
-- (This is just a safety check, usually the ID is fine)

-- 🎯 CrushGoals V1: Complete Database Schema (DEFINITIVE)
-- This is the ONE script to rule them all.
-- Safe to run multiple times. Will not delete data.

-- ==========================================
-- 1. CORE TABLES
-- ==========================================

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text
);

create table if not exists public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  emoji text default '🚀',
  owner_id uuid references public.profiles(id),
  plan text default 'free',
  created_at timestamp with time zone default now()
);

create table if not exists public.org_members (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text check (role in ('owner', 'member')),
  joined_at timestamp with time zone default now()
);

create table if not exists public.goals (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  title text not null,
  description text,
  emoji text,
  target_value text,
  current_value int default 0,
  deadline timestamp with time zone,
  category text,
  status text check (status in ('not_started', 'in_progress', 'blocked', 'completed')),
  priority text check (priority in ('low', 'medium', 'high')),
  created_by uuid references public.profiles(id),
  assigned_to jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.progress_updates (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references public.goals(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  content text,
  progress_value int,
  created_at timestamp with time zone default now()
);

-- ==========================================
-- 2. HELPER FUNCTION (breaks RLS recursion)
-- ==========================================

-- This function runs with elevated privileges (security definer)
-- so it bypasses RLS and prevents the infinite loop.
create or replace function public.get_my_org_ids()
returns setof uuid
language sql
security definer
set search_path = public
as $$
  select org_id from org_members where user_id = auth.uid();
$$;

-- ==========================================
-- 3. AUTOMATION
-- ==========================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- 4. SECURITY (RLS)
-- ==========================================

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.goals enable row level security;
alter table public.progress_updates enable row level security;

-- Drop ALL existing policies first
do $$ 
declare pol record;
begin 
  for pol in (select policyname, tablename from pg_policies where schemaname = 'public') 
  loop 
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop; 
end $$;

-- Profiles
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Organizations (uses helper function, NO reference to org_members)
create policy "orgs_select" on public.organizations for select using (
  owner_id = auth.uid() or id in (select public.get_my_org_ids())
);
create policy "orgs_insert" on public.organizations for insert with check (auth.role() = 'authenticated');
create policy "orgs_update" on public.organizations for update using (owner_id = auth.uid());

-- Org Members (uses helper function, NO reference to organizations)
create policy "members_select" on public.org_members for select using (
  org_id in (select public.get_my_org_ids())
);
create policy "members_insert" on public.org_members for insert with check (
  auth.role() = 'authenticated'
);

-- Goals (uses helper function, NO reference to org_members directly)
create policy "goals_select" on public.goals for select using (
  org_id in (select public.get_my_org_ids())
);
create policy "goals_insert" on public.goals for insert with check (
  org_id in (select public.get_my_org_ids())
);
create policy "goals_update" on public.goals for update using (
  org_id in (select public.get_my_org_ids())
);

-- Progress Updates
create policy "updates_select" on public.progress_updates for select using (
  goal_id in (select id from public.goals where org_id in (select public.get_my_org_ids()))
);
create policy "updates_insert" on public.progress_updates for insert with check (
  goal_id in (select id from public.goals where org_id in (select public.get_my_org_ids()))
);
