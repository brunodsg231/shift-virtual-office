import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 60

export default function DustParticles() {
  const meshRef = useRef()

  const { positions, speeds, offsets } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const speeds = new Float32Array(PARTICLE_COUNT)
    const offsets = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 48
      positions[i * 3 + 1] = 0.5 + Math.random() * 3.5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 28
      speeds[i] = 0.1 + Math.random() * 0.3
      offsets[i] = Math.random() * Math.PI * 2
    }

    return { positions, speeds, offsets }
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = positions[i * 3] + Math.sin(t * speeds[i] + offsets[i]) * 0.5
      const y = positions[i * 3 + 1] + Math.sin(t * 0.2 + offsets[i]) * 0.3
      const z = positions[i * 3 + 2] + Math.cos(t * speeds[i] * 0.7 + offsets[i]) * 0.5

      dummy.position.set(x, y, z)
      const s = 0.01 + Math.sin(t * 0.5 + offsets[i]) * 0.005
      dummy.scale.set(s, s, s)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshStandardMaterial
        color="#e8e4ff"
        emissive="#e8e4ff"
        emissiveIntensity={0.3}
        transparent
        opacity={0.15}
      />
    </instancedMesh>
  )
}
