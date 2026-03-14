const VENUE_API = process.env.VENUE_API_URL || 'http://192.168.1.100'

export const venueControlTools = [
  {
    name: 'venue__get_venue_status',
    description: 'Get the current status of all venue zones, projector states, and current Resolume composition.',
    input_schema: { type: 'object' as const, properties: {}, required: [] as string[] },
  },
  {
    name: 'venue__set_zone_lighting',
    description: 'Set the lighting for a specific venue zone (main_floor, bar, entrance, stage).',
    input_schema: {
      type: 'object' as const,
      properties: {
        zone: { type: 'string', enum: ['main_floor', 'bar', 'entrance', 'stage'], description: 'The venue zone to control' },
        scene: { type: 'string', description: 'The lighting scene preset name' },
        intensity: { type: 'number', minimum: 0, maximum: 100, description: 'Brightness level 0-100' },
      },
      required: ['zone', 'scene', 'intensity'],
    },
  },
  {
    name: 'venue__projector_power',
    description: 'Control power state of venue projectors via PJLink.',
    input_schema: {
      type: 'object' as const,
      properties: {
        projectorIds: { type: 'array', items: { type: 'number' }, description: 'Array of projector IDs (1-17)' },
        action: { type: 'string', enum: ['on', 'off'], description: 'Power action' },
      },
      required: ['projectorIds', 'action'],
    },
  },
  {
    name: 'venue__load_resolume_composition',
    description: 'Switch the active Resolume composition on the media server.',
    input_schema: {
      type: 'object' as const,
      properties: {
        composition: { type: 'string', description: 'Name of the Resolume composition to load' },
      },
      required: ['composition'],
    },
  },
  {
    name: 'venue__set_led_wall',
    description: 'Control the LED video wall content and brightness.',
    input_schema: {
      type: 'object' as const,
      properties: {
        content: { type: 'string', description: 'Content source or preset name for the LED wall' },
        brightness: { type: 'number', minimum: 0, maximum: 100, description: 'Brightness level 0-100' },
      },
      required: ['content', 'brightness'],
    },
  },
  {
    name: 'venue__get_av_health_check',
    description: 'Run a health check on all AV systems — pings 4 AV PCs, checks Resolume status, returns alerts.',
    input_schema: { type: 'object' as const, properties: {}, required: [] as string[] },
  },
]

export async function executeVenueTool(toolName: string, input: any): Promise<any> {
  const name = toolName.replace('venue__', '')

  try {
    switch (name) {
      case 'get_venue_status': {
        const res = await fetch(`${VENUE_API}/api/status`)
        if (!res.ok) throw new Error(`Venue API returned ${res.status}`)
        return await res.json()
      }
      case 'set_zone_lighting': {
        const res = await fetch(`${VENUE_API}/api/lighting`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        })
        if (!res.ok) throw new Error(`Venue API returned ${res.status}`)
        return await res.json()
      }
      case 'projector_power': {
        const res = await fetch(`${VENUE_API}/api/projectors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        })
        if (!res.ok) throw new Error(`Venue API returned ${res.status}`)
        return await res.json()
      }
      case 'load_resolume_composition': {
        const res = await fetch(`${VENUE_API}/api/resolume/composition`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        })
        if (!res.ok) throw new Error(`Venue API returned ${res.status}`)
        return await res.json()
      }
      case 'set_led_wall': {
        const res = await fetch(`${VENUE_API}/api/led-wall`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        })
        if (!res.ok) throw new Error(`Venue API returned ${res.status}`)
        return await res.json()
      }
      case 'get_av_health_check': {
        const res = await fetch(`${VENUE_API}/api/health`)
        if (!res.ok) throw new Error(`Venue API returned ${res.status}`)
        return await res.json()
      }
      default:
        return { error: `Unknown venue tool: ${name}` }
    }
  } catch (err: any) {
    return {
      error: `Venue API unreachable: ${err.message}. The venue control system may be offline or you're not on the venue network.`,
    }
  }
}
