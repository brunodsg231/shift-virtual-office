import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'

let notifyFn = () => {}

export function notify(message, type = 'info', icon = null, agentColor = null) {
  notifyFn(message, type, icon, agentColor)
}

const TYPE_CONFIG = {
  info: { color: tokens.accent, icon: '\u25C6' },
  success: { color: tokens.green, icon: '\u2713' },
  error: { color: tokens.red, icon: '\u2717' },
  warning: { color: tokens.amber, icon: '\u26A0' },
  delegation: { color: tokens.accent, icon: '\u2192' },
}

export default function NotificationSystem() {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const addToast = useCallback((message, type = 'info', icon = null, agentColor = null) => {
    const id = ++idRef.current
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.info
    setToasts(prev => [...prev.slice(-3), {
      id,
      message,
      type,
      color: agentColor || config.color,
      icon: icon || config.icon,
    }])

    // Auto-dismiss
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  useEffect(() => {
    notifyFn = addToast
    return () => { notifyFn = () => {} }
  }, [addToast])

  // Listen for store events that should generate notifications
  useEffect(() => {
    const unsub = useStore.subscribe((state, prevState) => {
      // Task completion
      const newTasks = state.taskBoard
      const oldTasks = prevState.taskBoard
      if (newTasks !== oldTasks) {
        newTasks.forEach(t => {
          const old = oldTasks.find(o => o.id === t.id)
          if (old && old.status !== 'done' && t.status === 'done') {
            const agent = state.agents[t.assigned_to]
            addToast(
              `${agent?.name || t.assigned_to} completed: ${t.title || 'task'}`,
              'success', null, agent?.color
            )
          }
          if (old && old.status !== 'failed' && t.status === 'failed') {
            const agent = state.agents[t.assigned_to]
            addToast(
              `${agent?.name || t.assigned_to} failed: ${t.title || 'task'}`,
              'error', null, agent?.color
            )
          }
        })
      }

      // Delegation
      if (state.delegations.length > prevState.delegations.length) {
        const newest = state.delegations[state.delegations.length - 1]
        if (newest) {
          addToast(`${newest.fromName} \u2192 ${newest.toName}`, 'delegation')
        }
      }
    })
    return unsub
  }, [addToast])

  return (
    <div style={{
      position: 'fixed',
      top: 60,
      right: 16,
      zIndex: 600,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      pointerEvents: 'none',
    }}>
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: tokens.glass,
              backdropFilter: tokens.glassBlur,
              border: `1px solid ${tokens.glassBorder}`,
              borderLeft: `2px solid ${toast.color}`,
              borderRadius: tokens.radiusSmall,
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: tokens.glassShadow,
              pointerEvents: 'auto',
              minWidth: 200,
              maxWidth: 320,
            }}
          >
            <span style={{
              color: toast.color,
              fontSize: 12,
              fontWeight: 700,
              fontFamily: tokens.fontMono,
              flexShrink: 0,
            }}>
              {toast.icon}
            </span>
            <span style={{
              color: tokens.textPrimary,
              fontSize: 12,
              fontFamily: tokens.fontUI,
              lineHeight: 1.4,
            }}>
              {toast.message}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
