import { useEffect } from 'react'
import { Html } from '@react-three/drei'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'

function getToolEmoji(toolName) {
  if (!toolName) return '\u{1F527}'
  if (toolName.startsWith('hubspot')) return '\u{1F3AF}'
  if (toolName.startsWith('gmail')) return '\u{1F4E7}'
  if (toolName.startsWith('googleCalendar') || toolName.startsWith('gcal')) return '\u{1F4C5}'
  if (toolName.startsWith('notion')) return '\u{1F4DD}'
  if (toolName.startsWith('venue')) return '\u{1F39B}\uFE0F'
  if (toolName.startsWith('figma')) return '\u{1F3A8}'
  return '\u{1F527}'
}

function formatToolName(toolName) {
  if (!toolName) return ''
  const parts = toolName.split('__')
  const server = parts[0]
  const action = parts.slice(1).join('.').replace(/_/g, ' ')
  const serverLabels = {
    hubspot: 'hubspot',
    gmail: 'gmail',
    googleCalendar: 'calendar',
    notion: 'notion',
    venue: 'venue',
    figma: 'figma',
  }
  return `${serverLabels[server] || server}.${action}`
}

function AudioBars({ color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 14 }}>
      {[1, 2, 3].map(i => (
        <div
          key={i}
          style={{
            width: 2,
            height: 6,
            background: color,
            borderRadius: 1,
            animation: `audio-bar-${i} 0.8s ease-in-out ${i * 0.1}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

export default function SpeechBubble({ agentId }) {
  const agent = useStore((s) => s.agents[agentId])
  const setAgentMessage = useStore((s) => s.setAgentMessage)
  const setAgentStatus = useStore((s) => s.setAgentStatus)
  const toolCall = useStore((s) => s.activeToolCalls[agentId])

  const isStreaming = agent.status === 'thinking' || agent.status === 'working'
  const isSpeaking = agent.status === 'speaking'

  const statusLabel = {
    speaking: 'SPEAKING',
    thinking: 'THINKING',
    working: 'WORKING',
    error: 'ERROR',
  }[agent.status] || ''

  const statusColor = {
    speaking: tokens.green,
    thinking: tokens.accent,
    working: '#3B82F6',
    error: tokens.red,
  }[agent.status] || tokens.textDim

  useEffect(() => {
    if ((agent.status === 'speaking' || agent.status === 'error') && agent.currentMessage) {
      const timeout = setTimeout(() => {
        setAgentMessage(agentId, null)
        setAgentStatus(agentId, 'idle')
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [agent.status, agentId, agent.currentMessage, setAgentMessage, setAgentStatus])

  return (
    <Html position={[0, 2.5, 0]} center zIndexRange={[50, 0]} style={{ pointerEvents: 'none' }}>
      <div
        style={{
          background: tokens.glass,
          backdropFilter: tokens.glassBlur,
          border: `1px solid ${tokens.glassBorder}`,
          borderLeft: `2px solid ${agent.color}`,
          borderRadius: tokens.radiusSmall,
          padding: '10px 14px',
          minWidth: 180,
          maxWidth: 260,
          pointerEvents: 'none',
          userSelect: 'none',
          boxShadow: tokens.glassShadow,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid rgba(255,255,255,0.06)`,
            paddingBottom: 6,
            marginBottom: 8,
          }}
        >
          <span style={{
            fontFamily: tokens.fontMono,
            fontWeight: 700,
            fontSize: 10,
            color: agent.color,
            letterSpacing: '0.04em',
          }}>
            {agent.name}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isSpeaking && <AudioBars color={statusColor} />}
            <span
              style={{
                fontFamily: tokens.fontMono,
                fontSize: 9,
                color: statusColor,
                animation: isStreaming ? 'pulse 1.5s ease-in-out infinite' : 'none',
                letterSpacing: '0.06em',
              }}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Message */}
        <div
          style={{
            fontFamily: tokens.fontUI,
            fontSize: 12,
            color: tokens.textPrimary,
            lineHeight: 1.6,
            maxHeight: 120,
            overflow: 'hidden',
          }}
        >
          {agent.currentMessage}
          {isStreaming && <span style={{ opacity: 0.5, color: tokens.accent }}>|</span>}
        </div>

        {/* Tool call badge */}
        {toolCall && (
          <div
            style={{
              borderTop: `1px solid rgba(255,255,255,0.06)`,
              marginTop: 8,
              paddingTop: 6,
            }}
          >
            <div style={{
              fontFamily: tokens.fontMono,
              fontSize: 10,
              color: tokens.accent,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span style={{ opacity: 0.5 }}>{getToolEmoji(toolCall.tool)}</span>
              {formatToolName(toolCall.tool)}
            </div>
            {/* Loading bar */}
            <div style={{
              width: '100%',
              height: 2,
              background: 'rgba(255,255,255,0.06)',
              marginTop: 4,
              overflow: 'hidden',
              borderRadius: 1,
            }}>
              <div style={{
                height: '100%',
                background: `linear-gradient(90deg, transparent, ${tokens.accent})`,
                animation: 'loading-bar 1.5s linear infinite',
                borderRadius: 1,
              }} />
            </div>
          </div>
        )}
      </div>
    </Html>
  )
}
