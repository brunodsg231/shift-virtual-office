# SHIFT HQ Dashboard Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Dashboard view as the default landing page with kanban board, task detail panel, activity feed, standup reports, and quick-assign bar.

**Architecture:** React SPA with hash-based routing (no server changes). Dashboard components in `src/dashboard/`. Reuses existing Zustand store and socket client. Dark glass theme matching existing UI.

**Tech Stack:** React, Zustand (existing), socket.io-client (existing), react-router-dom (new), framer-motion (existing), existing `tokens` design system.

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `src/dashboard/Dashboard.jsx` | Layout wrapper — sidebar, main content, detail panel, quick assign |
| `src/dashboard/Sidebar.jsx` | Agent roster with live status + nav links (Board/Activity/Standups) |
| `src/dashboard/KanbanBoard.jsx` | Three-column board (Backlog/In Progress/Done) with task cards |
| `src/dashboard/TaskCard.jsx` | Individual kanban card — agent, title, status, live indicator |
| `src/dashboard/TaskDetail.jsx` | Right panel — full conversation, tool calls, follow-up input |
| `src/dashboard/QuickAssign.jsx` | Bottom bar — agent picker + text input + send |
| `src/dashboard/ActivityView.jsx` | Full-width chronological activity feed with filters |
| `src/dashboard/StandupView.jsx` | Readable standup reports by date |

### Modified Files
| File | Change |
|------|--------|
| `src/App.jsx` | Add HashRouter, route `/` to Dashboard, `/office` to 3D view |
| `src/ui/TopBar.jsx` | Add Dashboard/Office tab switcher |
| `src/store/useStore.js` | Add `currentView` state, `dashboardNav` state |
| `package.json` | Add `react-router-dom` dependency |

---

## Chunk 1: Routing & Shell

### Task 1: Install react-router-dom and set up routing

**Files:**
- Modify: `package.json`
- Modify: `src/App.jsx`

- [ ] **Step 1: Install dependency**

```bash
cd C:/shift_virtual_office && npm install react-router-dom
```

- [ ] **Step 2: Add routing to App.jsx**

Wrap the app in HashRouter. Route `/` renders Dashboard, `/office` renders the existing 3D canvas + all overlay UI. Move all current Canvas + overlay components into an `OfficeView` wrapper.

```jsx
// src/App.jsx
import { HashRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './dashboard/Dashboard'
// ... existing imports

function OfficeView() {
  // Contains ALL current Canvas + overlay components
}

export default function App() {
  return (
    <HashRouter>
      <TopBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/office" element={<OfficeView />} />
      </Routes>
    </HashRouter>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add react-router, split app into dashboard and office routes"
```

### Task 2: Add view switcher to TopBar

**Files:**
- Modify: `src/ui/TopBar.jsx`

- [ ] **Step 1: Add Dashboard/Office toggle tabs**

After the logo section, add two tab buttons that use `useNavigate()` from react-router-dom. Highlight the active tab based on current location.

```jsx
const navigate = useNavigate()
const location = useLocation()
const isDashboard = location.pathname === '/' || location.pathname === ''

// Render two tabs:
// [Dashboard] [Office]
// Active tab has accent underline + brighter text
```

- [ ] **Step 2: Verify both routes work**

Navigate between Dashboard and Office. Office should show the full 3D scene. Dashboard shows placeholder for now.

- [ ] **Step 3: Commit**

```bash
git add src/ui/TopBar.jsx && git commit -m "feat: add dashboard/office view switcher to top bar"
```

### Task 3: Create Dashboard shell layout

**Files:**
- Create: `src/dashboard/Dashboard.jsx`
- Create: `src/dashboard/Sidebar.jsx`

- [ ] **Step 1: Build Dashboard layout component**

Three-panel layout: left sidebar (200px), main content area (flex), right detail panel (480px, hidden by default). Fixed bottom bar area.

Use `tokens` from `../styles/tokens` for consistent theming. Background: `#08080f`. Glass panels for sidebar and detail.

- [ ] **Step 2: Build Sidebar component**

Top section: Nav links (Board, Activity, Standups) — simple buttons that set `dashboardNav` in store.

Bottom section: Agent roster — all 10 agents listed with colored dot, name, status text. Subscribe to each agent's status from store. Click agent to filter the board.

- [ ] **Step 3: Add `dashboardNav` state to store**

```js
// In useStore.js, add:
dashboardNav: 'board', // 'board' | 'activity' | 'standups'
setDashboardNav: (nav) => set({ dashboardNav: nav }),
```

- [ ] **Step 4: Commit**

```bash
git add src/dashboard/ src/store/useStore.js && git commit -m "feat: dashboard shell layout with sidebar and agent roster"
```

---

## Chunk 2: Kanban Board

### Task 4: Build KanbanBoard component

**Files:**
- Create: `src/dashboard/KanbanBoard.jsx`
- Create: `src/dashboard/TaskCard.jsx`

- [ ] **Step 1: Build KanbanBoard**

Three columns: Backlog, In Progress, Done. Each column has a header with count badge and a scrollable list of TaskCards.

Read `taskBoard` from store. Group tasks by status:
- `pending` / `backlog` → Backlog column
- `in_progress` → In Progress column
- `done` / `failed` → Done column

Add "+ New Task" button at top of Backlog column that opens an inline form (agent selector dropdown + task text input + submit).

- [ ] **Step 2: Build TaskCard**

Each card shows:
- Left color bar (agent's color)
- Agent name (small, colored)
- Task title
- Timestamp (relative: "5m ago")
- Status dot: pulsing blue (in_progress), green (done), red (failed)
- If agent is currently working on this task: show "Working..." with typing animation

Card is clickable — calls `setSelectedTask(task)` in store to open detail panel.

- [ ] **Step 3: Add selectedTask state to store**

```js
selectedTask: null,
setSelectedTask: (task) => set({ selectedTask: task }),
```

- [ ] **Step 4: Commit**

```bash
git add src/dashboard/ src/store/useStore.js && git commit -m "feat: kanban board with task cards and status columns"
```

### Task 5: Build TaskDetail panel

**Files:**
- Create: `src/dashboard/TaskDetail.jsx`

- [ ] **Step 1: Build the detail panel**

Slides in from right (480px) when `selectedTask` is set. Framer-motion slide animation.

Sections:
- **Header**: Agent avatar (colored dot), task title, status badge, created/completed timestamps
- **Conversation**:
  - "You" block: the original task text
  - "Agent" block: the full response (from `task.result`). Render as formatted text with proper line breaks.
  - If agent is currently working: show live streaming text from `streamingTokens[agentId]`
- **Follow-up input**: Text field + send button. Calls `assignTaskToAgent(agentId, followUpText)` and links to original task.

Close button (X) or click outside to close.

- [ ] **Step 2: Wire detail panel into Dashboard layout**

In Dashboard.jsx, conditionally render TaskDetail when `selectedTask` is not null.

- [ ] **Step 3: Commit**

```bash
git add src/dashboard/ && git commit -m "feat: task detail panel with conversation view and follow-up"
```

---

## Chunk 3: Quick Assign, Activity, Standups

### Task 6: Build QuickAssign bar

**Files:**
- Create: `src/dashboard/QuickAssign.jsx`

- [ ] **Step 1: Build the bottom bar**

Fixed at bottom of dashboard. Contains:
- Agent selector: 10 colored dots (like current ChatBar). Click to select. Shows selected agent name.
- Text input: "Assign a task to [Agent]..."
- Send button
- Keyboard: Enter to send

On submit: call `assignTaskToAgent(agentId, text)` from socket client, call `assignTask(agentId, text)` on store. Clear input.

Disable input if selected agent is not idle (show "[Agent] is busy...").

- [ ] **Step 2: Commit**

```bash
git add src/dashboard/ && git commit -m "feat: quick assign bar for dashboard"
```

### Task 7: Build ActivityView

**Files:**
- Create: `src/dashboard/ActivityView.jsx`

- [ ] **Step 1: Build full-width activity feed**

Replaces the narrow side panel. Full main-area width. Shows:
- Each activity: agent colored dot, agent name, action description, timestamp
- Filter bar at top: All / Tasks / Done / Tools / Delegated (same as current ActivityFeed)
- Scrollable, auto-scrolls to bottom on new entries

Reuse data from `activities` in store.

Activity items that are task_received or completed should be clickable — find the matching task in taskBoard and open TaskDetail.

- [ ] **Step 2: Commit**

```bash
git add src/dashboard/ && git commit -m "feat: full-width activity view for dashboard"
```

### Task 8: Build StandupView

**Files:**
- Create: `src/dashboard/StandupView.jsx`

- [ ] **Step 1: Build standup reports view**

Fetches from `/api/standup/history` on mount (same as current StandupHistory component).

Layout:
- Date picker at top (dropdown of available dates)
- Agent report cards: each agent's report in a glass card with agent color accent, name, full report text. No streaming — just static text from DB.
- Bruno's synthesis card at bottom with red accent.
- "Run Standup" button if no standup today.

- [ ] **Step 2: Commit**

```bash
git add src/dashboard/ && git commit -m "feat: standup reports view for dashboard"
```

---

## Chunk 4: Integration & Polish

### Task 9: Wire everything together in Dashboard.jsx

**Files:**
- Modify: `src/dashboard/Dashboard.jsx`

- [ ] **Step 1: Connect nav to views**

Based on `dashboardNav` in store:
- `'board'` → render KanbanBoard
- `'activity'` → render ActivityView
- `'standups'` → render StandupView

TaskDetail panel overlays on top of any view when selectedTask is set.
QuickAssign bar always visible at bottom.

- [ ] **Step 2: Commit**

```bash
git add src/dashboard/ && git commit -m "feat: wire dashboard views together"
```

### Task 10: Keyboard shortcuts for dashboard

**Files:**
- Modify: `src/ui/KeyboardShortcuts.jsx`

- [ ] **Step 1: Add dashboard-specific shortcuts**

- `N` — focus new task input (QuickAssign bar)
- `B` — switch to Board view
- `D` — switch to Dashboard (if in office)
- Update help panel with new shortcuts

- [ ] **Step 2: Commit**

```bash
git add src/ui/KeyboardShortcuts.jsx && git commit -m "feat: dashboard keyboard shortcuts"
```

### Task 11: Final integration and push

- [ ] **Step 1: Build and verify**

```bash
cd C:/shift_virtual_office && npx vite build
```

Fix any build errors.

- [ ] **Step 2: Test locally**

```bash
npx vite --open
```

Verify: Dashboard loads by default, kanban shows tasks, clicking cards opens detail, quick assign works, office view still works.

- [ ] **Step 3: Commit and push**

```bash
git add -A && git commit -m "feat: SHIFT HQ dashboard — kanban board, task detail, activity feed, standups"
git push origin master
```
