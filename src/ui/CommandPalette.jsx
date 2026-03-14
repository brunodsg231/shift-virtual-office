import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'
import { assignTaskToAgent } from '../socket/client'

const COMMANDS = [
  { id: 'standup', label: 'Run Standup', icon: '📢', category: 'Actions' },
  { id: 'feed', label: 'Toggle Activity Feed', icon: '📋', category: 'View' },
  { id: 'tasks', label: 'Toggle Task Board', icon: '📌', category: 'View' },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: '⌨️', category: 'Help' },
]

const AGENT_IDS = ['kim', 'dev', 'marco', 'zara', 'riley', 'dante', 'sam', 'petra', 'lex', 'bruno']

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  const agents = useStore((s) => s.agents)
  const setActiveAgent = useStore((s) => s.setActiveAgent)
  const openAgentDetail = useStore((s) => s.openAgentDetail)
  const toggleActivityFeed = useStore((s) => s.toggleActivityFeed)
  const toggleTaskBoard = useStore((s) => s.toggleTaskBoard)
  const assignTask = useStore((s) => s.assignTask)

  // Build results list
  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    const items = []

    // Agent results
    Object.values(agents).forEach((a) => {
      if (!q || a.name.toLowerCase().includes(q) || a.role.toLowerCase().includes(q)) {
        items.push({
          id: `agent-${a.id}`,
          label: a.name,
          sublabel: a.role,
          icon: null,
          color: a.color,
          category: 'Agents',
          action: () => {
            setActiveAgent(a.id)
            openAgentDetail(a.id)
          },
        })
      }
    })

    // Command results
    COMMANDS.forEach((cmd) => {
      if (!q || cmd.label.toLowerCase().includes(q)) {
        items.push({
          ...cmd,
          sublabel: null,
          color: null,
          action: () => executeCommand(cmd.id),
        })
      }
    })

    // If query starts with > it's a direct task to active agent
    if (q.startsWith('>')) {
      const taskText = query.slice(1).trim()
      if (taskText) {
        const active = useStore.getState().activeAgent
        const agent = agents[active]
        items.unshift({
          id: 'direct-task',
          label: `Send to ${agent?.name || 'Bruno'}`,
          sublabel: taskText,
          icon: '⚡',
          color: agent?.color,
          category: 'Quick Task',
          action: () => {
            assignTask(active, taskText)
            assignTaskToAgent(active, taskText)
          },
        })
      }
    }

    return items
  }, [query, agents])

  const executeCommand = (id) => {
    const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'
    switch (id) {
      case 'standup':
        fetch(`${url}/api/standup/run`, { method: 'POST' }).catch(() => {})
        break
      case 'feed':
        toggleActivityFeed()
        break
      case 'tasks':
        toggleTaskBoard()
        break
      case 'shortcuts':
        // Dispatch keyboard event to toggle shortcuts
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))
        break
    }
  }

  // Open/close with Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
        setQuery('')
        setSelectedIndex(0)
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = results[selectedIndex]
      if (item?.action) {
        item.action()
        setOpen(false)
      }
    }
  }

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 500,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 501,
              width: 'min(520px, calc(100vw - 40px))',
              background: 'rgba(10, 10, 24, 0.95)',
              backdropFilter: tokens.glassBlur,
              border: `1px solid ${tokens.glassBorder}`,
              borderRadius: tokens.radiusLarge,
              boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 80px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
          >
            {/* Search input */}
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${tokens.glassBorder}`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tokens.textDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search agents, commands..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  fontFamily: tokens.fontUI,
                  fontSize: 15,
                  color: tokens.textPrimary,
                  outline: 'none',
                  caretColor: tokens.accent,
                }}
              />
              <kbd style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 4,
                padding: '2px 6px',
                fontFamily: tokens.fontMono,
                fontSize: 9,
                color: tokens.textDim,
              }}>
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div style={{
              maxHeight: 340,
              overflowY: 'auto',
              padding: '8px',
            }}>
              {results.length === 0 && (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  fontFamily: tokens.fontUI,
                  fontSize: 13,
                  color: tokens.textDim,
                }}>
                  No results
                </div>
              )}

              {/* Group by category */}
              {['Quick Task', 'Agents', 'Actions', 'View', 'Help'].map((cat) => {
                const items = results.filter((r) => r.category === cat)
                if (items.length === 0) return null
                return (
                  <div key={cat}>
                    <div style={{
                      padding: '6px 12px 4px',
                      fontFamily: tokens.fontUI,
                      fontSize: 10,
                      fontWeight: 700,
                      color: tokens.textDim,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}>
                      {cat}
                    </div>
                    {items.map((item) => {
                      const idx = results.indexOf(item)
                      const isSelected = idx === selectedIndex
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            item.action()
                            setOpen(false)
                          }}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '8px 12px',
                            background: isSelected ? 'rgba(123,92,230,0.1)' : 'transparent',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            transition: 'background 0.1s',
                            textAlign: 'left',
                          }}
                        >
                          {/* Icon or color dot */}
                          {item.color ? (
                            <div style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: item.color,
                              flexShrink: 0,
                            }} />
                          ) : item.icon ? (
                            <span style={{ fontSize: 14, flexShrink: 0, width: 20, textAlign: 'center' }}>
                              {item.icon}
                            </span>
                          ) : null}

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontFamily: tokens.fontUI,
                              fontSize: 13,
                              color: isSelected ? tokens.textPrimary : tokens.textSecondary,
                              fontWeight: isSelected ? 600 : 400,
                            }}>
                              {item.label}
                            </div>
                            {item.sublabel && (
                              <div style={{
                                fontFamily: tokens.fontUI,
                                fontSize: 11,
                                color: tokens.textDim,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {item.sublabel}
                              </div>
                            )}
                          </div>

                          {isSelected && (
                            <kbd style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              borderRadius: 4,
                              padding: '1px 5px',
                              fontFamily: tokens.fontMono,
                              fontSize: 9,
                              color: tokens.textDim,
                            }}>
                              ↵
                            </kbd>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* Footer hint */}
            <div style={{
              padding: '8px 16px',
              borderTop: `1px solid ${tokens.glassBorder}`,
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
            }}>
              {[
                { keys: '↑↓', label: 'Navigate' },
                { keys: '↵', label: 'Select' },
                { keys: '> text', label: 'Quick task' },
              ].map(({ keys, label }) => (
                <div key={keys} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <kbd style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 3,
                    padding: '1px 5px',
                    fontFamily: tokens.fontMono,
                    fontSize: 9,
                    color: tokens.textDim,
                  }}>
                    {keys}
                  </kbd>
                  <span style={{
                    fontFamily: tokens.fontUI,
                    fontSize: 10,
                    color: tokens.textDim,
                  }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
