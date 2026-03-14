# SHIFT HQ Virtual Office — Design Spec

## Overview

A React Three Fiber isometric 3D virtual office where AI agents appear as characters at workstations. Users can assign tasks to agents via a chat bar, and agents respond with animated speech bubbles. This is the frontend shell — the Socket.IO backend comes later.

## Stack

| Layer | Technology |
|-------|-----------|
| Build | Vite 5 |
| UI | React 18 |
| 3D | React Three Fiber + @react-three/drei |
| Post-processing | @react-three/postprocessing |
| State | Zustand |
| Overlays/animation | Framer Motion |
| Real-time (stub) | Socket.IO client (imported, not connected) |
| Font | Inter (Google Fonts, loaded via CSS) |

## File Structure

```
shift_virtual_office/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── models/          # GLB files go here later
├── src/
│   ├── main.jsx         # React root mount
│   ├── App.jsx          # Canvas + UI composition
│   ├── store/
│   │   └── useStore.js  # Zustand store
│   ├── scene/
│   │   ├── Venue.jsx        # Procedural venue geometry (swap for GLB later)
│   │   ├── Lighting.jsx     # Ambient + point lights
│   │   └── PostProcessing.jsx # Bloom + Vignette
│   ├── agents/
│   │   ├── Agent.jsx         # Single agent component (mesh + label + status dot)
│   │   ├── AgentGroup.jsx    # Renders all 5 agents from store
│   │   └── SpeechBubble.jsx  # Html overlay with typewriter effect
│   ├── ui/
│   │   ├── ChatBar.jsx       # Bottom panel with agent selector + input
│   │   └── TaskPill.jsx      # Recent task assignment pill
│   ├── hooks/
│   │   └── useTypewriter.js  # Character-by-character reveal hook
│   └── styles/
│       └── index.css         # Global styles, Inter font, dark theme
```

## Scene Architecture

### Camera & Controls
- PerspectiveCamera at position `[15, 15, 15]` looking at origin
- OrbitControls with: `enableRotate: false`, `enablePan: false`, `enableZoom: true` (clamped min/max distance 10-30)
- This gives an isometric-like perspective locked to a 45-degree angle

### Venue (Procedural Placeholder)
Since no GLB exists yet, build a stylized procedural venue:
- **Floor**: Large BoxGeometry (30x0.2x20), dark material (#1a1a2e) with subtle grid lines via a custom shader or overlaid line segments
- **Desk blocks**: 5 BoxGeometry clusters at fixed positions matching agent locations, dark material with emissive purple edge glow
- **Wall panels**: Thin boxes along back/sides, dark with faint emissive accents
- **Projection wall**: One taller panel at the back with a faint emissive rectangle (decorative only in this phase, intended for future dashboard display)

The initial version renders only the procedural venue. The GLB loading path is not wired up yet — when a real model is ready, `Venue.jsx` can be updated to use `useGLTF` wrapped in a `Suspense` + error boundary that falls back to the procedural version.

### Lighting
- Ambient light: `#7B5CE6` at intensity `0.3`
- One directional light from top-right for shadows: `#ffffff` at intensity `0.5`, position `[10, 20, 10]`
- Point lights near desk areas with warm-purple tint for atmosphere

### Post-Processing
- `Bloom`: intensity `0.3`, luminanceThreshold `0.6`, radius `0.4`
- `Vignette`: offset `0.3`, darkness `0.7`

## Agent System

### Data Model (Zustand)

```js
{
  agents: {
    kim:       { id: 'kim',       name: 'Kim',       role: 'Operations',    position: [-6, 0.8, -3], color: '#7B5CE6', status: 'idle', currentMessage: null, taskHistory: [] },
    dev:       { id: 'dev',       name: 'Dev',       role: 'Engineering',   position: [-2, 0.8, 2],  color: '#00D4FF', status: 'idle', currentMessage: null, taskHistory: [] },
    marketing: { id: 'marketing', name: 'Marketing', role: 'Marketing',     position: [3, 0.8, -4],  color: '#FF8A00', status: 'idle', currentMessage: null, taskHistory: [] },
    venue:     { id: 'venue',     name: 'Venue',     role: 'AV/Technical',  position: [6, 0.8, 1],   color: '#00E676', status: 'idle', currentMessage: null, taskHistory: [] },
    finance:   { id: 'finance',   name: 'Finance',   role: 'Finance',       position: [0, 0.8, 6],   color: '#FFD600', status: 'idle', currentMessage: null, taskHistory: [] },
  },
  activeAgent: 'kim',
  setAgentStatus: (id, status) => ...,
  setAgentMessage: (id, message) => ...,
  assignTask: (agentId, task) => ...,
  setActiveAgent: (id) => ...,
}
```

### Agent Component (`Agent.jsx`)
Each agent renders:
1. **Body**: CapsuleGeometry (radius=0.25, length=0.8), MeshStandardMaterial with agent color, emissive at low intensity
2. **Head**: SphereGeometry (radius=0.25), positioned on top of capsule
3. **Name label**: drei `Billboard` + `Text` floating above head — agent name in white, role in muted grey below
4. **Status dot**: Small SphereGeometry (radius=0.08) floating to the right of name label
   - `idle`: grey (#666), no animation
   - `working`: blue (#3B82F6), pulsing scale via `useFrame` with `Math.sin`
   - `speaking`: green (#00E676), pulsing scale
   - `error`: red (#EF4444), static
5. **Selection ring**: When agent is `activeAgent`, render a thin TorusGeometry at feet with agent color, slowly rotating

### Animations (via `useFrame`)
- **Idle**: `position.y = baseY + Math.sin(time * 1.5) * 0.05` (gentle float)
- **Working**: Idle float at 2x speed + mesh rotation.x tilted 0.1 rad forward + status dot pulses
- **Speaking**: Same as working, status dot color changes to green

### Speech Bubble (`SpeechBubble.jsx`)
- Uses drei `Html` component, positioned above agent head `[0, 2.2, 0]` relative to agent
- Renders only when `currentMessage` is non-null
- Content:
  - Agent name in the agent's own `color`, bold
  - Message text rendered via `useTypewriter` hook
  - Container: `background: rgba(10,10,10,0.85)`, `border: 1px solid rgba(123,92,230,0.3)`, `border-radius: 12px`, `padding: 12px 16px`, `max-width: 280px`
- Auto-dismiss: after typewriter completes, wait 3s, then `setAgentMessage(id, null)`

### Typewriter Hook (`useTypewriter.js`)
```
useTypewriter(fullText, speed = 30) → { displayedText, isComplete }
```
- Reveals one character every `speed` ms using `useEffect` + `setInterval`
- Returns `isComplete: true` when all characters revealed

## UI Layer

### Chat Bar (`ChatBar.jsx`)
Fixed at bottom of viewport, `z-index: 100`, Framer Motion `animate` for slide-up on mount.

Layout:
- **Agent selector row**: Horizontal row of colored dots (one per agent). Each dot is a 32px circle with the agent's color, name tooltip on hover. Clicking sets `activeAgent`. Active dot has a white ring.
- **Task history pills**: Above the input, up to 3 most recent entries from the active agent's `taskHistory`, shown as small rounded pills with truncated text.
- **Input row**: Text input (flex-1) with placeholder "Assign task to [AgentName]...", plus a Send button (purple `#7B5CE6` background, white arrow icon). Enter key submits; no multi-line support needed.
- **Agent click-to-select**: Clicking an agent in the 3D scene also sets `activeAgent` (via onClick on the Agent mesh group).

Styling: Dark glass panel — `background: rgba(10,10,10,0.9)`, `border-top: 1px solid rgba(123,92,230,0.2)`, `backdrop-filter: blur(10px)`.

### Task History Item Shape
```js
{ id: string, text: string, timestamp: number }
```

### TaskPill Component (`TaskPill.jsx`)
- Renders a single task history entry as a rounded pill
- Shows truncated task text (max 50 chars, ellipsis)
- Styling: `background: rgba(123,92,230,0.15)`, `border: 1px solid rgba(123,92,230,0.2)`, `border-radius: 16px`, `padding: 4px 12px`, `font-size: 12px`, color `#aaa`
- No click interaction — display only
- Framer Motion `AnimatePresence` for enter/exit transitions (fade + slide up)

### Mock Mode Flow
**Orchestration**: The `ChatBar.jsx` submit handler orchestrates the mock flow. The Zustand `assignTask` action is purely synchronous (pushes to `taskHistory`, sets status to `working`). The async sequence (timeouts, status transitions) lives in the submit handler.

**Busy agent guard**: If the target agent's status is not `idle`, the Send button is disabled and the input placeholder shows "[AgentName] is busy...".

When user clicks Send:
1. `assignTask(agentId, taskText)` — pushes to `taskHistory`, sets status to `working`
2. After 1500ms timeout: `setAgentStatus(id, 'speaking')`, `setAgentMessage(id, mockResponse)` — mock response picked randomly from canned strings
3. Typewriter effect streams the message in the speech bubble
4. After typewriter completes + 3000ms: `setAgentStatus(id, 'idle')`, `setAgentMessage(id, null)`

Mock responses per agent:
- Kim: operations/scheduling related
- Dev: engineering/code related
- Marketing: campaign/content related
- Venue: AV/setup related
- Finance: budget/reporting related

## Styling

- Font: Inter via Google Fonts CDN link in `index.html`
- Background: `#0a0a0a` on body and Canvas
- All UI panels: dark glass aesthetic, no light mode
- Accent color: `#7B5CE6` throughout
- No default browser scrollbars or chrome visible (overflow hidden on body)

## Dependencies (package.json)

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.92.0",
    "@react-three/postprocessing": "^2.16.0",
    "three": "0.160.0",
    "zustand": "^4.4.7",
    "framer-motion": "^11.15.0",
    "socket.io-client": "^4.7.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.10"
  }
}
```

## Additional Details

- **Canvas sizing**: Canvas fills `100vw x 100vh`, responsive to window resize (R3F handles this automatically).
- **Socket.IO stub**: Import `io` from `socket.io-client` in `useStore.js` with a commented-out connection to `ws://localhost:3001`. No actual connection in mock mode.
- **Error status**: The `error` agent status exists in the data model for future backend integration. It is not triggered in mock mode.
- **Enter to send**: Pressing Enter in the chat input submits the task. Empty input is ignored (no submit).

## Out of Scope
- Socket.IO server / real backend
- Real AI agent integration
- Authentication
- Persistence
- Mobile responsiveness (desktop-first)
- Real GLB model (procedural placeholder only)
