-- SHIFT HQ Database Schema
-- Run this in your Supabase SQL editor

-- Agent memory (conversation history per agent)
CREATE TABLE IF NOT EXISTS agent_memory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id text NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_agent_memory_agent_id ON agent_memory(agent_id, created_at);

-- Task queue
CREATE TABLE IF NOT EXISTS tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  assigned_to text NOT NULL,
  assigned_by text,
  title text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'pending',
  result text,
  priority integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_tasks_status ON tasks(status, created_at DESC);

-- Activity log
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id text NOT NULL,
  action_type text NOT NULL,
  description text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);

-- Standup reports (individual agent reports)
CREATE TABLE IF NOT EXISTS standups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL DEFAULT CURRENT_DATE,
  agent_id text NOT NULL,
  report text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_standups_date ON standups(date DESC);

-- Standup summaries (Bruno's daily synthesis)
CREATE TABLE IF NOT EXISTS standup_summaries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL DEFAULT CURRENT_DATE,
  summary text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_standup_summaries_date ON standup_summaries(date DESC);
