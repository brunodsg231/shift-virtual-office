# SHIFT HQ Dashboard — Design Spec

## Overview
Add a Dashboard view as the default landing page. The 3D office becomes secondary ("Watch the office" mode). The dashboard is where daily work happens: kanban board, task detail, activity feed, standup reports, quick-assign.

## Users
Bruno + 2-5 team members at SHIFT Midtown.

## Navigation & Layout

Top bar gets a view switcher: `[Dashboard] [Office]`. Dashboard loads by default.

```
┌──────────────────────────────────────────────────────┐
│  Top Bar: Logo | [Dashboard] [Office] | agents | ... │
├──────────┬──────────────────────────┬────────────────┤
│ Sidebar  │  Main Content            │  Detail Panel  │
│ 200px    │  (Kanban / Activity /    │  480px         │
│          │   Standups)              │  (slides in)   │
│ - Agents │                          │                │
│ - Board  │                          │                │
│ - Feed   │                          │                │
│ - Standups                          │                │
├──────────┴──────────────────────────┴────────────────┤
│  Quick Assign Bar (always visible)                    │
└──────────────────────────────────────────────────────┘
```

- **Left sidebar** (200px): Agent roster with live status dots, nav links (Board, Activity, Standups)
- **Main area**: Active view content
- **Right panel** (480px, slides open on task click): Task detail
- **Bottom bar**: Quick assign — pick agent, type task, send

## Kanban Board

Three columns: **Backlog** | **In Progress** | **Done**

Task cards show:
- Agent colored dot + name
- Task title
- Timestamp
- Live status indicator (pulsing = working, green = done, red = error)
- Live "typing..." when agent is active

Interactions:
- Drag cards between columns
- Click card → opens detail panel
- "+ New task" at top of Backlog → inline form
- Cards auto-move when agent status changes

Filters: by agent, status, date range.

## Task Detail Panel

Slides in from right (480px). Contains:

**Header**: Agent, title, status badge, timestamps

**Conversation**: Full exchange — original task, agent response (markdown), tool calls (expandable), delegation chain, follow-up thread.

**Follow-up input**: "Ask [Agent] to follow up..." sends a linked task.

**Metadata sidebar**: Assigned to/by, priority (low/med/high), duration.

## Left Sidebar — Agent Roster

All 10 agents listed with:
- Colored dot + name
- Current status (idle/working/thinking)
- Current task title (if active)
- Click to filter board by agent
- Click agent name to open agent detail (same panel as current AgentDetailPanel)

## Quick Assign Bar

Fixed at bottom. Always visible:
- Agent selector (colored dots, click to pick)
- Text input: "Assign a task..."
- Send button
- Same as current ChatBar but flat, dashboard-native

## Activity View

Chronological feed (replaces current side panel). Full-width in main area:
- Agent dot + name + action + description + timestamp
- Filterable by agent, action type
- Clickable — task_received and completed link to the task detail

## Standups View

Full-width readable standup reports:
- Date picker at top
- Each agent's report shown in full, scrollable cards
- Bruno's synthesis at the bottom
- No streaming speed issue — rendered as static text from DB

## Technical Approach

- New React components in `src/dashboard/` directory
- Reuse existing Zustand store (agents, tasks, activities, streaming)
- Reuse existing socket client (same events)
- Add React Router for `/` (dashboard) and `/office` (3D)
- Dark theme matching existing glass aesthetic
- No new server changes needed — same API, same socket events

## Files to Create
- `src/dashboard/Dashboard.jsx` — layout wrapper
- `src/dashboard/Sidebar.jsx` — agent roster + nav
- `src/dashboard/KanbanBoard.jsx` — board with columns
- `src/dashboard/TaskCard.jsx` — individual card
- `src/dashboard/TaskDetail.jsx` — right panel detail view
- `src/dashboard/QuickAssign.jsx` — bottom bar
- `src/dashboard/ActivityView.jsx` — full activity feed
- `src/dashboard/StandupView.jsx` — standup reports
- `src/dashboard/ViewSwitcher.jsx` — dashboard/office toggle

## Files to Modify
- `src/App.jsx` — add router, conditional render dashboard vs office
- `src/ui/TopBar.jsx` — add view switcher tabs
- `package.json` — add react-router-dom
