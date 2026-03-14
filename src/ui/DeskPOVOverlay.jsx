import { motion, AnimatePresence } from 'framer-motion'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'
import { useIsMobile } from '../hooks/useMediaQuery'

export default function DeskPOVOverlay() {
  const cameraMode = useStore((s) => s.cameraMode)
  const activeDeskAgent = useStore((s) => s.activeDeskAgent)
  const exitDeskMode = useStore((s) => s.exitDeskMode)
  const monitorZoomed = useStore((s) => s.monitorZoomed)
  const exitMonitorZoom = () => useStore.getState().setMonitorZoomed(false)

  // Subscribe to individual fields — not the whole agents object
  const agentName = useStore((s) => s.agents[activeDeskAgent]?.name)
  const agentColor = useStore((s) => s.agents[activeDeskAgent]?.color)
  const agentRole = useStore((s) => s.agents[activeDeskAgent]?.role)
  const agentStatus = useStore((s) => s.agents[activeDeskAgent]?.status)
  const agentMessage = useStore((s) => s.agents[activeDeskAgent]?.currentMessage)

  const isMobile = useIsMobile()
  const isVisible = cameraMode === 'desk' && activeDeskAgent && agentName

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Agent info — top left */}
          <motion.div
            key="desk-info"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: isMobile ? 52 : 80,
              left: isMobile ? 8 : 24,
              zIndex: 500,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{
              background: tokens.glass,
              backdropFilter: tokens.glassBlur,
              border: `1px solid ${tokens.glassBorder}`,
              borderRadius: tokens.radius,
              padding: '16px 20px',
              boxShadow: tokens.glassShadow,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 8,
              }}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: agentColor,
                  boxShadow: `0 0 10px ${agentColor}`,
                }} />
                <span style={{
                  fontFamily: tokens.fontUI,
                  fontSize: 16,
                  fontWeight: 700,
                  color: tokens.textPrimary,
                  letterSpacing: '0.02em',
                }}>
                  {agentName}'s Desk
                </span>
              </div>
              <div style={{
                fontFamily: tokens.fontMono,
                fontSize: 11,
                color: tokens.textSecondary,
                letterSpacing: '0.04em',
              }}>
                {agentRole}
              </div>
              {agentStatus !== 'idle' && (
                <div style={{
                  marginTop: 8,
                  fontFamily: tokens.fontMono,
                  fontSize: 10,
                  color: agentStatus === 'working' ? '#3B82F6' : agentStatus === 'error' ? tokens.red : tokens.green,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  {agentStatus}
                </div>
              )}
            </div>
          </motion.div>

          {/* Exit button — top right */}
          <motion.button
            key="desk-exit"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            onClick={exitDeskMode}
            style={{
              position: 'fixed',
              top: isMobile ? 52 : 80,
              right: isMobile ? 8 : 24,
              zIndex: 500,
              background: tokens.glass,
              backdropFilter: tokens.glassBlur,
              border: `1px solid ${tokens.glassBorder}`,
              borderRadius: tokens.radius,
              padding: '10px 20px',
              boxShadow: tokens.glassShadow,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: tokens.textPrimary,
              fontFamily: tokens.fontMono,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.06em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              e.currentTarget.style.background = 'rgba(10,10,24,0.85)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = tokens.glassBorder
              e.currentTarget.style.background = tokens.glass
            }}
          >
            <kbd style={{
              fontFamily: tokens.fontMono,
              fontSize: 9,
              color: tokens.textDim,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 3,
              padding: '1px 5px',
            }}>
              ESC
            </kbd>
            BACK TO OFFICE
          </motion.button>

          {/* Current message panel — bottom area */}
          {agentMessage && (
            <motion.div
              key="desk-message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.7 }}
              style={{
                position: 'fixed',
                bottom: 100,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 500,
                maxWidth: 600,
                width: '90%',
                background: tokens.glass,
                backdropFilter: tokens.glassBlur,
                border: `1px solid ${tokens.glassBorder}`,
                borderRadius: tokens.radius,
                padding: '14px 20px',
                boxShadow: tokens.glassShadow,
              }}
            >
              <div style={{
                fontFamily: tokens.fontMono,
                fontSize: 12,
                color: tokens.textPrimary,
                lineHeight: 1.5,
                maxHeight: 120,
                overflow: 'auto',
              }}>
                {agentMessage}
              </div>
            </motion.div>
          )}

          {/* Monitor zoom pill */}
          {monitorZoomed && (
            <motion.div
              key="desk-zoom-pill"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={() => exitMonitorZoom()}
              style={{
                position: 'fixed',
                bottom: 40,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 500,
                background: tokens.glass,
                backdropFilter: tokens.glassBlur,
                border: `1px solid ${tokens.glassBorder}`,
                borderRadius: 20,
                padding: '8px 20px',
                cursor: 'pointer',
                fontFamily: tokens.fontMono,
                fontSize: 11,
                color: tokens.textSecondary,
                letterSpacing: '0.04em',
              }}
            >
              ESC or click to step back
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  )
}
