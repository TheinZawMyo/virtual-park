import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sky, Stars } from '@react-three/drei'
import { TIME_PRESETS } from '../../game/presets'

function Clouds() {
  const group = useRef()

  const puffs = useMemo(() => {
    const clusters = []
    for (let c = 0; c < 6; c += 1) {
      const angle = (c / 6) * Math.PI * 2 + 0.4
      const radius = 52 + ((c * 13) % 34)
      const cx = Math.cos(angle) * radius
      const cz = Math.sin(angle) * radius
      const cy = 30 + ((c * 7) % 12)
      const scale = 1.4 + ((c * 5) % 4) * 0.3
      const blobs = []
      for (let b = 0; b < 4; b += 1) {
        blobs.push({
          position: [
            cx + Math.cos(b * 1.9) * 5 * scale,
            cy + Math.sin(b * 2.3) * 1.2,
            cz + Math.sin(b * 1.7) * 3.4 * scale,
          ],
          scale: [4.6 * scale, 2.2 * scale, 3.1 * scale],
        })
      }
      clusters.push(blobs)
    }
    return clusters
  }, [])

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += Math.min(delta, 0.05) * 0.006
  })

  return (
    <group ref={group}>
      {puffs.map((blobs, index) => (
        <group key={index}>
          {blobs.map((blob, blobIndex) => (
            <mesh key={blobIndex} position={blob.position} scale={blob.scale}>
              <icosahedronGeometry args={[1, 1]} />
              <meshStandardMaterial
                color="#f7f9f5"
                emissive="#93a59a"
                emissiveIntensity={0.14}
                roughness={1}
                transparent
                opacity={0.92}
                fog={false}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

export default function Atmosphere({ timeOfDay, shadows }) {
  const preset = TIME_PRESETS[timeOfDay]
  const isNight = timeOfDay === 'night'

  return (
    <>
      {!isNight && (
        <Sky
          distance={450000}
          sunPosition={preset.sunPosition}
          turbidity={preset.turbidity}
          rayleigh={preset.rayleigh}
          mieCoefficient={0.006}
          mieDirectionalG={0.82}
        />
      )}
      {isNight && <color attach="background" args={['#060c19']} />}
      {isNight && (
        <Stars radius={150} depth={70} count={4200} factor={5} saturation={0} fade speed={0.3} />
      )}
      {isNight && (
        <mesh position={[-62, 46, -95]}>
          <sphereGeometry args={[5.8, 32, 32]} />
          <meshBasicMaterial color="#eef3ff" />
        </mesh>
      )}
      {isNight && (
        <pointLight position={[-62, 46, -95]} intensity={120} distance={150} decay={1.6} color="#c9d8ff" />
      )}

      <fog attach="fog" args={[preset.fog, preset.fogNear, preset.fogFar]} />
      <hemisphereLight args={[preset.hemiSky, preset.hemiGround, preset.hemiIntensity]} />
      <ambientLight intensity={preset.ambient} color={preset.ambientColor} />
      <directionalLight
        castShadow={shadows}
        position={preset.sunPosition}
        intensity={preset.sunIntensity}
        color={preset.sunColor}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-56}
        shadow-camera-right={56}
        shadow-camera-top={56}
        shadow-camera-bottom={-56}
        shadow-camera-near={1}
        shadow-camera-far={240}
        shadow-bias={-0.0005}
        shadow-normalBias={0.035}
      />
      {!isNight && <Clouds />}
    </>
  )
}
