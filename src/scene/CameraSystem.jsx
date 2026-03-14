import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../store/useStore'

// Camera lives OUTSIDE <group scale={1.1}>, so multiply all positions by 1.1
const S = 1.1

// Desk POV: sitting in the chair, looking down at desk surface + monitors
// Pulled back enough to see: monitors at top, desk items in middle, keyboard at bottom
const DESK_VIEWS = {
  // Regular desks — chair faces -Z toward desk
  // pos: behind chair (desk_z + 2.8), y=1.25 (seated eye height)
  // look: desk center, y=0.85 (desk surface level)
  kim:   { pos: [-18*S, 1.25*S, -3.2*S],  look: [-18*S, 0.85*S, -6*S] },
  dev:   { pos: [ -6*S, 1.25*S, -3.2*S],  look: [ -6*S, 0.85*S, -6*S] },
  marco: { pos: [  3*S, 1.25*S, -3.2*S],  look: [  3*S, 0.85*S, -6*S] },
  zara:  { pos: [ 12*S, 1.25*S, -3.2*S],  look: [ 12*S, 0.85*S, -6*S] },
  sam:   { pos: [ 19*S, 1.25*S, -3.2*S],  look: [ 19*S, 0.85*S, -6*S] },
  petra: { pos: [-18*S, 1.25*S,  5.8*S],  look: [-18*S, 0.85*S,  3*S] },
  lex:   { pos: [ -6*S, 1.25*S,  5.8*S],  look: [ -6*S, 0.85*S,  3*S] },
  riley: { pos: [  3*S, 1.25*S,  5.8*S],  look: [  3*S, 0.85*S,  3*S] },
  dante: { pos: [  7*S, 1.25*S,  5.8*S],  look: [  7*S, 0.85*S,  3*S] },
  // Bruno — standing desk, higher eye level
  bruno: { pos: [0, 1.70*S, 2.0*S],       look: [0, 1.20*S, 0] },
}

// Monitor screen center positions (in scene units, before S scaling)
const MONITOR_POSITIONS = {
  kim: [-18, 1.2, -6.3], dev: [-6, 1.2, -6.3],
  marco: [3, 1.2, -6.3], zara: [12, 1.2, -6.3],
  sam: [19, 1.2, -6.3],
  petra: [-18, 1.2, 2.7], lex: [-6, 1.2, 2.7],
  riley: [3, 1.2, 2.7], dante: [7, 1.2, 2.7],
  bruno: [0, 1.65, -0.28],
}

const tempVec = new THREE.Vector3()
const tempLook = new THREE.Vector3()

export default function CameraSystem() {
  const camRef = useRef()
  const mouseRef = useRef({ x: 0, y: 0 })
  const transitionRef = useRef(0)
  const snappedRef = useRef(false)
  const prevAgentRef = useRef(null)
  const monitorZoomRef = useRef(0)
  const cameraMode = useStore((s) => s.cameraMode)
  const activeDeskAgent = useStore((s) => s.activeDeskAgent)
  const isDesk = cameraMode === 'desk'

  // Mouse tracking for parallax
  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // Escape key to exit
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        const { cameraMode, monitorZoomed, setMonitorZoomed, exitDeskMode } = useStore.getState()
        if (monitorZoomed) {
          setMonitorZoomed(false)
        } else if (cameraMode === 'desk') {
          exitDeskMode()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Reset snap when switching agents
  useEffect(() => {
    if (activeDeskAgent && activeDeskAgent !== prevAgentRef.current) {
      snappedRef.current = false
    }
    prevAgentRef.current = activeDeskAgent
  }, [activeDeskAgent])

  useFrame((state, delta) => {
    const { cameraMode, activeDeskAgent, setDeskTransition, monitorZoomed } = useStore.getState()
    const isDeskMode = cameraMode === 'desk' && activeDeskAgent
    const cam = camRef.current
    if (!cam) return

    // Animate transition value
    const target = isDeskMode ? 1 : 0
    transitionRef.current = THREE.MathUtils.lerp(transitionRef.current, target, 3.5 * delta)
    if (Math.abs(transitionRef.current - target) < 0.001) transitionRef.current = target
    setDeskTransition(transitionRef.current)

    const t = transitionRef.current
    if (t < 0.01) {
      snappedRef.current = false
      monitorZoomRef.current = 0
      return
    }

    const view = DESK_VIEWS[activeDeskAgent] || DESK_VIEWS.bruno
    const clock = state.clock.elapsedTime

    // Snap camera on first frame — no lerp from default position
    if (!snappedRef.current) {
      cam.position.set(view.pos[0], view.pos[1], view.pos[2])
      cam.lookAt(view.look[0], view.look[1], view.look[2])
      snappedRef.current = true
      return
    }

    // Animate monitor zoom transition (0 = desk view, 1 = zoomed into monitor)
    const zoomTarget = monitorZoomed ? 1 : 0
    monitorZoomRef.current = THREE.MathUtils.lerp(monitorZoomRef.current, zoomTarget, 4 * delta)
    if (Math.abs(monitorZoomRef.current - zoomTarget) < 0.001) monitorZoomRef.current = zoomTarget
    const zoomT = monitorZoomRef.current

    // Head bob
    const bobY = Math.sin(clock * 1.2) * 0.003
    // Mouse parallax
    const px = mouseRef.current.x * 0.06
    const py = mouseRef.current.y * -0.03

    // Normal desk view position
    tempVec.set(
      view.pos[0] + px,
      view.pos[1] + bobY + py,
      view.pos[2]
    )
    tempLook.set(view.look[0], view.look[1], view.look[2])

    // If zooming into monitor, blend toward monitor position
    if (zoomT > 0.001) {
      const monPos = MONITOR_POSITIONS[activeDeskAgent]
      if (monPos) {
        // Zoom position: same X/Y as monitor, Z offset toward chair (+Z direction)
        const zoomPosX = monPos[0] * S
        const zoomPosY = monPos[1] * S
        const zoomPosZ = (monPos[2] + 0.6) * S
        const zoomLookX = monPos[0] * S
        const zoomLookY = monPos[1] * S
        const zoomLookZ = monPos[2] * S

        tempVec.set(
          THREE.MathUtils.lerp(view.pos[0] + px, zoomPosX, zoomT),
          THREE.MathUtils.lerp(view.pos[1] + bobY + py, zoomPosY, zoomT),
          THREE.MathUtils.lerp(view.pos[2], zoomPosZ, zoomT)
        )
        tempLook.set(
          THREE.MathUtils.lerp(view.look[0], zoomLookX, zoomT),
          THREE.MathUtils.lerp(view.look[1], zoomLookY, zoomT),
          THREE.MathUtils.lerp(view.look[2], zoomLookZ, zoomT)
        )
      }
    }

    cam.position.lerp(tempVec, 6 * delta)
    cam.lookAt(tempLook)
  })

  return (
    <PerspectiveCamera
      ref={camRef}
      makeDefault={isDesk}
      fov={65}
      near={0.05}
      far={200}
      position={[0, 1.4, 2]}
    />
  )
}
