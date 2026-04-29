create table if not exists public.chat_history (
  id text primary key,
  title text not null,
  dataset_id text not null,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create index if not exists chat_history_updated_at_idx
  on public.chat_history (updated_at desc);

alter table public.chat_history enable row level security;

grant select, insert, update, delete on public.chat_history to anon;

drop policy if exists "Allow anonymous chat history reads"
  on public.chat_history;
create policy "Allow anonymous chat history reads"
  on public.chat_history
  for select
  to anon
  using (true);

drop policy if exists "Allow anonymous chat history inserts"
  on public.chat_history;
create policy "Allow anonymous chat history inserts"
  on public.chat_history
  for insert
  to anon
  with check (true);

drop policy if exists "Allow anonymous chat history updates"
  on public.chat_history;
create policy "Allow anonymous chat history updates"
  on public.chat_history
  for update
  to anon
  using (true)
  with check (true);

drop policy if exists "Allow anonymous chat history deletes"
  on public.chat_history;
create policy "Allow anonymous chat history deletes"
  on public.chat_history
  for delete
  to anon
  using (true);
