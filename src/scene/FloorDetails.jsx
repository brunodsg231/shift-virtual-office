import * as THREE from 'three'

// Shared geometries — all grid lines of same orientation share one geometry
const vGridGeo = new THREE.BoxGeometry(0.01, 0.001, 18)
const hGridGeo = new THREE.BoxGeometry(50, 0.001, 0.01)
const walkwayGeo = new THREE.BoxGeometry(0.03, 0.001, 16)
const brunoRingGeo = new THREE.RingGeometry(1.8, 1.85, 32)
const confRingGeo = new THREE.RingGeometry(3.5, 3.55, 4)

// Shared materials — each unique visual style gets one material
const gridMat = new THREE.MeshStandardMaterial({
  color: '#1a1a2a',
  emissive: new THREE.Color('#1a1a2a'),
  emissiveIntensity: 0.2,
  transparent: true,
  opacity: 0.3,
})

const brunoZoneMat = new THREE.MeshStandardMaterial({
  color: '#7B5CE6',
  emissive: new THREE.Color('#7B5CE6'),
  emissiveIntensity: 0.3,
  transparent: true,
  opacity: 0.15,
})

const confZoneMat = new THREE.MeshStandardMaterial({
  color: '#7B5CE6',
  emissive: new THREE.Color('#7B5CE6'),
  emissiveIntensity: 0.15,
  transparent: true,
  opacity: 0.1,
})

const walkwayMat = new THREE.MeshStandardMaterial({
  color: '#7B5CE6',
  emissive: new THREE.Color('#7B5CE6'),
  emissiveIntensity: 0.4,
  transparent: true,
  opacity: 0.12,
})

const V_POSITIONS = [-20, -15, -10, -5, 0, 5, 10, 15, 20]
const H_POSITIONS = [-8, -4, 0, 4, 8]

// Subtle floor grid lines and zone markers for premium office feel
export default function FloorDetails() {
  return (
    <group>
      {/* Grid lines — very subtle */}
      {V_POSITIONS.map((x) => (
        <mesh key={`v${x}`} position={[x, 0.005, 0]} geometry={vGridGeo} material={gridMat} />
      ))}
      {H_POSITIONS.map((z) => (
        <mesh key={`h${z}`} position={[0, 0.005, z]} geometry={hGridGeo} material={gridMat} />
      ))}

      {/* Zone markers — subtle purple lines showing team areas */}
      {/* Bruno's area highlight */}
      <mesh position={[0, 0.006, 0.6]} geometry={brunoRingGeo} material={brunoZoneMat} />

      {/* Conference area outline */}
      <mesh position={[14, 0.006, 5]} rotation={[-Math.PI / 2, 0, 0]} geometry={confRingGeo} material={confZoneMat} />

      {/* Walkway accent lines — connecting main areas */}
      <mesh position={[-5, 0.006, 0]} geometry={walkwayGeo} material={walkwayMat} />
    </group>
  )
}
