import { useMemo } from 'react'
import * as THREE from 'three'
import { toon } from './toonMaterial'
import OutlineMesh from './OutlineMesh'

// Color constants
const darkWood = '#2a2030'
const metalDark = '#1a1a24'
const metalLight = '#3a3a48'
const screenGlow = '#5588cc'
const couchDark = '#1a1828'
const bottleColors = ['#2a3a6a', '#6a2a2a', '#2a6a4a', '#6a5a2a', '#5a2a6a']
const outlineColor = '#080810'

// ───────────────────────── DESK LAMP ─────────────────────────
function DeskLamp({ position }) {
  const geos = useMemo(() => ({
    base: new THREE.CylinderGeometry(0.09, 0.11, 0.03, 8),
    poleLower: new THREE.CylinderGeometry(0.018, 0.018, 0.28, 6),
    poleUpper: new THREE.CylinderGeometry(0.018, 0.018, 0.22, 6),
    shade: new THREE.ConeGeometry(0.09, 0.13, 8),
  }), [])

  return (
    <group position={position}>
      {/* Base */}
      <group>
        <mesh geometry={geos.base} castShadow material={toon('#111120')} />
        <OutlineMesh geometry={geos.base} scale={1.06} color={outlineColor} />
      </group>
      {/* Pole lower */}
      <group position={[0, 0.15, 0]}>
        <mesh geometry={geos.poleLower} material={toon('#111120')} />
        <OutlineMesh geometry={geos.poleLower} scale={1.06} color={outlineColor} />
      </group>
      {/* Pole upper */}
      <group position={[0, 0.38, 0]} rotation={[0.698, 0, 0]}>
        <mesh geometry={geos.poleUpper} material={toon('#111120')} />
        <OutlineMesh geometry={geos.poleUpper} scale={1.06} color={outlineColor} />
      </group>
      {/* Shade — at end of upper pole, open end down */}
      <group position={[0, 0.49, 0.11]} rotation={[0.698, 0, 0]}>
        <mesh geometry={geos.shade} material={toon('#1a1a2e')} rotation={[Math.PI, 0, 0]} />
        <OutlineMesh geometry={geos.shade} scale={1.06} color={outlineColor} />
        <pointLight color="#fff5e6" intensity={3} distance={2.5} position={[0, -0.05, 0]} />
      </group>
    </group>
  )
}

// ───────────────────────── KEYBOARD ─────────────────────────
function Keyboard({ position }) {
  const geos = useMemo(() => ({
    base: new THREE.BoxGeometry(0.52, 0.018, 0.17),
    keyRow: new THREE.BoxGeometry(0.46, 0.008, 0.030),
  }), [])

  return (
    <group position={position}>
      {/* Base */}
      <group>
        <mesh geometry={geos.base} material={toon('#0d0d1a')} rotation={[-0.06, 0, 0]} castShadow />
        <OutlineMesh geometry={geos.base} scale={1.06} color={outlineColor} />
      </group>
      {/* Key rows */}
      {[0.012, 0.012 + 0.035, 0.012 + 0.07, 0.012 + 0.105].map((yOff, i) => (
        <group key={i} position={[0, yOff, -0.055 + i * 0.038]}>
          <mesh geometry={geos.keyRow} material={toon('#151525')} />
        </group>
      ))}
    </group>
  )
}

// ───────────────────────── DESK ─────────────────────────
function Desk({ position, rotation = [0, 0, 0], dualMonitor = false }) {
  const geos = useMemo(() => ({
    desktop: new THREE.BoxGeometry(2.0, 0.06, 1.0),
    leg: new THREE.BoxGeometry(0.04, 0.74, 0.7),
    tray: new THREE.BoxGeometry(1.6, 0.04, 0.15),
    monitorStand: new THREE.BoxGeometry(0.06, 0.24, 0.06),
    screenFrame: new THREE.BoxGeometry(0.7, 0.5, 0.03),
    screenSurface: new THREE.BoxGeometry(0.62, 0.42, 0.005),
    mouse: new THREE.BoxGeometry(0.08, 0.02, 0.12),
  }), [])

  return (
    <group position={position} rotation={rotation}>
      {/* Desktop surface */}
      <group>
        <mesh geometry={geos.desktop} position={[0, 0.75, 0]} castShadow receiveShadow material={toon(darkWood)} />
        <mesh position={[0, 0.75, 0]}>
          <OutlineMesh geometry={geos.desktop} scale={1.03} color={outlineColor} />
        </mesh>
      </group>

      {/* Metal legs — A-frame style */}
      <group>
        <mesh geometry={geos.leg} position={[-0.85, 0.37, 0]} material={toon(metalDark)} />
        <mesh position={[-0.85, 0.37, 0]}>
          <OutlineMesh geometry={geos.leg} scale={1.03} color={outlineColor} />
        </mesh>
      </group>
      <group>
        <mesh geometry={geos.leg} position={[0.85, 0.37, 0]} material={toon(metalDark)} />
        <mesh position={[0.85, 0.37, 0]}>
          <OutlineMesh geometry={geos.leg} scale={1.03} color={outlineColor} />
        </mesh>
      </group>

      {/* Cable management tray */}
      <group>
        <mesh geometry={geos.tray} position={[0, 0.68, -0.35]} material={toon(metalDark)} />
        <mesh position={[0, 0.68, -0.35]}>
          <OutlineMesh geometry={geos.tray} scale={1.03} color={outlineColor} />
        </mesh>
      </group>

      {/* Single centered Monitor */}
      <group position={[0, 0, -0.3]}>
        {/* Stand */}
        <group>
          <mesh geometry={geos.monitorStand} position={[0, 0.9, -0.03]} material={toon(metalDark)} />
          <mesh position={[0, 0.9, 0]}>
            <OutlineMesh geometry={geos.monitorStand} scale={1.06} color={outlineColor} />
          </mesh>
        </group>
        {/* Screen frame (bezel) */}
        <group>
          <mesh geometry={geos.screenFrame} position={[0, 1.2, 0]} castShadow material={toon('#0a0a10')} />
          <mesh position={[0, 1.2, 0]}>
            <OutlineMesh geometry={geos.screenFrame} scale={1.02} color={outlineColor} />
          </mesh>
        </group>
        {/* Screen surface rendered by AgentScreen */}
      </group>

      {/* Keyboard */}
      <Keyboard position={[0, 0.79, 0.12]} />

      {/* Mouse */}
      <group>
        <mesh geometry={geos.mouse} position={[0.45, 0.79, 0.12]} material={toon('#18181e')} />
        <mesh position={[0.45, 0.79, 0.12]}>
          <OutlineMesh geometry={geos.mouse} scale={1.06} color={outlineColor} />
        </mesh>
      </group>

      {/* Desk Lamp — left rear of desk */}
      <DeskLamp position={[-0.75, 0.79, -0.3]} />
    </group>
  )
}

// ───────────────────────── OFFICE CHAIR ─────────────────────────
function OfficeChair({ position, rotation = [0, 0, 0] }) {
  const geos = useMemo(() => ({
    seat: new THREE.BoxGeometry(0.68, 0.08, 0.65),
    back: new THREE.BoxGeometry(0.68, 0.52, 0.06),
    armrest: new THREE.BoxGeometry(0.06, 0.1, 0.44),
    gasLift: new THREE.CylinderGeometry(0.04, 0.04, 0.36, 8),
    basePlate: new THREE.CylinderGeometry(0.30, 0.30, 0.03, 5),
    casterArm: new THREE.BoxGeometry(0.22, 0.025, 0.04),
  }), [])

  const casterAngles = [0, (2 * Math.PI) / 5, (4 * Math.PI) / 5, (6 * Math.PI) / 5, (8 * Math.PI) / 5]

  return (
    <group position={position} rotation={rotation}>
      {/* Seat */}
      <group>
        <mesh geometry={geos.seat} position={[0, 0, 0]} castShadow material={toon('#2d3a5c')} />
        <mesh position={[0, 0, 0]}>
          <OutlineMesh geometry={geos.seat} scale={1.03} color={outlineColor} />
        </mesh>
      </group>

      {/* Back */}
      <group>
        <mesh geometry={geos.back} position={[0, 0.3, -0.295]} rotation={[-0.14, 0, 0]} castShadow material={toon('#263050')} />
        <mesh position={[0, 0.3, -0.295]} rotation={[-0.14, 0, 0]}>
          <OutlineMesh geometry={geos.back} scale={1.03} color={outlineColor} />
        </mesh>
      </group>

      {/* Left armrest */}
      <group>
        <mesh geometry={geos.armrest} position={[-0.37, 0.12, 0]} material={toon('#1a1a2e')} />
        <mesh position={[-0.37, 0.12, 0]}>
          <OutlineMesh geometry={geos.armrest} scale={1.06} color={outlineColor} />
        </mesh>
      </group>

      {/* Right armrest */}
      <group>
        <mesh geometry={geos.armrest} position={[0.37, 0.12, 0]} material={toon('#1a1a2e')} />
        <mesh position={[0.37, 0.12, 0]}>
          <OutlineMesh geometry={geos.armrest} scale={1.06} color={outlineColor} />
        </mesh>
      </group>

      {/* Gas lift */}
      <group>
        <mesh geometry={geos.gasLift} position={[0, -0.22, 0]} material={toon('#111122')} />
        <mesh position={[0, -0.22, 0]}>
          <OutlineMesh geometry={geos.gasLift} scale={1.06} color={outlineColor} />
        </mesh>
      </group>

      {/* Base plate */}
      <group>
        <mesh geometry={geos.basePlate} position={[0, -0.40, 0]} material={toon('#0d0d1a')} />
        <mesh position={[0, -0.40, 0]}>
          <OutlineMesh geometry={geos.basePlate} scale={1.03} color={outlineColor} />
        </mesh>
      </group>

      {/* 5 caster arms */}
      {casterAngles.map((angle, i) => (
        <group key={i} position={[0, -0.40, 0]} rotation={[0, angle, 0]}>
          <mesh geometry={geos.casterArm} position={[0.11, 0, 0]} material={toon('#0d0d1a')} />
        </group>
      ))}
    </group>
  )
}

// ───────────────────────── SOFA ─────────────────────────
function Sofa({ position, rotation = [0, 0, 0] }) {
  const geos = useMemo(() => ({
    base: new THREE.BoxGeometry(2.4, 0.12, 0.85),
    seat: new THREE.BoxGeometry(2.3, 0.18, 0.75),
    backrest: new THREE.BoxGeometry(2.3, 0.5, 0.2),
    arm: new THREE.BoxGeometry(0.12, 0.4, 0.8),
  }), [])

  return (
    <group position={position} rotation={rotation}>
      {/* Base */}
      <group>
        <mesh geometry={geos.base} position={[0, 0.15, 0]} material={toon(metalDark)} />
        <mesh position={[0, 0.15, 0]}>
          <OutlineMesh geometry={geos.base} scale={1.03} color={outlineColor} />
        </mesh>
      </group>
      {/* Seat cushion */}
      <group>
        <mesh geometry={geos.seat} position={[0, 0.3, 0.05]} castShadow material={toon(couchDark)} />
        <mesh position={[0, 0.3, 0.05]}>
          <OutlineMesh geometry={geos.seat} scale={1.03} color={outlineColor} />
        </mesh>
      </group>
      {/* Backrest */}
      <group>
        <mesh geometry={geos.backrest} position={[0, 0.6, -0.3]} castShadow material={toon(couchDark)} />
        <mesh position={[0, 0.6, -0.3]}>
          <OutlineMesh geometry={geos.backrest} scale={1.03} color={outlineColor} />
        </mesh>
      </group>
      {/* Arms */}
      <group>
        <mesh geometry={geos.arm} position={[-1.1, 0.42, 0]} material={toon(couchDark)} />
        <mesh position={[-1.1, 0.42, 0]}>
          <OutlineMesh geometry={geos.arm} scale={1.03} color={outlineColor} />
        </mesh>
      </group>
      <group>
        <mesh geometry={geos.arm} position={[1.1, 0.42, 0]} material={toon(couchDark)} />
        <mesh position={[1.1, 0.42, 0]}>
          <OutlineMesh geometry={geos.arm} scale={1.03} color={outlineColor} />
        </mesh>
      </group>
    </group>
  )
}

// ───────────────────────── COFFEE TABLE ─────────────────────────
function CoffeeTable({ position }) {
  const geos = useMemo(() => ({
    top: new THREE.BoxGeometry(1.2, 0.04, 0.6),
    leg: new THREE.CylinderGeometry(0.02, 0.02, 0.34, 6),
  }), [])

  return (
    <group position={position}>
      {/* Glass top — keep meshPhysicalMaterial */}
      <group>
        <mesh geometry={geos.top} position={[0, 0.35, 0]} castShadow>
          <meshPhysicalMaterial
            color="#1a1a2a"
            transparent
            opacity={0.7}
            roughness={0.05}
            metalness={0.3}
            transmission={0.3}
          />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <OutlineMesh geometry={geos.top} scale={1.03} color={outlineColor} />
        </mesh>
      </group>
      {/* Metal legs */}
      {[[-0.5, 0, -0.22], [0.5, 0, -0.22], [-0.5, 0, 0.22], [0.5, 0, 0.22]].map((p, i) => (
        <group key={i}>
          <mesh geometry={geos.leg} position={[p[0], 0.17, p[2]]} material={toon(metalLight)} />
          <mesh position={[p[0], 0.17, p[2]]}>
            <OutlineMesh geometry={geos.leg} scale={1.06} color={outlineColor} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ───────────────────────── CONFERENCE TABLE ─────────────────────────
function ConferenceTable({ position }) {
  const geos = useMemo(() => ({
    top: new THREE.BoxGeometry(8, 0.08, 2.2),
    trim: new THREE.BoxGeometry(8.06, 0.04, 2.26),
    pedestal: new THREE.BoxGeometry(0.8, 0.7, 0.5),
    cablePort: new THREE.CylinderGeometry(0.12, 0.12, 0.04, 12),
  }), [])

  return (
    <group position={position}>
      {/* Table top */}
      <group>
        <mesh geometry={geos.top} position={[0, 0.75, 0]} castShadow material={toon(darkWood)} />
        <mesh position={[0, 0.75, 0]}>
          <OutlineMesh geometry={geos.top} scale={1.03} color={outlineColor} />
        </mesh>
      </group>
      {/* Table edge trim */}
      <group>
        <mesh geometry={geos.trim} position={[0, 0.72, 0]} material={toon(metalDark)} />
        <mesh position={[0, 0.72, 0]}>
          <OutlineMesh geometry={geos.trim} scale={1.03} color={outlineColor} />
        </mesh>
      </group>
      {/* Support pedestals */}
      <group>
        <mesh geometry={geos.pedestal} position={[-2.5, 0.37, 0]} material={toon(metalDark)} />
        <mesh position={[-2.5, 0.37, 0]}>
          <OutlineMesh geometry={geos.pedestal} scale={1.03} color={outlineColor} />
        </mesh>
      </group>
      <group>
        <mesh geometry={geos.pedestal} position={[2.5, 0.37, 0]} material={toon(metalDark)} />
        <mesh position={[2.5, 0.37, 0]}>
          <OutlineMesh geometry={geos.pedestal} scale={1.03} color={outlineColor} />
        </mesh>
      </group>
      {/* Center cable port */}
      <group>
        <mesh geometry={geos.cablePort} position={[0, 0.76, 0]} material={toon(metalLight)} />
        <mesh position={[0, 0.76, 0]}>
          <OutlineMesh geometry={geos.cablePort} scale={1.06} color={outlineColor} />
        </mesh>
      </group>
    </group>
  )
}

// ───────────────────────── BOOKSHELF ─────────────────────────
// Pre-compute stable random book sizes outside component to avoid Math.random() on every render
const bookData = [
  { x: -0.35, y: 0.62, c: '#7B5CE6', w: 0.14, h: 0.32 },
  { x: -0.1, y: 0.62, c: '#3B82F6', w: 0.16, h: 0.30 },
  { x: 0.15, y: 0.62, c: '#30d158', w: 0.13, h: 0.35 },
  { x: 0.35, y: 0.62, c: '#ff453a', w: 0.15, h: 0.29 },
  { x: -0.25, y: 1.22, c: '#ffb800', w: 0.14, h: 0.33 },
  { x: 0.05, y: 1.22, c: '#EC4899', w: 0.16, h: 0.31 },
  { x: 0.3, y: 1.22, c: '#6366F1', w: 0.13, h: 0.34 },
  { x: -0.3, y: 1.82, c: '#22C55E', w: 0.15, h: 0.28 },
  { x: 0, y: 1.82, c: '#F59E0B', w: 0.14, h: 0.36 },
  { x: 0.3, y: 1.82, c: '#00BCD4', w: 0.16, h: 0.30 },
  { x: -0.2, y: 2.42, c: '#ff453a', w: 0.13, h: 0.32 },
  { x: 0.15, y: 2.42, c: '#7B5CE6', w: 0.15, h: 0.33 },
]

function Bookshelf({ position, rotation = [0, 0, 0] }) {
  const geos = useMemo(() => ({
    frame: new THREE.BoxGeometry(1.2, 3.0, 0.35),
    shelf: new THREE.BoxGeometry(1.1, 0.04, 0.32),
    books: bookData.map(b => ({
      body: new THREE.BoxGeometry(b.w, b.h, 0.22),
      spine: new THREE.BoxGeometry(0.02, b.h + 0.01, 0.22),
    })),
  }), [])

  return (
    <group position={position} rotation={rotation}>
      {/* Frame */}
      <group>
        <mesh geometry={geos.frame} position={[0, 1.5, 0]} castShadow material={toon('#12121e')} />
        <mesh position={[0, 1.5, 0]}>
          <OutlineMesh geometry={geos.frame} scale={1.03} color={outlineColor} />
        </mesh>
      </group>

      {/* Shelves */}
      {[0.4, 1.0, 1.6, 2.2, 2.8].map((y, i) => (
        <group key={i}>
          <mesh geometry={geos.shelf} position={[0, y, 0.02]} material={toon('#1a1a2a')} />
          <mesh position={[0, y, 0.02]}>
            <OutlineMesh geometry={geos.shelf} scale={1.03} color={outlineColor} />
          </mesh>
        </group>
      ))}

      {/* Books with spine strips */}
      {bookData.map((b, i) => (
        <group key={i} position={[b.x, b.y, 0.04]}>
          {/* Book body */}
          <group>
            <mesh geometry={geos.books[i].body} material={toon(b.c)} />
            <OutlineMesh geometry={geos.books[i].body} scale={1.06} color={outlineColor} />
          </group>
          {/* Spine strip */}
          <mesh geometry={geos.books[i].spine} position={[-b.w / 2 + 0.01, 0, 0]} material={toon(b.c)} />
        </group>
      ))}
    </group>
  )
}

// ───────────────────────── PLANT ─────────────────────────
function Plant({ position, scale: s = 1 }) {
  const geos = useMemo(() => ({
    pot: new THREE.CylinderGeometry(0.085, 0.068, 0.10, 8),
    soil: new THREE.CylinderGeometry(0.080, 0.080, 0.012, 8),
    stem: new THREE.CylinderGeometry(0.007, 0.007, 0.16, 4),
    leaf: new THREE.BoxGeometry(0.055, 0.016, 0.09),
  }), [])

  return (
    <group position={position} scale={[s, s, s]}>
      {/* Pot */}
      <group>
        <mesh geometry={geos.pot} position={[0, 0.05, 0]} castShadow material={toon('#7a2e1a')} />
        <mesh position={[0, 0.05, 0]}>
          <OutlineMesh geometry={geos.pot} scale={1.06} color={outlineColor} />
        </mesh>
      </group>
      {/* Soil */}
      <group>
        <mesh geometry={geos.soil} position={[0, 0.106, 0]} material={toon('#1a0f08')} />
      </group>
      {/* 3 stems at different angles */}
      <group position={[0, 0.19, 0]} rotation={[0.15, 0, 0.1]}>
        <mesh geometry={geos.stem} material={toon('#0d2208')} />
        <OutlineMesh geometry={geos.stem} scale={1.06} color={outlineColor} />
      </group>
      <group position={[0.02, 0.19, -0.01]} rotation={[-0.1, 0.5, -0.15]}>
        <mesh geometry={geos.stem} material={toon('#0d2208')} />
        <OutlineMesh geometry={geos.stem} scale={1.06} color={outlineColor} />
      </group>
      <group position={[-0.02, 0.19, 0.01]} rotation={[0.08, -0.6, 0.12]}>
        <mesh geometry={geos.stem} material={toon('#0d2208')} />
        <OutlineMesh geometry={geos.stem} scale={1.06} color={outlineColor} />
      </group>
      {/* 6 leaves distributed around stems */}
      {[
        { pos: [0.03, 0.24, 0.02], rot: [0.3, 0.4, 0.1] },
        { pos: [-0.04, 0.26, -0.01], rot: [-0.2, -0.5, 0.15] },
        { pos: [0.01, 0.22, -0.03], rot: [0.15, 1.0, -0.1] },
        { pos: [-0.02, 0.28, 0.03], rot: [-0.25, 0.8, 0.2] },
        { pos: [0.04, 0.27, 0.0], rot: [0.1, -0.3, -0.15] },
        { pos: [-0.03, 0.25, -0.02], rot: [0.2, 1.5, 0.05] },
      ].map((l, i) => (
        <group key={i} position={l.pos} rotation={l.rot}>
          <mesh geometry={geos.leaf} material={toon('#1a4a0a')} />
          <OutlineMesh geometry={geos.leaf} scale={1.06} color={outlineColor} />
        </group>
      ))}
    </group>
  )
}

// ───────────────────────── BAR AREA ─────────────────────────
function BarArea({ position }) {
  const geos = useMemo(() => ({
    counter: new THREE.BoxGeometry(3.5, 0.08, 0.8),
    front: new THREE.BoxGeometry(3.5, 0.6, 0.08),
    barBase: new THREE.BoxGeometry(3.5, 0.04, 0.45),
    backShelf: new THREE.BoxGeometry(3.5, 0.06, 0.35),
    bottle: new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6),
    pendantCord: new THREE.CylinderGeometry(0.01, 0.01, 1.2, 4),
    pendantShade: new THREE.CylinderGeometry(0.2, 0.25, 0.2, 8),
    stoolBase: new THREE.CylinderGeometry(0.15, 0.15, 0.03, 8),
    stoolPost: new THREE.CylinderGeometry(0.025, 0.025, 0.6, 6),
    stoolSeat: new THREE.CylinderGeometry(0.17, 0.17, 0.06, 8),
  }), [])

  return (
    <group position={position}>
      {/* Bar counter */}
      <group>
        <mesh geometry={geos.counter} position={[0, 0.55, 0]} castShadow material={toon(darkWood)} />
        <mesh position={[0, 0.55, 0]}>
          <OutlineMesh geometry={geos.counter} scale={1.03} color={outlineColor} />
        </mesh>
      </group>
      {/* Bar front */}
      <group>
        <mesh geometry={geos.front} position={[0, 0.3, -0.35]} material={toon('#12121e')} />
        <mesh position={[0, 0.3, -0.35]}>
          <OutlineMesh geometry={geos.front} scale={1.03} color={outlineColor} />
        </mesh>
      </group>
      {/* Bar base */}
      <group>
        <mesh geometry={geos.barBase} position={[0, 0.02, -0.2]} material={toon(metalDark)} />
        <mesh position={[0, 0.02, -0.2]}>
          <OutlineMesh geometry={geos.barBase} scale={1.03} color={outlineColor} />
        </mesh>
      </group>

      {/* Back shelf */}
      <group>
        <mesh geometry={geos.backShelf} position={[0, 1.2, -0.65]} castShadow material={toon('#12121e')} />
        <mesh position={[0, 1.2, -0.65]}>
          <OutlineMesh geometry={geos.backShelf} scale={1.03} color={outlineColor} />
        </mesh>
      </group>

      {/* Bottles on shelf — keep semi-transparent */}
      {[-1.2, -0.6, 0, 0.5, 1.0, 1.4].map((x, i) => (
        <group key={`bottle-${i}`}>
          <mesh geometry={geos.bottle} position={[x, 1.5, -0.65]}>
            <meshStandardMaterial
              color={bottleColors[i % bottleColors.length]}
              roughness={0.1}
              metalness={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>
          <mesh position={[x, 1.5, -0.65]}>
            <OutlineMesh geometry={geos.bottle} scale={1.06} color={outlineColor} />
          </mesh>
        </group>
      ))}

      {/* Pendant light above bar — keep as-is */}
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 1.2, 4]} />
        <meshStandardMaterial color={metalDark} roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 2.9, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.2, 8]} />
        <meshStandardMaterial color="#2a2028" roughness={0.5} />
      </mesh>
      <pointLight position={[0, 2.7, 0]} intensity={1.5} distance={4} decay={2} color="#ffe0c0" />

      {/* Bar stools */}
      {[-1.0, 0, 1.0].map((x, i) => (
        <group key={`stool-${i}`} position={[x, 0, 0.6]}>
          {/* Stool base */}
          <group>
            <mesh geometry={geos.stoolBase} position={[0, 0.04, 0]} material={toon(metalDark)} />
            <mesh position={[0, 0.04, 0]}>
              <OutlineMesh geometry={geos.stoolBase} scale={1.06} color={outlineColor} />
            </mesh>
          </group>
          {/* Stool post */}
          <group>
            <mesh geometry={geos.stoolPost} position={[0, 0.35, 0]} material={toon(metalLight)} />
            <mesh position={[0, 0.35, 0]}>
              <OutlineMesh geometry={geos.stoolPost} scale={1.06} color={outlineColor} />
            </mesh>
          </group>
          {/* Stool seat */}
          <group>
            <mesh geometry={geos.stoolSeat} position={[0, 0.65, 0]} material={toon('#1a1a28')} />
            <mesh position={[0, 0.65, 0]}>
              <OutlineMesh geometry={geos.stoolSeat} scale={1.03} color={outlineColor} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}

// ───────────────────────── AV CORNER ─────────────────────────
function AVCorner({ position }) {
  const geos = useMemo(() => ({
    rack: new THREE.BoxGeometry(0.6, 2.0, 0.5),
    led: new THREE.BoxGeometry(0.5, 0.02, 0.01),
    monitorFrame: new THREE.BoxGeometry(0.5, 0.35, 0.03),
    monitorScreen: new THREE.BoxGeometry(0.44, 0.29, 0.005),
  }), [])

  return (
    <group position={position}>
      {/* Equipment rack */}
      <group>
        <mesh geometry={geos.rack} position={[0, 1.0, 0]} castShadow material={toon('#0a0a14')} />
        <mesh position={[0, 1.0, 0]}>
          <OutlineMesh geometry={geos.rack} scale={1.03} color={outlineColor} />
        </mesh>
      </group>
      {/* Rack LEDs — keep emissive */}
      {[0.3, 0.7, 1.1, 1.5].map((y, i) => (
        <mesh key={i} geometry={geos.led} position={[0, y, 0.26]}>
          <meshStandardMaterial
            color={i % 2 === 0 ? '#30d158' : '#3B82F6'}
            emissive={i % 2 === 0 ? '#30d158' : '#3B82F6'}
            emissiveIntensity={1}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* Small monitor frame */}
      <group>
        <mesh geometry={geos.monitorFrame} position={[0.6, 1.3, 0]} material={toon('#0a0a10')} />
        <mesh position={[0.6, 1.3, 0]}>
          <OutlineMesh geometry={geos.monitorFrame} scale={1.02} color={outlineColor} />
        </mesh>
      </group>
      {/* Screen surface rendered by AgentScreen */}
    </group>
  )
}

// ───────────────────────── DESK ITEMS ─────────────────────────
function DeskItems({ type, position }) {
  const geos = useMemo(() => ({
    calendar: new THREE.BoxGeometry(0.2, 0.15, 0.01),
    energyCan: new THREE.CylinderGeometry(0.025, 0.025, 0.1, 6),
    phone: new THREE.BoxGeometry(0.06, 0.01, 0.12),
    notepad: new THREE.BoxGeometry(0.12, 0.02, 0.16),
    tablet: new THREE.BoxGeometry(0.18, 0.01, 0.24),
    torus: new THREE.TorusGeometry(0.06, 0.01, 6, 12),
    shaker: new THREE.CylinderGeometry(0.03, 0.04, 0.14, 8),
    clipboard: new THREE.BoxGeometry(0.15, 0.02, 0.2),
    sticky: new THREE.BoxGeometry(0.06, 0.005, 0.06),
    calculator: new THREE.BoxGeometry(0.08, 0.01, 0.12),
    papers: new THREE.BoxGeometry(0.14, 0.03, 0.2),
    bookStack: new THREE.BoxGeometry(0.14, 0.06, 0.2),
    legalPad: new THREE.BoxGeometry(0.12, 0.01, 0.18),
  }), [])

  switch (type) {
    case 'kim': // Calendar + papers
      return (
        <group position={position}>
          <group>
            <mesh geometry={geos.calendar} position={[0.65, 0.82, 0.2]} material={toon('#e8e8f0')} />
            <mesh position={[0.65, 0.82, 0.2]}>
              <OutlineMesh geometry={geos.calendar} scale={1.06} color={outlineColor} />
            </mesh>
          </group>
        </group>
      )
    case 'dev': // Energy drink
      return (
        <group position={position}>
          <group>
            <mesh geometry={geos.energyCan} position={[0.7, 0.83, 0.3]} material={toon('#30d158')} />
            <mesh position={[0.7, 0.83, 0.3]}>
              <OutlineMesh geometry={geos.energyCan} scale={1.06} color={outlineColor} />
            </mesh>
          </group>
        </group>
      )
    case 'marco': // Phone + notepad
      return (
        <group position={position}>
          <group>
            <mesh geometry={geos.phone} position={[0.65, 0.8, 0.3]} material={toon('#1a1a24')} />
            <mesh position={[0.65, 0.8, 0.3]}>
              <OutlineMesh geometry={geos.phone} scale={1.06} color={outlineColor} />
            </mesh>
          </group>
          <group>
            <mesh geometry={geos.notepad} position={[0.5, 0.8, 0.3]} material={toon('#f0f0e0')} />
            <mesh position={[0.5, 0.8, 0.3]}>
              <OutlineMesh geometry={geos.notepad} scale={1.06} color={outlineColor} />
            </mesh>
          </group>
        </group>
      )
    case 'zara': // Tablet + color swatches
      return (
        <group position={position}>
          <group>
            <mesh geometry={geos.tablet} position={[0.6, 0.8, 0.25]} material={toon('#1a1a24')} />
            <mesh position={[0.6, 0.8, 0.25]}>
              <OutlineMesh geometry={geos.tablet} scale={1.06} color={outlineColor} />
            </mesh>
          </group>
        </group>
      )
    case 'riley': // Cables
      return (
        <group position={position}>
          <group>
            <mesh geometry={geos.torus} position={[0.7, 0.8, 0.3]} material={toon('#3a3a48')} />
            <mesh position={[0.7, 0.8, 0.3]}>
              <OutlineMesh geometry={geos.torus} scale={1.06} color={outlineColor} />
            </mesh>
          </group>
        </group>
      )
    case 'dante': // Cocktail shaker
      return (
        <group position={position}>
          <group>
            <mesh geometry={geos.shaker} position={[0.7, 0.85, 0.3]} material={toon('#8a8a98')} />
            <mesh position={[0.7, 0.85, 0.3]}>
              <OutlineMesh geometry={geos.shaker} scale={1.06} color={outlineColor} />
            </mesh>
          </group>
        </group>
      )
    case 'sam': // Clipboard + sticky notes
      return (
        <group position={position}>
          <group>
            <mesh geometry={geos.clipboard} position={[0.6, 0.8, 0.3]} material={toon('#3a2818')} />
            <mesh position={[0.6, 0.8, 0.3]}>
              <OutlineMesh geometry={geos.clipboard} scale={1.06} color={outlineColor} />
            </mesh>
          </group>
          {['#ffb800', '#ff453a', '#30d158'].map((c, i) => (
            <group key={i}>
              <mesh geometry={geos.sticky} position={[0.4 + i * 0.08, 0.81, 0.35]} material={toon(c)} />
            </group>
          ))}
        </group>
      )
    case 'petra': // Calculator + papers
      return (
        <group position={position}>
          <group>
            <mesh geometry={geos.calculator} position={[0.65, 0.8, 0.3]} material={toon('#2a2a34')} />
            <mesh position={[0.65, 0.8, 0.3]}>
              <OutlineMesh geometry={geos.calculator} scale={1.06} color={outlineColor} />
            </mesh>
          </group>
          <group>
            <mesh geometry={geos.papers} position={[0.45, 0.8, 0.25]} material={toon('#e8e8f0')} />
            <mesh position={[0.45, 0.8, 0.25]}>
              <OutlineMesh geometry={geos.papers} scale={1.06} color={outlineColor} />
            </mesh>
          </group>
        </group>
      )
    case 'lex': // Books + legal pad
      return (
        <group position={position}>
          <group>
            <mesh geometry={geos.bookStack} position={[0.6, 0.82, 0.3]} material={toon('#2a2a6a')} />
            <mesh position={[0.6, 0.82, 0.3]}>
              <OutlineMesh geometry={geos.bookStack} scale={1.06} color={outlineColor} />
            </mesh>
          </group>
          <group>
            <mesh geometry={geos.legalPad} position={[0.45, 0.8, 0.3]} material={toon('#f0f0a0')} />
            <mesh position={[0.45, 0.8, 0.3]}>
              <OutlineMesh geometry={geos.legalPad} scale={1.06} color={outlineColor} />
            </mesh>
          </group>
        </group>
      )
    default: // Bruno — clear desk
      return null
  }
}

// ───────────────────────── STANDING DESK ─────────────────────────
function StandingDesk({ position }) {
  const geos = useMemo(() => ({
    desktop: new THREE.BoxGeometry(2.0, 0.06, 0.9),
    leg: new THREE.BoxGeometry(0.06, 1.04, 0.06),
    monitorArm: new THREE.BoxGeometry(0.06, 0.5, 0.06),
    monitorMount: new THREE.BoxGeometry(0.3, 0.06, 0.3),
    screenFrame: new THREE.BoxGeometry(1.2, 0.55, 0.03),
    screenSurface: new THREE.BoxGeometry(1.12, 0.47, 0.005),
  }), [])

  return (
    <group position={position}>
      {/* Desktop surface — higher */}
      <group>
        <mesh geometry={geos.desktop} position={[0, 1.05, 0]} castShadow material={toon(darkWood)} />
        <mesh position={[0, 1.05, 0]}>
          <OutlineMesh geometry={geos.desktop} scale={1.03} color={outlineColor} />
        </mesh>
      </group>
      {/* Telescoping legs */}
      <group>
        <mesh geometry={geos.leg} position={[-0.85, 0.52, 0]} material={toon(metalDark)} />
        <mesh position={[-0.85, 0.52, 0]}>
          <OutlineMesh geometry={geos.leg} scale={1.03} color={outlineColor} />
        </mesh>
      </group>
      <group>
        <mesh geometry={geos.leg} position={[0.85, 0.52, 0]} material={toon(metalDark)} />
        <mesh position={[0.85, 0.52, 0]}>
          <OutlineMesh geometry={geos.leg} scale={1.03} color={outlineColor} />
        </mesh>
      </group>
      {/* Large monitor on arm */}
      <group>
        <mesh geometry={geos.monitorArm} position={[0, 1.35, -0.3]} material={toon(metalDark)} />
        <mesh position={[0, 1.35, -0.3]}>
          <OutlineMesh geometry={geos.monitorArm} scale={1.06} color={outlineColor} />
        </mesh>
      </group>
      <group>
        <mesh geometry={geos.monitorMount} position={[0, 1.6, -0.45]} material={toon(metalDark)} />
        <mesh position={[0, 1.6, -0.45]}>
          <OutlineMesh geometry={geos.monitorMount} scale={1.06} color={outlineColor} />
        </mesh>
      </group>
      {/* Big ultrawide screen frame */}
      <group>
        <mesh geometry={geos.screenFrame} position={[0, 1.65, -0.3]} castShadow material={toon('#0a0a10')} />
        <mesh position={[0, 1.65, -0.3]}>
          <OutlineMesh geometry={geos.screenFrame} scale={1.02} color={outlineColor} />
        </mesh>
      </group>
      {/* Screen surface rendered by AgentScreen */}
    </group>
  )
}

// ───────────────────────── RECEPTION DESK ─────────────────────────
function ReceptionDesk({ position }) {
  const geos = useMemo(() => ({
    body: new THREE.BoxGeometry(2.0, 1.0, 0.7),
    top: new THREE.BoxGeometry(2.1, 0.04, 0.75),
    logo: new THREE.BoxGeometry(0.8, 0.15, 0.01),
  }), [])

  return (
    <group position={position}>
      {/* Desk body */}
      <group>
        <mesh geometry={geos.body} position={[0, 0.5, 0]} castShadow material={toon('#12121e')} />
        <mesh position={[0, 0.5, 0]}>
          <OutlineMesh geometry={geos.body} scale={1.03} color={outlineColor} />
        </mesh>
      </group>
      {/* Top surface */}
      <group>
        <mesh geometry={geos.top} position={[0, 1.02, 0]} material={toon(darkWood)} />
        <mesh position={[0, 1.02, 0]}>
          <OutlineMesh geometry={geos.top} scale={1.03} color={outlineColor} />
        </mesh>
      </group>
      {/* SHIFT logo light on front — keep emissive */}
      <mesh geometry={geos.logo} position={[0, 0.5, 0.36]}>
        <meshStandardMaterial
          color="#7B5CE6"
          emissive="#7B5CE6"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

// ───────────────────────── MAIN EXPORT ─────────────────────────
export default function Furniture() {
  return (
    <group>
      {/* === ROW 1 DESKS — z=-6, chairs at z=-4.5 === */}
      <Desk position={[-18, 0, -6]} />
      <OfficeChair position={[-18, 0.47, -4.5]} rotation={[0, Math.PI, 0]} />
      <DeskItems type="kim" position={[-18, 0, -6]} />

      <Desk position={[-6, 0, -6]} />
      <OfficeChair position={[-6, 0.47, -4.5]} rotation={[0, Math.PI, 0]} />
      <DeskItems type="dev" position={[-6, 0, -6]} />

      <Desk position={[3, 0, -6]} />
      <OfficeChair position={[3, 0.47, -4.5]} rotation={[0, Math.PI, 0]} />
      <DeskItems type="marco" position={[3, 0, -6]} />

      <Desk position={[12, 0, -6]} />
      <OfficeChair position={[12, 0.47, -4.5]} rotation={[0, Math.PI, 0]} />
      <DeskItems type="zara" position={[12, 0, -6]} />

      <Desk position={[19, 0, -6]} />
      <OfficeChair position={[19, 0.47, -4.5]} rotation={[0, Math.PI, 0]} />
      <DeskItems type="sam" position={[19, 0, -6]} />

      {/* === ROW 2 DESKS — z=3, chairs at z=4.5 === */}
      <Desk position={[-18, 0, 3]} />
      <OfficeChair position={[-18, 0.47, 4.5]} rotation={[0, Math.PI, 0]} />
      <DeskItems type="petra" position={[-18, 0, 3]} />

      <Desk position={[-6, 0, 3]} />
      <OfficeChair position={[-6, 0.47, 4.5]} rotation={[0, Math.PI, 0]} />
      <DeskItems type="lex" position={[-6, 0, 3]} />

      <Desk position={[3, 0, 3]} />
      <OfficeChair position={[3, 0.47, 4.5]} rotation={[0, Math.PI, 0]} />
      <DeskItems type="riley" position={[3, 0, 3]} />

      <Desk position={[7, 0, 3]} />
      <OfficeChair position={[7, 0.47, 4.5]} rotation={[0, Math.PI, 0]} />
      <DeskItems type="dante" position={[7, 0, 3]} />

      {/* === BRUNO'S ZONE — Center === */}
      <StandingDesk position={[0, 0, 0]} />

      {/* === CONFERENCE TABLE — Right front === */}
      <ConferenceTable position={[14, 0, 5]} />
      {/* Chairs along near side (z > table center) */}
      <OfficeChair position={[10.5, 0.47, 6.8]} rotation={[0, Math.PI, 0]} />
      <OfficeChair position={[12.5, 0.47, 6.8]} rotation={[0, Math.PI, 0]} />
      <OfficeChair position={[14.5, 0.47, 6.8]} rotation={[0, Math.PI, 0]} />
      <OfficeChair position={[16.5, 0.47, 6.8]} rotation={[0, Math.PI, 0]} />
      {/* Chairs along far side (z < table center) */}
      <OfficeChair position={[10.5, 0.47, 3.2]} rotation={[0, 0, 0]} />
      <OfficeChair position={[12.5, 0.47, 3.2]} rotation={[0, 0, 0]} />
      <OfficeChair position={[14.5, 0.47, 3.2]} rotation={[0, 0, 0]} />
      <OfficeChair position={[16.5, 0.47, 3.2]} rotation={[0, 0, 0]} />
      {/* Head of table chairs */}
      <OfficeChair position={[9.5, 0.47, 5]} rotation={[0, Math.PI / 2, 0]} />
      <OfficeChair position={[18.5, 0.47, 5]} rotation={[0, -Math.PI / 2, 0]} />

      {/* === LOUNGE AREA — Far right === */}
      <Sofa position={[20, 0, 6]} />
      <Sofa position={[21, 0, 2]} rotation={[0, -Math.PI / 2, 0]} />
      <CoffeeTable position={[20, 0, 4]} />

      {/* === BAR AREA — Back center-left === */}
      <BarArea position={[-10, 0, -7]} />

      {/* === AV CORNER — Front left === */}
      <AVCorner position={[-21, 0, 7]} />

      {/* === RECEPTION — Front center === */}
      <ReceptionDesk position={[0, 0, 7]} />

      {/* === BOOKSHELVES — Right wall === */}
      <Bookshelf position={[21, 0, -6]} rotation={[0, -Math.PI / 2, 0]} />
      <Bookshelf position={[21, 0, -2]} rotation={[0, -Math.PI / 2, 0]} />
      <Bookshelf position={[21, 0, 2]} rotation={[0, -Math.PI / 2, 0]} />

      {/* === PLANTS === */}
      <Plant position={[-21, 0, 7]} scale={1.3} />
      <Plant position={[21, 0, 7]} scale={1.1} />
      <Plant position={[-21, 0, -7]} scale={1.0} />
      <Plant position={[10, 0, 7]} scale={1.2} />
      <Plant position={[6, 0, -7]} scale={0.9} />
      <Plant position={[-5, 0, -7]} scale={1.1} />
    </group>
  )
}
