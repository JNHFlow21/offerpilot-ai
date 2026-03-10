create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.resume_workspaces(id) on delete cascade,
  job_target_id uuid not null references public.job_targets(id) on delete cascade,
  status text not null default 'in_progress',
  current_turn_index integer not null default 0,
  outline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interview_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  turn_index integer not null,
  kind text not null default 'primary',
  question text not null,
  answer text,
  feedback text,
  score integer,
  status text not null default 'asked',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists interview_sessions_workspace_job_idx
  on public.interview_sessions (workspace_id, job_target_id, created_at desc);

create index if not exists interview_turns_session_turn_idx
  on public.interview_turns (session_id, turn_index);
