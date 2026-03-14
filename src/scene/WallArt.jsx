// Decorative wall elements — posters, art, and signage
export default function WallArt() {
  const floorD = 20
  const floorW = 52
  const wallT = 0.6

  return (
    <group>
      {/* Back wall — motivational poster frames */}
      {/* Frame 1: Abstract purple art */}
      <group position={[5, 2.5, -floorD / 2 + wallT + 0.01]}>
        <mesh>
          <boxGeometry args={[1.6, 1.2, 0.06]} />
          <meshStandardMaterial color="#1a1a2a" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Canvas */}
        <mesh position={[0, 0, 0.035]}>
          <boxGeometry args={[1.4, 1.0, 0.01]} />
          <meshStandardMaterial
            color="#2a1a4a"
            emissive="#4a2a8a"
            emissiveIntensity={0.08}
          />
        </mesh>
        {/* Accent stripe */}
        <mesh position={[0, -0.2, 0.04]}>
          <boxGeometry args={[0.8, 0.06, 0.005]} />
          <meshStandardMaterial
            color="#7B5CE6"
            emissive="#7B5CE6"
            emissiveIntensity={0.3}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Frame 2: Gradient panel */}
      <group position={[14, 2.5, -floorD / 2 + wallT + 0.01]}>
        <mesh>
          <boxGeometry args={[1.2, 1.2, 0.06]} />
          <meshStandardMaterial color="#1a1a2a" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <boxGeometry args={[1.0, 1.0, 0.01]} />
          <meshStandardMaterial
            color="#1a2a3a"
            emissive="#2a4a6a"
            emissiveIntensity={0.06}
          />
        </mesh>
      </group>

      {/* Left wall — SHIFT values sign */}
      <group position={[-floorW / 2 + wallT + 0.01, 2.8, -6]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[3, 0.6, 0.06]} />
          <meshStandardMaterial color="#0a0a14" roughness={0.3} metalness={0.4} />
        </mesh>
        {/* Glow text effect */}
        <mesh position={[0, 0, 0.035]}>
          <boxGeometry args={[2.6, 0.2, 0.01]} />
          <meshStandardMaterial
            color="#7B5CE6"
            emissive="#7B5CE6"
            emissiveIntensity={0.15}
            transparent
            opacity={0.4}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Left wall — clock area */}
      <group position={[-floorW / 2 + wallT + 0.01, 3.2, 5]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[0.6, 0.6, 0.04]} />
          <meshStandardMaterial color="#1a1a28" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Clock face */}
        <mesh position={[0, 0, 0.025]}>
          <circleGeometry args={[0.25, 16]} />
          <meshStandardMaterial
            color="#0a0a14"
            emissive="#3a3a5a"
            emissiveIntensity={0.1}
          />
        </mesh>
      </group>

      {/* Right wall — whiteboard area */}
      <group position={[floorW / 2 - wallT - 0.01, 2.5, -6]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[4, 2.2, 0.06]} />
          <meshStandardMaterial color="#1a1a2a" roughness={0.5} metalness={0.2} />
        </mesh>
        {/* Whiteboard surface */}
        <mesh position={[0, 0, 0.035]}>
          <boxGeometry args={[3.6, 1.8, 0.01]} />
          <meshStandardMaterial
            color="#1a1a28"
            emissive="#2a2a3a"
            emissiveIntensity={0.04}
          />
        </mesh>
        {/* Tray */}
        <mesh position={[0, -1.0, 0.08]}>
          <boxGeometry args={[3.6, 0.04, 0.12]} />
          <meshStandardMaterial color="#2a2a34" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
    </group>
  )
}
