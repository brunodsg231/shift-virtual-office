import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Large display screen — animated with data visualization aesthetic
export default function LEDWall() {
  const screenRef = useRef()
  const barRefs = useRef([])

  // Data visualization bars on screen
  const bars = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      x: -2 + i * 0.38,
      baseHeight: 0.3 + Math.random() * 0.8,
      speed: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
    })),
    []
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (screenRef.current) {
      screenRef.current.material.emissiveIntensity = 0.18 + Math.sin(t * 0.3) * 0.04
    }
    // Animate bars
    barRefs.current.forEach((ref, i) => {
      if (ref) {
        const bar = bars[i]
        const h = bar.baseHeight + Math.sin(t * bar.speed + bar.phase) * 0.3
        ref.scale.y = Math.max(0.1, h)
        ref.position.y = h * 0.5 - 0.6
      }
    })
  })

  return (
    <group position={[16, 2.8, -15.5]}>
      {/* Screen frame — sleek bezel */}
      <mesh castShadow>
        <boxGeometry args={[5, 2.8, 0.12]} />
        <meshStandardMaterial color="#0a0a10" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Screen surface */}
      <mesh ref={screenRef} position={[0, 0, 0.065]}>
        <boxGeometry args={[4.6, 2.4, 0.01]} />
        <meshStandardMaterial
          color="#0a1228"
          emissive="#1a3058"
          emissiveIntensity={0.2}
          roughness={0}
          metalness={0.3}
        />
      </mesh>

      {/* Animated data bars on screen */}
      {bars.map((bar, i) => (
        <mesh
          key={i}
          ref={(el) => (barRefs.current[i] = el)}
          position={[bar.x, 0, 0.075]}
        >
          <boxGeometry args={[0.2, 1, 0.005]} />
          <meshStandardMaterial
            color="#7B5CE6"
            emissive="#7B5CE6"
            emissiveIntensity={0.4}
            transparent
            opacity={0.6}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Status bar — bottom */}
      <mesh position={[0, -1.1, 0.075]}>
        <boxGeometry args={[4.6, 0.06, 0.005]} />
        <meshStandardMaterial
          color="#7B5CE6"
          emissive="#7B5CE6"
          emissiveIntensity={0.6}
          toneMapped={false}
        />
      </mesh>

      {/* SHIFT logo glow on screen — top left */}
      <mesh position={[-1.7, 0.95, 0.075]}>
        <boxGeometry args={[0.8, 0.15, 0.005]} />
        <meshStandardMaterial
          color="#7B5CE6"
          emissive="#7B5CE6"
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
          toneMapped={false}
        />
      </mesh>

      {/* Thin mounting bracket */}
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[0.3, 0.3, 0.15]} />
        <meshStandardMaterial color="#1a1a24" roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  )
}
