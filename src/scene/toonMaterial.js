import * as THREE from 'three'

const gradientMap = new THREE.DataTexture(
  new Uint8Array([40, 100, 200]),
  3, 1,
  THREE.RedFormat
)
gradientMap.needsUpdate = true

// Cache materials by color key to avoid creating duplicates
const materialCache = new Map()

export function toon(color, emissiveColor) {
  const key = `${color}|${emissiveColor || ''}`
  let mat = materialCache.get(key)
  if (mat) return mat

  mat = new THREE.MeshToonMaterial({
    color: new THREE.Color(color),
    gradientMap,
    emissive: emissiveColor
      ? new THREE.Color(emissiveColor)
      : new THREE.Color(0x000000),
    emissiveIntensity: emissiveColor ? 0.15 : 0,
  })
  materialCache.set(key, mat)
  return mat
}

const lightenCache = new Map()

export function lightenHex(hex, amount) {
  const key = `${hex}|${amount}`
  let result = lightenCache.get(key)
  if (result) return result

  const c = new THREE.Color(hex)
  c.r = Math.min(1, c.r + amount)
  c.g = Math.min(1, c.g + amount)
  c.b = Math.min(1, c.b + amount)
  result = '#' + c.getHexString()
  lightenCache.set(key, result)
  return result
}

export { gradientMap }
