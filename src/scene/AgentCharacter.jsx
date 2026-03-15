import { useRef, useMemo, useState, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../store/useStore'
import SpeechBubble from '../agents/SpeechBubble'
import { toon, lightenHex } from './toonMaterial'
import OutlineMesh from './OutlineMesh'

const STATUS_COLORS = {
  idle: 'rgba(255,255,255,0.3)',
  working: '#3B82F6',
  speaking: '#30d158',
  thinking: '#A855F7',
  delegating: '#F59E0B',
  error: '#ff453a',
}

// Skin tones
const SKIN_TONES = {
  kim: '#e8c4a0',
  dev: '#8d6040',
  marco: '#d4a878',
  zara: '#6b4226',
  riley: '#f0d0b0',
  dante: '#c49470',
  sam: '#d4a878',
  petra: '#f0d0b0',
  lex: '#8d6040',
  bruno: '#c49470',
}

// Hair colors
const HAIR_COLORS = {
  kim: '#1a1a2a',
  dev: '#0a0a0a',
  marco: '#3a2010',
  zara: '#0a0a0a',
  riley: '#8a5020',
  dante: '#2a1a0a',
  sam: '#1a1a1a',
  petra: '#c8a040',
  lex: '#0a0a0a',
  bruno: '#2a1810',
}

// Hair styles — different per agent
const HAIR_STYLES = {
  kim: 'long',
  dev: 'short',
  marco: 'medium',
  zara: 'long',
  riley: 'medium',
  dante: 'short',
  sam: 'buzz',
  petra: 'long',
  lex: 'short',
  bruno: 'medium',
}

function lerp(a, b, t) {
  return a + (b - a) * Math.min(t, 1)
}

// Body proportions
const P = {
  headW: 0.28, headH: 0.28, headD: 0.26,
  neckH: 0.08,
  torsoW: 0.34, torsoH: 0.38, torsoD: 0.2,
  upperArmW: 0.09, upperArmH: 0.22, upperArmD: 0.09,
  forearmW: 0.08, forearmH: 0.20, forearmD: 0.08,
  handW: 0.09, handH: 0.08, handD: 0.06,
  upperLegW: 0.13, upperLegH: 0.26, upperLegD: 0.13,
  lowerLegW: 0.11, lowerLegH: 0.24, lowerLegD: 0.11,
  footW: 0.13, footH: 0.06, footD: 0.18,
}

// Total height calculation
const TOTAL_HEIGHT = P.footH + P.lowerLegH + P.upperLegH + P.torsoH + P.neckH + P.headH

// Module-level shared geometries — all characters use identical proportions
const SHARED_GEOS = {
  head: new THREE.BoxGeometry(P.headW, P.headH, P.headD),
  torso: new THREE.BoxGeometry(P.torsoW, P.torsoH, P.torsoD),
  upperArm: new THREE.BoxGeometry(P.upperArmW, P.upperArmH, P.upperArmD),
  forearm: new THREE.BoxGeometry(P.forearmW, P.forearmH, P.forearmD),
  hand: new THREE.BoxGeometry(P.handW, P.handH, P.handD),
  upperLeg: new THREE.BoxGeometry(P.upperLegW, P.upperLegH, P.upperLegD),
  lowerLeg: new THREE.BoxGeometry(P.lowerLegW, P.lowerLegH, P.lowerLegD),
  foot: new THREE.BoxGeometry(P.footW, P.footH, P.footD),
  eye: new THREE.BoxGeometry(0.045, 0.045, 0.01),
  eyeBlink: new THREE.BoxGeometry(0.045, 0.01, 0.01),
  collar: new THREE.BoxGeometry(P.torsoW + 0.02, 0.04, P.torsoD + 0.02),
  neck: new THREE.BoxGeometry(0.1, P.neckH, 0.08),
  hitbox: new THREE.BoxGeometry(0.6, 1.8, 0.5),
  ring: new THREE.RingGeometry(0.35, 0.42, 16),
  shadow: new THREE.CircleGeometry(0.3, 16),
}

// Shared materials for static meshes
const HITBOX_MAT = new THREE.MeshBasicMaterial()
const SHADOW_MAT = new THREE.MeshStandardMaterial({ color: '#000000', transparent: true, opacity: 0.3 })

// Height calculations — constant
const hipsY = P.footH + P.lowerLegH + P.upperLegH
const shoulderSpread = P.torsoW / 2 + P.upperArmW / 2 + 0.01
const hipSpread = 0.07

// Hair geometries — shared per style
const HAIR_GEOS = {
  long_top: new THREE.BoxGeometry(P.headW + 0.04, 0.08, P.headD + 0.04),
  long_back: new THREE.BoxGeometry(P.headW + 0.02, P.headH * 0.7, 0.06),
  medium: new THREE.BoxGeometry(P.headW + 0.03, 0.1, P.headD + 0.02),
  buzz: new THREE.BoxGeometry(P.headW + 0.01, 0.04, P.headD + 0.01),
  short: new THREE.BoxGeometry(P.headW + 0.02, 0.07, P.headD + 0.01),
}

// Hair materials — cached per color
const hairMatCache = new Map()
function getHairMat(color) {
  let mat = hairMatCache.get(color)
  if (!mat) {
    mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
    hairMatCache.set(color, mat)
  }
  return mat
}

const HairMesh = memo(function HairMesh({ style, color }) {
  const mat = getHairMat(color)
  if (style === 'long') {
    return (
      <group>
        <mesh position={[0, P.headH * 0.42, 0]} geometry={HAIR_GEOS.long_top} material={mat} />
        <mesh position={[0, P.headH * 0.1, -P.headD * 0.45]} geometry={HAIR_GEOS.long_back} material={mat} />
      </group>
    )
  }
  if (style === 'medium') {
    return <mesh position={[0, P.headH * 0.42, -0.01]} geometry={HAIR_GEOS.medium} material={mat} />
  }
  if (style === 'buzz') {
    return <mesh position={[0, P.headH * 0.42, 0]} geometry={HAIR_GEOS.buzz} material={mat} />
  }
  return <mesh position={[0, P.headH * 0.42, 0.01]} geometry={HAIR_GEOS.short} material={mat} />
})

// Eye materials — cached
const EYE_MAT = new THREE.MeshStandardMaterial({
  color: '#e8e8ff', emissive: '#e8e8ff', emissiveIntensity: 0.4,
})
const EYE_MAT_DIM = new THREE.MeshStandardMaterial({
  color: '#e8e8ff', emissive: '#e8e8ff', emissiveIntensity: 0.1,
})

export default memo(function AgentCharacter({ agentId }) {
  // Optimized subscriptions — avoid re-rendering on every streaming token
  // agentColor and agentName never change at runtime
  const agentColor = useStore((s) => s.agents[agentId]?.color)
  const agentName = useStore((s) => s.agents[agentId]?.name)
  const agentStatus = useStore((s) => s.agents[agentId]?.status)
  // Boolean — only changes when message goes null↔truthy, not on every token
  const hasMessage = useStore((s) => !!s.agents[agentId]?.currentMessage)
  const standupActive = useStore((s) => s.standupActive)
  const standupCurrentAgent = useStore((s) => s.standupCurrentAgent)
  const openAgentDetail = useStore((s) => s.openAgentDetail)
  const activeAgent = useStore((s) => s.activeAgent)

  // Refs for all joint groups
  const groupRef = useRef()
  const rootRef = useRef()
  const hipsRef = useRef()
  const torsoRef = useRef()
  const headRef = useRef()
  const leftShoulderRef = useRef()
  const rightShoulderRef = useRef()
  const leftElbowRef = useRef()
  const rightElbowRef = useRef()
  const leftHipJointRef = useRef()
  const rightHipJointRef = useRef()
  const leftKneeRef = useRef()
  const rightKneeRef = useRef()
  const leftEyeRef = useRef()
  const rightEyeRef = useRef()

  // Animation state
  const animState = useRef({
    phase: 'idle',
    blinkTimer: 3 + Math.random() * 4,
    blinkOpen: true,
    prevBlinkOpen: true,
    idleOffset: Math.random() * Math.PI * 2,
    lookTimer: 5 + Math.random() * 8,
    lookTarget: 0,
  })

  const facingRef = useRef(0)

  const [hovered, setHovered] = useState(false)
  const isBruno = agentId === 'bruno'
  const scale = isBruno ? 1.15 : 1
  const isDimmed = standupActive && standupCurrentAgent !== agentId

  const statusColor = STATUS_COLORS[agentStatus] || STATUS_COLORS.idle
  const skinTone = SKIN_TONES[agentId] || '#d4a878'
  const hairColor = HAIR_COLORS[agentId] || '#2a2a2a'
  const hairStyle = HAIR_STYLES[agentId] || 'short'
  const shirtColor = isDimmed ? '#2a2a3a' : agentColor

  const showBubble = hasMessage && ['thinking', 'working', 'speaking', 'error'].includes(agentStatus)

  const initialPosSet = useRef(false)

  // Desk-facing directions: agents face their monitors when sitting
  const DESK_FACING = {
    kim: Math.PI, dev: Math.PI, marco: Math.PI, zara: Math.PI, sam: Math.PI,
    petra: 0, lex: 0, riley: 0, dante: 0, bruno: Math.PI,
  }

  // Memoize toon materials (toon() itself caches, but useMemo avoids the lookup)
  const mats = useMemo(() => ({
    head: toon(lightenHex(skinTone, 0.15)),
    torso: toon(shirtColor),
    hands: toon(lightenHex(skinTone, 0.1)),
    pants: toon('#1a1a2e'),
    lowerLeg: toon('#151525'),
    shoes: toon('#0a0a12'),
    neck: toon(skinTone),
  }), [skinTone, shirtColor])

  const outlineScale = isBruno ? 1.06 : 1.05
  const outlineColor = '#060608'
  const eyeMat = isDimmed ? EYE_MAT_DIM : EYE_MAT

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Set initial position once
    if (!initialPosSet.current) {
      const initPos = useStore.getState().agents[agentId]?.position || [0, 0, 0]
      groupRef.current.position.set(initPos[0], 0, initPos[2])
      initialPosSet.current = true
    }

    // Read from store directly — no reactive subscriptions needed for animation
    const agentData = useStore.getState().agents[agentId]
    const target = agentData?.position || [0, 0, 0]
    const currentStatus = agentData?.status || 'idle'

    const dx = target[0] - groupRef.current.position.x
    const dz = target[2] - groupRef.current.position.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    const isWalking = dist > 0.15

    // Constant-speed walking at 4 units/sec
    if (isWalking) {
      const walkSpeed = 4
      const step = Math.min(walkSpeed * delta, dist)
      const nx = dx / dist
      const nz = dz / dist
      groupRef.current.position.x += nx * step
      groupRef.current.position.z += nz * step
    }

    // Safety clamp
    groupRef.current.position.x = Math.max(-28, Math.min(28, groupRef.current.position.x))
    groupRef.current.position.z = Math.max(-7, Math.min(7, groupRef.current.position.z))

    // Face movement direction
    if (isWalking && dist > 0.2) {
      const targetAngle = Math.atan2(dx, dz)
      let diff = targetAngle - facingRef.current
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      facingRef.current += diff * 6 * delta
      groupRef.current.rotation.y = facingRef.current
    }

    const t = state.clock.elapsedTime
    const dt = delta
    const anim = animState.current
    const off = anim.idleOffset

    // === BLINK SYSTEM — only reassign geometry when state changes ===
    anim.blinkTimer -= dt
    if (anim.blinkTimer <= 0) {
      if (anim.blinkOpen) {
        anim.blinkOpen = false
        anim.blinkTimer = 0.1
      } else {
        anim.blinkOpen = true
        anim.blinkTimer = 3 + Math.random() * 4
      }
      // Only update geometry on actual blink state change
      if (anim.blinkOpen !== anim.prevBlinkOpen) {
        if (leftEyeRef.current && rightEyeRef.current) {
          const eyeGeo = anim.blinkOpen ? SHARED_GEOS.eye : SHARED_GEOS.eyeBlink
          leftEyeRef.current.geometry = eyeGeo
          rightEyeRef.current.geometry = eyeGeo
        }
        anim.prevBlinkOpen = anim.blinkOpen
      }
    }

    // === ANIMATION STATE MACHINE — reads status from store, not reactive ===
    if (isWalking) {
      const walkSpeed = isBruno ? 12 : 10
      const walkAmplitude = isBruno ? 0.6 : 0.5
      const cycle = Math.sin(t * walkSpeed)
      const halfCycle = Math.sin(t * walkSpeed * 0.5)

      if (rootRef.current) rootRef.current.position.y = Math.abs(halfCycle) * 0.04
      if (hipsRef.current) {
        hipsRef.current.rotation.z = cycle * 0.03
        hipsRef.current.rotation.y = cycle * 0.02
      }
      if (torsoRef.current) {
        torsoRef.current.rotation.x = -0.06
        torsoRef.current.rotation.z = -cycle * 0.02
      }
      if (headRef.current) {
        headRef.current.rotation.x = 0.04
        headRef.current.rotation.z = 0
      }
      if (leftHipJointRef.current) leftHipJointRef.current.rotation.x = cycle * walkAmplitude
      if (rightHipJointRef.current) rightHipJointRef.current.rotation.x = -cycle * walkAmplitude
      if (leftKneeRef.current) leftKneeRef.current.rotation.x = Math.max(0, -cycle) * 0.6
      if (rightKneeRef.current) rightKneeRef.current.rotation.x = Math.max(0, cycle) * 0.6
      const armSwing = isBruno ? 0.5 : 0.4
      if (leftShoulderRef.current) leftShoulderRef.current.rotation.x = -cycle * armSwing
      if (rightShoulderRef.current) rightShoulderRef.current.rotation.x = cycle * armSwing
      if (leftElbowRef.current) leftElbowRef.current.rotation.x = -0.2
      if (rightElbowRef.current) rightElbowRef.current.rotation.x = -0.2

    } else if (currentStatus === 'working') {
      // Face the desk
      const deskAngle = DESK_FACING[agentId] ?? Math.PI
      let angleDiff = deskAngle - facingRef.current
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
      facingRef.current += angleDiff * 4 * dt
      groupRef.current.rotation.y = facingRef.current

      // Sitting pose — lower body and bend legs
      if (rootRef.current) rootRef.current.position.y = lerp(rootRef.current.position.y, -0.26, 3 * dt)
      if (hipsRef.current) hipsRef.current.rotation.z = lerp(hipsRef.current.rotation.z, 0, 3 * dt)
      if (torsoRef.current) torsoRef.current.rotation.x = lerp(torsoRef.current.rotation.x, -0.08, 3 * dt)
      if (headRef.current) {
        headRef.current.rotation.x = lerp(headRef.current.rotation.x, -0.05, 3 * dt)
        headRef.current.rotation.z = Math.sin(t * 0.5 + off) * 0.02
      }
      const typeSpeed = 8
      if (leftShoulderRef.current) leftShoulderRef.current.rotation.x = lerp(leftShoulderRef.current.rotation.x, -0.5, 3 * dt)
      if (rightShoulderRef.current) rightShoulderRef.current.rotation.x = lerp(rightShoulderRef.current.rotation.x, -0.5, 3 * dt)
      if (leftElbowRef.current) leftElbowRef.current.rotation.x = -0.8 + Math.sin(t * typeSpeed + off) * 0.06
      if (rightElbowRef.current) rightElbowRef.current.rotation.x = -0.8 + Math.cos(t * typeSpeed + off + 1) * 0.06
      // Legs bent — sitting in chair
      if (leftHipJointRef.current) leftHipJointRef.current.rotation.x = lerp(leftHipJointRef.current.rotation.x, -1.5, 3 * dt)
      if (rightHipJointRef.current) rightHipJointRef.current.rotation.x = lerp(rightHipJointRef.current.rotation.x, -1.5, 3 * dt)
      if (leftKneeRef.current) leftKneeRef.current.rotation.x = lerp(leftKneeRef.current.rotation.x, 1.5, 3 * dt)
      if (rightKneeRef.current) rightKneeRef.current.rotation.x = lerp(rightKneeRef.current.rotation.x, 1.5, 3 * dt)

    } else if (currentStatus === 'speaking') {
      const bounce = Math.abs(Math.sin(t * 4)) * 0.06
      if (rootRef.current) rootRef.current.position.y = bounce
      if (torsoRef.current) {
        torsoRef.current.rotation.x = lerp(torsoRef.current.rotation.x, 0, 3 * dt)
        torsoRef.current.rotation.z = Math.sin(t * 1.5 + off) * 0.03
      }
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(t * 3) * 0.05
        headRef.current.rotation.y = Math.sin(t * 1.2) * 0.1
        headRef.current.rotation.z = 0
      }
      if (leftShoulderRef.current) leftShoulderRef.current.rotation.x = -0.3 + Math.sin(t * 2 + off) * 0.3
      if (rightShoulderRef.current) rightShoulderRef.current.rotation.x = -0.3 + Math.cos(t * 2.5 + off) * 0.3
      if (leftElbowRef.current) leftElbowRef.current.rotation.x = -0.4 + Math.sin(t * 3) * 0.2
      if (rightElbowRef.current) rightElbowRef.current.rotation.x = -0.4 + Math.cos(t * 3.5) * 0.2
      if (leftHipJointRef.current) leftHipJointRef.current.rotation.x = lerp(leftHipJointRef.current.rotation.x, 0, 3 * dt)
      if (rightHipJointRef.current) rightHipJointRef.current.rotation.x = lerp(rightHipJointRef.current.rotation.x, 0, 3 * dt)
      if (leftKneeRef.current) leftKneeRef.current.rotation.x = lerp(leftKneeRef.current.rotation.x, 0, 3 * dt)
      if (rightKneeRef.current) rightKneeRef.current.rotation.x = lerp(rightKneeRef.current.rotation.x, 0, 3 * dt)

    } else if (currentStatus === 'thinking') {
      // Face the desk
      const deskAngle2 = DESK_FACING[agentId] ?? Math.PI
      let angleDiff2 = deskAngle2 - facingRef.current
      while (angleDiff2 > Math.PI) angleDiff2 -= Math.PI * 2
      while (angleDiff2 < -Math.PI) angleDiff2 += Math.PI * 2
      facingRef.current += angleDiff2 * 4 * dt
      groupRef.current.rotation.y = facingRef.current

      // Sitting pose
      if (rootRef.current) rootRef.current.position.y = lerp(rootRef.current.position.y, -0.26, 3 * dt)
      if (torsoRef.current) torsoRef.current.rotation.x = lerp(torsoRef.current.rotation.x, 0, 3 * dt)
      if (headRef.current) {
        headRef.current.rotation.z = Math.sin(t * 0.6 + off) * 0.12
        headRef.current.rotation.x = lerp(headRef.current.rotation.x, -0.05, 2 * dt)
      }
      if (rightShoulderRef.current) rightShoulderRef.current.rotation.x = lerp(rightShoulderRef.current.rotation.x, -0.8, 3 * dt)
      if (rightElbowRef.current) rightElbowRef.current.rotation.x = lerp(rightElbowRef.current.rotation.x, -1.2, 3 * dt)
      if (leftShoulderRef.current) leftShoulderRef.current.rotation.x = lerp(leftShoulderRef.current.rotation.x, 0, 3 * dt)
      if (leftElbowRef.current) leftElbowRef.current.rotation.x = lerp(leftElbowRef.current.rotation.x, 0, 3 * dt)
      if (hipsRef.current) hipsRef.current.rotation.z = Math.sin(t * 0.4 + off) * 0.03
      // Legs bent — sitting
      if (leftHipJointRef.current) leftHipJointRef.current.rotation.x = lerp(leftHipJointRef.current.rotation.x, -1.5, 3 * dt)
      if (rightHipJointRef.current) rightHipJointRef.current.rotation.x = lerp(rightHipJointRef.current.rotation.x, -1.5, 3 * dt)
      if (leftKneeRef.current) leftKneeRef.current.rotation.x = lerp(leftKneeRef.current.rotation.x, 1.5, 3 * dt)
      if (rightKneeRef.current) rightKneeRef.current.rotation.x = lerp(rightKneeRef.current.rotation.x, 1.5, 3 * dt)

    } else if (currentStatus === 'delegating') {
      if (rootRef.current) rootRef.current.position.y = lerp(rootRef.current.position.y, 0, 3 * dt)
      if (torsoRef.current) {
        torsoRef.current.rotation.x = lerp(torsoRef.current.rotation.x, 0, 3 * dt)
        torsoRef.current.rotation.y = Math.sin(t * 0.8 + off) * 0.1
      }
      if (headRef.current) {
        headRef.current.rotation.y = lerp(headRef.current.rotation.y, 0.3, 2 * dt)
        headRef.current.rotation.x = lerp(headRef.current.rotation.x, -0.05, 3 * dt)
      }
      if (rightShoulderRef.current) rightShoulderRef.current.rotation.x = lerp(rightShoulderRef.current.rotation.x, -0.7, 3 * dt)
      if (rightShoulderRef.current) rightShoulderRef.current.rotation.z = lerp(rightShoulderRef.current.rotation.z || 0, 0.5, 3 * dt)
      if (rightElbowRef.current) rightElbowRef.current.rotation.x = lerp(rightElbowRef.current.rotation.x, -0.3, 3 * dt)
      if (leftShoulderRef.current) leftShoulderRef.current.rotation.x = lerp(leftShoulderRef.current.rotation.x, 0.2, 3 * dt)
      if (leftElbowRef.current) leftElbowRef.current.rotation.x = lerp(leftElbowRef.current.rotation.x, -1.0, 3 * dt)
      if (hipsRef.current) hipsRef.current.rotation.z = lerp(hipsRef.current.rotation.z || 0, 0.04, 2 * dt)
      if (leftHipJointRef.current) leftHipJointRef.current.rotation.x = lerp(leftHipJointRef.current.rotation.x, 0, 3 * dt)
      if (rightHipJointRef.current) rightHipJointRef.current.rotation.x = lerp(rightHipJointRef.current.rotation.x, 0, 3 * dt)
      if (leftKneeRef.current) leftKneeRef.current.rotation.x = lerp(leftKneeRef.current.rotation.x, 0, 3 * dt)
      if (rightKneeRef.current) rightKneeRef.current.rotation.x = lerp(rightKneeRef.current.rotation.x, 0, 3 * dt)

    } else if (currentStatus === 'error') {
      const shake = Math.sin(t * 20) * 0.015 * Math.max(0, 1 - (t % 3))
      if (rootRef.current) rootRef.current.position.y = lerp(rootRef.current.position.y, -0.02, 3 * dt)
      if (torsoRef.current) {
        torsoRef.current.rotation.x = lerp(torsoRef.current.rotation.x, 0.1, 2 * dt)
        torsoRef.current.rotation.z = shake
      }
      if (headRef.current) {
        headRef.current.rotation.x = lerp(headRef.current.rotation.x, 0.25, 2 * dt)
        headRef.current.rotation.z = shake * 2
      }
      if (leftShoulderRef.current) leftShoulderRef.current.rotation.x = lerp(leftShoulderRef.current.rotation.x, -1.2, 2 * dt)
      if (rightShoulderRef.current) rightShoulderRef.current.rotation.x = lerp(rightShoulderRef.current.rotation.x, -1.2, 2 * dt)
      if (leftElbowRef.current) leftElbowRef.current.rotation.x = lerp(leftElbowRef.current.rotation.x, -1.5, 2 * dt)
      if (rightElbowRef.current) rightElbowRef.current.rotation.x = lerp(rightElbowRef.current.rotation.x, -1.5, 2 * dt)
      if (hipsRef.current) hipsRef.current.rotation.z = lerp(hipsRef.current.rotation.z || 0, 0, 3 * dt)
      if (leftHipJointRef.current) leftHipJointRef.current.rotation.x = lerp(leftHipJointRef.current.rotation.x, 0, 3 * dt)
      if (rightHipJointRef.current) rightHipJointRef.current.rotation.x = lerp(rightHipJointRef.current.rotation.x, 0, 3 * dt)
      if (leftKneeRef.current) leftKneeRef.current.rotation.x = lerp(leftKneeRef.current.rotation.x, 0, 3 * dt)
      if (rightKneeRef.current) rightKneeRef.current.rotation.x = lerp(rightKneeRef.current.rotation.x, 0, 3 * dt)

    } else {
      // IDLE
      const breathRate = 0.4
      const breath = Math.sin(t * breathRate * Math.PI * 2 + off)
      if (rootRef.current) rootRef.current.position.y = lerp(rootRef.current.position.y, breath * 0.01, 3 * dt)
      if (torsoRef.current) {
        torsoRef.current.rotation.x = lerp(torsoRef.current.rotation.x, 0, 3 * dt)
        torsoRef.current.rotation.z = lerp(torsoRef.current.rotation.z, 0, 3 * dt)
        torsoRef.current.scale.y = 1 + breath * 0.015
      }
      if (hipsRef.current) hipsRef.current.rotation.z = lerp(hipsRef.current.rotation.z, Math.sin(t * 0.2 + off) * 0.02, 2 * dt)
      anim.lookTimer -= dt
      if (anim.lookTimer <= 0) {
        anim.lookTarget = (Math.random() - 0.5) * 0.3
        anim.lookTimer = 5 + Math.random() * 8
      }
      if (headRef.current) {
        headRef.current.rotation.y = lerp(headRef.current.rotation.y, anim.lookTarget, 1.5 * dt)
        headRef.current.rotation.x = lerp(headRef.current.rotation.x, 0, 3 * dt)
        headRef.current.rotation.z = lerp(headRef.current.rotation.z, 0, 3 * dt)
      }
      if (leftShoulderRef.current) leftShoulderRef.current.rotation.x = lerp(leftShoulderRef.current.rotation.x, 0, 3 * dt)
      if (rightShoulderRef.current) rightShoulderRef.current.rotation.x = lerp(rightShoulderRef.current.rotation.x, 0, 3 * dt)
      if (leftElbowRef.current) leftElbowRef.current.rotation.x = lerp(leftElbowRef.current.rotation.x, -0.05, 3 * dt)
      if (rightElbowRef.current) rightElbowRef.current.rotation.x = lerp(rightElbowRef.current.rotation.x, -0.05, 3 * dt)
      if (leftHipJointRef.current) leftHipJointRef.current.rotation.x = lerp(leftHipJointRef.current.rotation.x, 0, 3 * dt)
      if (rightHipJointRef.current) rightHipJointRef.current.rotation.x = lerp(rightHipJointRef.current.rotation.x, 0, 3 * dt)
      if (leftKneeRef.current) leftKneeRef.current.rotation.x = lerp(leftKneeRef.current.rotation.x, 0, 3 * dt)
      if (rightKneeRef.current) rightKneeRef.current.rotation.x = lerp(rightKneeRef.current.rotation.x, 0, 3 * dt)
    }
  })

  return (
    <group
      ref={groupRef}
      scale={[scale, scale, scale]}
      onClick={(e) => { e.stopPropagation(); openAgentDetail(agentId) }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true) }}
      onPointerOut={() => { document.body.style.cursor = 'default'; setHovered(false) }}
    >
      {/* Invisible click hitbox — shared geometry + material */}
      <mesh position={[0, 0.7, 0]} visible={false} geometry={SHARED_GEOS.hitbox} material={HITBOX_MAT} />

      {/* Selection ring */}
      {activeAgent === agentId && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={SHARED_GEOS.ring}>
          <meshStandardMaterial
            color={agentColor}
            emissive={agentColor}
            emissiveIntensity={2}
            transparent
            opacity={0.6}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Shadow on floor — shared geometry + material */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={SHARED_GEOS.shadow} material={SHADOW_MAT} />

      {/* Root group — handles overall bob */}
      <group ref={rootRef}>
        {/* Hips group — weight shift pivot */}
        <group ref={hipsRef} position={[0, hipsY, 0]}>

          {/* === LEFT LEG === */}
          <group ref={leftHipJointRef} position={[-hipSpread, 0, 0]}>
            <group>
              <mesh position={[0, -P.upperLegH / 2, 0]} geometry={SHARED_GEOS.upperLeg} material={mats.pants} />
              <OutlineMesh geometry={SHARED_GEOS.upperLeg} scale={outlineScale} color={outlineColor} />
            </group>
            <group ref={leftKneeRef} position={[0, -P.upperLegH, 0]}>
              <group>
                <mesh position={[0, -P.lowerLegH / 2, 0]} geometry={SHARED_GEOS.lowerLeg} material={mats.lowerLeg} />
                <OutlineMesh geometry={SHARED_GEOS.lowerLeg} scale={outlineScale} color={outlineColor} />
              </group>
              <group>
                <mesh position={[0, -P.lowerLegH - P.footH / 2, 0.02]} geometry={SHARED_GEOS.foot} material={mats.shoes} />
                <OutlineMesh geometry={SHARED_GEOS.foot} scale={outlineScale} color={outlineColor} />
              </group>
            </group>
          </group>

          {/* === RIGHT LEG === */}
          <group ref={rightHipJointRef} position={[hipSpread, 0, 0]}>
            <group>
              <mesh position={[0, -P.upperLegH / 2, 0]} geometry={SHARED_GEOS.upperLeg} material={mats.pants} />
              <OutlineMesh geometry={SHARED_GEOS.upperLeg} scale={outlineScale} color={outlineColor} />
            </group>
            <group ref={rightKneeRef} position={[0, -P.upperLegH, 0]}>
              <group>
                <mesh position={[0, -P.lowerLegH / 2, 0]} geometry={SHARED_GEOS.lowerLeg} material={mats.lowerLeg} />
                <OutlineMesh geometry={SHARED_GEOS.lowerLeg} scale={outlineScale} color={outlineColor} />
              </group>
              <group>
                <mesh position={[0, -P.lowerLegH - P.footH / 2, 0.02]} geometry={SHARED_GEOS.foot} material={mats.shoes} />
                <OutlineMesh geometry={SHARED_GEOS.foot} scale={outlineScale} color={outlineColor} />
              </group>
            </group>
          </group>

          {/* === TORSO === */}
          <group ref={torsoRef} position={[0, P.torsoH / 2, 0]}>
            <group>
              <mesh geometry={SHARED_GEOS.torso} material={mats.torso} />
              <OutlineMesh geometry={SHARED_GEOS.torso} scale={outlineScale} color={outlineColor} />
            </group>
            <group>
              <mesh position={[0, P.torsoH / 2 - 0.02, 0]} geometry={SHARED_GEOS.collar} material={mats.torso} />
              <OutlineMesh geometry={SHARED_GEOS.collar} scale={outlineScale} color={outlineColor} />
            </group>

            {/* === LEFT ARM === */}
            <group ref={leftShoulderRef} position={[-shoulderSpread, P.torsoH / 2 - 0.04, 0]}>
              <group>
                <mesh position={[0, -P.upperArmH / 2, 0]} geometry={SHARED_GEOS.upperArm} material={mats.torso} />
                <OutlineMesh geometry={SHARED_GEOS.upperArm} scale={outlineScale} color={outlineColor} />
              </group>
              <group ref={leftElbowRef} position={[0, -P.upperArmH, 0]}>
                <group>
                  <mesh position={[0, -P.forearmH / 2, 0]} geometry={SHARED_GEOS.forearm} material={mats.torso} />
                  <OutlineMesh geometry={SHARED_GEOS.forearm} scale={outlineScale} color={outlineColor} />
                </group>
                <group>
                  <mesh position={[0, -P.forearmH - P.handH / 2, 0]} geometry={SHARED_GEOS.hand} material={mats.hands} />
                  <OutlineMesh geometry={SHARED_GEOS.hand} scale={outlineScale} color={outlineColor} />
                </group>
              </group>
            </group>

            {/* === RIGHT ARM === */}
            <group ref={rightShoulderRef} position={[shoulderSpread, P.torsoH / 2 - 0.04, 0]}>
              <group>
                <mesh position={[0, -P.upperArmH / 2, 0]} geometry={SHARED_GEOS.upperArm} material={mats.torso} />
                <OutlineMesh geometry={SHARED_GEOS.upperArm} scale={outlineScale} color={outlineColor} />
              </group>
              <group ref={rightElbowRef} position={[0, -P.upperArmH, 0]}>
                <group>
                  <mesh position={[0, -P.forearmH / 2, 0]} geometry={SHARED_GEOS.forearm} material={mats.torso} />
                  <OutlineMesh geometry={SHARED_GEOS.forearm} scale={outlineScale} color={outlineColor} />
                </group>
                <group>
                  <mesh position={[0, -P.forearmH - P.handH / 2, 0]} geometry={SHARED_GEOS.hand} material={mats.hands} />
                  <OutlineMesh geometry={SHARED_GEOS.hand} scale={outlineScale} color={outlineColor} />
                </group>
              </group>
            </group>

            {/* === NECK === */}
            <group>
              <mesh position={[0, P.torsoH / 2 + P.neckH / 2, 0]} geometry={SHARED_GEOS.neck} material={mats.neck} />
              <OutlineMesh geometry={SHARED_GEOS.neck} scale={outlineScale} color={outlineColor} />
            </group>

            {/* === HEAD === */}
            <group ref={headRef} position={[0, P.torsoH / 2 + P.neckH + P.headH / 2, 0]}>
              <group>
                <mesh geometry={SHARED_GEOS.head} material={mats.head} />
                <OutlineMesh geometry={SHARED_GEOS.head} scale={outlineScale} color={outlineColor} />
              </group>

              <HairMesh style={hairStyle} color={hairColor} />

              {/* Eyes — shared materials */}
              <mesh ref={leftEyeRef} position={[-0.065, 0.02, P.headD / 2 + 0.005]} geometry={SHARED_GEOS.eye} material={eyeMat} />
              <mesh ref={rightEyeRef} position={[0.065, 0.02, P.headD / 2 + 0.005]} geometry={SHARED_GEOS.eye} material={eyeMat} />
            </group>
          </group>
        </group>
      </group>

      {/* Name label */}
      <Html position={[0, TOTAL_HEIGHT + 0.35, 0]} center zIndexRange={[40, 0]} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            background: 'rgba(10, 10, 24, 0.72)',
            backdropFilter: 'blur(12px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6,
            padding: '3px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <span style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 10,
            fontWeight: 600,
            fontFamily: 'system-ui, -apple-system, "Inter", sans-serif',
            letterSpacing: '0.02em',
          }}>
            {agentName}
          </span>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: statusColor,
            display: 'inline-block',
            boxShadow: agentStatus !== 'idle' ? `0 0 6px ${statusColor}` : 'none',
            animation: agentStatus === 'working' ? 'pulse 2s ease-in-out infinite' : 'none',
          }} />
        </div>
      </Html>

      {/* Speech bubble */}
      {showBubble && <SpeechBubble agentId={agentId} />}
    </group>
  )
})
