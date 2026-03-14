import cron from 'node-cron'
import { Server } from 'socket.io'
import { generateStandupReport, generateBrunoSummary } from './reports.js'

const AGENT_ORDER = [
  'kim', 'marco', 'zara', 'riley', 'dante',
  'sam', 'petra', 'lex', 'dev', 'bruno',
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

let standupRunning = false
let lastRunTime: string | null = null

export function isStandupRunning(): boolean {
  return standupRunning
}

export function getStandupStatus() {
  return {
    lastRun: lastRunTime,
    scheduledTime: '9:00 AM EST weekdays',
    isRunning: standupRunning,
  }
}

export async function runStandup(io: Server) {
  if (standupRunning) return
  standupRunning = true

  console.log('\u{1F399}\uFE0F  SHIFT HQ Standup starting...')

  io.emit('standup_start', {
    timestamp: new Date().toISOString(),
    agents: AGENT_ORDER,
  })

  // Each agent reports in sequence (Bruno excluded from loop — he goes last as synthesizer)
  const reportAgents = AGENT_ORDER.filter((id) => id !== 'bruno')

  for (let i = 0; i < reportAgents.length; i++) {
    const agentId = reportAgents[i]

    await delay(i === 0 ? 500 : 3000)

    io.emit('standup_agent_turn', { agentId })
    io.emit('agent_status', { agentId, status: 'speaking' })

    const report = await generateStandupReport(agentId, io)

    io.emit('agent_status', { agentId, status: 'idle' })
    io.emit('standup_agent_done', {
      agentId,
      report,
      isLast: false,
    })
  }

  // Bruno goes last — synthesizes everything
  await delay(3000)
  io.emit('standup_agent_turn', { agentId: 'bruno' })
  io.emit('agent_status', { agentId: 'bruno', status: 'speaking' })

  const brunoSummary = await generateBrunoSummary(io)

  io.emit('agent_status', { agentId: 'bruno', status: 'idle' })
  io.emit('standup_agent_done', {
    agentId: 'bruno',
    report: brunoSummary,
    isLast: true,
  })

  lastRunTime = new Date().toISOString()
  standupRunning = false

  io.emit('standup_complete', {
    timestamp: lastRunTime,
    summary: brunoSummary,
  })

  console.log('\u2705 Standup complete')
}

export function initStandupScheduler(io: Server) {
  cron.schedule(
    '0 9 * * 1-5',
    () => {
      runStandup(io)
    },
    { timezone: 'America/New_York' }
  )
  console.log('Standup scheduler: 9:00 AM EST weekdays')
}
