-- ------------------------------------------------------------------
-- Migration: Initial schema for Abbington Neighborhood Tool Share
-- Creates core tables, policies, helper functions, and storage setup
-- ------------------------------------------------------------------
begin;

-- Ensure required extensions are available
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Users table ------------------------------------------------------
create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    facebook_id text unique not null,
    email text,
    full_name text not null,
    address text not null,
    phone_number text not null,
    agreed_to_rules_at timestamptz not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index if not exists users_facebook_id_idx on public.users (facebook_id);
create index if not exists users_created_at_idx on public.users (created_at);

-- Tools table ------------------------------------------------------
create table if not exists public.tools (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references public.users(id) on delete cascade,
    name text not null,
    description text,
    photo_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists tools_owner_id_idx on public.tools (owner_id);
create index if not exists tools_name_idx on public.tools (name);
create index if not exists tools_search_idx on public.tools using gin (to_tsvector('english', name || ' ' || coalesce(description, '')));

-- Timestamp trigger ------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute procedure public.set_updated_at();

drop trigger if exists set_tools_updated_at on public.tools;
create trigger set_tools_updated_at
before update on public.tools
for each row execute procedure public.set_updated_at();

-- Search helper ----------------------------------------------------
create or replace function public.search_tools(search_query text)
returns setof public.tools
language sql
stable
as $$
  select *
  from public.tools
  where to_tsvector('english', name || ' ' || coalesce(description, ''))
        @@ plainto_tsquery('english', search_query);
$$;

-- Row Level Security -----------------------------------------------
alter table public.users enable row level security;
alter table public.tools enable row level security;

-- Users policies
drop policy if exists "Users can view all users" on public.users;
create policy "Users can view all users"
  on public.users
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users
  for update
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile"
  on public.users
  for insert
  with check (auth.uid() = id);

-- Tools policies
drop policy if exists "Authenticated users can view all tools" on public.tools;
create policy "Authenticated users can view all tools"
  on public.tools
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "Users can insert own tools" on public.tools;
create policy "Users can insert own tools"
  on public.tools
  for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Users can update own tools" on public.tools;
create policy "Users can update own tools"
  on public.tools
  for update
  using (auth.uid() = owner_id);

drop policy if exists "Users can delete own tools" on public.tools;
create policy "Users can delete own tools"
  on public.tools
  for delete
  using (auth.uid() = owner_id);

-- Storage bucket ---------------------------------------------------
select storage.create_bucket('tools', public => true)
where not exists (
  select 1
  from storage.buckets
  where id = 'tools'
);

commit;
