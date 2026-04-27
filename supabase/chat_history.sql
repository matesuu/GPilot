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

alter table public.chat_history disable row level security;

grant select, insert, update, delete on public.chat_history to anon;
