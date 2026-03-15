import { AnimatePresence } from 'framer-motion'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'
import Sidebar from './Sidebar'
import QuickAssign from './QuickAssign'
import ActivityView from './ActivityView'
import StandupView from './StandupView'

// ─── Placeholder components (will be replaced) ────────────

function PlaceholderView({ name }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        fontFamily: tokens.fontUI,
        fontSize: 18,
        color: tokens.textDim,
        userSelect: 'none',
      }}
    >
      {name}
    </div>
  )
}

function KanbanBoard() {
  return <PlaceholderView name="Kanban Board" />
}

function TaskDetail() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 360,
        height: '100%',
        background: tokens.glass,
        backdropFilter: tokens.glassBlur,
        borderLeft: `1px solid ${tokens.glassBorder}`,
        boxShadow: tokens.glassShadow,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: tokens.fontUI,
        fontSize: 16,
        color: tokens.textDim,
      }}
    >
      Task Detail
    </div>
  )
}

// ─── Dashboard Layout ──────────────────────────────────

export default function Dashboard() {
  const dashboardNav = useStore((s) => s.dashboardNav)
  const selectedTask = useStore((s) => s.selectedTask)

  return (
    <>
      <div
        style={{
          display: 'flex',
          height: '100vh',
          paddingTop: 56,
          background: tokens.void,
        }}
      >
        <Sidebar />
        <main
          style={{
            flex: 1,
            overflow: 'auto',
            position: 'relative',
          }}
        >
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
