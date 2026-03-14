# SHIFT HQ Virtual Office Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React Three Fiber isometric 3D virtual office with 5 AI agent characters, speech bubbles, and a chat bar for task assignment (mock mode).

**Architecture:** Feature-modular R3F app — `store/` (Zustand state), `scene/` (venue geometry + lighting + post-processing), `agents/` (character meshes + speech bubbles), `ui/` (chat bar + task pills). All mock orchestration lives in the ChatBar submit handler; the store is purely synchronous.

**Tech Stack:** React 18, Vite 5, React Three Fiber, @react-three/drei, @react-three/postprocessing, Three.js 0.160, Zustand, Framer Motion 11, Socket.IO client (stub only).

**Spec:** `docs/superpowers/specs/2026-03-12-shift-hq-virtual-office-design.md`

---

## Chunk 1: Project Scaffold + Zustand Store

### Task 1: Initialize Vite project and install dependencies

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/styles/index.css`
- Create: `public/models/.gitkeep`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "shift-hq",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
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

- [ ] **Step 2: Create `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 3: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SHIFT HQ</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create `src/styles/index.css`**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background: #0a0a0a;
  color: #ffffff;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
}

#root {
  width: 100%;
  height: 100%;
}
```

- [ ] **Step 5: Create `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 6: Create placeholder `src/App.jsx`**

```jsx
export default function App() {
  return <div style={{ color: '#7B5CE6', padding: 40 }}>SHIFT HQ loading...</div>
}
```

- [ ] **Step 7: Create `public/models/.gitkeep`**

Empty file — placeholder for future GLB models.

- [ ] **Step 8: Install dependencies**

Run: `npm install`
Expected: Clean install, `node_modules` created, no peer dependency errors.

- [ ] **Step 9: Verify dev server starts**

Run: `npm run dev`
Expected: Vite dev server starts, browser shows "SHIFT HQ loading..." in purple text.

- [ ] **Step 10: Verify production build**

Run: `npm run build`
Expected: Build succeeds with no errors, `dist/` directory created.

- [ ] **Step 11: Commit**

```bash
git init
git add package.json vite.config.js index.html src/main.jsx src/App.jsx src/styles/index.css public/models/.gitkeep
git commit -m "feat: scaffold Vite project with dependencies"
```

---

### Task 2: Create Zustand store

**Files:**
- Create: `src/store/useStore.js`

- [ ] **Step 1: Create `src/store/useStore.js`**

```js
import { create } from 'zustand'
// import { io } from 'socket.io-client'
// const socket = io('ws://localhost:3001')

const MOCK_RESPONSES = {
  kim: [
    "I've updated the schedule. The team standup is moved to 2pm and I've notified everyone.",
    "Operations report is ready. We're at 94% efficiency this week, up from 89% last week.",
    "I've coordinated with all departments. The venue walkthrough is confirmed for Thursday at 10am.",
    "All supply orders have been placed. Expected delivery is tomorrow morning before the event.",
  ],
  dev: [
    "I've pushed the fix to staging. The API latency issue was caused by an unindexed query on the events table.",
    "New feature branch is ready for review. Added real-time sync for the agent dashboard with WebSocket fallback.",
    "CI pipeline is green. All 247 tests passing. Deploying to production in the next window.",
    "I've refactored the notification service. Memory usage is down 40% and response times improved by 120ms.",
  ],
  marketing: [
    "Campaign draft is ready for review. Targeting 25-34 demographic with the new venue showcase series.",
    "Social media analytics are in. Instagram engagement is up 34% this month. The behind-the-scenes content is performing best.",
    "Email newsletter is scheduled for Thursday. Open rate prediction is 28% based on the subject line A/B test.",
    "I've prepared the press kit for the upcoming launch event. All assets are in the shared drive.",
  ],
  venue: [
    "Sound check complete. Main PA is calibrated, monitors are set. We're ready for tonight's event.",
    "Lighting rig is programmed for all three scenes. I've added a new ambient purple wash for the networking segment.",
    "AV rack maintenance is done. Replaced two aging HDMI splitters and updated the streaming encoder firmware.",
    "Projector is calibrated to the new screen. Running 4K at 60Hz with 12ms latency. Backup unit is on standby.",
  ],
  finance: [
    "Q1 budget report is finalized. We're 8% under budget with strong margins on event revenue.",
    "Invoice batch is processed. 23 vendor payments scheduled for Friday's payment run.",
    "I've prepared the financial forecast for next quarter. Revenue projection is up 15% based on confirmed bookings.",
    "Expense audit is complete. Found two duplicate charges totaling $1,240 — I've initiated the refund process.",
  ],
}

const useStore = create((set, get) => ({
  agents: {
    kim:       { id: 'kim',       name: 'Kim',       role: 'Operations',    position: [-6, 0.8, -3], color: '#7B5CE6', status: 'idle', currentMessage: null, taskHistory: [] },
    dev:       { id: 'dev',       name: 'Dev',       role: 'Engineering',   position: [-2, 0.8, 2],  color: '#00D4FF', status: 'idle', currentMessage: null, taskHistory: [] },
    marketing: { id: 'marketing', name: 'Marketing', role: 'Marketing',     position: [3, 0.8, -4],  color: '#FF8A00', status: 'idle', currentMessage: null, taskHistory: [] },
    venue:     { id: 'venue',     name: 'Venue',     role: 'AV/Technical',  position: [6, 0.8, 1],   color: '#00E676', status: 'idle', currentMessage: null, taskHistory: [] },
    finance:   { id: 'finance',   name: 'Finance',   role: 'Finance',       position: [0, 0.8, 6],   color: '#FFD600', status: 'idle', currentMessage: null, taskHistory: [] },
  },

  activeAgent: 'kim',

  setActiveAgent: (id) => set({ activeAgent: id }),

  setAgentStatus: (id, status) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: { ...state.agents[id], status },
      },
    })),

  setAgentMessage: (id, message) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: { ...state.agents[id], currentMessage: message },
      },
    })),

  assignTask: (agentId, task) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          status: 'working',
          taskHistory: [
            ...state.agents[agentId].taskHistory,
            { id: crypto.randomUUID(), text: task, timestamp: Date.now() },
          ],
        },
      },
    })),

  getMockResponse: (agentId) => {
    const responses = MOCK_RESPONSES[agentId] || MOCK_RESPONSES.kim
    return responses[Math.floor(Math.random() * responses.length)]
  },
}))

export default useStore
```

- [ ] **Step 2: Verify build still passes**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/store/useStore.js
git commit -m "feat: add Zustand store with agent data model and mock responses"
```

---

## Chunk 2: 3D Scene (Venue + Lighting + Post-Processing)

### Task 3: Create procedural venue

**Files:**
- Create: `src/scene/Venue.jsx`

- [ ] **Step 1: Create `src/scene/Venue.jsx`**

```jsx
import { useMemo } from 'react'
import * as THREE from 'three'

function GridFloor() {
  const gridLines = useMemo(() => {
    const points = []
    const size = 15
    const divisions = 30
    const step = (size * 2) / divisions

    for (let i = 0; i <= divisions; i++) {
      const pos = -size + i * step
      // Lines along X
      points.push(new THREE.Vector3(pos, 0.11, -size))
      points.push(new THREE.Vector3(pos, 0.11, size))
      // Lines along Z
      points.push(new THREE.Vector3(-size, 0.11, pos))
      points.push(new THREE.Vector3(size, 0.11, pos))
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    return geometry
  }, [])

  return (
    <lineSegments geometry={gridLines}>
      <lineBasicMaterial color="#7B5CE6" transparent opacity={0.06} />
    </lineSegments>
  )
}

function Desk({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Desktop surface */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.6, 0.06, 0.8]} />
        <meshStandardMaterial color="#1a1a2e" emissive="#7B5CE6" emissiveIntensity={0.05} />
      </mesh>
      {/* Legs */}
      {[[-0.7, 0.275, -0.3], [0.7, 0.275, -0.3], [-0.7, 0.275, 0.3], [0.7, 0.275, 0.3]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.05, 0.55, 0.05]} />
          <meshStandardMaterial color="#12121e" />
        </mesh>
      ))}
      {/* Monitor */}
      <mesh position={[0, 0.9, -0.25]}>
        <boxGeometry args={[0.6, 0.4, 0.03]} />
        <meshStandardMaterial color="#0a0a14" emissive="#7B5CE6" emissiveIntensity={0.15} />
      </mesh>
      {/* Monitor stand */}
      <mesh position={[0, 0.68, -0.25]}>
        <boxGeometry args={[0.08, 0.2, 0.08]} />
        <meshStandardMaterial color="#12121e" />
      </mesh>
    </group>
  )
}

export default function Venue() {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <GridFloor />

      {/* Back wall */}
      <mesh position={[0, 2, -10]}>
        <boxGeometry args={[30, 4, 0.2]} />
        <meshStandardMaterial color="#12121e" emissive="#7B5CE6" emissiveIntensity={0.02} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-15, 2, 0]}>
        <boxGeometry args={[0.2, 4, 20]} />
        <meshStandardMaterial color="#12121e" emissive="#7B5CE6" emissiveIntensity={0.02} />
      </mesh>

      {/* Right wall */}
      <mesh position={[15, 2, 0]}>
        <boxGeometry args={[0.2, 4, 20]} />
        <meshStandardMaterial color="#12121e" emissive="#7B5CE6" emissiveIntensity={0.02} />
      </mesh>

      {/* Projection wall / screen */}
      <mesh position={[0, 2.5, -9.85]}>
        <boxGeometry args={[6, 3, 0.05]} />
        <meshStandardMaterial color="#0a0a14" emissive="#7B5CE6" emissiveIntensity={0.1} />
      </mesh>

      {/* Desks at agent positions */}
      <Desk position={[-6, 0, -3]} />
      <Desk position={[-2, 0, 2]} rotation={[0, Math.PI * 0.1, 0]} />
      <Desk position={[3, 0, -4]} rotation={[0, -Math.PI * 0.15, 0]} />
      <Desk position={[6, 0, 1]} rotation={[0, Math.PI * 0.2, 0]} />
      <Desk position={[0, 0, 6]} rotation={[0, Math.PI, 0]} />

      {/* Decorative edge strips along floor/wall junction */}
      <mesh position={[0, 0.02, -9.85]}>
        <boxGeometry args={[30, 0.04, 0.04]} />
        <meshStandardMaterial color="#7B5CE6" emissive="#7B5CE6" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-14.9, 0.02, 0]}>
        <boxGeometry args={[0.04, 0.04, 20]} />
        <meshStandardMaterial color="#7B5CE6" emissive="#7B5CE6" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[14.9, 0.02, 0]}>
        <boxGeometry args={[0.04, 0.04, 20]} />
        <meshStandardMaterial color="#7B5CE6" emissive="#7B5CE6" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/scene/Venue.jsx
git commit -m "feat: add procedural venue with floor, walls, desks, and grid"
```

---

### Task 4: Create lighting and post-processing

**Files:**
- Create: `src/scene/Lighting.jsx`
- Create: `src/scene/PostProcessing.jsx`

- [ ] **Step 1: Create `src/scene/Lighting.jsx`**

```jsx
export default function Lighting() {
  return (
    <>
      <ambientLight color="#7B5CE6" intensity={0.3} />
      <directionalLight
        color="#ffffff"
        intensity={0.5}
        position={[10, 20, 10]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* Atmospheric point lights near desk areas */}
      <pointLight color="#7B5CE6" intensity={0.4} position={[-6, 3, -3]} distance={8} />
      <pointLight color="#7B5CE6" intensity={0.4} position={[-2, 3, 2]} distance={8} />
      <pointLight color="#7B5CE6" intensity={0.4} position={[3, 3, -4]} distance={8} />
      <pointLight color="#7B5CE6" intensity={0.4} position={[6, 3, 1]} distance={8} />
      <pointLight color="#7B5CE6" intensity={0.4} position={[0, 3, 6]} distance={8} />
    </>
  )
}
```

- [ ] **Step 2: Create `src/scene/PostProcessing.jsx`**

```jsx
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

export default function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.3}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.4}
        mipmapBlur
      />
      <Vignette offset={0.3} darkness={0.7} />
    </EffectComposer>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/scene/Lighting.jsx src/scene/PostProcessing.jsx
git commit -m "feat: add lighting and post-processing (bloom + vignette)"
```

---

### Task 5: Wire up App.jsx with Canvas and scene

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Update `src/App.jsx` to render the 3D scene**

```jsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Venue from './scene/Venue'
import Lighting from './scene/Lighting'
import PostProcessing from './scene/PostProcessing'

export default function App() {
  return (
    <>
      <Canvas
        camera={{ position: [15, 15, 15], fov: 35 }}
        gl={{ antialias: true }}
        style={{ background: '#0a0a0a' }}
      >
        <color attach="background" args={['#0a0a0a']} />
        <Lighting />
        <Venue />
        <OrbitControls
          enableRotate={false}
          enablePan={false}
          enableZoom={true}
          minDistance={10}
          maxDistance={30}
          target={[0, 0, 0]}
        />
        <PostProcessing />
      </Canvas>
    </>
  )
}
```

- [ ] **Step 2: Verify dev server renders the scene**

Run: `npm run dev`
Expected: Browser shows a dark 3D scene with the procedural venue — floor with grid, walls, desks with monitors, purple edge glow. Camera is locked to isometric angle with zoom only.

- [ ] **Step 3: Verify production build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire up R3F Canvas with venue, lighting, and post-processing"
```

---

## Chunk 3: Agent System

### Task 6: Create Agent character component

**Files:**
- Create: `src/agents/Agent.jsx`

- [ ] **Step 1: Create `src/agents/Agent.jsx`**

```jsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../store/useStore'
import SpeechBubble from './SpeechBubble'

const STATUS_COLORS = {
  idle: '#666666',
  working: '#3B82F6',
  speaking: '#00E676',
  error: '#EF4444',
}

export default function Agent({ agentId }) {
  const agent = useStore((s) => s.agents[agentId])
  const activeAgent = useStore((s) => s.activeAgent)
  const setActiveAgent = useStore((s) => s.setActiveAgent)
  const groupRef = useRef()
  const dotRef = useRef()
  const ringRef = useRef()
  const bodyRef = useRef()

  const isActive = activeAgent === agentId
  const baseY = agent.position[1]

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (groupRef.current) {
      const speed = agent.status === 'working' || agent.status === 'speaking' ? 3 : 1.5
      groupRef.current.position.y = baseY + Math.sin(t * speed) * 0.05
    }

    // Forward lean when working/speaking
    if (bodyRef.current) {
      const targetRotX = agent.status === 'working' || agent.status === 'speaking' ? 0.1 : 0
      bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, targetRotX, 0.05)
    }

    // Pulsing status dot
    if (dotRef.current) {
      if (agent.status === 'working' || agent.status === 'speaking') {
        const pulse = 1 + Math.sin(t * 4) * 0.3
        dotRef.current.scale.setScalar(pulse)
      } else {
        dotRef.current.scale.setScalar(1)
      }
      dotRef.current.material.color.set(STATUS_COLORS[agent.status] || STATUS_COLORS.idle)
    }

    // Rotating selection ring
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 0.5
    }
  })

  return (
    <group
      ref={groupRef}
      position={[agent.position[0], baseY, agent.position[2]]}
      onClick={(e) => {
        e.stopPropagation()
        setActiveAgent(agentId)
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'default' }}
    >
      {/* Body + Head group (for forward lean) */}
      <group ref={bodyRef}>
        {/* Body - Capsule */}
        <mesh position={[0, 0.4, 0]}>
          <capsuleGeometry args={[0.25, 0.8, 8, 16]} />
          <meshStandardMaterial
            color={agent.color}
            emissive={agent.color}
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Head - Sphere */}
        <mesh position={[0, 1.15, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial
            color={agent.color}
            emissive={agent.color}
            emissiveIntensity={0.15}
          />
        </mesh>
      </group>

      {/* Name label */}
      <Billboard position={[0, 1.7, 0]}>
        <Text fontSize={0.18} color="#ffffff" anchorY="bottom" font={undefined}>
          {agent.name}
        </Text>
        <Text fontSize={0.1} color="#888888" anchorY="top" position={[0, -0.02, 0]} font={undefined}>
          {agent.role}
        </Text>
      </Billboard>

      {/* Status dot */}
      <mesh ref={dotRef} position={[0.6, 1.7, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color={STATUS_COLORS[agent.status]}
          emissive={STATUS_COLORS[agent.status]}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Selection ring */}
      {isActive && (
        <mesh ref={ringRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.6, 0.03, 8, 32]} />
          <meshStandardMaterial
            color={agent.color}
            emissive={agent.color}
            emissiveIntensity={0.8}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}

      {/* Speech bubble */}
      {agent.currentMessage && (
        <SpeechBubble agentId={agentId} />
      )}
    </group>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/agents/Agent.jsx
git commit -m "feat: add Agent character component with animations and status indicators"
```

---

### Task 7: Create SpeechBubble and useTypewriter hook

**Files:**
- Create: `src/hooks/useTypewriter.js`
- Create: `src/agents/SpeechBubble.jsx`

- [ ] **Step 1: Create `src/hooks/useTypewriter.js`**

```js
import { useState, useEffect, useRef } from 'react'

export default function useTypewriter(fullText, speed = 30) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const indexRef = useRef(0)

  useEffect(() => {
    if (!fullText) {
      setDisplayedText('')
      setIsComplete(false)
      indexRef.current = 0
      return
    }

    setDisplayedText('')
    setIsComplete(false)
    indexRef.current = 0

    const interval = setInterval(() => {
      indexRef.current += 1
      if (indexRef.current >= fullText.length) {
        setDisplayedText(fullText)
        setIsComplete(true)
        clearInterval(interval)
      } else {
        setDisplayedText(fullText.slice(0, indexRef.current))
      }
    }, speed)

    return () => clearInterval(interval)
  }, [fullText, speed])

  return { displayedText, isComplete }
}
```

- [ ] **Step 2: Create `src/agents/SpeechBubble.jsx`**

```jsx
import { useEffect } from 'react'
import { Html } from '@react-three/drei'
import useStore from '../store/useStore'
import useTypewriter from '../hooks/useTypewriter'

export default function SpeechBubble({ agentId }) {
  const agent = useStore((s) => s.agents[agentId])
  const setAgentMessage = useStore((s) => s.setAgentMessage)
  const setAgentStatus = useStore((s) => s.setAgentStatus)
  const { displayedText, isComplete } = useTypewriter(agent.currentMessage, 30)

  useEffect(() => {
    if (isComplete && agent.currentMessage) {
      const timeout = setTimeout(() => {
        setAgentMessage(agentId, null)
        setAgentStatus(agentId, 'idle')
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [isComplete, agentId, agent.currentMessage, setAgentMessage, setAgentStatus])

  return (
    <Html position={[0, 2.2, 0]} center distanceFactor={10} zIndexRange={[50, 0]}>
      <div
        style={{
          background: 'rgba(10, 10, 10, 0.85)',
          border: '1px solid rgba(123, 92, 230, 0.3)',
          borderRadius: 12,
          padding: '12px 16px',
          maxWidth: 280,
          minWidth: 160,
          fontFamily: "'Inter', sans-serif",
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            color: agent.color,
            fontWeight: 700,
            fontSize: 12,
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {agent.name}
        </div>
        <div
          style={{
            color: '#e0e0e0',
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {displayedText}
          {!isComplete && (
            <span style={{ opacity: 0.5, animation: 'blink 0.8s infinite' }}>|</span>
          )}
        </div>
      </div>
    </Html>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useTypewriter.js src/agents/SpeechBubble.jsx
git commit -m "feat: add speech bubble with typewriter effect and auto-dismiss"
```

---

### Task 8: Create AgentGroup and add to scene

**Files:**
- Create: `src/agents/AgentGroup.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/agents/AgentGroup.jsx`**

```jsx
import useStore from '../store/useStore'
import Agent from './Agent'

export default function AgentGroup() {
  const agents = useStore((s) => s.agents)

  return (
    <group>
      {Object.keys(agents).map((id) => (
        <Agent key={id} agentId={id} />
      ))}
    </group>
  )
}
```

- [ ] **Step 2: Update `src/App.jsx` — add AgentGroup to Canvas**

Add import at top:
```jsx
import AgentGroup from './agents/AgentGroup'
```

Add `<AgentGroup />` inside the Canvas, after `<Venue />`:
```jsx
<Venue />
<AgentGroup />
```

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`
Expected: 5 colored capsule characters visible at their desk positions, each with a name label, role text, and status dot floating above them. Kim should have a selection ring at her feet. Clicking a different agent should move the selection ring.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/agents/AgentGroup.jsx src/App.jsx
git commit -m "feat: render all 5 agents in the scene with click-to-select"
```

---

## Chunk 4: Chat Bar UI + Mock Mode

### Task 9: Create TaskPill component

**Files:**
- Create: `src/ui/TaskPill.jsx`

- [ ] **Step 1: Create `src/ui/TaskPill.jsx`**

```jsx
import { motion } from 'framer-motion'

export default function TaskPill({ task }) {
  const truncated =
    task.text.length > 50 ? task.text.slice(0, 50) + '...' : task.text

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        background: 'rgba(123, 92, 230, 0.15)',
        border: '1px solid rgba(123, 92, 230, 0.2)',
        borderRadius: 16,
        padding: '4px 12px',
        fontSize: 12,
        color: '#aaa',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 300,
      }}
    >
      {truncated}
    </motion.div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/ui/TaskPill.jsx
git commit -m "feat: add TaskPill component for recent task display"
```

---

### Task 10: Create ChatBar with mock mode orchestration

**Files:**
- Create: `src/ui/ChatBar.jsx`

- [ ] **Step 1: Create `src/ui/ChatBar.jsx`**

```jsx
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'
import TaskPill from './TaskPill'

export default function ChatBar() {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)
  const agents = useStore((s) => s.agents)
  const activeAgent = useStore((s) => s.activeAgent)
  const setActiveAgent = useStore((s) => s.setActiveAgent)
  const assignTask = useStore((s) => s.assignTask)
  const setAgentStatus = useStore((s) => s.setAgentStatus)
  const setAgentMessage = useStore((s) => s.setAgentMessage)
  const getMockResponse = useStore((s) => s.getMockResponse)

  const agent = agents[activeAgent]
  const isBusy = agent.status !== 'idle'
  const recentTasks = agent.taskHistory.slice(-3)

  const handleSubmit = () => {
    const text = input.trim()
    if (!text || isBusy) return

    setInput('')
    assignTask(activeAgent, text)

    // Mock mode orchestration
    setTimeout(() => {
      const response = getMockResponse(activeAgent)
      setAgentStatus(activeAgent, 'speaking')
      setAgentMessage(activeAgent, response)
      // Auto-dismiss is handled by SpeechBubble's useEffect
    }, 1500)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(10, 10, 10, 0.9)',
        borderTop: '1px solid rgba(123, 92, 230, 0.2)',
        backdropFilter: 'blur(10px)',
        padding: '12px 20px 16px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Agent selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
        {Object.values(agents).map((a) => (
          <button
            key={a.id}
            onClick={() => setActiveAgent(a.id)}
            title={`${a.name} (${a.role})`}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: a.color,
              border: activeAgent === a.id ? '2px solid #fff' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'border-color 0.2s, transform 0.2s',
              transform: activeAgent === a.id ? 'scale(1.1)' : 'scale(1)',
              outline: 'none',
            }}
          />
        ))}
        <span style={{ marginLeft: 8, color: '#888', fontSize: 13 }}>
          {agent.name} — {agent.role}
        </span>
      </div>

      {/* Task history pills */}
      <AnimatePresence>
        {recentTasks.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            {recentTasks.map((task) => (
              <TaskPill key={task.id} task={task} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Input row */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isBusy
              ? `${agent.name} is busy...`
              : `Assign task to ${agent.name}...`
          }
          disabled={isBusy}
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(123, 92, 230, 0.2)',
            borderRadius: 8,
            padding: '10px 14px',
            color: '#fff',
            fontSize: 14,
            fontFamily: "'Inter', sans-serif",
            outline: 'none',
            opacity: isBusy ? 0.5 : 1,
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={isBusy || !input.trim()}
          style={{
            background: isBusy || !input.trim() ? '#3d2d6b' : '#7B5CE6',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: isBusy || !input.trim() ? 'not-allowed' : 'pointer',
            fontFamily: "'Inter', sans-serif",
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          Send
          <span style={{ fontSize: 16 }}>&#8593;</span>
        </button>
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/ui/ChatBar.jsx
git commit -m "feat: add ChatBar with agent selector, input, and mock mode orchestration"
```

---

### Task 11: Wire ChatBar into App and add cursor blink animation

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/styles/index.css`

- [ ] **Step 1: Update `src/App.jsx` — add ChatBar outside Canvas**

Add import at top:
```jsx
import ChatBar from './ui/ChatBar'
```

Add `<ChatBar />` as a sibling after the closing `</Canvas>` tag:
```jsx
      </Canvas>
      <ChatBar />
    </>
```

- [ ] **Step 2: Add blink animation to `src/styles/index.css`**

Append to end of file:
```css
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

- [ ] **Step 3: Full integration test in browser**

Run: `npm run dev`
Expected:
1. 3D scene renders with venue and 5 agents
2. Chat bar slides up at bottom of screen
3. Agent selector dots are visible — clicking changes the active agent (ring moves in 3D scene)
4. Type a message and press Enter or click Send
5. Agent status dot turns blue (working)
6. After ~1.5s, dot turns green (speaking) and speech bubble appears with typewriter text
7. After text completes + 3s, bubble disappears and dot returns to grey (idle)
8. Task pills appear above input after sending tasks
9. Send button is disabled while agent is busy

- [ ] **Step 4: Verify production build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/styles/index.css
git commit -m "feat: wire up ChatBar, complete mock mode integration"
```

---

## Chunk 5: Final Polish

### Task 12: Final review and cleanup

- [ ] **Step 1: Verify all files exist**

Check that every file from the spec's file structure exists:
```
src/main.jsx
src/App.jsx
src/store/useStore.js
src/scene/Venue.jsx
src/scene/Lighting.jsx
src/scene/PostProcessing.jsx
src/agents/Agent.jsx
src/agents/AgentGroup.jsx
src/agents/SpeechBubble.jsx
src/ui/ChatBar.jsx
src/ui/TaskPill.jsx
src/hooks/useTypewriter.js
src/styles/index.css
index.html
package.json
vite.config.js
public/models/.gitkeep
```

- [ ] **Step 2: Clean production build**

Run: `rm -rf dist && npm run build`
Expected: Clean build, no warnings about unused imports or missing modules.

- [ ] **Step 3: Test the full flow end-to-end**

Run: `npm run dev`
Walk through:
1. Scene loads with isometric view
2. Click each of the 5 agents — selection ring moves
3. Send a task to each agent — verify speech bubble appears for each
4. Verify busy guard — cannot send while agent is responding
5. Verify task pills show up (up to 3 per agent)
6. Zoom in/out works, rotation is locked

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: SHIFT HQ virtual office v0.1 — complete mock mode"
```
