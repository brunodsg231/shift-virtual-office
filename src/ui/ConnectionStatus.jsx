import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tokens } from '../styles/tokens'

export default function ConnectionStatus() {
  const [visible, setVisible] = useState(false)
  const [reconnected, setReconnected] = useState(false)
  const failCountRef = useRef(0)
  const wasDisconnectedRef = useRef(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

    const checkConnection = async () => {
      try {
        const res = await fetch(`${socketUrl}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000),
        })
        if (res.ok) {
          if (wasDisconnectedRef.current) {
            setReconnected(true)
            setTimeout(() => setReconnected(false), 3000)
            wasDisconnectedRef.current = false
          }
          failCountRef.current = 0
          setVisible(false)
        } else {
          throw new Error('unhealthy')
        }
      } catch {
        failCountRef.current++
        if (failCountRef.current >= 3) {
          setVisible(true)
          wasDisconnectedRef.current = true
        }
      }
    }

    intervalRef.current = setInterval(checkConnection, 5000)
    const timeout = setTimeout(checkConnection, 3000)

    return () => {
      clearInterval(intervalRef.current)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <>
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            top: 64,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 300,
            width: 'auto',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: '4px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.3)',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: tokens.fontMono,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.4)',
          }}>
            SERVER UNAVAILABLE — RETRYING...
          </span>
        </motion.div>
      )}
    </AnimatePresence>
    <AnimatePresence>
      {reconnected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: 64,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 300,
            background: 'rgba(48,209,88,0.1)',
            border: `1px solid ${tokens.green}40`,
            borderRadius: 20,
            padding: '4px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: tokens.green,
            boxShadow: `0 0 6px ${tokens.green}`,
          }} />
          <span style={{
            fontFamily: tokens.fontMono, fontSize: 11, fontWeight: 600,
            letterSpacing: '0.08em', color: tokens.green,
          }}>
            RECONNECTED
          </span>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}
