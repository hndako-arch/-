-- Create the closet_items table
create table public.closet_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  brand text check (brand in ('UNIQLO', 'GU')) not null,
  product_id text not null,
  name text not null,
  image_url text,
  item_url text
);

-- Set up Row Level Security (RLS)
-- For now, enabling public read/write for simplicity of the prototype.
-- In a real app, you'd want to restrict this to authenticated users.
alter table public.closet_items enable row level security;

create policy "Allow public read access"
on public.closet_items for select
to anon
using (true);

create policy "Allow public insert access"
on public.closet_items for insert
to anon
with check (true);
