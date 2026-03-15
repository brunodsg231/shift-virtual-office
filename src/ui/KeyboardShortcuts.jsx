import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'

const AGENT_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
const AGENT_IDS = ['kim', 'dev', 'marco', 'zara', 'riley', 'dante', 'sam', 'petra', 'lex', 'bruno']

const SHORTCUTS = [
  { key: 'Ctrl+K', label: 'Command palette' },
  { key: '/', label: 'Focus command input' },
  { key: '1-9, 0', label: 'Select agent (Kim=1 ... Bruno=0)' },
  { key: 'Space', label: 'Select Bruno' },
  { key: 'S', label: 'Trigger standup' },
  { key: 'T', label: 'Toggle task board' },
  { key: 'A', label: 'Toggle activity feed' },
  { key: 'Escape', label: 'Close panels / deselect' },
  { key: '?', label: 'Toggle this panel' },
]

export default function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false)
  const setActiveAgent = useStore((s) => s.setActiveAgent)
  const toggleActivityFeed = useStore((s) => s.toggleActivityFeed)
  const toggleTaskBoard = useStore((s) => s.toggleTaskBoard)

  useEffect(() => {
    const handler = (e) => {
      // Skip if typing in an input
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      // Agent selection: 1-9, 0
      const keyIdx = AGENT_KEYS.indexOf(e.key)
      if (keyIdx !== -1) {
        e.preventDefault()
        setActiveAgent(AGENT_IDS[keyIdx])
        return
      }

      // Space — select Bruno
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        setActiveAgent('bruno')
        return
      }

      // S — standup
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault()
        const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'
        fetch(`${url}/api/standup/run`, { method: 'POST' }).catch(() => {})
        return
      }

      // T — toggle task board
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault()
        toggleTaskBoard()
        return
      }

      // A — toggle activity feed
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        toggleActivityFeed()
        return
      }

      // ? — toggle help
      if (e.key === '?') {
        e.preventDefault()
        setShowHelp(v => !v)
        return
      }

      // Escape — close panels
      if (e.key === 'Escape') {
        setShowHelp(false)
        // Close sidebars if open
        const state = useStore.getState()
        if (state.activityFeedOpen) toggleActivityFeed()
        if (state.taskBoardOpen) toggleTaskBoard()
        if (state.agentDetailOpen) state.toggleAgentDetail()
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setActiveAgent, toggleActivityFeed, toggleTaskBoard])

  return (
    <AnimatePresence>
      {showHelp && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 500,
            background: tokens.glass,
            backdropFilter: tokens.glassBlur,
            border: `1px solid ${tokens.glassBorder}`,
            borderRadius: tokens.radius,
            padding: '24px 32px',
            minWidth: 320,
            boxShadow: tokens.glassShadow,
          }}
        >
          <div style={{
            fontFamily: tokens.fontUI,
            fontWeight: 700,
            fontSize: 14,
            color: tokens.textPrimary,
            marginBottom: 16,
          }}>
            Keyboard Shortcuts
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SHORTCUTS.map(({ key, label }) => (
              <div key={key} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <kbd style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  padding: '3px 10px',
                  fontFamily: tokens.fontMono,
                  fontSize: 11,
                  color: tokens.textPrimary,
                  minWidth: 56,
                  textAlign: 'center',
                }}>
                  {key}
                </kbd>
                <span style={{
                  fontFamily: tokens.fontUI,
                  fontSize: 12,
                  color: tokens.textSecondary,
                }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 16,
            fontSize: 10,
            color: tokens.textDim,
            fontFamily: tokens.fontMono,
            textAlign: 'center',
          }}>
            Press ? to close
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
