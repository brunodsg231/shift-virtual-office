import { useEffect, useRef } from 'react'

// Creates a subtle ambient office hum using Web Audio API
// No external files needed — generates procedural ambience

export default function AmbientSound() {
  const ctxRef = useRef(null)
  const startedRef = useRef(false)

  useEffect(() => {
    const startAudio = () => {
      if (startedRef.current) return
      if (window.__shiftSettings?.ambientSound === false) return

      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        ctxRef.current = ctx

        // Master gain (very quiet)
        const master = ctx.createGain()
        master.gain.value = 0.015
        master.connect(ctx.destination)

        // Low hum — filtered noise
        const bufferSize = 2 * ctx.sampleRate
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1
        }

        const noise = ctx.createBufferSource()
        noise.buffer = noiseBuffer
        noise.loop = true

        // Bandpass filter — office AC/ventilation vibe
        const filter = ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.value = 180
        filter.Q.value = 0.5

        noise.connect(filter)
        filter.connect(master)
        noise.start()

        // Very subtle high-frequency hiss (electronics)
        const hissBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const hissData = hissBuffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          hissData[i] = Math.random() * 2 - 1
        }

        const hiss = ctx.createBufferSource()
        hiss.buffer = hissBuffer
        hiss.loop = true

        const hissFilter = ctx.createBiquadFilter()
        hissFilter.type = 'highpass'
        hissFilter.frequency.value = 4000

        const hissGain = ctx.createGain()
        hissGain.gain.value = 0.3

        hiss.connect(hissFilter)
        hissFilter.connect(hissGain)
        hissGain.connect(master)
        hiss.start()

        startedRef.current = true
      } catch {
        // Web Audio not available
      }
    }

    // Start on first user interaction (browser policy)
    const events = ['click', 'keydown', 'touchstart']
    events.forEach((e) => window.addEventListener(e, startAudio, { once: true }))

    return () => {
      events.forEach((e) => window.removeEventListener(e, startAudio))
      if (ctxRef.current?.state !== 'closed') {
        ctxRef.current?.close()
      }
    }
  }, [])

  return null
}
