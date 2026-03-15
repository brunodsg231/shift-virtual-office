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
It's the daily standup. Give your report in 2-3 short sentences.

CRITICAL: Only report on tasks you were ACTUALLY given and completed.
The user will provide your recent task history below.
If you have no completed tasks, say "Nothing assigned to me yet — standing by."
Do NOT make up or fabricate any work, bookings, deals, or activities.
Only reference tasks that appear in your history.

Keep it under 50 words. Direct and honest.
`

const BRUNO_SUMMARY_PROMPT = `
You are Bruno, founder of SHIFT Midtown.
Your team just gave their standup reports.
Synthesize ONLY what they actually reported — do not add or invent
information that isn't in their reports.
2-3 sentences: what's the priority today, any action items.
If most agents have nothing assigned, say the team needs tasks.
Under 50 words. Direct, sharp.
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
        ? `Your actual completed tasks:\n${recentTasks.map((t: any) => `- ${t.title} (${t.status})`).join('\n')}\n\nReport ONLY on these tasks.`
        : 'You have no tasks assigned yet. Say "Nothing assigned to me yet — standing by." and nothing else.'

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
      model: 'claude-sonnet-4-5-20250929',
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
