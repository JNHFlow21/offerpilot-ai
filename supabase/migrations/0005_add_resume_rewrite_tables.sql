create table if not exists public.resume_workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  raw_resume_text text not null,
  resume_summary text,
  key_project_bullets jsonb not null default '[]'::jsonb,
  rewrite_focus text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resume_rewrites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.resume_workspaces (id) on delete cascade,
  job_target_id uuid not null references public.job_targets (id) on delete cascade,
  rewrite_summary text not null,
  section_suggestions jsonb not null default '[]'::jsonb,
  revised_bullets jsonb not null default '[]'::jsonb,
  interview_angles jsonb not null default '[]'::jsonb,
  raw_result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resume_workspaces_updated_at_idx
on public.resume_workspaces (updated_at desc);

create index if not exists resume_rewrites_workspace_job_idx
on public.resume_rewrites (workspace_id, job_target_id, updated_at desc);
