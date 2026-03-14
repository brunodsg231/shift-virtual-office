import { Environment } from '@react-three/drei'

// Agent desk positions for focused desk lights
const DESK_LIGHTS = [
  [-20, 2.5, -7],
  [-15, 2.5, -7],
  [-20, 2.5, -1],
  [-15, 2.5, -1],
  [-20, 2.5, 6],
  [-15, 2.5, 6],
  [-8, 2.5, 6],
  [0, 2.5, 0],
  [16, 2.5, -8],
  [16, 2.5, 5],
]

export default function SceneLighting() {
  return (
    <>
      {/* Environment map for IBL reflections */}
      <Environment preset="night" />

      {/* Ambient — base visibility for everything */}
      <ambientLight color="#5a5a7a" intensity={1.2} />

      {/* Key light — slightly warm, strong */}
      <directionalLight
        position={[30, 40, 20]}
        intensity={3.0}
        color="#e8e4ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0005}
      />

      {/* Fill from left */}
      <directionalLight
        position={[-25, 30, 15]}
        intensity={1.8}
        color="#b0b0e0"
      />

      {/* Back rim light for depth */}
      <directionalLight
        position={[0, 20, -30]}
        intensity={0.8}
        color="#8888cc"
      />

      {/* Ceiling RectAreaLights — bright panels simulating office lights */}
      <rectAreaLight
        position={[-16, 4.3, -4]}
        width={10}
        height={4}
        intensity={6}
        color="#e8e4ff"
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <rectAreaLight
        position={[-16, 4.3, 6]}
        width={10}
        height={4}
        intensity={6}
        color="#e8e4ff"
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <rectAreaLight
        position={[14, 4.3, -8]}
        width={8}
        height={5}
        intensity={5}
        color="#e0e0ff"
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <rectAreaLight
        position={[14, 4.3, 5]}
        width={8}
        height={5}
        intensity={4}
        color="#ffe8e0"
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Desk-focused point lights — warm spots */}
      {DESK_LIGHTS.map((pos, i) => (
        <pointLight
          key={i}
          position={pos}
          intensity={2.5}
          distance={8}
          decay={2}
          color="#ffe8d0"
        />
      ))}

      {/* Accent purple spot on Bruno's area */}
      <spotLight
        position={[0, 5, 0]}
        angle={0.5}
        penumbra={0.8}
        intensity={3}
        color="#7B5CE6"
        distance={10}
        decay={2}
      />

      {/* Bar area warm light */}
      <pointLight
        position={[-10, 3, -13]}
        intensity={2}
        distance={6}
        decay={2}
        color="#ffe0c0"
      />
    </>
  )
}
