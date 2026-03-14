import { motion } from 'framer-motion'
import { tokens } from '../styles/tokens'

export default function TaskPill({ task, agent }) {
  const truncated = task.text.length > 40 ? task.text.slice(0, 40) + '...' : task.text

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 6,
        padding: '3px 10px',
        fontFamily: tokens.fontUI,
        fontSize: 11,
        color: tokens.textSecondary,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 280,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <span style={{
        width: 4,
        height: 4,
        borderRadius: '50%',
        background: agent?.color || tokens.accent,
        flexShrink: 0,
      }} />
      {truncated}
    </motion.div>
  )
}
