import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'

export function RemotePlayer({ player }) {
  const meshRef = useRef()
  const target = useRef(
    new THREE.Vector3(player.x ?? 0, player.y ?? 0, player.z ?? 0)
  )
  const targetYaw = useRef(player.rotation?.y ?? 0)

  useEffect(() => {
    target.current.set(player.x ?? 0, player.y ?? 0, player.z ?? 0)
    if (player.rotation && player.rotation.y !== undefined) {
      targetYaw.current = player.rotation.y
    }
  }, [player.x, player.y, player.z, player.rotation])

  useFrame((state, delta) => {
    if (!meshRef.current) return
    meshRef.current.position.lerp(target.current, 1 - Math.exp(-10 * delta))
    meshRef.current.rotation.y +=
      ((((targetYaw.current - meshRef.current.rotation.y + Math.PI) %
        (2 * Math.PI)) -
        Math.PI) *
        (1 - Math.exp(-10 * delta)))
  })

  return (
    <group
      ref={meshRef}
      position={[player.x ?? 0, player.y ?? 0, player.z ?? 0]}
      rotation={[0, player.rotation?.y ?? 0, 0]}
    >
      {/* Keep the remote avatar's proportions aligned with the local explorer. */}
      {[-1, 1].map((side) => (
        <group key={`leg-${side}`} position={[side * 0.13, 0.78, 0]}>
          <mesh position={[0, -0.34, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.085, 0.46, 4, 8]} />
            <meshStandardMaterial color="#31465c" roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.68, 0.055]} castShadow>
            <boxGeometry args={[0.17, 0.1, 0.25]} />
            <meshStandardMaterial color="#22303f" roughness={0.7} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.08, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.22, 0.4, 6, 12]} />
        <meshStandardMaterial color={player.avatarColor || '#d97b4a'} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.13, -0.21]} castShadow>
        <boxGeometry args={[0.33, 0.4, 0.17]} />
        <meshStandardMaterial color="#718f5e" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.31, -0.21]} castShadow>
        <boxGeometry args={[0.2, 0.13, 0.19]} />
        <meshStandardMaterial color="#5d7a4d" roughness={0.9} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={`arm-${side}`} position={[side * 0.355, 1.32, 0]} rotation={[0, 0, side * -0.08]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.38, 4, 8]} />
            <meshStandardMaterial color={player.avatarColor || '#d97b4a'} roughness={0.82} />
          </mesh>
          <mesh position={[0, -0.46, 0]} castShadow>
            <sphereGeometry args={[0.068, 10, 10]} />
            <meshStandardMaterial color="#d9a06b" roughness={0.7} />
          </mesh>
        </group>
      ))}
      {player.avatarType === 'robot' ? (
        <>
          <mesh position={[0, 1.62, 0]} castShadow>
            <boxGeometry args={[0.38, 0.34, 0.34]} />
            <meshStandardMaterial color="#c8d8d4" metalness={0.45} roughness={0.38} />
          </mesh>
          <mesh position={[0, 1.84, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.12, 8]} />
            <meshStandardMaterial color={player.avatarColor || '#ff6b6b'} emissive={player.avatarColor || '#ff6b6b'} emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[0, 1.91, 0]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial color={player.avatarColor || '#ff6b6b'} emissive={player.avatarColor || '#ff6b6b'} emissiveIntensity={0.8} />
          </mesh>
        </>
      ) : player.avatarType === 'dino' ? (
        <>
          <mesh position={[0, 1.62, 0]} castShadow>
            <sphereGeometry args={[0.2, 18, 14]} />
            <meshStandardMaterial color={player.avatarColor || '#4ecdc4'} roughness={0.72} />
          </mesh>
          <mesh position={[0, 1.56, 0.18]} castShadow>
            <coneGeometry args={[0.11, 0.27, 12]} />
            <meshStandardMaterial color={player.avatarColor || '#4ecdc4'} roughness={0.72} />
          </mesh>
          {[-0.12, 0, 0.12].map((x) => <mesh key={x} position={[x, 1.85, -0.02]} rotation={[0, 0, -x * 3]}>
            <coneGeometry args={[0.065, 0.14, 6]} />
            <meshStandardMaterial color="#d4f06a" />
          </mesh>)}
        </>
      ) : (
        <group>
          <mesh position={[0, 1.61, 0]} castShadow>
            <sphereGeometry args={[0.185, 20, 20]} />
            <meshStandardMaterial color="#d9a06b" roughness={0.72} />
          </mesh>
          <mesh position={[0, 1.68, -0.01]} scale={[1, 0.74, 1]} castShadow>
            <sphereGeometry args={[0.192, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
            <meshStandardMaterial color="#2c221b" roughness={0.92} />
          </mesh>
          {/* Face details point toward the character's forward (+Z) direction. */}
          {[-1, 1].map((side) => (
            <mesh key={`eye-${side}`} position={[side * 0.066, 1.62, 0.166]}>
              <sphereGeometry args={[0.021, 8, 8]} />
              <meshStandardMaterial color="#241c18" roughness={0.5} />
            </mesh>
          ))}
        </group>
      )}
      {player.avatarType !== 'robot' && player.avatarType !== 'dino' && (
        <mesh position={[0, 1.46, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.155, 0.045, 8, 20]} />
          <meshStandardMaterial color="#d4f06a" roughness={0.75} />
        </mesh>
      )}
      <Billboard position={[0, 2.12, 0]}>
        <Text
          text={player.displayName || player.username}
          fill="#ffffff"
          stroke="black"
          strokeWidth={0.035}
          fontSize={0.14}
          align="center"
        />
      </Billboard>
    </group>
  )
}

export default function OtherPlayers({ players, localPlayerId }) {
  return (
    <group>
      {players
        .filter((p) => p.id !== localPlayerId)
        .map((p) => (
          <RemotePlayer key={p.id} player={p} />
        ))}
    </group>
  )
}
