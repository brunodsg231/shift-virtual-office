import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { gradientMap } from './toonMaterial'

/* ── Room dimensions ─────────────────────────────── */
const roomW   = 52     // full width (X)
const roomD   = 20     // full depth (Z)
const cornerR = 3.5    // corner radius
const wallT   = 0.6    // wall thickness
const wallH   = 5.5    // full wall height

/* ── Derived inner dimensions ────────────────────── */
const innerR = Math.max(0.1, cornerR - wallT)
const innerW = roomW - 2 * wallT
const innerD = roomD - 2 * wallT
const halfW  = roomW / 2
const halfD  = roomD / 2
const iHW    = innerW / 2
const iHD    = innerD / 2

/* ── Shape helper (rounded rectangle — used for floor) ── */
function makeRoundedRect(w, h, r, asShape) {
  const s = asShape ? new THREE.Shape() : new THREE.Path()
  const hw = w / 2, hh = h / 2
  s.moveTo(-hw + r, -hh)
  s.lineTo( hw - r, -hh)
  s.quadraticCurveTo( hw, -hh,  hw, -hh + r)
  s.lineTo( hw,  hh - r)
  s.quadraticCurveTo( hw,  hh,  hw - r,  hh)
  s.lineTo(-hw + r,  hh)
  s.quadraticCurveTo(-hw,  hh, -hw,  hh - r)
  s.lineTo(-hw, -hh + r)
  s.quadraticCurveTo(-hw, -hh, -hw + r, -hh)
  return s
}

/* ── 3-sided wall shape (back + left + right, NO front wall) ── */
// U-shaped cross-section with all 4 rounded corners kept.
// Only the straight front section is removed.
// Shape coords: X = scene X, Shape Y = scene -Z
// Shape -Y = scene +Z = front (camera side, open)
function makeThreeWallShape() {
  const shape = new THREE.Shape()
  const hw = halfW, hd = halfD, r = cornerR

  // Outer boundary (counterclockwise) — start at front-right curve end
  shape.moveTo(hw - r, -hd)
  // Front-right curve (up to right wall)
  shape.quadraticCurveTo(hw, -hd, hw, -hd + r)
  // Right wall
  shape.lineTo(hw, hd - r)
  // Back-right curve
  shape.quadraticCurveTo(hw, hd, hw - r, hd)
  // Back wall
  shape.lineTo(-hw + r, hd)
  // Back-left curve
  shape.quadraticCurveTo(-hw, hd, -hw, hd - r)
  // Left wall
  shape.lineTo(-hw, -hd + r)
  // Front-left curve (down to front edge)
  shape.quadraticCurveTo(-hw, -hd, -hw + r, -hd)

  // Step inward at front-left to inner path
  shape.lineTo(-iHW + innerR, -iHD)

  // Inner boundary (clockwise) — all 4 inner curves
  // Front-left inner curve (up to inner left wall)
  shape.quadraticCurveTo(-iHW, -iHD, -iHW, -iHD + innerR)
  // Inner left wall
  shape.lineTo(-iHW, iHD - innerR)
  // Inner back-left curve
  shape.quadraticCurveTo(-iHW, iHD, -iHW + innerR, iHD)
  // Inner back wall
  shape.lineTo(iHW - innerR, iHD)
  // Inner back-right curve
  shape.quadraticCurveTo(iHW, iHD, iHW, iHD - innerR)
  // Inner right wall
  shape.lineTo(iHW, -iHD + innerR)
  // Front-right inner curve (down to inner front edge)
  shape.quadraticCurveTo(iHW, -iHD, iHW - innerR, -iHD)

  // Step outward at front-right to close
  shape.lineTo(hw - r, -hd)

  return shape
}

/* ── Wall geometry ─────────────────────────────── */
const wallGeo = new THREE.ExtrudeGeometry(makeThreeWallShape(), {
  depth: wallH,
  bevelEnabled: false,
})

/* ── Floor geometry (inner rounded rect) ─────────── */
const floorShape = makeRoundedRect(innerW, innerD, innerR, true)
const floorGeo   = new THREE.ShapeGeometry(floorShape)

/* ── LED strip: open path along inner wall with all 4 curves ─── */
function makeThreeSidedPath() {
  const p = new THREE.Path()
  // Start at inner front-right curve end, trace all 4 curves, skip front straight
  p.moveTo(iHW - innerR, -iHD)
  // Front-right inner curve
  p.quadraticCurveTo(iHW, -iHD, iHW, -iHD + innerR)
  // Right wall
  p.lineTo(iHW, iHD - innerR)
  // Back-right inner curve
  p.quadraticCurveTo(iHW, iHD, iHW - innerR, iHD)
  // Back wall
  p.lineTo(-iHW + innerR, iHD)
  // Back-left inner curve
  p.quadraticCurveTo(-iHW, iHD, -iHW, iHD - innerR)
  // Left wall
  p.lineTo(-iHW, -iHD + innerR)
  // Front-left inner curve
  p.quadraticCurveTo(-iHW, -iHD, -iHW + innerR, -iHD)
  return p
}

class WallPathCurve extends THREE.Curve {
  constructor(path2d, y) {
    super()
    this.path2d = path2d
    this.y = y
  }
  getPoint(t) {
    const pt = this.path2d.getPoint(t)
    return new THREE.Vector3(pt.x, this.y, -pt.y)
  }
}

const ledPath = makeThreeSidedPath()

// Base LED: 3-sided at floor level, open ends
const baseLedGeo = new THREE.TubeGeometry(
  new WallPathCurve(ledPath, 0.08), 128, 0.04, 8, false
)

// Top LED: 3-sided at wall height, open ends
const topLedGeo = new THREE.TubeGeometry(
  new WallPathCurve(ledPath, wallH - 0.1), 128, 0.04, 8, false
)

/* ── Shared materials ────────────────────────────── */
const wallMat = new THREE.MeshToonMaterial({
  color: new THREE.Color('#12082a'),
  gradientMap,
})

const ledMat = new THREE.MeshStandardMaterial({
  color: '#7B5CE6',
  emissive: new THREE.Color('#7B5CE6'),
  emissiveIntensity: 2.0,
  toneMapped: false,
})

/* ── Component ───────────────────────────────────── */
export default function Room() {
  return (
    <group>
      {/* Reflective floor — rounded inner shape */}
      <mesh
        geometry={floorGeo}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={0.6}
          roughness={0.2}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#121220"
          metalness={0.6}
          mirror={0.5}
        />
      </mesh>

      {/* Back + side walls — 3 sides, front completely open */}
      <mesh
        geometry={wallGeo}
        rotation={[-Math.PI / 2, 0, 0]}
        material={wallMat}
        castShadow
      />

      {/* LED base strip — 3 sides, open at front */}
      <mesh geometry={baseLedGeo} material={ledMat} />

      {/* LED top strip — 3 sides at wall height */}
      <mesh geometry={topLedGeo} material={ledMat} />

      {/* SHIFT logo glow on back wall */}
      <mesh position={[-8, 2.8, -(roomD / 2) + wallT]}>
        <boxGeometry args={[5, 1, 0.04]} />
        <meshStandardMaterial
          color="#7B5CE6"
          emissive="#7B5CE6"
          emissiveIntensity={0.8}
          transparent
          opacity={0.12}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
