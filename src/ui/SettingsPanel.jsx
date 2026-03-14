import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'
import { useIsMobile } from '../hooks/useMediaQuery'

function Toggle({ value, onChange, label }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0',
    }}>
      <span style={{
        fontFamily: tokens.fontUI,
        fontSize: 12,
        color: tokens.textPrimary,
      }}>
        {label}
      </span>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          border: 'none',
          background: value ? tokens.accent : 'rgba(255,255,255,0.08)',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      >
        <div style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: 3,
          left: value ? 19 : 3,
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </button>
    </div>
  )
}

function Slider({ value, onChange, label, min = 0, max = 100 }) {
  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 6,
      }}>
        <span style={{
          fontFamily: tokens.fontUI,
          fontSize: 12,
          color: tokens.textPrimary,
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: tokens.fontMono,
          fontSize: 10,
          color: tokens.textDim,
        }}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          height: 4,
          appearance: 'none',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 2,
          outline: 'none',
          accentColor: tokens.accent,
        }}
      />
    </div>
  )
}

export default function SettingsPanel() {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()
  const [settings, setSettings] = useState({
    showNames: true,
    showBubbles: true,
    showMiniMap: true,
    showGrid: true,
    ambientSound: false,
    reducedMotion: false,
    quality: 80,
    uiScale: 100,
  })

  const update = (key, val) => setSettings((s) => ({ ...s, [key]: val }))

  // Expose settings globally for other components to read
  if (typeof window !== 'undefined') {
    window.__shiftSettings = settings
  }

  return (
    <>
      {/* Gear button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 100,
          right: 16,
          zIndex: 100,
          width: 36,
          height: 36,
          borderRadius: 8,
          background: 'rgba(10,10,24,0.8)',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: tokens.textDim,
          fontSize: 16,
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = tokens.textPrimary
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = tokens.textDim
          e.currentTarget.style.borderColor = tokens.glassBorder
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 499,
                background: 'rgba(0,0,0,0.3)',
              }}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed',
                bottom: isMobile ? 60 : 124,
                right: isMobile ? 8 : 16,
                left: isMobile ? 8 : 'auto',
                zIndex: 500,
                width: isMobile ? 'auto' : 280,
                background: tokens.glass,
                backdropFilter: tokens.glassBlur,
                border: `1px solid ${tokens.glassBorder}`,
                borderRadius: tokens.radius,
                boxShadow: tokens.glassShadow,
                padding: '20px',
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}>
                <span style={{
                  fontFamily: tokens.fontUI,
                  fontSize: 14,
                  fontWeight: 700,
                  color: tokens.textPrimary,
                }}>
                  Settings
                </span>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 6,
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: tokens.textDim,
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  ×
                </button>
              </div>

              {/* Section: Display */}
              <div style={{
                fontFamily: tokens.fontUI,
                fontSize: 10,
                fontWeight: 700,
                color: tokens.textDim,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                Display
              </div>

              <Toggle label="Agent Names" value={settings.showNames} onChange={(v) => update('showNames', v)} />
              <Toggle label="Speech Bubbles" value={settings.showBubbles} onChange={(v) => update('showBubbles', v)} />
              <Toggle label="Mini Map" value={settings.showMiniMap} onChange={(v) => update('showMiniMap', v)} />
              <Toggle label="Floor Grid" value={settings.showGrid} onChange={(v) => update('showGrid', v)} />

              <div style={{
                height: 1,
                background: 'rgba(255,255,255,0.06)',
                margin: '12px 0',
              }} />

              {/* Section: Accessibility */}
              <div style={{
                fontFamily: tokens.fontUI,
                fontSize: 10,
                fontWeight: 700,
                color: tokens.textDim,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                Accessibility
              </div>

              <Toggle label="Reduced Motion" value={settings.reducedMotion} onChange={(v) => update('reducedMotion', v)} />
              <Slider label="UI Scale" value={settings.uiScale} onChange={(v) => update('uiScale', v)} min={80} max={120} />

              {/* Version */}
              <div style={{
                marginTop: 16,
                textAlign: 'center',
                fontFamily: tokens.fontMono,
                fontSize: 9,
                color: tokens.textDim,
              }}>
                SHIFT HQ v2.0
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
