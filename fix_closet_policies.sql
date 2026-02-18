-- Enable UPDATE access for all users (Development Prototype)
create policy "Allow public update access"
on public.closet_items for update
to anon
using (true)
with check (true);

-- Enable DELETE access for all users (Development Prototype)
create policy "Allow public delete access"
on public.closet_items for delete
to anon
using (true);
