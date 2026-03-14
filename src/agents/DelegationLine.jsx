import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 12

export default function DelegationLine({ from, to, fromColor, toColor, timestamp }) {
  const lineRef = useRef()
  const particlesRef = useRef()

  const { positions, colors, curve } = useMemo(() => {
    const start = new THREE.Vector3(from[0], 2, from[2])
    const end = new THREE.Vector3(to[0], 2, to[2])
    const mid = new THREE.Vector3(
      (from[0] + to[0]) / 2,
      4.5,
      (from[2] + to[2]) / 2
    )

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
    const points = curve.getPoints(32)

    const posArray = new Float32Array(points.length * 3)
    const colArray = new Float32Array(points.length * 3)
    const c1 = new THREE.Color(fromColor)
    const c2 = new THREE.Color(toColor)

    for (let i = 0; i < points.length; i++) {
      posArray[i * 3] = points[i].x
      posArray[i * 3 + 1] = points[i].y
      posArray[i * 3 + 2] = points[i].z

      const t = i / (points.length - 1)
      const mixed = c1.clone().lerp(c2, t)
      colArray[i * 3] = mixed.r
      colArray[i * 3 + 1] = mixed.g
      colArray[i * 3 + 2] = mixed.b
    }

    return { positions: posArray, colors: colArray, curve }
  }, [from, to, fromColor, toColor])

  // Particle positions along the curve
  const particlePositions = useMemo(() => {
    return new Float32Array(PARTICLE_COUNT * 3)
  }, [])

  const particleSizes = useMemo(() => {
    return new Float32Array(PARTICLE_COUNT).fill(0.08)
  }, [])

  useFrame(({ clock }) => {
    const age = (Date.now() - timestamp) / 1000
    const opacity = Math.max(0, 1 - age / 4)

    if (lineRef.current) {
      lineRef.current.material.opacity = opacity
    }

    // Animate particles traveling along the curve
    if (particlesRef.current) {
      const t = clock.elapsedTime
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const progress = ((t * 0.8 + i / PARTICLE_COUNT) % 1)
        const point = curve.getPoint(progress)
        particlePositions[i * 3] = point.x
        particlePositions[i * 3 + 1] = point.y
        particlePositions[i * 3 + 2] = point.z
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
      particlesRef.current.material.opacity = opacity * 0.8
    }
  })

  return (
    <group>
      {/* Main arc line */}
      <line ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={1}
          linewidth={1}
        />
      </line>

      {/* Traveling particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={PARTICLE_COUNT}
            array={particlePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={PARTICLE_COUNT}
            array={particleSizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color={fromColor}
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
    </group>
  )
}
