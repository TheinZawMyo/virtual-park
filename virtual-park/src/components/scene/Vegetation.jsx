import { Instance, Instances } from '@react-three/drei'
import {
  FLOWERS,
  ROCKS,
  TREES,
  TREE_FOLIAGE,
  TUFTS,
} from '../../game/layout'

export default function Vegetation({ shadows }) {
  const roundTrees = TREES.filter((tree) => tree.type === 'round')
  const pineTrees = TREES.filter((tree) => tree.type === 'pine')

  return (
    <group>
      <Instances limit={TREES.length} castShadow={shadows} receiveShadow>
        <cylinderGeometry args={[0.16, 0.3, 1, 6]} />
        <meshStandardMaterial color="#7b5436" roughness={0.95} flatShading />
        {TREES.map((tree) => {
          const height = (tree.type === 'pine' ? 1.9 : 2.35) * tree.s
          return (
            <Instance
              key={tree.id}
              position={[tree.x, height / 2, tree.z]}
              rotation={[0, tree.rotation, 0]}
              scale={[tree.s, height, tree.s]}
            />
          )
        })}
      </Instances>

      <Instances limit={roundTrees.length * 3} castShadow={shadows}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.85} flatShading />
        {roundTrees.flatMap((tree) => {
          const color = TREE_FOLIAGE[tree.color]
          return [
            <Instance
              key={`${tree.id}-a`}
              position={[tree.x, 2.55 * tree.s, tree.z]}
              rotation={[0, tree.rotation, 0]}
              scale={[1.58 * tree.s, 1.48 * tree.s, 1.58 * tree.s]}
              color={color}
            />,
            <Instance
              key={`${tree.id}-b`}
              position={[tree.x + 0.72 * tree.s, 2.92 * tree.s, tree.z + 0.26 * tree.s]}
              scale={[1.02 * tree.s, 0.96 * tree.s, 1.02 * tree.s]}
              color={TREE_FOLIAGE[(tree.color + 2) % TREE_FOLIAGE.length]}
            />,
            <Instance
              key={`${tree.id}-c`}
              position={[tree.x - 0.66 * tree.s, 2.28 * tree.s, tree.z - 0.22 * tree.s]}
              scale={[0.94 * tree.s, 0.9 * tree.s, 0.94 * tree.s]}
              color={TREE_FOLIAGE[(tree.color + 1) % TREE_FOLIAGE.length]}
            />,
          ]
        })}
      </Instances>

      {[
        { y: 2.1, scale: 1.5, h: 1.95 },
        { y: 3.0, scale: 1.12, h: 1.65 },
        { y: 3.72, scale: 0.78, h: 1.35 },
      ].map((layer, layerIndex) => (
        <Instances key={layerIndex} limit={pineTrees.length} castShadow={shadows}>
          <coneGeometry args={[1, 1, 7]} />
          <meshStandardMaterial color="#3f783f" roughness={0.9} flatShading />
          {pineTrees.map((tree) => (
            <Instance
              key={`${tree.id}-${layerIndex}`}
              position={[tree.x, layer.y * tree.s, tree.z]}
              rotation={[0, tree.rotation + layerIndex * 0.4, 0]}
              scale={[layer.scale * tree.s, layer.h * tree.s, layer.scale * tree.s]}
              color={
                layerIndex === 1
                  ? '#4b8647'
                  : TREE_FOLIAGE[(tree.color + layerIndex) % TREE_FOLIAGE.length]
              }
            />
          ))}
        </Instances>
      ))}

      <Instances limit={TUFTS.length}>
        <coneGeometry args={[0.08, 0.5, 4]} />
        <meshStandardMaterial color="#ffffff" roughness={1} flatShading />
        {TUFTS.map((tuft, index) => (
          <Instance
            key={index}
            position={[tuft.x, 0.24 * tuft.s, tuft.z]}
            rotation={[0, tuft.rotation, 0]}
            scale={[tuft.s * 1.3, tuft.s, tuft.s * 1.3]}
            color={tuft.color}
          />
        ))}
      </Instances>

      <Instances limit={FLOWERS.length}>
        <cylinderGeometry args={[0.012, 0.018, 1, 4]} />
        <meshStandardMaterial color="#4e7c42" roughness={1} />
        {FLOWERS.map((flower, index) => (
          <Instance
            key={index}
            position={[flower.x, 0.17 * flower.s, flower.z]}
            scale={[flower.s, 0.34 * flower.s, flower.s]}
          />
        ))}
      </Instances>

      <Instances limit={FLOWERS.length}>
        <icosahedronGeometry args={[0.075, 0]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} flatShading />
        {FLOWERS.map((flower, index) => (
          <Instance
            key={index}
            position={[flower.x, 0.35 * flower.s, flower.z]}
            scale={[flower.s, flower.s * 0.8, flower.s]}
            color={flower.color}
          />
        ))}
      </Instances>

      <Instances limit={ROCKS.length} castShadow={shadows} receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} flatShading />
        {ROCKS.map((rock, index) => (
          <Instance
            key={index}
            position={[rock.x, 0.26 * rock.s, rock.z]}
            rotation={[0.1, rock.rotation, 0.05]}
            scale={[rock.s, rock.s * 0.72, rock.s * 0.92]}
            color={rock.color}
          />
        ))}
      </Instances>
    </group>
  )
}
