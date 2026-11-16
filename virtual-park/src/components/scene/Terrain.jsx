import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import {
  PARK_RADIUS,
  PATH_HALF,
  PLAZA_RADIUS,
  STEPPING_STONES,
} from '../../game/layout'
import { Fountain } from './Props'
import Pond from './Pond'

function useGrassTexture() {
  const texture = useMemo(() => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#6d9754'
    ctx.fillRect(0, 0, size, size)

    for (let i = 0; i < 40; i += 1) {
      const x = Math.random() * size
      const y = Math.random() * size
      const r = 4 + Math.random() * 22
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, r)
      const dark = Math.random() > 0.5
      gradient.addColorStop(0, dark ? 'rgba(63, 92, 47, 0.35)' : 'rgba(132, 168, 96, 0.28)')
      gradient.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    for (let i = 0; i < 6000; i += 1) {
      const shade = 60 + Math.random() * 80
      ctx.fillStyle = `rgba(${Math.floor(shade * 0.72)}, ${Math.floor(shade)}, ${Math.floor(shade * 0.52)}, ${0.12 + Math.random() * 0.24})`
      ctx.fillRect(Math.random() * size, Math.random() * size, 1.4, 1.4)
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(16, 16)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    return tex
  }, [])

  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

function Hills() {
  const hills = useMemo(() => {
    const list = []
    for (let i = 0; i < 16; i += 1) {
      const angle = (i / 16) * Math.PI * 2 + 0.2
      const radius = 66 + (i % 4) * 9
      list.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        scale: [16 + (i % 5) * 5, 5 + (i % 3) * 3, 12 + (i % 4) * 4],
        rotation: angle,
        color: i % 2 === 0 ? '#587250' : '#4e6a4d',
      })
    }
    return list
  }, [])

  return (
    <group>
      {hills.map((hill, index) => (
        <mesh
          key={index}
          position={[hill.x, -1.5, hill.z]}
          rotation={[0, hill.rotation, 0]}
          scale={hill.scale}
        >
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={hill.color} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  )
}

function Fence({ shadows }) {
  const segments = useMemo(() => {
    const count = 32
    const radius = PARK_RADIUS - 1
    const posts = []
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2
      const isGate = Math.abs(angle - Math.PI / 2) < 0.11
      if (isGate) continue
      posts.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        rotation: -angle,
      })
    }
    const rails = []
    for (let i = 0; i < count; i += 1) {
      const a1 = (i / count) * Math.PI * 2
      const a2 = ((i + 1) / count) * Math.PI * 2
      if (Math.abs(a1 - Math.PI / 2) < 0.11 || Math.abs(a2 - Math.PI / 2) < 0.11) continue
      const p1 = [Math.cos(a1) * radius, Math.sin(a1) * radius]
      const p2 = [Math.cos(a2) * radius, Math.sin(a2) * radius]
      const dx = p2[0] - p1[0]
      const dz = p2[1] - p1[1]
      rails.push({
        x: (p1[0] + p2[0]) / 2,
        z: (p1[1] + p2[1]) / 2,
        rotation: Math.atan2(dx, dz),
        length: Math.hypot(dx, dz),
      })
    }
    return { posts, rails }
  }, [])

  const wood = '#7c5a3a'
  return (
    <group>
      {segments.posts.map((post, index) => (
        <mesh
          key={`post-${index}`}
          position={[post.x, 0.6, post.z]}
          rotation={[0, post.rotation, 0]}
          castShadow={shadows}
        >
          <boxGeometry args={[0.16, 1.2, 0.16]} />
          <meshStandardMaterial color={wood} roughness={0.9} />
        </mesh>
      ))}
      {segments.rails.map((rail, index) => (
        <group key={`rail-${index}`} position={[rail.x, 0, rail.z]} rotation={[0, rail.rotation, 0]}>
          <mesh position={[0, 1.0, 0]} castShadow={shadows}>
            <boxGeometry args={[0.08, 0.09, rail.length]} />
            <meshStandardMaterial color={wood} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.62, 0]} castShadow={shadows}>
            <boxGeometry args={[0.07, 0.07, rail.length]} />
            <meshStandardMaterial color={wood} roughness={0.9} />
          </mesh>
        </group>
      ))}
      <mesh position={[-2.3, 1.3, PARK_RADIUS - 1]} castShadow={shadows}>
        <boxGeometry args={[0.38, 2.6, 0.38]} />
        <meshStandardMaterial color="#8f8a7c" roughness={0.95} />
      </mesh>
      <mesh position={[2.3, 1.3, PARK_RADIUS - 1]} castShadow={shadows}>
        <boxGeometry args={[0.38, 2.6, 0.38]} />
        <meshStandardMaterial color="#8f8a7c" roughness={0.95} />
      </mesh>
    </group>
  )
}

export default function Terrain({ shadows }) {
  const grass = useGrassTexture()
  const groundRadius = PARK_RADIUS + 10

  return (
    <group>
      <Hills />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[groundRadius, 96]} />
        <meshStandardMaterial map={grass} color="#ffffff" roughness={1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <circleGeometry args={[PLAZA_RADIUS + 0.3, 64]} />
        <meshStandardMaterial color="#c9b78f" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]}>
        <circleGeometry args={[PLAZA_RADIUS, 64]} />
        <meshStandardMaterial color="#dccda9" roughness={0.92} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[PATH_HALF * 2, PARK_RADIUS * 2]} />
        <meshStandardMaterial color="#d9c9a6" roughness={0.94} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.021, 0]} receiveShadow>
        <planeGeometry args={[PARK_RADIUS * 2, PATH_HALF * 2]} />
        <meshStandardMaterial color="#d9c9a6" roughness={0.94} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-PATH_HALF, 0.022, 0]}>
        <planeGeometry args={[0.12, PARK_RADIUS * 2]} />
        <meshStandardMaterial color="#b8a47e" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PATH_HALF, 0.022, 0]}>
        <planeGeometry args={[0.12, PARK_RADIUS * 2]} />
        <meshStandardMaterial color="#b8a47e" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.022, -PATH_HALF]}>
        <planeGeometry args={[PARK_RADIUS * 2, 0.12]} />
        <meshStandardMaterial color="#b8a47e" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.022, PATH_HALF]}>
        <planeGeometry args={[PARK_RADIUS * 2, 0.12]} />
        <meshStandardMaterial color="#b8a47e" roughness={0.95} />
      </mesh>

      {STEPPING_STONES.map((stone, index) => (
        <mesh
          key={index}
          position={[stone.x, 0.045, stone.z]}
          rotation={[0, stone.rotation, 0]}
          receiveShadow
        >
          <cylinderGeometry args={[stone.r, stone.r * 1.05, 0.09, 9]} />
          <meshStandardMaterial color={index % 2 ? '#a9a294' : '#b7b0a0'} roughness={0.95} flatShading />
        </mesh>
      ))}

      <Fence shadows={shadows} />
      <Pond shadows={shadows} />
      <Fountain shadows={shadows} />
    </group>
  )
}
