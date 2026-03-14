interface MCPServerConfig {
  url: string
  tokenEnvVar: string
  agents: string[]
}

const MCP_SERVERS: Record<string, MCPServerConfig> = {
  hubspot: {
    url: 'https://mcp.hubspot.com/anthropic',
    tokenEnvVar: 'HUBSPOT_MCP_TOKEN',
    agents: ['kim', 'marco', 'bruno'],
  },
  gmail: {
    url: 'https://gmail.mcp.claude.com/mcp',
    tokenEnvVar: 'GMAIL_MCP_TOKEN',
    agents: ['kim', 'marco', 'zara', 'dante', 'sam', 'petra', 'lex', 'bruno'],
  },
  googleCalendar: {
    url: 'https://gcal.mcp.claude.com/mcp',
    tokenEnvVar: 'GCAL_MCP_TOKEN',
    agents: ['kim', 'sam', 'bruno'],
  },
  notion: {
    url: 'https://mcp.notion.com/mcp',
    tokenEnvVar: 'NOTION_MCP_TOKEN',
    agents: ['dev', 'zara', 'dante', 'sam', 'petra', 'lex', 'bruno'],
  },
  figma: {
    url: 'https://mcp.figma.com/mcp',
    tokenEnvVar: 'FIGMA_MCP_TOKEN',
    agents: ['dev', 'zara', 'bruno'],
  },
}

interface MCPTool {
  name: string
  description: string
  inputSchema: any
}

export class MCPClientManager {
  private clients = new Map<string, any>()
  private toolsByServer = new Map<string, MCPTool[]>()
  private connectionStatus = new Map<string, boolean>()

  async connectAll(): Promise<number> {
    let connected = 0

    for (const [serverName, config] of Object.entries(MCP_SERVERS)) {
      const token = process.env[config.tokenEnvVar]
      if (!token) {
        console.log(`  ${serverName}: no token (${config.tokenEnvVar})`)
        this.connectionStatus.set(serverName, false)
        continue
      }

      try {
        const { Client } = await import('@modelcontextprotocol/sdk/client/index.js')
        const { SSEClientTransport } = await import(
          '@modelcontextprotocol/sdk/client/sse.js'
        )

        const transport = new SSEClientTransport(new URL(config.url), {
          requestInit: {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        })

        const client = new Client(
          { name: 'shift-hq', version: '1.0.0' },
          { capabilities: {} }
        )

        await client.connect(transport)
        const { tools } = await client.listTools()

        this.clients.set(serverName, client)
        this.toolsByServer.set(serverName, tools as MCPTool[])
        this.connectionStatus.set(serverName, true)
        connected++
        console.log(`  ${serverName}: connected (${tools.length} tools)`)
      } catch (err: any) {
        this.connectionStatus.set(serverName, false)
        console.log(`  ${serverName}: failed — ${err.message}`)
      }
    }

    return connected
  }

  getToolsForAgent(agentId: string): any[] {
    const tools: any[] = []

    for (const [serverName, config] of Object.entries(MCP_SERVERS)) {
      if (!config.agents.includes(agentId)) continue
      const serverTools = this.toolsByServer.get(serverName) || []
      for (const tool of serverTools) {
        tools.push({
          name: `${serverName}__${tool.name}`,
          description: `[${serverName}] ${tool.description}`,
          input_schema: tool.inputSchema,
        })
      }
    }

    return tools
  }

  findServerForTool(toolName: string): string | null {
    // Check prefixed name first
    const sepIndex = toolName.indexOf('__')
    if (sepIndex !== -1) {
      const serverName = toolName.slice(0, sepIndex)
      if (this.clients.has(serverName)) return serverName
    }

    // Fallback: search all servers for matching tool name
    for (const [serverName, tools] of this.toolsByServer) {
      if (tools.some((t) => t.name === toolName)) return serverName
    }

    return null
  }

  async callTool(serverName: string, toolName: string, input: any): Promise<any> {
    const client = this.clients.get(serverName)
    if (!client) {
      throw new Error(`MCP server '${serverName}' not connected`)
    }

    // Strip server prefix if present
    const cleanName = toolName.includes('__')
      ? toolName.slice(toolName.indexOf('__') + 2)
      : toolName

    const result = await client.callTool({ name: cleanName, arguments: input })
    return result
  }

  isConnected(serverName: string): boolean {
    return this.connectionStatus.get(serverName) === true
  }

  getConnectedCount(): number {
    return this.clients.size
  }

  getTotalConfigured(): number {
    return Object.keys(MCP_SERVERS).length
  }

  getStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {}
    for (const name of Object.keys(MCP_SERVERS)) {
      status[name] = this.connectionStatus.get(name) === true
    }
    return status
  }
}

export const mcpManager = new MCPClientManager()
