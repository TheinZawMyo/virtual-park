import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { AVENUE_HALF, AVENUE_LENGTH } from '../../game/layout'

const CITY_GROUND_RADIUS = 120
const AVENUE_CLEAR = AVENUE_HALF + 3

const FACADE_COLORS = ['#8d939b', '#7d838c', '#9aa0a6', '#6f757e', '#a8a196', '#5d646e', '#85909b', '#b0aa9c', '#7a848f', '#94897c']
const ROOF_COLORS = ['#4a4e55', '#565b62', '#43474d', '#5d6168']

function mulberry32(seed) {
  let a = seed
  return function random() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeFacadeTextures(baseColor, rand, repeatX, repeatY) {
  const width = 128
  const height = 256
  const litRand = mulberry32(Math.floor(rand() * 1e9))

  const facade = document.createElement('canvas')
  facade.width = width
  facade.height = height
  const fctx = facade.getContext('2d')
  fctx.fillStyle = baseColor
  fctx.fillRect(0, 0, width, height)

  const glow = document.createElement('canvas')
  glow.width = width
  glow.height = height
  const gctx = glow.getContext('2d')
  gctx.fillStyle = '#000000'
  gctx.fillRect(0, 0, width, height)

  const cols = 4
  const rows = 8
  const cellW = width / cols
  const cellH = height / rows
  const winW = cellW * 0.56
  const winH = cellH * 0.6
  const offX = (cellW - winW) / 2
  const offY = (cellH - winH) / 2

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * cellW + offX
      const y = row * cellH + offY
      const shade = 0.55 + litRand() * 0.35
      fctx.fillStyle = `rgba(${Math.floor(38 * shade)}, ${Math.floor(52 * shade)}, ${Math.floor(68 * shade)}, 0.95)`
      fctx.fillRect(x, y, winW, winH)

      if (litRand() < 0.42) {
        const warm = litRand() < 0.75
        gctx.fillStyle = warm ? '#ffd9a0' : '#cfe4ff'
        gctx.fillRect(x, y, winW, winH)
      }
    }
  }

  const map = new THREE.CanvasTexture(facade)
  map.colorSpace = THREE.SRGBColorSpace
  map.wrapS = THREE.RepeatWrapping
  map.wrapT = THREE.RepeatWrapping
  map.repeat.set(repeatX, repeatY)

  const emissiveMap = new THREE.CanvasTexture(glow)
  emissiveMap.colorSpace = THREE.SRGBColorSpace
  emissiveMap.wrapS = THREE.RepeatWrapping
  emissiveMap.wrapT = THREE.RepeatWrapping
  emissiveMap.repeat.set(repeatX, repeatY)

  return { map, emissiveMap }
}

function generateBuildings() {
  const rand = mulberry32(770421)
  const between = (a, b) => a + rand() * (b - a)
  const list = []

  let attempts = 0
  while (list.length < 54 && attempts < 4000) {
    attempts += 1
    const angle = rand() * Math.PI * 2
    const radius = 62 + rand() * 40
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius

    if (radius < AVENUE_LENGTH + 8 && Math.min(Math.abs(x), Math.abs(z)) < AVENUE_CLEAR) continue

    const w = between(6, 15)
    const d = between(6, 15)
    const h = 10 + rand() * rand() * 50 + (radius > 85 ? between(6, 18) : 0)

    if (list.some((b) => Math.hypot(b.x - x, b.z - z) < (Math.max(b.w, b.d) + Math.max(w, d)) * 0.55)) continue

    list.push({
      x,
      z,
      w,
      d,
      h,
      rotation: between(-0.35, 0.35),
      color: FACADE_COLORS[Math.floor(rand() * FACADE_COLORS.length)],
      roof: ROOF_COLORS[Math.floor(rand() * ROOF_COLORS.length)],
      rooftop: rand() < 0.55,
      seed: Math.floor(rand() * 1e9),
    })
  }

  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2 + 0.35
    const radius = between(104, 114)
    list.push({
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      w: between(9, 16),
      d: between(9, 16),
      h: between(52, 86),
      rotation: between(-0.3, 0.3),
      color: FACADE_COLORS[Math.floor(rand() * FACADE_COLORS.length)],
      roof: ROOF_COLORS[Math.floor(rand() * ROOF_COLORS.length)],
      rooftop: rand() < 0.55,
      seed: Math.floor(rand() * 1e9),
      distant: true,
    })
  }

  return list
}

function Building({ data, shadows, glow }) {
  const textures = useMemo(
    () => makeFacadeTextures(data.color, mulberry32(data.seed), data.w / 8, data.h / 16),
    [data],
  )

  useEffect(() => () => {
    textures.map.dispose()
    textures.emissiveMap.dispose()
  }, [textures])

  return (
    <group position={[data.x, 0, data.z]} rotation={[0, data.rotation, 0]}>
      <mesh position={[0, data.h / 2, 0]} castShadow={shadows} receiveShadow={shadows}>
        <boxGeometry args={[data.w, data.h, data.d]} />
        <meshStandardMaterial
          map={textures.map}
          emissiveMap={textures.emissiveMap}
          emissive="#ffffff"
          emissiveIntensity={0.05 + glow * 0.85}
          roughness={0.86}
          metalness={0.06}
        />
      </mesh>
      <mesh position={[0, data.h + 0.2, 0]} castShadow={shadows}>
        <boxGeometry args={[data.w + 0.4, 0.45, data.d + 0.4]} />
        <meshStandardMaterial color={data.roof} roughness={0.92} />
      </mesh>
      {data.rooftop && (
        <mesh
          position={[data.w * 0.16, data.h + 0.9, -data.d * 0.12]}
          castShadow={shadows}
        >
          <boxGeometry args={[data.w * 0.3, 1.1, data.d * 0.26]} />
          <meshStandardMaterial color="#6d7178" roughness={0.9} />
        </mesh>
      )}
    </group>
  )
}

export default function Skyline({ shadows = false, glow = 0 }) {
  const buildings = useMemo(() => generateBuildings(), [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow={shadows}>
        <circleGeometry args={[CITY_GROUND_RADIUS, 96]} />
        <meshStandardMaterial color="#33363b" roughness={0.97} />
      </mesh>
      {buildings.map((building, index) => (
        <Building key={index} data={building} shadows={shadows} glow={glow} />
      ))}
    </group>
  )
}
