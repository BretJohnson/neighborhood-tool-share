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

-- Create storage bucket for tool photos
insert into storage.buckets (id, name, public)
values ('tools', 'tools', true)
on conflict (id) do nothing;

-- Storage policies for tools bucket
-- Allow authenticated users to upload files to their own folder
create policy "Users can upload tool photos to their own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'tools' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all tool photos
create policy "Public can view tool photos"
on storage.objects for select
to public
using (bucket_id = 'tools');

-- Allow users to delete their own tool photos
create policy "Users can delete their own tool photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'tools' and
  (storage.foldername(name))[1] = auth.uid()::text
);
