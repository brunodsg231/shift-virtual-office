import Anthropic from '@anthropic-ai/sdk'
import { Socket } from 'socket.io'
import { agentRegistry } from './registry.js'
import {
  getAgentMemory,
  saveMemoryEntry,
  createTask,
  updateTaskStatus,
  logActivity,
} from '../db/supabase.js'
import { mcpManager } from '../mcp/mcpClient.js'
import { venueControlTools, executeVenueTool } from '../tools/venueControl.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MAX_TURNS = 5

// ─── World Context for Agent Awareness ──────────────

const agentStatuses: Record<string, { status: string; currentTask?: string; timestamp: number }> = {}

export function getWorldContext(): string {
  const lines: string[] = ['Current team status:']
  for (const [id, def] of agentRegistry) {
    const s = agentStatuses[id]
    const status = s?.status || 'idle'
    const task = s?.currentTask ? ` — working on: ${s.currentTask}` : ''
    lines.push(`- ${def.name} (${def.role}): ${status}${task}`)
  }
  return lines.join('\n')
}

function getToolsForAgent(agentId: string): any[] {
  const mcpTools = mcpManager.getToolsForAgent(agentId)
  const customTools: any[] = []

  if (agentId === 'riley' || agentId === 'bruno') {
    customTools.push(...venueControlTools)
  }

  return [...mcpTools, ...customTools]
}

async function executeToolCall(
  agentId: string,
  block: Anthropic.ToolUseBlock,
  socket: { emit: (event: string, data: any) => void }
): Promise<{ type: 'tool_result'; tool_use_id: string; content: string; is_error?: boolean }> {
  const toolName = block.name
  const input = block.input as Record<string, any>

  // Check if it's a venue control tool
  if (toolName.startsWith('venue__')) {
    socket.emit('agent_tool_call', { agentId, tool: toolName, server: 'venue', input })

    const toolEntry = await logActivity(agentId, 'tool_called', `${toolName} via venue`, { input, success: true })
    if (toolEntry) socket.emit('activity_update', toolEntry)

    try {
      const result = await executeVenueTool(toolName, input)
      return {
        type: 'tool_result',
        tool_use_id: block.id,
        content: typeof result === 'string' ? result : JSON.stringify(result),
      }
    } catch (err: any) {
      await logActivity(agentId, 'tool_error', `${toolName} failed: ${err.message}`)
      return { type: 'tool_result', tool_use_id: block.id, content: `Error: ${err.message}`, is_error: true }
    }
  }

  // Find MCP server for this tool
  const serverName = mcpManager.findServerForTool(toolName)

  if (!serverName) {
    return { type: 'tool_result', tool_use_id: block.id, content: `Error: No server found for tool '${toolName}'`, is_error: true }
  }

  socket.emit('agent_tool_call', { agentId, tool: toolName, server: serverName, input })

  try {
    const result = await mcpManager.callTool(serverName, toolName, input)

    await logActivity(agentId, 'tool_called', `${toolName} via ${serverName}`, { input, success: true })

    return {
      type: 'tool_result',
      tool_use_id: block.id,
      content: typeof result === 'string' ? result : JSON.stringify(result),
    }
  } catch (err: any) {
    await logActivity(agentId, 'tool_error', `${toolName} failed: ${err.message}`)
    return { type: 'tool_result', tool_use_id: block.id, content: `Error: ${err.message}`, is_error: true }
  }
}

function parseDelegation(response: string, fromAgentId: string) {
  const match = response.match(/@(\w+)\s+please\s+(.+?)(?:\.|$)/i)
  if (!match) return null

  const name = match[1].toLowerCase()
  const entries = Array.from(agentRegistry.entries())
  const found = entries.find(([_id, def]) => def.name.toLowerCase() === name)

  if (!found || found[0] === fromAgentId) return null
  return { agentId: found[0], task: match[2] }
}

export interface TaskResult {
  fullResponse: string
  toolsCalled: string[]
  turns: number
}

export async function handleTask(
  agentId: string,
  task: string,
  socket: Socket | { emit: (event: string, data: any) => void },
  delegatedFrom?: string
): Promise<TaskResult> {
  const agent = agentRegistry.get(agentId)
  if (!agent) {
    socket.emit('agent_error', { agentId, error: 'Unknown agent' })
    return { fullResponse: '', toolsCalled: [], turns: 0 }
  }

  // 1. Load memory from Supabase
  const history = await getAgentMemory(agentId, 20)

  // 2. Get tools for this agent
  const tools = getToolsForAgent(agentId)

  // 2b. Track agent status
  agentStatuses[agentId] = { status: 'working', currentTask: task.slice(0, 80), timestamp: Date.now() }

  // 3. Log task received
  const actEntry = await logActivity(agentId, 'task_received', task)
  if (actEntry) socket.emit('activity_update', actEntry)
  socket.emit('agent_status', { agentId, status: 'thinking' })

  // 4. Create task record
  const taskRecord = await createTask({
    assigned_to: agentId,
    assigned_by: delegatedFrom || 'user',
    title: task.slice(0, 80),
    description: task,
    status: 'in_progress',
  })
  if (taskRecord) socket.emit('task_update', taskRecord)

  const toolsCalled: string[] = []
  let turns = 0

  try {
    let messages: any[] = [
      ...history,
      { role: 'user', content: task },
    ]

    let fullResponse = ''

    // 5. Agentic loop — stream + handle tool calls
    while (turns < MAX_TURNS) {
      turns++

      const worldContext = getWorldContext()
      const systemWithContext = `${agent.systemPrompt}\n\n${worldContext}`

      const streamOptions: any = {
        model: 'claude-sonnet-4-5-latest',
        max_tokens: 1024,
        system: systemWithContext,
        messages,
      }

      if (tools.length > 0) {
        streamOptions.tools = tools
      }

      const stream = client.messages.stream(streamOptions)
      socket.emit('agent_status', { agentId, status: 'working' })

      stream.on('text', (text) => {
        fullResponse += text
        socket.emit('agent_token', { agentId, token: text })
      })

      const finalMessage = await stream.finalMessage()

      if (finalMessage.stop_reason === 'tool_use') {
        const toolUseBlocks = finalMessage.content.filter(
          (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
        )

        // Add assistant turn to messages
        messages.push({ role: 'assistant', content: finalMessage.content })

        // Execute each tool call
        const toolResults: any[] = []
        for (const block of toolUseBlocks) {
          toolsCalled.push(block.name)
          const result = await executeToolCall(agentId, block, socket)
          toolResults.push(result)
        }

        // Add tool results as user message
        messages.push({ role: 'user', content: toolResults })

        // Continue agentic loop
        continue
      }

      // stop_reason is 'end_turn' — done streaming
      break
    }

    // 6. Check for delegation
    const delegation = parseDelegation(fullResponse, agentId)
    if (delegation) {
      socket.emit('agent_delegation', {
        from: agentId,
        to: delegation.agentId,
        task: delegation.task,
      })
      const delEntry = await logActivity(
        agentId,
        'delegated',
        `Delegated to ${delegation.agentId}: ${delegation.task}`
      )
      if (delEntry) socket.emit('activity_update', delEntry)

      setTimeout(() => {
        handleTask(
          delegation.agentId,
          `[Delegated from ${agent.name}] ${delegation.task}`,
          socket,
          agentId
        )
      }, 1500)
    }

    // 7. Save to memory
    await saveMemoryEntry(agentId, 'user', task)
    await saveMemoryEntry(agentId, 'assistant', fullResponse)

    // 8. Update task status
    if (taskRecord) {
      await updateTaskStatus(taskRecord.id, 'done', fullResponse)
      socket.emit('task_update', {
        ...taskRecord,
        status: 'done',
        result: fullResponse,
        completed_at: new Date().toISOString(),
      })
    }

    const compEntry = await logActivity(
      agentId,
      'completed',
      `Completed: ${task.slice(0, 60)}`
    )
    if (compEntry) socket.emit('activity_update', compEntry)

    // 9. Report back if delegated
    if (delegatedFrom) {
      socket.emit('agent_report', {
        from: agentId,
        to: delegatedFrom,
        result: fullResponse.slice(0, 100),
      })
    }

    // 10. Final status
    agentStatuses[agentId] = { status: 'idle', timestamp: Date.now() }
    socket.emit('agent_status', { agentId, status: 'speaking' })
    socket.emit('agent_done', { agentId, fullResponse })

    return { fullResponse, toolsCalled, turns }
  } catch (err: any) {
    console.error(`[${agent.name}] Error:`, err)
    if (taskRecord) {
      await updateTaskStatus(taskRecord.id, 'failed', err.message || 'Unknown error')
    }
    agentStatuses[agentId] = { status: 'error', timestamp: Date.now() }
    socket.emit('agent_status', { agentId, status: 'error' })
    socket.emit('agent_error', { agentId, error: 'Something went wrong. Try again.' })
    return { fullResponse: '', toolsCalled, turns }
  }
}
