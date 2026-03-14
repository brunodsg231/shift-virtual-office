import { memo } from 'react'
import { motion } from 'framer-motion'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'
import { useIsMobile } from '../hooks/useMediaQuery'

const MAP_W = 120
const MAP_H = 80
const FLOOR_W = 52
const FLOOR_D = 20

const AGENT_IDS = ['kim', 'dev', 'marco', 'zara', 'riley', 'dante', 'sam', 'petra', 'lex', 'bruno']

function worldToMap(x, z) {
  return {
    x: ((x + FLOOR_W / 2) / FLOOR_W) * MAP_W,
    y: ((z + FLOOR_D / 2) / FLOOR_D) * MAP_H,
  }
}

// Each dot subscribes to its own agent — no cascade from token streaming
const AgentMapDot = memo(function AgentMapDot({ agentId, isActive, onClick }) {
  const posX = useStore((s) => s.agents[agentId]?.position[0])
  const posZ = useStore((s) => s.agents[agentId]?.position[2])
  const color = useStore((s) => s.agents[agentId]?.color)
  const status = useStore((s) => s.agents[agentId]?.status)

  const pos = worldToMap(posX || 0, posZ || 0)

  return (
    <g onClick={() => onClick(agentId)} style={{ cursor: 'pointer' }}>
      {(status !== 'idle' || isActive) && (
        <circle
          cx={pos.x} cy={pos.y}
          r={isActive ? 5 : 4}
          fill={color} opacity={0.15}
        />
      )}
      <circle
        cx={pos.x} cy={pos.y}
        r={isActive ? 3 : 2}
        fill={color}
        opacity={status === 'idle' && !isActive ? 0.4 : 1}
      />
      {isActive && (
        <circle
          cx={pos.x} cy={pos.y}
          r={5} fill="none" stroke={color}
          strokeWidth={0.5} opacity={0.6}
        />
      )}
    </g>
  )
})

export default function MiniMap() {
  const activeAgent = useStore((s) => s.activeAgent)
  const setActiveAgent = useStore((s) => s.setActiveAgent)
  const isMobile = useIsMobile()
  if (isMobile) return null

  // Room features for the map
  const confCenter = worldToMap(14, 5)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        bottom: 100,
        left: 16,
        zIndex: 100,
        width: MAP_W,
        height: MAP_H,
        background: 'rgba(10,10,24,0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 8,
        overflow: 'hidden',
        padding: 1,
      }}
    >
      <svg
        width={MAP_W}
        height={MAP_H}
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        style={{ display: 'block' }}
      >
        {/* Room outline */}
        <rect
          x={1} y={1}
          width={MAP_W - 2} height={MAP_H - 2}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={0.5}
          rx={2}
        />

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((f) => (
          <g key={f}>
            <line
              x1={MAP_W * f} y1={2} x2={MAP_W * f} y2={MAP_H - 2}
              stroke="rgba(255,255,255,0.03)" strokeWidth={0.5}
            />
            <line
              x1={2} y1={MAP_H * f} x2={MAP_W - 2} y2={MAP_H * f}
              stroke="rgba(255,255,255,0.03)" strokeWidth={0.5}
            />
          </g>
        ))}

        {/* Conference table */}
        <rect
          x={confCenter.x - 12} y={confCenter.y - 3}
          width={24} height={6}
          fill="rgba(123,92,230,0.12)"
          rx={1}
        />

        {/* Agent dots */}
        {AGENT_IDS.map((id) => (
          <AgentMapDot
            key={id}
            agentId={id}
            isActive={activeAgent === id}
            onClick={setActiveAgent}
          />
        ))}
      </svg>

      {/* Label */}
      <div style={{
        position: 'absolute',
        top: 4,
        right: 6,
        fontFamily: tokens.fontMono,
        fontSize: 7,
        color: tokens.textDim,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        MAP
      </div>
    </motion.div>
  )
}
