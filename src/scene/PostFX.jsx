import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, SMAA, Vignette, ChromaticAberration, ToneMapping, N8AO } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import { Vector2 } from 'three'
import useStore from '../store/useStore'

export default function PostFX() {
  const vignetteRef = useRef()
  const chromaRef = useRef()

  useFrame(() => {
    const t = useStore.getState().deskTransition

    // Vignette: darkness peaks at t=0.5 (masks camera switch), settles at 0.55 in overview or 0.4 in desk
    if (vignetteRef.current) {
      const peak = Math.sin(Math.min(t, 1) * Math.PI) // 0→1→0 peak at t=0.5
      const baseDarkness = t < 0.5 ? 0.55 : 0.4
      vignetteRef.current.darkness = baseDarkness + peak * 0.5
    }

    // Chromatic aberration spikes during transition
    if (chromaRef.current) {
      const spike = Math.sin(Math.min(t, 1) * Math.PI)
      const base = 0.0004
      const val = base + spike * 0.003
      chromaRef.current.offset.set(val, val)
    }
  })

  return (
    <EffectComposer multisampling={0}>
      <N8AO
        aoRadius={2}
        intensity={1.5}
        distanceFalloff={0.5}
        quality="medium"
      />
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.5}
        luminanceSmoothing={0.4}
        mipmapBlur
      />
      <ChromaticAberration
        ref={chromaRef}
        offset={new Vector2(0.0004, 0.0004)}
        radialModulation
        modulationOffset={0.5}
      />
      <Vignette ref={vignetteRef} offset={0.25} darkness={0.55} />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <SMAA />
    </EffectComposer>
  )
}
