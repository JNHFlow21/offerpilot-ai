create extension if not exists "pgcrypto";

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  target_roles text[] not null default '{}',
  target_city text,
  years_of_experience integer,
  resume_text text,
  resume_summary text,
  self_intro_draft text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_name text,
  role_name text not null,
  target_city text,
  job_source_url text,
  jd_text text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jd_analyses (
  id uuid primary key default gen_random_uuid(),
  job_target_id uuid not null references public.job_targets (id) on delete cascade,
  keywords text[] not null default '{}',
  capability_dimensions jsonb not null default '[]'::jsonb,
  question_type_weights jsonb not null default '{}'::jsonb,
  recommended_topics jsonb not null default '[]'::jsonb,
  recommended_actions jsonb not null default '[]'::jsonb,
  overall_summary text not null,
  model_name text,
  model_version text,
  raw_result jsonb not null,
  created_at timestamptz not null default now()
);
