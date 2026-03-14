import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | null = null

export function initSupabase(): boolean {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key || url === 'your_url' || key === 'your_service_key') {
    console.log('Supabase: Not configured — running without persistence')
    return false
  }
  supabase = createClient(url, key)
  console.log('Supabase: Connected')
  return true
}

export async function getAgentMemory(agentId: string, limit = 20) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('agent_memory')
    .select('role, content')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: true })
    .limit(limit)
  if (error) {
    console.error('Supabase getAgentMemory error:', error.message)
    return []
  }
  return data.map((e: any) => ({ role: e.role, content: e.content }))
}

export async function getAgentMemoryRaw(agentId: string) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('agent_memory')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: true })
  if (error) {
    console.error('Supabase getAgentMemoryRaw error:', error.message)
    return []
  }
  return data
}

export async function saveMemoryEntry(
  agentId: string,
  role: string,
  content: string,
  metadata?: Record<string, any>
) {
  if (!supabase) return
  const { error } = await supabase
    .from('agent_memory')
    .insert({ agent_id: agentId, role, content, metadata })
  if (error) console.error('Supabase saveMemory error:', error.message)
}

export async function deleteAgentMemory(agentId: string) {
  if (!supabase) return
  const { error } = await supabase
    .from('agent_memory')
    .delete()
    .eq('agent_id', agentId)
  if (error) console.error('Supabase deleteMemory error:', error.message)
}

export async function createTask(task: {
  assigned_to: string
  assigned_by: string
  title: string
  description: string
  status?: string
  priority?: number
}) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()
  if (error) {
    console.error('Supabase createTask error:', error.message)
    return null
  }
  return data
}

export async function updateTaskStatus(
  taskId: string,
  status: string,
  result?: string
) {
  if (!supabase) return
  const update: Record<string, any> = { status }
  if (result) update.result = result
  if (status === 'done' || status === 'failed') {
    update.completed_at = new Date().toISOString()
  }
  const { error } = await supabase
    .from('tasks')
    .update(update)
    .eq('id', taskId)
  if (error) console.error('Supabase updateTask error:', error.message)
}

export async function getTasks() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) {
    console.error('Supabase getTasks error:', error.message)
    return []
  }
  return data
}

export async function logActivity(
  agentId: string,
  actionType: string,
  description: string,
  metadata?: Record<string, any>
) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('activity_log')
    .insert({ agent_id: agentId, action_type: actionType, description, metadata })
    .select()
    .single()
  if (error) {
    console.error('Supabase logActivity error:', error.message)
    return null
  }
  return data
}

export async function getRecentActivity(limit = 50) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) {
    console.error('Supabase getActivity error:', error.message)
    return []
  }
  return data
}

// ─── Tasks by Agent ───────────────────────────────

export async function getRecentTasksForAgent(agentId: string, limit = 3) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('tasks')
    .select('title, status')
    .eq('assigned_to', agentId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) {
    console.error('Supabase getRecentTasksForAgent error:', error.message)
    return []
  }
  return data
}

// ─── Standup Persistence ──────────────────────────

export async function saveStandupReport(agentId: string, report: string) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('standups')
    .insert({ agent_id: agentId, report })
    .select()
    .single()
  if (error) {
    console.error('Supabase saveStandupReport error:', error.message)
    return null
  }
  return data
}

export async function getTodayStandupReports() {
  if (!supabase) return []
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('standups')
    .select('*')
    .eq('date', today)
    .order('created_at', { ascending: true })
  if (error) {
    console.error('Supabase getTodayStandupReports error:', error.message)
    return []
  }
  return data
}

export async function saveStandupSummary(summary: string) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('standup_summaries')
    .insert({ summary })
    .select()
    .single()
  if (error) {
    console.error('Supabase saveStandupSummary error:', error.message)
    return null
  }
  return data
}

export async function getStandupHistory(days = 30) {
  if (!supabase) return []
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceDate = since.toISOString().slice(0, 10)

  const { data: reports, error: rErr } = await supabase
    .from('standups')
    .select('*')
    .gte('date', sinceDate)
    .order('date', { ascending: false })
    .order('created_at', { ascending: true })

  const { data: summaries, error: sErr } = await supabase
    .from('standup_summaries')
    .select('*')
    .gte('date', sinceDate)
    .order('date', { ascending: false })

  if (rErr) console.error('Supabase getStandupHistory reports error:', rErr.message)
  if (sErr) console.error('Supabase getStandupHistory summaries error:', sErr.message)

  // Group by date
  const byDate: Record<string, { reports: any[]; summary: string | null }> = {}
  for (const r of reports || []) {
    if (!byDate[r.date]) byDate[r.date] = { reports: [], summary: null }
    byDate[r.date].reports.push(r)
  }
  for (const s of summaries || []) {
    if (!byDate[s.date]) byDate[s.date] = { reports: [], summary: null }
    byDate[s.date].summary = s.summary
  }

  return Object.entries(byDate)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => b.date.localeCompare(a.date))
}
