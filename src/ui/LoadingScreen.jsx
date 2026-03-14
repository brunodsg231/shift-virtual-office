import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tokens } from '../styles/tokens'

function FloatingParticle({ delay, x, size }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: [0, 0.6, 0], y: -200 }}
      transition={{
        duration: 4 + Math.random() * 3,
        delay: delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        position: 'absolute',
        left: `${x}%`,
        bottom: '20%',
        width: size,
        height: size,
        borderRadius: '50%',
        background: tokens.accent,
        filter: 'blur(1px)',
        pointerEvents: 'none',
      }}
    />
  )
}

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Initializing...')

  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: Math.random() * 3,
      x: Math.random() * 100,
      size: 2 + Math.random() * 3,
    })),
    []
  )

  useEffect(() => {
    const steps = [
      { at: 10, text: 'Loading scene...' },
      { at: 30, text: 'Building office...' },
      { at: 50, text: 'Placing furniture...' },
      { at: 70, text: 'Waking agents...' },
      { at: 90, text: 'Almost ready...' },
      { at: 100, text: 'Welcome to SHIFT HQ' },
    ]

    let frame = 0
    const interval = setInterval(() => {
      frame += 2
      const p = Math.min(frame, 100)
      setProgress(p)

      const step = [...steps].reverse().find(s => p >= s.at)
      if (step) setStatusText(step.text)

      if (p >= 100) {
        clearInterval(interval)
        setTimeout(() => setVisible(false), 800)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: '#04040c',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
            overflow: 'hidden',
          }}
        >
          {/* Floating particles */}
          {particles.map((p) => (
            <FloatingParticle key={p.id} {...p} />
          ))}

          {/* Radial glow behind logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.2 }}
            style={{
              position: 'absolute',
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${tokens.accent}20 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              zIndex: 1,
            }}
          >
            <div style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: tokens.accent,
              boxShadow: `0 0 30px ${tokens.accent}, 0 0 60px ${tokens.accent}40`,
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: tokens.fontMono,
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: tokens.textPrimary,
            }}>
              SHIFT
              <span style={{ color: tokens.accent, marginLeft: 6 }}>HQ</span>
            </span>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            style={{
              fontFamily: tokens.fontUI,
              fontSize: 11,
              color: tokens.textDim,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              zIndex: 1,
            }}
          >
            Virtual Office
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.8 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            style={{ width: 260, zIndex: 1 }}
          >
            <div style={{
              width: '100%',
              height: 2,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 1,
              overflow: 'hidden',
            }}>
              <motion.div
                style={{
                  height: '100%',
                  background: `linear-gradient(90deg, ${tokens.accent}, ${tokens.accentBright})`,
                  borderRadius: 1,
                  width: `${progress}%`,
                  transition: 'width 0.1s linear',
                  boxShadow: `0 0 8px ${tokens.accent}`,
                }}
              />
            </div>
            {/* Percentage */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 8,
            }}>
              <span style={{
                fontFamily: tokens.fontUI,
                fontSize: 11,
                color: tokens.textDim,
                letterSpacing: '0.03em',
              }}>
                {statusText}
              </span>
              <span style={{
                fontFamily: tokens.fontMono,
                fontSize: 10,
                color: tokens.textDim,
              }}>
                {progress}%
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
