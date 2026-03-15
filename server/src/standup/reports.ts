import Anthropic from '@anthropic-ai/sdk'
import { agentRegistry } from '../agents/registry.js'
import {
  getAgentMemory,
  saveMemoryEntry,
  logActivity,
  getRecentTasksForAgent,
  saveStandupReport,
  getTodayStandupReports,
  saveStandupSummary,
} from '../db/supabase.js'
import { Server } from 'socket.io'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const STANDUP_SYSTEM_PROMPT = (agentName: string, role: string) => `
You are ${agentName}, ${role} at SHIFT Midtown.
It's the daily standup. Give your report in exactly this format,
3 short punchy sentences, no bullet points, no headers:

1. What you completed or handled since yesterday
2. What you're focused on today
3. Any blockers or things you need from the team

Be specific to SHIFT Midtown — mention real venue ops,
bookings, AV, bar, legal, whatever your domain is.
Sound like a real person at a standup, not a chatbot.
Keep it under 60 words total. Fast and direct.
`

const BRUNO_SUMMARY_PROMPT = `
You are Bruno, founder of SHIFT Midtown.
Your team just gave their standup reports.
Read them and give a 2-3 sentence founder's synthesis:
- What's the most important thing happening today
- Any immediate priority shifts or decisions
- One direct call to action for the team

Sound like a founder who moves fast. Direct, sharp, no fluff.
Under 50 words.
`

export async function generateStandupReport(
  agentId: string,
  socket: Server
): Promise<string> {
  const agent = agentRegistry.get(agentId)
  if (!agent) return `[${agentId}] is unavailable today`

  try {
    const recentMemory = await getAgentMemory(agentId, 5)
    const recentTasks = await getRecentTasksForAgent(agentId, 3)

    const contextBlock =
      recentTasks.length > 0
        ? `Recent tasks you worked on: ${recentTasks.map((t: any) => t.title).join(', ')}`
        : 'No specific tasks logged yet — give a general standup for your role.'

    let report = ''

    const stream = client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      system: STANDUP_SYSTEM_PROMPT(agent.name, agent.role),
      messages: [
        ...recentMemory,
        {
          role: 'user',
          content: `Give your standup report. ${contextBlock}`,
        },
      ],
    })

    stream.on('text', (text) => {
      report += text
      socket.emit('agent_token', { agentId, token: text })
    })

    await stream.finalMessage()

    await saveMemoryEntry(agentId, 'assistant', `[STANDUP] ${report}`)
    await logActivity(agentId, 'standup', report.slice(0, 100))
    await saveStandupReport(agentId, report)

    return report
  } catch (err: any) {
    console.error(`[${agent.name}] Standup error:`, err.message)
    return `${agent.name} is unavailable today`
  }
}

export async function generateBrunoSummary(socket: Server): Promise<string> {
  try {
    const todayReports = await getTodayStandupReports()

    const reportText = todayReports
      .map((r: any) => `${r.agent_id.toUpperCase()}: ${r.report}`)
      .join('\n\n')

    if (!reportText) return 'No reports to synthesize yet.'

    let summary = ''

    const stream = client.messages.stream({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 120,
      system: BRUNO_SUMMARY_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Team standup reports:\n\n${reportText}\n\nGive your synthesis.`,
        },
      ],
    })

    stream.on('text', (text) => {
      summary += text
      socket.emit('agent_token', { agentId: 'bruno', token: text })
    })

    await stream.finalMessage()

    await saveStandupSummary(summary)

    return summary
  } catch (err: any) {
    console.error('[Bruno] Summary error:', err.message)
    return 'Summary unavailable — check agent logs.'
  }
}
