import { useMemo } from 'react'
import {
  AVENUE_HALF,
  AVENUE_LENGTH,
  RING_ROAD,
} from '../../game/layout'

const ASPHALT = '#43464b'
const LANE = '#e6e2d0'
const CURB = '#8d8a82'
const SIDEWALK = '#a9a49a'

function RingRoad() {
  const dashes = useMemo(() => {
    const list = []
    const count = 72
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2
      list.push({
        angle,
        x: Math.cos(angle) * RING_ROAD.center,
        z: Math.sin(angle) * RING_ROAD.center,
      })
    }
    return list
  }, [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <ringGeometry args={[RING_ROAD.outer, RING_ROAD.sidewalk, 128]} />
        <meshStandardMaterial color={SIDEWALK} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 0]} receiveShadow>
        <ringGeometry args={[RING_ROAD.inner, RING_ROAD.outer, 128]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]}>
        <ringGeometry args={[RING_ROAD.inner - 0.35, RING_ROAD.inner, 128]} />
        <meshStandardMaterial color={CURB} roughness={0.95} />
      </mesh>
      {dashes.map((dash, index) => (
        <mesh
          key={index}
          position={[dash.x, 0.018, dash.z]}
          rotation={[0, -(dash.angle + Math.PI / 2), 0]}
        >
          <boxGeometry args={[2.4, 0.02, 0.16]} />
          <meshStandardMaterial color={LANE} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function Avenue({ angle, from }) {
  const length = AVENUE_LENGTH - from
  const mid = (from + AVENUE_LENGTH) / 2

  const dashes = useMemo(() => {
    const list = []
    for (let x = from + 4; x < AVENUE_LENGTH - 2; x += 6.5) list.push(x)
    return list
  }, [from])

  return (
    <group rotation={[0, -angle, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[mid, 0.016, 0]} receiveShadow>
        <planeGeometry args={[length, AVENUE_HALF * 2]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[mid, 0.017, AVENUE_HALF - 0.45]}>
        <planeGeometry args={[length, 0.14]} />
        <meshStandardMaterial color={LANE} roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[mid, 0.017, -(AVENUE_HALF - 0.45)]}>
        <planeGeometry args={[length, 0.14]} />
        <meshStandardMaterial color={LANE} roughness={0.9} />
      </mesh>
      {dashes.map((x) => (
        <mesh key={x} position={[x, 0.019, 0]}>
          <boxGeometry args={[2.4, 0.02, 0.16]} />
          <meshStandardMaterial color={LANE} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export default function Roads() {
  const gateStart = RING_ROAD.inner - 4.5

  return (
    <group>
      <RingRoad />
      <Avenue angle={0} from={RING_ROAD.inner} />
      <Avenue angle={Math.PI} from={RING_ROAD.inner} />
      <Avenue angle={-Math.PI / 2} from={RING_ROAD.inner} />
      <Avenue angle={Math.PI / 2} from={gateStart} />
    </group>
  )
}
