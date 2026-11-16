import { useMemo } from 'react'
import { Instance, Instances, MeshDistortMaterial } from '@react-three/drei'
import { POND } from '../../game/layout'

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

export default function Pond({ shadows }) {
  const { reeds, pads } = useMemo(() => {
    const rand = mulberry32(424242)
    const reeds = []
    const pads = []

    for (let i = 0; i < 90; i += 1) {
      const angle = rand() * Math.PI * 2
      const radius = POND.r + 0.15 + rand() * 0.9
      reeds.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        height: 0.7 + rand() * 1.1,
        lean: (rand() - 0.5) * 0.18,
        rotation: rand() * Math.PI,
      })
    }

    for (let i = 0; i < 11; i += 1) {
      const angle = rand() * Math.PI * 2
      const radius = Math.sqrt(rand()) * (POND.r - 1.6)
      pads.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        scale: 0.45 + rand() * 0.5,
        rotation: rand() * Math.PI,
        lotus: rand() > 0.55,
      })
    }

    return { reeds, pads }
  }, [])

  return (
    <group position={[POND.x, 0, POND.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <ringGeometry args={[POND.r - 0.15, POND.r + 0.85, 64]} />
        <meshStandardMaterial color="#9b9a8b" roughness={0.98} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <circleGeometry args={[POND.r, 72]} />
        <MeshDistortMaterial
          color="#3f8298"
          roughness={0.08}
          metalness={0.35}
          transparent
          opacity={0.93}
          distort={0.06}
          speed={0.9}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
        <circleGeometry args={[POND.r - 0.1, 48]} />
        <meshStandardMaterial color="#2f6376" roughness={0.6} transparent opacity={0.55} />
      </mesh>

      <Instances limit={reeds.length} castShadow={shadows}>
        <coneGeometry args={[0.045, 1, 5]} />
        <meshStandardMaterial color="#5e7c43" roughness={0.95} side={2} />
        {reeds.map((reed, index) => (
          <Instance
            key={index}
            position={[reed.x, (reed.height / 2) * 0.95, reed.z]}
            rotation={[reed.lean, reed.rotation, reed.lean * 0.6]}
            scale={[1, reed.height, 1]}
          />
        ))}
      </Instances>

      {pads.map((pad, index) => (
        <group key={index} position={[pad.x, 0.085, pad.z]} rotation={[0, pad.rotation, 0]}>
          <mesh>
            <cylinderGeometry args={[pad.scale, pad.scale, 0.02, 10]} />
            <meshStandardMaterial color={index % 2 ? '#5a9448' : '#4c8440'} roughness={0.8} />
          </mesh>
          {pad.lotus && (
            <group position={[pad.scale * 0.25, 0.07, 0]}>
              <mesh>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial color="#f3bfcc" roughness={0.7} />
              </mesh>
              <mesh position={[0, 0.09, 0]}>
                <sphereGeometry args={[0.06, 8, 6]} />
                <meshStandardMaterial color="#f7e2a1" roughness={0.6} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  )
}
