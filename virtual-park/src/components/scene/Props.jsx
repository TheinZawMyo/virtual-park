import { useMemo } from 'react'
import * as THREE from 'three'
import { MeshDistortMaterial } from '@react-three/drei'
import { BOARD, FOUNTAIN, PAGODA } from '../../game/layout'

const METAL = '#39413d'
const WOOD = '#8a5b3a'
const WOOD_LIGHT = '#9c6a45'
const STONE = '#a7a294'
const WATER = '#4f93a8'
const GOLD = '#d8a527'
const GOLD_DARK = '#b8861c'
const GOLD_LIGHT = '#f1cd55'

export function Bench({ bench, shadows }) {
  return (
    <group position={[bench.x, 0, bench.z]} rotation={[0, bench.rotation, 0]}>
      {[-0.58, 0.58].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.23, 0.16]} castShadow={shadows}>
            <boxGeometry args={[0.09, 0.46, 0.1]} />
            <meshStandardMaterial color={METAL} roughness={0.55} metalness={0.4} />
          </mesh>
          <mesh position={[x, 0.23, -0.26]} castShadow={shadows}>
            <boxGeometry args={[0.09, 0.46, 0.1]} />
            <meshStandardMaterial color={METAL} roughness={0.55} metalness={0.4} />
          </mesh>
          <mesh position={[x, 0.72, -0.34]} rotation={[-0.14, 0, 0]} castShadow={shadows}>
            <boxGeometry args={[0.08, 0.64, 0.08]} />
            <meshStandardMaterial color={METAL} roughness={0.55} metalness={0.4} />
          </mesh>
          <mesh position={[x, 0.68, 0.02]} castShadow={shadows}>
            <boxGeometry args={[0.08, 0.07, 0.62]} />
            <meshStandardMaterial color={METAL} roughness={0.6} metalness={0.35} />
          </mesh>
        </group>
      ))}

      {[-0.2, 0, 0.2].map((z) => (
        <mesh key={z} position={[0, 0.47, z]} castShadow={shadows} receiveShadow>
          <boxGeometry args={[1.42, 0.06, 0.17]} />
          <meshStandardMaterial color={WOOD_LIGHT} roughness={0.85} />
        </mesh>
      ))}
      {[0.62, 0.84].map((y) => (
        <mesh key={y} position={[0, y, -0.355]} rotation={[-0.14, 0, 0]} castShadow={shadows}>
          <boxGeometry args={[1.42, 0.15, 0.06]} />
          <meshStandardMaterial color={WOOD} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

export function Lamppost({ lamp, shadows, lampIntensity }) {
  return (
    <group position={[lamp.x, 0, lamp.z]}>
      <mesh position={[0, 0.08, 0]} castShadow={shadows}>
        <cylinderGeometry args={[0.2, 0.24, 0.16, 8]} />
        <meshStandardMaterial color={METAL} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow={shadows}>
        <cylinderGeometry args={[0.06, 0.1, 2.9, 8]} />
        <meshStandardMaterial color={METAL} roughness={0.55} metalness={0.45} />
      </mesh>
      <mesh position={[0, 2.98, 0]} castShadow={shadows}>
        <cylinderGeometry args={[0.18, 0.13, 0.2, 8]} />
        <meshStandardMaterial color={METAL} roughness={0.55} metalness={0.45} />
      </mesh>
      <mesh position={[0, 3.22, 0]}>
        <boxGeometry args={[0.32, 0.38, 0.32]} />
        <meshStandardMaterial
          color="#ffe7b0"
          emissive="#ffc76e"
          emissiveIntensity={0.35 + lampIntensity * 1.6}
          roughness={0.35}
          transparent
          opacity={0.94}
        />
      </mesh>
      <mesh position={[0, 3.47, 0]} rotation={[0, Math.PI / 4, 0]} castShadow={shadows}>
        <coneGeometry args={[0.29, 0.18, 4]} />
        <meshStandardMaterial color={METAL} roughness={0.55} metalness={0.45} />
      </mesh>
      <mesh position={[0, 3.58, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color={METAL} roughness={0.5} metalness={0.5} />
      </mesh>
      <pointLight
        position={[0, 3.15, 0]}
        intensity={lampIntensity * 10}
        distance={16}
        decay={2}
        color="#ffd28c"
      />
    </group>
  )
}

export function InfoBoard({ shadows }) {
  return (
    <group position={[BOARD.x, 0, BOARD.z]} rotation={[0, BOARD.rotation, 0]}>
      {[-0.92, 0.92].map((x) => (
        <mesh key={x} position={[x, 1.05, 0]} castShadow={shadows}>
          <boxGeometry args={[0.14, 2.1, 0.14]} />
          <meshStandardMaterial color="#5d4834" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 1.52, 0]} castShadow={shadows}>
        <boxGeometry args={[2.18, 1.2, 0.12]} />
        <meshStandardMaterial color="#2c4436" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.52, 0.065]}>
        <planeGeometry args={[1.9, 0.94]} />
        <meshStandardMaterial color="#efe8d2" roughness={0.95} />
      </mesh>

      <mesh position={[0, 1.54, 0.075]}>
        <boxGeometry args={[0.1, 0.66, 0.01]} />
        <meshStandardMaterial color="#78975b" />
      </mesh>
      <mesh position={[0, 1.54, 0.075]}>
        <boxGeometry args={[0.76, 0.1, 0.01]} />
        <meshStandardMaterial color="#78975b" />
      </mesh>
      <mesh position={[0.34, 1.72, 0.08]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[0.5, 0.055, 0.01]} />
        <meshStandardMaterial color="#4f7d74" />
      </mesh>
      <mesh position={[0.31, 1.32, 0.08]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.4, 0.05, 0.01]} />
        <meshStandardMaterial color="#b48b5b" />
      </mesh>
      <mesh position={[-0.56, 1.72, 0.08]}>
        <circleGeometry args={[0.1, 16]} />
        <meshStandardMaterial color="#d4f06a" />
      </mesh>
      <mesh position={[-0.56, 1.66, 0.08]}>
        <boxGeometry args={[0.16, 0.015, 0.01]} />
        <meshStandardMaterial color="#5a6b4a" />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow={shadows}>
        <boxGeometry args={[1.92, 0.16, 0.14]} />
        <meshStandardMaterial color="#5d4834" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function Fountain({ shadows }) {
  return (
    <group position={[FOUNTAIN.x, 0, FOUNTAIN.z]}>
      <mesh position={[0, 0.31, 0]} castShadow={shadows} receiveShadow>
        <cylinderGeometry args={[2.5, 2.6, 0.62, 40]} />
        <meshStandardMaterial color={STONE} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.63, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.24, 48]} />
        <MeshDistortMaterial
          color={WATER}
          roughness={0.12}
          metalness={0.25}
          transparent
          opacity={0.92}
          distort={0.045}
          speed={1.2}
        />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow={shadows}>
        <cylinderGeometry args={[0.36, 0.52, 0.75, 12]} />
        <meshStandardMaterial color="#9a9588" roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.14, 0]} castShadow={shadows}>
        <cylinderGeometry args={[1.02, 0.72, 0.26, 32]} />
        <meshStandardMaterial color={STONE} roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 32]} />
        <MeshDistortMaterial
          color="#6fb1c2"
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.9}
          distort={0.05}
          speed={1.6}
        />
      </mesh>
      <mesh position={[0, 1.44, 0]} castShadow={shadows}>
        <cylinderGeometry args={[0.1, 0.16, 0.4, 8]} />
        <meshStandardMaterial color="#9a9588" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow={shadows}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#8f8a7d" roughness={0.85} />
      </mesh>

      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.36, 1.95, Math.sin(angle) * 0.36]}
            rotation={[0, -angle, 0.22]}
          >
            <cylinderGeometry args={[0.012, 0.035, 0.7, 6, 1, true]} />
            <meshBasicMaterial color="#d8f2fa" transparent opacity={0.32} />
          </mesh>
        )
      })}
      <pointLight position={[0, 1.8, 0]} intensity={0.5} distance={5} color="#bfe6ff" />
    </group>
  )
}

export function Pagoda({ shadows, glow = 0 }) {
  const dome = useMemo(
    () =>
      [
        [2.42, 2.0],
        [2.58, 2.5],
        [2.64, 2.9],
        [2.6, 3.35],
        [2.49, 3.85],
        [2.31, 4.32],
        [2.05, 4.78],
        [1.73, 5.2],
        [1.38, 5.58],
        [1.03, 5.92],
        [0.71, 6.2],
        [0.47, 6.45],
        [0.35, 6.6],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
    [],
  )

  const spireRings = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const t = index / 6
        return { y: 6.72 + t * 3.5, r: 0.3 - t * 0.24 }
      }),
    [],
  )

  const gold = {
    color: GOLD,
    metalness: 0.78,
    roughness: 0.26,
    emissive: '#8a5f10',
    emissiveIntensity: 0.06 + glow * 0.22,
  }
  const goldLight = {
    color: GOLD_LIGHT,
    metalness: 0.8,
    roughness: 0.22,
    emissive: '#8a5f10',
    emissiveIntensity: 0.06 + glow * 0.22,
  }

  return (
    <group position={[PAGODA.x, 0, PAGODA.z]}>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[5.4, 5.5, 0.16, 32]} />
        <meshStandardMaterial color="#b9ad91" roughness={0.97} />
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation={[0, Math.PI / 8, 0]} castShadow={shadows} receiveShadow>
        <cylinderGeometry args={[4.7, 4.8, 0.4, 8]} />
        <meshStandardMaterial color="#cdc2a6" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.68, 0]} rotation={[0, Math.PI / 8, 0]} castShadow={shadows} receiveShadow>
        <cylinderGeometry args={[4.0, 4.1, 0.36, 8]} />
        <meshStandardMaterial color="#d6ccb2" roughness={0.93} />
      </mesh>
      <mesh position={[0, 1.04, 0]} rotation={[0, Math.PI / 8, 0]} castShadow={shadows}>
        <cylinderGeometry args={[3.4, 3.5, 0.36, 8]} />
        <meshStandardMaterial color={GOLD_DARK} metalness={0.7} roughness={0.32} emissive="#8a5f10" emissiveIntensity={0.06 + glow * 0.22} />
      </mesh>
      <mesh position={[0, 1.37, 0]} rotation={[0, Math.PI / 8, 0]} castShadow={shadows}>
        <cylinderGeometry args={[2.95, 3.05, 0.3, 24]} />
        <meshStandardMaterial {...gold} />
      </mesh>
      <mesh position={[0, 1.65, 0]} rotation={[0, Math.PI / 8, 0]} castShadow={shadows}>
        <cylinderGeometry args={[2.7, 2.78, 0.26, 24]} />
        <meshStandardMaterial {...goldLight} />
      </mesh>
      <mesh position={[0, 1.9, 0]} rotation={[0, Math.PI / 8, 0]} castShadow={shadows}>
        <cylinderGeometry args={[2.5, 2.56, 0.24, 24]} />
        <meshStandardMaterial {...gold} />
      </mesh>

      <mesh castShadow={shadows}>
        <latheGeometry args={[dome, 40]} />
        <meshStandardMaterial {...gold} />
      </mesh>

      {spireRings.map((ring, index) => (
        <mesh
          key={index}
          position={[0, ring.y, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow={shadows}
        >
          <torusGeometry args={[ring.r, 0.045, 6, 20]} />
          <meshStandardMaterial {...(index % 2 ? goldLight : gold)} />
        </mesh>
      ))}
      <mesh position={[0, 8.35, 0]} castShadow={shadows}>
        <cylinderGeometry args={[0.06, 0.34, 3.5, 16]} />
        <meshStandardMaterial {...gold} />
      </mesh>

      <mesh position={[0, 10.28, 0]} castShadow={shadows}>
        <coneGeometry args={[0.52, 0.34, 16]} />
        <meshStandardMaterial {...goldLight} />
      </mesh>
      <mesh position={[0, 10.52, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.14, 8]} />
        <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[0, 10.72, 0]} castShadow={shadows}>
        <octahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial
          color="#fff2b8"
          metalness={0.9}
          roughness={0.12}
          emissive="#ffe27a"
          emissiveIntensity={0.4 + glow * 0.9}
        />
      </mesh>

      {[0, 1, 2, 3].map((index) => {
        const angle = (index / 4) * Math.PI * 2 + Math.PI / 4
        return (
          <group key={index} position={[Math.cos(angle) * 4.2, 0.5, Math.sin(angle) * 4.2]}>
            <mesh position={[0, 0.06, 0]} castShadow={shadows}>
              <cylinderGeometry args={[0.16, 0.2, 0.12, 8]} />
              <meshStandardMaterial color="#cdc2a6" roughness={0.95} />
            </mesh>
            <mesh position={[0, 0.6, 0]} castShadow={shadows}>
              <cylinderGeometry args={[0.055, 0.09, 1, 8]} />
              <meshStandardMaterial {...gold} />
            </mesh>
            <mesh position={[0, 1.18, 0]} castShadow={shadows}>
              <sphereGeometry args={[0.14, 12, 12]} />
              <meshStandardMaterial {...goldLight} />
            </mesh>
            <mesh position={[0, 1.34, 0]} castShadow={shadows}>
              <coneGeometry args={[0.13, 0.2, 8]} />
              <meshStandardMaterial {...gold} />
            </mesh>
          </group>
        )
      })}

      <pointLight
        position={[0, 7.6, 0]}
        intensity={0.8 + glow * 14}
        distance={30}
        decay={2}
        color="#ffd77a"
      />
    </group>
  )
}
