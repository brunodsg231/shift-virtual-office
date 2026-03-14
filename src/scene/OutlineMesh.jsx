import * as THREE from 'three'

// Cache outline materials by color — almost all outlines share the same color
const outlineMaterials = new Map()

function getOutlineMaterial(color) {
  let mat = outlineMaterials.get(color)
  if (!mat) {
    mat = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide })
    outlineMaterials.set(color, mat)
  }
  return mat
}

export default function OutlineMesh({
  geometry,
  scale = 1.04,
  color = '#080810',
}) {
  return (
    <mesh geometry={geometry} scale={scale} material={getOutlineMaterial(color)} />
  )
}
