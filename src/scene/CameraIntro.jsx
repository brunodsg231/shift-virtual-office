import { useRef, useState, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'

export default function CameraIntro() {
  const { camera, size } = useThree()
  const isMobile = size.width < 768
  const startZoom = isMobile ? 6 : 9
  const targetZoom = isMobile ? 12 : 18
  const duration = 2.5 // seconds
  const delay = 2.0 // wait for loading screen

  const progressRef = useRef(0)
  const startedRef = useRef(false)
  const startTimeRef = useRef(0)

  useEffect(() => {
    // Set initial zoom (zoomed out)
    camera.zoom = startZoom
    camera.updateProjectionMatrix()
  }, [])

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime

    if (!startedRef.current) {
      if (elapsed > delay) {
        startedRef.current = true
        startTimeRef.current = elapsed
      }
      return
    }

    const t = Math.min((elapsed - startTimeRef.current) / duration, 1)
    if (t >= 1) return

    // Ease out cubic
    const eased = 1 - Math.pow(1 - t, 3)
    camera.zoom = startZoom + (targetZoom - startZoom) * eased
    camera.updateProjectionMatrix()
  })

  return null
}
