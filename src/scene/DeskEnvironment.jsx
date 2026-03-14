import { useMemo } from 'react'
import * as THREE from 'three'
import useStore from '../store/useStore'
import AgentScreen from './AgentScreen'
import { toon } from './toonMaterial'
import OutlineMesh from './OutlineMesh'

// Toon-shaded desk items per agent with outlines
// All meshStandardMaterial/meshPhysicalMaterial replaced with toon()

const mugColors = {
  kim: '#7B5CE6',
  dev: '#00BCD4',
  marco: '#FF6B35',
  zara: '#F59E0B',
  riley: '#22C55E',
  dante: '#EC4899',
  sam: '#94A3B8',
  petra: '#EAB308',
  lex: '#6366F1',
  bruno: '#FF0040',
}

const OUTLINE = '#080810'

function CoffeeMug({ position, bandColor }) {
  const geo = useMemo(() => ({
    body: new THREE.CylinderGeometry(0.068, 0.060, 0.10, 12),
    coffee: new THREE.CylinderGeometry(0.060, 0.060, 0.008, 12),
    handle: new THREE.TorusGeometry(0.048, 0.012, 6, 8),
    band: new THREE.CylinderGeometry(0.070, 0.070, 0.025, 12),
  }), [])

  return (
    <group position={position}>
      {/* Mug body */}
      <mesh geometry={geo.body} material={toon('#e8e8e8')} castShadow />
      <OutlineMesh geometry={geo.body} scale={1.06} color={OUTLINE} />

      {/* Coffee top */}
      <mesh
        geometry={geo.coffee}
        material={toon('#2a1a0a')}
        position={[0, 0.046, 0]}
      />

      {/* Handle */}
      <mesh
        geometry={geo.handle}
        material={toon('#e8e8e8')}
        rotation={[0, 0, Math.PI / 2]}
        position={[0.072, 0, 0]}
      />
      <OutlineMesh geometry={geo.handle} scale={1.06} color={OUTLINE} />

      {/* Color band */}
      <mesh geometry={geo.band} material={toon(bandColor)} castShadow />
      <OutlineMesh geometry={geo.band} scale={1.06} color={OUTLINE} />
    </group>
  )
}

function StickyNote({ position, color = '#FFE500', rotation = [0, 0, 0] }) {
  const geo = useMemo(() => new THREE.BoxGeometry(0.13, 0.002, 0.13), [])
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} material={toon(color)} castShadow />
      <OutlineMesh geometry={geo} scale={1.06} color={OUTLINE} />
    </group>
  )
}

function PlantSmall({ position }) {
  const geo = useMemo(() => ({
    pot: new THREE.CylinderGeometry(0.085, 0.068, 0.10, 8),
    soil: new THREE.CylinderGeometry(0.080, 0.080, 0.012, 8),
    stem: new THREE.CylinderGeometry(0.007, 0.007, 0.16, 4),
    leaf: new THREE.BoxGeometry(0.055, 0.016, 0.09),
  }), [])

  const stemAngles = [
    { rz: 0.15, ry: 0 },
    { rz: -0.12, ry: 2.1 },
    { rz: 0.18, ry: 4.2 },
  ]

  const leafPositions = [
    { pos: [0.03, 0.16, 0.02], ry: 0.3 },
    { pos: [-0.04, 0.14, -0.01], ry: 1.8 },
    { pos: [0.01, 0.18, -0.04], ry: 3.0 },
    { pos: [-0.02, 0.15, 0.04], ry: 4.5 },
    { pos: [0.04, 0.17, -0.03], ry: 5.5 },
    { pos: [-0.03, 0.19, 0.01], ry: 0.9 },
  ]

  return (
    <group position={position}>
      {/* Pot */}
      <mesh geometry={geo.pot} material={toon('#7a2e1a')} position={[0, 0.05, 0]} castShadow />
      <OutlineMesh geometry={geo.pot} scale={1.06} color={OUTLINE} />

      {/* Soil */}
      <mesh geometry={geo.soil} material={toon('#1a0f08')} position={[0, 0.106, 0]} />

      {/* Stems */}
      {stemAngles.map((s, i) => (
        <mesh
          key={`stem-${i}`}
          geometry={geo.stem}
          material={toon('#0d2208')}
          position={[0, 0.15, 0]}
          rotation={[0, s.ry, s.rz]}
        />
      ))}

      {/* Leaves */}
      {leafPositions.map((l, i) => (
        <mesh
          key={`leaf-${i}`}
          geometry={geo.leaf}
          material={toon('#1a4a0a')}
          position={l.pos}
          rotation={[0, l.ry, 0]}
        />
      ))}
      <OutlineMesh geometry={geo.pot} scale={1.06} color={OUTLINE} />
    </group>
  )
}

function WaterBottle({ position }) {
  const geo = useMemo(() => ({
    body: new THREE.CylinderGeometry(0.025, 0.025, 0.18, 8),
    cap: new THREE.CylinderGeometry(0.018, 0.025, 0.02, 8),
  }), [])

  return (
    <group position={position}>
      <mesh geometry={geo.body} material={toon('#c8d8f0')} castShadow />
      <OutlineMesh geometry={geo.body} scale={1.06} color={OUTLINE} />
      {/* Cap */}
      <mesh
        geometry={geo.cap}
        material={toon('#1a1a2a')}
        position={[0, 0.095, 0]}
        castShadow
      />
      <OutlineMesh geometry={geo.cap} scale={1.06} color={OUTLINE} />
    </group>
  )
}

function PenHolder({ position }) {
  const geo = useMemo(() => ({
    container: new THREE.CylinderGeometry(0.052, 0.048, 0.11, 8),
    pen: new THREE.CylinderGeometry(0.007, 0.007, 0.17, 5),
  }), [])

  const penColors = ['#cc2222', '#2255cc', '#228822', '#e8e8e8']
  const penOffsets = [
    { x: 0.015, z: 0.01, rz: 0.08, rx: 0.05 },
    { x: -0.01, z: 0.015, rz: -0.06, rx: 0.07 },
    { x: 0.01, z: -0.012, rz: 0.1, rx: -0.04 },
    { x: -0.015, z: -0.008, rz: -0.09, rx: -0.06 },
  ]

  return (
    <group position={position}>
      {/* Container */}
      <mesh geometry={geo.container} material={toon('#111120')} castShadow />
      <OutlineMesh geometry={geo.container} scale={1.06} color={OUTLINE} />

      {/* Pens */}
      {penColors.map((c, i) => {
        const o = penOffsets[i]
        return (
          <mesh
            key={i}
            geometry={geo.pen}
            material={toon(c)}
            position={[o.x, 0.06, o.z]}
            rotation={[o.rx, 0, o.rz]}
          />
        )
      })}
    </group>
  )
}

function Headphones({ position }) {
  const geo = useMemo(() => ({
    band: new THREE.TorusGeometry(0.06, 0.006, 6, 12, Math.PI),
    ear: new THREE.CylinderGeometry(0.025, 0.025, 0.02, 8),
  }), [])

  return (
    <group position={position}>
      <mesh geometry={geo.band} material={toon('#1a1a24')} />
      <OutlineMesh geometry={geo.band} scale={1.06} color={OUTLINE} />
      {/* Left ear */}
      <mesh geometry={geo.ear} material={toon('#1a1a24')} position={[-0.06, 0, 0]} />
      <OutlineMesh geometry={geo.ear} scale={1.06} color={OUTLINE} />
      {/* Right ear */}
      <mesh geometry={geo.ear} material={toon('#1a1a24')} position={[0.06, 0, 0]} />
      <OutlineMesh geometry={geo.ear} scale={1.06} color={OUTLINE} />
    </group>
  )
}

function BookStack({ position }) {
  const geo = useMemo(() => ({
    body: new THREE.BoxGeometry(0.15, 0.036, 0.11),
    spine: new THREE.BoxGeometry(0.008, 0.040, 0.11),
  }), [])

  const books = [
    { color: '#6B0000', rotY: 0.05 },
    { color: '#003366', rotY: -0.08 },
    { color: '#004400', rotY: 0.1 },
  ]

  return (
    <group position={position}>
      {books.map((b, i) => (
        <group key={i} position={[0, i * 0.038, 0]} rotation={[0, b.rotY, 0]}>
          {/* Book body */}
          <mesh geometry={geo.body} material={toon(b.color)} castShadow />
          <OutlineMesh geometry={geo.body} scale={1.06} color={OUTLINE} />
          {/* Spine strip */}
          <mesh
            geometry={geo.spine}
            material={toon('#ccccaa')}
            position={[-0.071, 0.002, 0]}
          />
        </group>
      ))}
    </group>
  )
}

// Per-agent desk item layouts
function KimDesk({ deskPos }) {
  const [dx, , dz] = deskPos
  const y = 0.79
  const calGeo = useMemo(() => new THREE.BoxGeometry(0.12, 0.1, 0.04), [])
  return (
    <group>
      <CoffeeMug position={[dx + 0.7, y + 0.045, dz + 0.3]} bandColor={mugColors.kim} />
      <StickyNote position={[dx - 0.6, y, dz + 0.35]} color="#FFE500" />
      <StickyNote position={[dx - 0.52, y + 0.001, dz + 0.28]} color="#FF2299" rotation={[0, 0.2, 0]} />
      <PlantSmall position={[dx + 0.8, y, dz - 0.1]} />
      {/* Calendar stand */}
      <mesh geometry={calGeo} material={toon('#e8e8f0')} position={[dx + 0.65, y + 0.05, dz + 0.15]} castShadow />
      <OutlineMesh geometry={calGeo} scale={1.06} color={OUTLINE} />
    </group>
  )
}

function DevDesk({ deskPos }) {
  const [dx, , dz] = deskPos
  const y = 0.79
  const geo = useMemo(() => ({
    can: new THREE.CylinderGeometry(0.025, 0.025, 0.11, 8),
    usb: new THREE.BoxGeometry(0.12, 0.02, 0.04),
    duck: new THREE.BoxGeometry(0.04, 0.04, 0.04),
  }), [])
  return (
    <group>
      {/* Energy drink can */}
      <mesh geometry={geo.can} material={toon('#30d158')} position={[dx + 0.7, y + 0.05, dz + 0.3]} castShadow />
      <OutlineMesh geometry={geo.can} scale={1.06} color={OUTLINE} />
      <Headphones position={[dx - 0.65, y + 0.03, dz + 0.3]} />
      <PenHolder position={[dx + 0.8, y + 0.04, dz + 0.1]} />
      {/* USB hub */}
      <mesh geometry={geo.usb} material={toon('#1a1a24')} position={[dx + 0.5, y, dz - 0.25]} castShadow />
      <OutlineMesh geometry={geo.usb} scale={1.06} color={OUTLINE} />
      {/* Rubber duck */}
      <mesh geometry={geo.duck} material={toon('#ffcc00')} position={[dx - 0.75, y + 0.02, dz + 0.1]} castShadow />
      <OutlineMesh geometry={geo.duck} scale={1.06} color={OUTLINE} />
    </group>
  )
}

function MarcoDesk({ deskPos }) {
  const [dx, , dz] = deskPos
  const y = 0.79
  const geo = useMemo(() => ({
    phone: new THREE.BoxGeometry(0.06, 0.1, 0.005),
    notepad: new THREE.BoxGeometry(0.12, 0.015, 0.16),
  }), [])
  return (
    <group>
      <CoffeeMug position={[dx + 0.7, y + 0.045, dz + 0.3]} bandColor={mugColors.marco} />
      {/* Phone stand */}
      <mesh geometry={geo.phone} material={toon('#1a1a24')} position={[dx + 0.65, y + 0.03, dz + 0.2]} rotation={[-0.3, 0, 0]} castShadow />
      <OutlineMesh geometry={geo.phone} scale={1.06} color={OUTLINE} />
      {/* Notepad */}
      <mesh geometry={geo.notepad} material={toon('#f0f0e0')} position={[dx + 0.5, y, dz + 0.35]} castShadow />
      <OutlineMesh geometry={geo.notepad} scale={1.06} color={OUTLINE} />
      <WaterBottle position={[dx - 0.7, y + 0.09, dz + 0.25]} />
    </group>
  )
}

function ZaraDesk({ deskPos }) {
  const [dx, , dz] = deskPos
  const y = 0.79
  const geo = useMemo(() => ({
    tablet: new THREE.BoxGeometry(0.18, 0.01, 0.24),
    swatch: new THREE.BoxGeometry(0.04, 0.002, 0.06),
  }), [])
  const swatchColors = ['#ff453a', '#F59E0B', '#30d158', '#3B82F6', '#EC4899']
  return (
    <group>
      <CoffeeMug position={[dx + 0.7, y + 0.045, dz + 0.3]} bandColor={mugColors.zara} />
      {/* Tablet */}
      <mesh geometry={geo.tablet} material={toon('#1a1a24')} position={[dx + 0.6, y + 0.005, dz + 0.25]} castShadow />
      <OutlineMesh geometry={geo.tablet} scale={1.06} color={OUTLINE} />
      {/* Color swatch cards */}
      {swatchColors.map((c, i) => (
        <mesh key={i} geometry={geo.swatch} material={toon(c)} position={[dx - 0.6 + i * 0.06, y + 0.001, dz + 0.38]} castShadow />
      ))}
      <PlantSmall position={[dx - 0.8, y, dz + 0.1]} />
    </group>
  )
}

function RileyDesk({ deskPos }) {
  const [dx, , dz] = deskPos
  const y = 0.79
  const geo = useMemo(() => ({
    cable: new THREE.TorusGeometry(0.04, 0.008, 6, 12),
    tool: new THREE.BoxGeometry(0.03, 0.01, 0.1),
    speaker: new THREE.CylinderGeometry(0.035, 0.035, 0.06, 12),
  }), [])
  return (
    <group>
      <CoffeeMug position={[dx + 0.7, y + 0.045, dz + 0.3]} bandColor={mugColors.riley} />
      {/* Cable coil */}
      <mesh geometry={geo.cable} material={toon('#3a3a48')} position={[dx - 0.65, y + 0.015, dz + 0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow />
      <OutlineMesh geometry={geo.cable} scale={1.06} color={OUTLINE} />
      {/* Multitool */}
      <mesh geometry={geo.tool} material={toon('#8a8a98')} position={[dx + 0.5, y, dz + 0.35]} castShadow />
      <OutlineMesh geometry={geo.tool} scale={1.06} color={OUTLINE} />
      <Headphones position={[dx + 0.8, y + 0.03, dz + 0.15]} />
      {/* Mini speaker */}
      <mesh geometry={geo.speaker} material={toon('#1a1a24')} position={[dx - 0.8, y + 0.03, dz + 0.1]} castShadow />
      <OutlineMesh geometry={geo.speaker} scale={1.06} color={OUTLINE} />
    </group>
  )
}

function DanteDesk({ deskPos }) {
  const [dx, , dz] = deskPos
  const y = 0.79
  const shakerGeo = useMemo(() => new THREE.CylinderGeometry(0.03, 0.04, 0.14, 8), [])
  return (
    <group>
      {/* Cocktail shaker */}
      <mesh geometry={shakerGeo} material={toon('#8a8a98')} position={[dx + 0.7, y + 0.07, dz + 0.3]} castShadow />
      <OutlineMesh geometry={shakerGeo} scale={1.06} color={OUTLINE} />
      {/* Book stack */}
      <BookStack position={[dx - 0.6, y + 0.018, dz + 0.3]} />
      <CoffeeMug position={[dx + 0.4, y + 0.045, dz + 0.35]} bandColor={mugColors.dante} />
      <PlantSmall position={[dx - 0.8, y, dz + 0.1]} />
    </group>
  )
}

function SamDesk({ deskPos }) {
  const [dx, , dz] = deskPos
  const y = 0.79
  const clipGeo = useMemo(() => new THREE.BoxGeometry(0.15, 0.02, 0.2), [])
  const stickyColors = ['#FFE500', '#FF2299', '#00FFAA']
  return (
    <group>
      <CoffeeMug position={[dx + 0.7, y + 0.045, dz + 0.3]} bandColor={mugColors.sam} />
      {/* Clipboard */}
      <mesh geometry={clipGeo} material={toon('#3a2818')} position={[dx + 0.55, y + 0.01, dz + 0.3]} castShadow />
      <OutlineMesh geometry={clipGeo} scale={1.06} color={OUTLINE} />
      {/* Sticky notes */}
      {stickyColors.map((c, i) => (
        <StickyNote
          key={i}
          position={[dx - 0.55 + i * 0.09, y + i * 0.002, dz + 0.38]}
          color={c}
          rotation={[0.05, (i - 1) * 0.35, 0]}
        />
      ))}
      <PenHolder position={[dx - 0.8, y + 0.04, dz + 0.15]} />
      <WaterBottle position={[dx + 0.8, y + 0.09, dz + 0.2]} />
    </group>
  )
}

function PetraDesk({ deskPos }) {
  const [dx, , dz] = deskPos
  const y = 0.79
  const geo = useMemo(() => ({
    calc: new THREE.BoxGeometry(0.08, 0.01, 0.12),
    paper: new THREE.BoxGeometry(0.14, 0.025, 0.2),
  }), [])
  return (
    <group>
      <CoffeeMug position={[dx + 0.7, y + 0.045, dz + 0.3]} bandColor={mugColors.petra} />
      {/* Calculator */}
      <mesh geometry={geo.calc} material={toon('#2a2a34')} position={[dx + 0.4, y, dz + 0.2]} castShadow />
      <OutlineMesh geometry={geo.calc} scale={1.06} color={OUTLINE} />
      {/* Paper stack */}
      <mesh geometry={geo.paper} material={toon('#e8e8f0')} position={[dx - 0.3, y + 0.01, dz + 0.3]} castShadow />
      <OutlineMesh geometry={geo.paper} scale={1.06} color={OUTLINE} />
    </group>
  )
}

function LexDesk({ deskPos }) {
  const [dx, , dz] = deskPos
  const y = 0.79
  const padGeo = useMemo(() => new THREE.BoxGeometry(0.12, 0.01, 0.18), [])
  return (
    <group>
      <CoffeeMug position={[dx + 0.7, y + 0.045, dz + 0.3]} bandColor={mugColors.lex} />
      {/* Book stack */}
      <BookStack position={[dx - 0.3, y + 0.018, dz + 0.3]} />
      {/* Yellow legal pad */}
      <mesh geometry={padGeo} material={toon('#f0f0a0')} position={[dx + 0.4, y, dz + 0.3]} castShadow />
      <OutlineMesh geometry={padGeo} scale={1.06} color={OUTLINE} />
    </group>
  )
}

function BrunoDesk() {
  const y = 1.09 // standing desk is higher
  const notebookGeo = useMemo(() => new THREE.BoxGeometry(0.14, 0.01, 0.2), [])
  return (
    <group>
      <CoffeeMug position={[0.7, y + 0.045, 0.3]} bandColor={mugColors.bruno} />
      <PlantSmall position={[-0.8, y, 0.2]} />
      {/* Notebook */}
      <mesh geometry={notebookGeo} material={toon('#1a1a28')} position={[0.5, y, 0.3]} castShadow />
      <OutlineMesh geometry={notebookGeo} scale={1.06} color={OUTLINE} />
      <WaterBottle position={[-0.6, y + 0.09, 0.3]} />
    </group>
  )
}

// Desk positions from Furniture.jsx
const DESK_POSITIONS = {
  kim:   [-18, 0, -6],
  dev:   [ -6, 0, -6],
  marco: [  3, 0, -6],
  zara:  [ 12, 0, -6],
  sam:   [ 19, 0, -6],
  petra: [-18, 0,  3],
  lex:   [ -6, 0,  3],
  riley: [  3, 0,  3],
  dante: [  7, 0,  3],
}

export default function DeskEnvironment() {
  return (
    <group>
      <KimDesk deskPos={DESK_POSITIONS.kim} />
      <DevDesk deskPos={DESK_POSITIONS.dev} />
      <MarcoDesk deskPos={DESK_POSITIONS.marco} />
      <ZaraDesk deskPos={DESK_POSITIONS.zara} />
      <RileyDesk deskPos={DESK_POSITIONS.riley} />
      <DanteDesk deskPos={DESK_POSITIONS.dante} />
      <SamDesk deskPos={DESK_POSITIONS.sam} />
      <PetraDesk deskPos={DESK_POSITIONS.petra} />
      <LexDesk deskPos={DESK_POSITIONS.lex} />
      <BrunoDesk />
      <AgentScreen />
    </group>
  )
}
