import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'
import { useIsMobile } from '../hooks/useMediaQuery'
import Sidebar from './Sidebar'
import QuickAssign from './QuickAssign'
import KanbanBoard from './KanbanBoard'
import TaskDetail from './TaskDetail'
import ActivityView from './ActivityView'
import StandupView from './StandupView'

const NAV_ITEMS = [
  { key: 'board', label: 'Board' },
  { key: 'activity', label: 'Activity' },
  { key: 'standups', label: 'Standups' },
]

function MobileNav() {
  const dashboardNav = useStore((s) => s.dashboardNav)
  const setDashboardNav = useStore((s) => s.setDashboardNav)
  return (
    <div style={{
      display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(10,10,24,0.9)', flexShrink: 0,
    }}>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          onClick={() => setDashboardNav(item.key)}
          style={{
            flex: 1, padding: '10px 0', background: 'transparent', border: 'none',
            borderBottom: dashboardNav === item.key ? `2px solid ${tokens.accent}` : '2px solid transparent',
            fontFamily: tokens.fontUI, fontSize: 12, fontWeight: 600,
            color: dashboardNav === item.key ? tokens.textPrimary : tokens.textDim,
            cursor: 'pointer',
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const dashboardNav = useStore((s) => s.dashboardNav)
  const selectedTask = useStore((s) => s.selectedTask)
  const isMobile = useIsMobile()

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          height: '100vh',
          paddingTop: isMobile ? 48 : 56,
          paddingBottom: isMobile ? 56 : 0,
          background: tokens.void,
        }}
      >
        {isMobile ? <MobileNav /> : <Sidebar />}
        <main style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          {dashboardNav === 'board' && <KanbanBoard />}
          {dashboardNav === 'activity' && <ActivityView />}
          {dashboardNav === 'standups' && <StandupView />}
          <AnimatePresence>
            {selectedTask && <TaskDetail />}
          </AnimatePresence>
        </main>
      </div>
      <QuickAssign />
    </>
  )
}
