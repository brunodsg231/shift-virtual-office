import { AnimatePresence } from 'framer-motion'
import { tokens } from '../styles/tokens'
import useStore from '../store/useStore'
import Sidebar from './Sidebar'
import QuickAssign from './QuickAssign'
import KanbanBoard from './KanbanBoard'
import TaskDetail from './TaskDetail'
import ActivityView from './ActivityView'
import StandupView from './StandupView'

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
