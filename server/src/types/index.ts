export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface AgentDefinition {
  systemPrompt: string
  name: string
  role: string
}

export interface AssignTaskPayload {
  agentId: string
  task: string
}

export interface Task {
  id: string
  assigned_to: string
  assigned_by: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'done' | 'failed'
  result?: string
  priority: number
  created_at: string
  completed_at?: string
}

export interface Activity {
  id: string
  agent_id: string
  action_type: string
  description: string
  metadata?: Record<string, any>
  created_at: string
}

export interface StandupReport {
  id: string
  date: string
  agent_id: string
  report: string
  created_at: string
}

export interface StandupSummary {
  id: string
  date: string
  summary: string
  created_at: string
}
