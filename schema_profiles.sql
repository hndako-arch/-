-- Create the profiles table
create table public.profiles (
  id uuid primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  height numeric,
  weight numeric,
  body_type text check (body_type in ('Straight', 'Wave', 'Natural')),
  personal_color text check (personal_color in ('Spring', 'Summer', 'Autumn', 'Winter')),
  style_preference text
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Allow public read access"
on public.profiles for select
to anon
using (true);

create policy "Allow public insert/update access"
on public.profiles for all
to anon
using (true)
with check (true);
