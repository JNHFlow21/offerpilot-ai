create table if not exists public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  source_type text not null,
  title text not null,
  content_text text not null,
  job_target_id uuid references public.job_targets (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.knowledge_sources (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  token_count integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists knowledge_sources_source_type_idx
on public.knowledge_sources (source_type);

create index if not exists knowledge_chunks_source_chunk_idx
on public.knowledge_chunks (source_id, chunk_index);
