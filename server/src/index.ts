import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { handleTask } from './agents/orchestrator.js'
import { AssignTaskPayload } from './types/index.js'
import { initSupabase, getTasks, getRecentActivity, getAgentMemoryRaw, deleteAgentMemory, createTask, getTodayStandupReports, getStandupHistory } from './db/supabase.js'
import { mcpManager } from './mcp/mcpClient.js'
import { agentRegistry } from './agents/registry.js'
import { runStandup, initStandupScheduler, isStandupRunning, getStandupStatus } from './standup/scheduler.js'

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: (origin, cb) => cb(null, true),
    methods: ['GET', 'POST'],
  },
})

app.use(cors())
app.use(express.json())

// ─── Heartbeat tracking (in-memory) ─────────────────

const heartbeats: Record<string, { status: string; currentTask?: string; timestamp: number }> = {}

// ─── REST API ────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'shift-hq-server' })
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'shift-hq-server' })
})

app.post('/api/heartbeat', (req, res) => {
  const { agentId, status, currentTask } = req.body
  if (!agentId) {
    res.status(400).json({ error: 'agentId is required' })
    return
  }
  heartbeats[agentId] = { status: status || 'idle', currentTask, timestamp: Date.now() }
  io.emit('agent_heartbeat', { agentId, ...heartbeats[agentId] })
  res.json({ ok: true })
})

app.get('/api/world/state', async (_req, res) => {
  const agents: Record<string, any> = {}
  for (const [id, def] of agentRegistry) {
    const hb = heartbeats[id]
    agents[id] = {
      name: def.name,
      role: def.role,
      status: hb?.status || 'idle',
      currentTask: hb?.currentTask || null,
      lastHeartbeat: hb?.timestamp || null,
      online: hb ? (Date.now() - hb.timestamp < 5 * 60 * 1000) : false,
    }
  }
  const recentActivity = await getRecentActivity(10)
  const tasks = await getTasks()
  const activeTasks = tasks.filter((t: any) => t.status === 'in_progress')
  res.json({ agents, recentActivity, activeTasks, timestamp: Date.now() })
})

app.get('/api/tasks', async (_req, res) => {
  const tasks = await getTasks()
  res.json(tasks)
})

app.get('/api/activity', async (_req, res) => {
  const activity = await getRecentActivity(50)
  res.json(activity)
})

app.get('/api/agents/status', (_req, res) => {
  const agents: Record<string, any> = {}
  for (const [id, def] of agentRegistry) {
    agents[id] = { name: def.name, role: def.role }
  }
  res.json(agents)
})

app.get('/api/agent/:id/memory', async (req, res) => {
  const memory = await getAgentMemoryRaw(req.params.id)
  res.json(memory)
})

app.delete('/api/agent/:id/memory', async (req, res) => {
  await deleteAgentMemory(req.params.id)
  res.json({ success: true })
})

app.post('/api/tasks', async (req, res) => {
  const task = await createTask(req.body)
  res.json(task)
})

// ─── STANDUP ENDPOINTS ──────────────────────────────

app.post('/api/standup/run', async (_req, res) => {
  if (isStandupRunning()) {
    res.status(409).json({ error: 'Standup already in progress' })
    return
  }
  runStandup(io)
  res.json({ started: true, timestamp: new Date().toISOString() })
})

app.get('/api/standup/today', async (_req, res) => {
  const reports = await getTodayStandupReports()
  res.json({ reports, summary: reports.length > 0 ? reports[reports.length - 1] : null })
})

app.get('/api/standup/history', async (_req, res) => {
  const history = await getStandupHistory(30)
  res.json(history)
})

app.get('/api/standup/status', (_req, res) => {
  res.json(getStandupStatus())
})

// ─── TEST ENDPOINT ───────────────────────────────────

app.post('/api/test/agent', async (req, res) => {
  const { agentId, task } = req.body
  if (!agentId || !task) {
    res.status(400).json({ error: 'agentId and task are required' })
    return
  }

  const startTime = Date.now()

  // Mock socket that collects emitted events silently
  const mockSocket = {
    emit: (_event: string, _data: any) => {},
  }

  try {
    const result = await handleTask(agentId, task, mockSocket)

    res.json({
      response: result.fullResponse,
      toolsCalled: result.toolsCalled,
      turns: result.turns,
      duration: Date.now() - startTime,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ─── SOCKET.IO ───────────────────────────────────────

io.on('connection', (socket) => {
  console.log('SHIFT HQ client connected:', socket.id)

  socket.on('assign_task', (payload: AssignTaskPayload) => {
    const { agentId, task } = payload
    console.log(`[${agentId}] Task assigned: "${task}"`)
    handleTask(agentId, task, socket)
  })

  socket.on('disconnect', () => {
    console.log('SHIFT HQ client disconnected:', socket.id)
  })
})

// ─── STARTUP ─────────────────────────────────────────

async function checkVenueApi(): Promise<boolean> {
  const url = process.env.VENUE_API_URL || 'http://192.168.1.100'
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    await fetch(`${url}/api/status`, { signal: controller.signal })
    clearTimeout(timeout)
    return true
  } catch {
    return false
  }
}

async function startup() {
  // 1. Supabase
  const supabaseOk = initSupabase()

  // 2. MCP servers
  console.log('\nConnecting MCP servers...')
  const mcpConnected = await mcpManager.connectAll()
  const mcpStatus = mcpManager.getStatus()

  // 3. Venue API
  const venueOk = await checkVenueApi()

  // 4. Anthropic check
  const anthropicOk = !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_key_here'

  const s = (ok: boolean, labelTrue: string, labelFalse: string) =>
    ok ? `\u2705 ${labelTrue}` : `\u274C ${labelFalse}`

  // 5. Standup scheduler
  initStandupScheduler(io)

  const PORT = process.env.PORT || 3001
  server.listen(PORT, () => {
    console.log(`
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551       SHIFT HQ \u2014 ONLINE (port ${PORT})       \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551  HubSpot MCP   ${s(mcpStatus.hubspot, 'Connected', 'No token').padEnd(24)}\u2551
\u2551  Gmail MCP     ${s(mcpStatus.gmail, 'Connected', 'No token').padEnd(24)}\u2551
\u2551  Calendar MCP  ${s(mcpStatus.googleCalendar, 'Connected', 'No token').padEnd(24)}\u2551
\u2551  Notion MCP    ${s(mcpStatus.notion, 'Connected', 'No token').padEnd(24)}\u2551
\u2551  Figma MCP     ${s(mcpStatus.figma, 'Connected', 'No token').padEnd(24)}\u2551
\u2551  Venue API     ${s(venueOk, 'Connected', 'Offline').padEnd(24)}\u2551
\u2551  Supabase      ${s(supabaseOk, 'Connected', 'No config').padEnd(24)}\u2551
\u2551  Anthropic     ${s(anthropicOk, 'Ready', 'No key').padEnd(24)}\u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D
`)
  })
}

startup().catch((err) => {
  console.error('Startup failed:', err)
  process.exit(1)
})
