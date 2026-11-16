import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr } from '@react-three/drei'
import Scene from './Scene'

export default function Experience({ settings, onInteract, remotePlayers, localPlayerId, avatarType, avatarColor }) {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.8]}
      camera={{ position: [0, 4.4, 25], fov: 52, near: 0.1, far: 500 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Suspense fallback={null}>
        <Scene settings={settings} onInteract={onInteract} remotePlayers={remotePlayers} localPlayerId={localPlayerId} avatarType={avatarType} avatarColor={avatarColor} />
      </Suspense>
      <AdaptiveDpr pixelated />
    </Canvas>
  )
}
