import { Billboard, Float } from '@react-three/drei'
import { HOTSPOTS } from '../../game/layout'

const HEIGHTS = {
  bench: 2.25,
  info: 2.95,
  fountain: 3.05,
  water: 1.55,
  pagoda: 12.4,
}

export default function Markers() {
  return (
    <group>
      {HOTSPOTS.map((spot) => (
        <Float
          key={spot.id}
          speed={2.2}
          rotationIntensity={0.35}
          floatIntensity={0.4}
          floatingRange={[-0.08, 0.08]}
        >
          <Billboard>
            <group position={[spot.position.x, HEIGHTS[spot.icon] ?? 2, spot.position.z]}>
              <mesh>
                <torusGeometry args={[0.13, 0.022, 8, 24]} />
                <meshStandardMaterial
                  color="#e7f68e"
                  emissive="#c7e654"
                  emissiveIntensity={0.7}
                  roughness={0.35}
                />
              </mesh>
              <mesh>
                <sphereGeometry args={[0.045, 12, 12]} />
                <meshStandardMaterial
                  color="#f7ffd8"
                  emissive="#e7ff9a"
                  emissiveIntensity={1.2}
                  roughness={0.2}
                />
              </mesh>
            </group>
          </Billboard>
        </Float>
      ))}
    </group>
  )
}
