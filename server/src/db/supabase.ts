import pg from 'pg'
const { Pool } = pg

let pool: pg.Pool | null = null

export function initSupabase(): boolean {
  const url = process.env.DATABASE_URL
  if (!url || url === 'your_url') {
    console.log('Database: Not configured — running without persistence')
    return false
  }
  pool = new Pool({ connectionString: url })
  console.log('Database: Connected (PostgreSQL)')
  return true
}

export async function initTables() {
  if (!pool) return
  await pool.query(`
    CREATE TABLE IF NOT EXISTS agent_memory (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      agent_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      assigned_to TEXT NOT NULL,
      assigned_by TEXT DEFAULT 'user',
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority INT DEFAULT 0,
      result TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS activity_log (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      agent_id TEXT NOT NULL,
      action_type TEXT NOT NULL,
      description TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS standups (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      agent_id TEXT NOT NULL,
      report TEXT NOT NULL,
      date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS standup_summaries (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      summary TEXT NOT NULL,
      date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_memory_agent ON agent_memory(agent_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_activity_agent ON activity_log(agent_id);
  `)
  console.log('Database: Tables ready')
}

// ─── Agent Memory ───────────────────────────────

export async function getAgentMemory(agentId: string, limit = 20) {
  if (!pool) return []
  const { rows } = await pool.query(
    'SELECT role, content FROM agent_memory WHERE agent_id = $1 ORDER BY created_at ASC LIMIT $2',
    [agentId, limit]
  )
  return rows.map((r: any) => ({ role: r.role, content: r.content }))
}

export async function getAgentMemoryRaw(agentId: string) {
  if (!pool) return []
  const { rows } = await pool.query(
    'SELECT * FROM agent_memory WHERE agent_id = $1 ORDER BY created_at ASC',
    [agentId]
  )
  return rows
}

export async function saveMemoryEntry(
  agentId: string, role: string, content: string, metadata?: Record<string, any>
) {
  if (!pool) return
  await pool.query(
    'INSERT INTO agent_memory (agent_id, role, content, metadata) VALUES ($1, $2, $3, $4)',
    [agentId, role, content, metadata ? JSON.stringify(metadata) : null]
  )
}

export async function deleteAgentMemory(agentId: string) {
  if (!pool) return
  await pool.query('DELETE FROM agent_memory WHERE agent_id = $1', [agentId])
}

// ─── Tasks ──────────────────────────────────────

export async function createTask(task: {
  assigned_to: string; assigned_by: string; title: string;
  description: string; status?: string; priority?: number;
}) {
  if (!pool) return null
  const { rows } = await pool.query(
    `INSERT INTO tasks (assigned_to, assigned_by, title, description, status, priority)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [task.assigned_to, task.assigned_by, task.title, task.description,
     task.status || 'pending', task.priority || 0]
  )
  return rows[0] || null
}

export async function updateTaskStatus(taskId: string, status: string, result?: string) {
  if (!pool) return
  const completedAt = (status === 'done' || status === 'failed') ? new Date().toISOString() : null
  await pool.query(
    'UPDATE tasks SET status = $1, result = $2, completed_at = $3 WHERE id = $4',
    [status, result || null, completedAt, taskId]
  )
}

export async function getTasks() {
  if (!pool) return []
  const { rows } = await pool.query(
    'SELECT * FROM tasks ORDER BY created_at DESC LIMIT 50'
  )
  return rows
}

export async function getRecentTasksForAgent(agentId: string, limit = 3) {
  if (!pool) return []
  const { rows } = await pool.query(
    'SELECT title, status FROM tasks WHERE assigned_to = $1 ORDER BY created_at DESC LIMIT $2',
    [agentId, limit]
  )
  return rows
}

// ─── Activity Log ───────────────────────────────

export async function logActivity(
  agentId: string, actionType: string, description: string, metadata?: Record<string, any>
) {
  if (!pool) return null
  const { rows } = await pool.query(
    `INSERT INTO activity_log (agent_id, action_type, description, metadata)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [agentId, actionType, description, metadata ? JSON.stringify(metadata) : null]
  )
  return rows[0] || null
}

export async function getRecentActivity(limit = 50) {
  if (!pool) return []
  const { rows } = await pool.query(
    'SELECT * FROM activity_log ORDER BY created_at DESC LIMIT $1',
    [limit]
  )
  return rows
}

// ─── Standup Persistence ────────────────────────

export async function saveStandupReport(agentId: string, report: string) {
  if (!pool) return null
  const { rows } = await pool.query(
    'INSERT INTO standups (agent_id, report) VALUES ($1, $2) RETURNING *',
    [agentId, report]
  )
  return rows[0] || null
}

export async function getTodayStandupReports() {
  if (!pool) return []
  const { rows } = await pool.query(
    'SELECT * FROM standups WHERE date = CURRENT_DATE ORDER BY created_at ASC'
  )
  return rows
}

export async function saveStandupSummary(summary: string) {
  if (!pool) return null
  const { rows } = await pool.query(
    'INSERT INTO standup_summaries (summary) VALUES ($1) RETURNING *',
    [summary]
  )
  return rows[0] || null
}

export async function getStandupHistory(days = 30) {
  if (!pool) return []
  const { rows: reports } = await pool.query(
    `SELECT * FROM standups WHERE date >= CURRENT_DATE - $1::int
     ORDER BY date DESC, created_at ASC`,
    [days]
  )
  const { rows: summaries } = await pool.query(
    `SELECT * FROM standup_summaries WHERE date >= CURRENT_DATE - $1::int
     ORDER BY date DESC`,
    [days]
  )

  const byDate: Record<string, { reports: any[]; summary: string | null }> = {}
  for (const r of reports) {
    if (!byDate[r.date]) byDate[r.date] = { reports: [], summary: null }
    byDate[r.date].reports.push(r)
  }
  for (const s of summaries) {
    if (!byDate[s.date]) byDate[s.date] = { reports: [], summary: null }
    byDate[s.date].summary = s.summary
  }

  return Object.entries(byDate)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => b.date.localeCompare(a.date))
}
