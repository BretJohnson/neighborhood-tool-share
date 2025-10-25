-- Add category and model columns to tools table

alter table public.tools
  add column if not exists category text check (category in ('Power Tools', 'Hand Tools', 'Garden', 'Ladders', 'Automotive', 'Cleaning', 'Other')),
  add column if not exists model text;

-- Set default value for existing rows
update public.tools
set category = 'Other'
where category is null;

-- Make category required for new rows
alter table public.tools
  alter column category set not null,
  alter column category set default 'Other';

-- Add index for category filtering
create index if not exists tools_category_idx on public.tools (category);

-- Update search function to include category and model in search
drop function if exists public.search_tools(text);
create or replace function public.search_tools(search_query text)
returns setof public.tools
language sql
stable
as $$
  select *
  from public.tools
  where to_tsvector('english', name || ' ' || coalesce(description, '') || ' ' || coalesce(category, '') || ' ' || coalesce(model, ''))
        @@ plainto_tsquery('english', search_query);
$$;

-- Update the search index to include category and model
drop index if exists public.tools_search_idx;
create index tools_search_idx on public.tools using gin (
  to_tsvector('english', name || ' ' || coalesce(description, '') || ' ' || coalesce(category, '') || ' ' || coalesce(model, ''))
);
