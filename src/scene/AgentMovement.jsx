import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import useStore from '../store/useStore'

// Home positions — where agents stand near their desks
const HOME = {
  kim:   [-18, 0, -4],
  dev:   [ -6, 0, -4],
  marco: [  3, 0, -4],
  zara:  [ 12, 0, -4],
  sam:   [ 19, 0, -4],
  petra: [-18, 0,  5],
  lex:   [ -6, 0,  5],
  riley: [  3, 0,  5],
  dante: [  7, 0,  5],
  bruno: [  0, 0,  1.2],
}

// Furniture bounding boxes — agents cannot walk through these
const BLOCKED_ZONES = [
  // Row 1 desks at z=-6 (desk ±1.0 X, ±0.5 Z, plus chair clearance)
  { x: [-19.2, -16.8], z: [-7, -4] },  // Kim desk+chair
  { x: [-7.2, -4.8],   z: [-7, -4] },  // Dev desk+chair
  { x: [1.8, 4.2],     z: [-7, -4] },  // Marco desk+chair
  { x: [10.8, 13.2],   z: [-7, -4] },  // Zara desk+chair
  { x: [17.8, 20.2],   z: [-7, -4] },  // Sam desk+chair
  // Row 2 desks at z=3
  { x: [-19.2, -16.8], z: [2, 5.5] },  // Petra desk+chair
  { x: [-7.2, -4.8],   z: [2, 5.5] },  // Lex desk+chair
  { x: [1.8, 4.2],     z: [2, 5.5] },  // Riley desk+chair
  { x: [5.8, 8.2],     z: [2, 5.5] },  // Dante desk+chair
  // Bruno standing desk
  { x: [-1.5, 1.5],    z: [-0.6, 1.5] },
  // Conference table + chairs
  { x: [9, 19],    z: [2.5, 7.5] },    // Conference area
  // Lounge
  { x: [19, 23],   z: [1, 7] },        // Sofas + coffee table
  // Bar
  { x: [-12, -8],  z: [-8, -5.5] },    // Bar area + stools
  // Other furniture
  { x: [-23, -21], z: [6, 8] },        // AV corner
  { x: [-1.2, 1.2], z: [6, 8] },       // Reception desk
  { x: [20, 22],   z: [-7, -5] },      // Bookshelves
  { x: [20, 22],   z: [-3, -1] },      // Bookshelves
  { x: [20, 22],   z: [1, 3] },        // Bookshelves
]

function isBlocked(x, z) {
  return BLOCKED_ZONES.some(zone =>
    x >= zone.x[0] && x <= zone.x[1] && z >= zone.z[0] && z <= zone.z[1]
  )
}

// Wander bounds — keep agents visible
const WANDER = { xMin: -20, xMax: 20, zMin: -7, zMax: 7 }

// Interesting destinations within wander bounds and outside blocked zones
const WANDER_SPOTS = [
  [-12, 0, -3],    // left of center, between rows
  [-12, 0, 1],     // left corridor
  [0, 0, -3],      // center back
  [-2, 0, 6],      // center front
  [7, 0, 0],       // right of center
  [-20, 0, 0],     // far left
  [-3, 0, -3],     // near center
  [5, 0, 0],       // center-right
  [-8, 0, 5],      // left front
  [5, 0, 6],       // front area
  [-15, 0, 0],     // between left desks
  [10, 0, -2],     // right area
  [-5, 0, -2],     // center-left
  [3, 0, -2],      // near center
  [-18, 0, 0],     // far left center
  [15, 0, 0],      // right corridor
]

function randomSpot() {
  // Pick a random wander spot that isn't blocked
  for (let i = 0; i < 10; i++) {
    const spot = WANDER_SPOTS[Math.floor(Math.random() * WANDER_SPOTS.length)]
    if (!isBlocked(spot[0], spot[2])) return spot
  }
  return [0, 0, 0] // fallback to center
}

function randomDelay() {
  return 8000 + Math.random() * 15000 // 8-23 seconds
}

export default function AgentMovement() {
  const timersRef = useRef({})
  const stateRef = useRef({})

  useFrame(() => {
    const { agents } = useStore.getState()
    const now = Date.now()

    Object.keys(agents).forEach((id) => {
      const agent = agents[id]

      // Don't move agents that are busy
      if (agent.status !== 'idle') {
        if (stateRef.current[id] === 'wandering') {
          stateRef.current[id] = 'returning'
          useStore.getState().setAgentPosition(id, HOME[id])
          timersRef.current[id] = now + 5000
        }
        return
      }

      // Initialize timer
      if (!timersRef.current[id]) {
        timersRef.current[id] = now + randomDelay()
        stateRef.current[id] = 'home'
      }

      // Check if timer expired
      if (now < timersRef.current[id]) return

      const currentState = stateRef.current[id] || 'home'

      if (currentState === 'home') {
        // Go wander somewhere
        const spot = randomSpot()
        useStore.getState().setAgentPosition(id, spot)
        stateRef.current[id] = 'wandering'
        timersRef.current[id] = now + 5000 + Math.random() * 10000
      } else if (currentState === 'wandering') {
        // Sometimes wander to another spot, sometimes go home
        if (Math.random() < 0.35) {
          const spot = randomSpot()
          useStore.getState().setAgentPosition(id, spot)
          timersRef.current[id] = now + 4000 + Math.random() * 8000
        } else {
          useStore.getState().setAgentPosition(id, HOME[id])
          stateRef.current[id] = 'returning'
          timersRef.current[id] = now + 3000
        }
      } else if (currentState === 'returning') {
        stateRef.current[id] = 'home'
        timersRef.current[id] = now + randomDelay()
      }
    })
  })

  return null
}
