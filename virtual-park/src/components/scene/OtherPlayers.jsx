import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'

export function RemotePlayer({ player }) {
  const meshRef = useRef()
  const target = useRef(
    new THREE.Vector3(player.x ?? 0, 1, player.z ?? 0)
  )
  const targetYaw = useRef(player.rotation?.y ?? 0)

  useEffect(() => {
    target.current.set(player.x ?? 0, 1, player.z ?? 0)
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
      position={[player.x ?? 0, 1, player.z ?? 0]}
      rotation={[0, player.rotation?.y ?? 0, 0]}
    >
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[0.22, 0.9, 4, 8]} />
        <meshStandardMaterial
          color={player.avatarColor || '#ffffff'}
          roughness={0.8}
        />
      </mesh>
      <mesh position={[0, 1.75, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#d9a06b" roughness={0.7} />
      </mesh>
      <Billboard position={[0, 2.1, 0]} fixedSize={false}>
        <Text
          text={player.displayName || player.username}
          fill={player.avatarColor || '#ffffff'}
          stroke="black"
          strokeWidth={0.15}
          fontSize={0.25}
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