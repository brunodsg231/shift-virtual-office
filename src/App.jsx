import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import Room from './scene/Room'
import SceneLighting from './scene/SceneLighting'
import Furniture from './scene/Furniture'
import LEDWall from './scene/LEDWall'
import FloorDetails from './scene/FloorDetails'
import PostFX from './scene/PostFX'
import CameraIntro from './scene/CameraIntro'
import DustParticles from './scene/DustParticles'
import WallArt from './scene/WallArt'
import AgentGroup from './agents/AgentGroup'
import AgentMovement from './scene/AgentMovement'
import CameraSystem from './scene/CameraSystem'
import DeskEnvironment from './scene/DeskEnvironment'
import TopBar from './ui/TopBar'
import ChatBar from './ui/ChatBar'
import ActivityFeed from './ui/ActivityFeed'
import TaskBoard from './ui/TaskBoard'
import StandupMode from './ui/StandupMode'
import NotificationSystem from './ui/NotificationSystem'
import KeyboardShortcuts from './ui/KeyboardShortcuts'
import AgentDetailPanel from './ui/AgentDetailPanel'
import MiniMap from './ui/MiniMap'
import SettingsPanel from './ui/SettingsPanel'
import ConnectionStatus from './ui/ConnectionStatus'
import AgentStatusDashboard from './ui/AgentStatusDashboard'
import CommandPalette from './ui/CommandPalette'
import AmbientSound from './ui/AmbientSound'
import DeskPOVOverlay from './ui/DeskPOVOverlay'
import LoadingScreen from './ui/LoadingScreen'
import useStore from './store/useStore'

export default function App() {
  const cameraMode = useStore((s) => s.cameraMode)
  const isDesk = cameraMode === 'desk'
  return (
    <>
      <Canvas
        orthographic
        camera={{ zoom: 18, position: [50, 40, 50], near: 0.1, far: 500 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        shadows
        dpr={[1, 2]}
        style={{ background: '#04040c' }}
      >
        <color attach="background" args={['#04040c']} />
        <fog attach="fog" args={['#04040c', 60, 120]} />

        <Suspense fallback={null}>
          <group scale={1.1}>
            <SceneLighting />
            <Room />
            <Furniture />
            <LEDWall />
            <FloorDetails />
            <AgentGroup />
            <AgentMovement />
            <DeskEnvironment />
            <DustParticles />
            <WallArt />
            <ContactShadows
              position={[0, 0.01, 0]}
              opacity={0.4}
              scale={60}
              blur={2}
              far={4}
              resolution={512}
              color="#000010"
            />
          </group>
        </Suspense>

        <CameraSystem />

        <OrbitControls
          enabled={!isDesk}
          enableRotate={!isDesk}
          minAzimuthAngle={-Math.PI / 6}
          maxAzimuthAngle={Math.PI / 6}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI * 81.8 / 180}
          enablePan={false}
          enableZoom={!isDesk}
          minZoom={9}
          maxZoom={54}
          target={[0, 1, 0]}
          enableDamping
          dampingFactor={0.06}
        />
        <CameraIntro />
        <PostFX />
      </Canvas>
      <TopBar />
      <ChatBar />
      <ActivityFeed />
      <TaskBoard />
      <StandupMode />
      <NotificationSystem />
      <KeyboardShortcuts />
      <AgentDetailPanel />
      <MiniMap />
      <SettingsPanel />
      <ConnectionStatus />
      <AgentStatusDashboard />
      <CommandPalette />
      <DeskPOVOverlay />
      <AmbientSound />
      <LoadingScreen />
    </>
  )
}
