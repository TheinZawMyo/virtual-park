import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { game, standUp } from '../../game/state'
import { findNearestHotspot, moveWithCollisions, TREES } from '../../game/layout'

const WALK_SPEED = 4.3
const RUN_SPEED = 7.2
const SKIN = '#d9a06b'
const JACKET = '#d97b4a'
const PANTS = '#31465c'
const SHOE = '#22303f'
const HAIR = '#2c221b'
const SCARF = '#d4f06a'
const PACK = '#718f5e'

function dampAngle(current, target, lambda, dt) {
  let diff = target - current
  diff = Math.atan2(Math.sin(diff), Math.cos(diff))
  return current + diff * (1 - Math.exp(-lambda * dt))
}

function cameraClearance(originX, originY, originZ, dx, dy, dz) {
  const steps = 18
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps
    const x = originX + dx * t
    const y = originY + dy * t
    const z = originZ + dz * t

    for (let j = 0; j < TREES.length; j += 1) {
      const tree = TREES[j]
      const s = tree.s
      const trunkHeight = (tree.type === 'pine' ? 1.9 : 2.35) * s

      if (y < trunkHeight + 0.2) {
        const trunkRadius = 0.4 * s
        if ((x - tree.x) ** 2 + (z - tree.z) ** 2 < trunkRadius * trunkRadius) {
          return t
        }
      }

      const canopyY = (tree.type === 'pine' ? 2.7 : 2.55) * s
      const canopyRadius = (tree.type === 'pine' ? 1.6 : 1.85) * s
      if (
        (x - tree.x) ** 2 + (y - canopyY) ** 2 + (z - tree.z) ** 2 <
        canopyRadius * canopyRadius
      ) {
        return t
      }
    }
  }
  return 1
}

export default function Player({ shadows, onInteract, avatarType = 'default', avatarColor = JACKET }) {
  const group = useRef()
  const body = useRef()
  const leftLeg = useRef()
  const rightLeg = useRef()
  const leftArm = useRef()
  const rightArm = useRef()
  const sitAmount = useRef(0)
  const seatedId = useRef(null)
  const onInteractRef = useRef(onInteract)
  const target = useRef(new THREE.Vector3(0, 1.25, 17))
  const desired = useRef(new THREE.Vector3())
  const { gl, camera } = useThree()

  useEffect(() => {
    onInteractRef.current = onInteract
  }, [onInteract])

  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        event.preventDefault()
      }
      game.keys.add(event.code)

      if (event.code === 'KeyE' && !event.repeat && !game.paused && game.started) {
        const targetSpot = game.sitting || game.nearest
        if (targetSpot) onInteractRef.current?.(targetSpot)
      }
    }

    const onKeyUp = (event) => {
      game.keys.delete(event.code)
    }

    const clearKeys = () => game.keys.clear()

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', clearKeys)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', clearKeys)
      clearKeys()
    }
  }, [])

  useEffect(() => {
    const el = gl.domElement
    let activePointer = null
    let lastX = 0
    let lastY = 0

    const onPointerDown = (event) => {
      if (event.button !== undefined && event.button !== 0 && event.pointerType === 'mouse') return
      activePointer = event.pointerId
      lastX = event.clientX
      lastY = event.clientY
      game.dragging = true
      el.style.cursor = 'grabbing'
      try {
        el.setPointerCapture(event.pointerId)
      } catch {
        /* noop */
      }
    }

    const onPointerMove = (event) => {
      if (!game.dragging || event.pointerId !== activePointer) return
      const dx = event.clientX - lastX
      const dy = event.clientY - lastY
      lastX = event.clientX
      lastY = event.clientY
      const sensitivity = event.pointerType === 'touch' ? 0.006 : 0.0045
      game.cameraYaw -= dx * sensitivity
      game.cameraPitch = THREE.MathUtils.clamp(
        game.cameraPitch + dy * sensitivity * 0.8,
        0.08,
        1.15,
      )
    }

    const endDrag = (event) => {
      if (event.pointerId !== activePointer) return
      activePointer = null
      game.dragging = false
      el.style.cursor = 'grab'
      try {
        el.releasePointerCapture(event.pointerId)
      } catch {
        /* noop */
      }
    }

    const onWheel = (event) => {
      event.preventDefault()
      game.cameraDistance = THREE.MathUtils.clamp(
        game.cameraDistance + event.deltaY * 0.006,
        4.4,
        13.5,
      )
    }

    el.style.cursor = 'grab'
    el.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)
    el.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
      el.removeEventListener('wheel', onWheel)
    }
  }, [gl])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const time = state.clock.elapsedTime
    const keys = game.keys

    if (!game.started) {
      game.cameraYaw = Math.sin(time * 0.16) * 0.28
      game.cameraPitch = 0.36 + Math.sin(time * 0.12) * 0.04
    }

    if (game.sitting) {
      if (seatedId.current !== game.sitting.id) {
        seatedId.current = game.sitting.id
        game.position.x = game.sitting.seat.x
        game.position.z = game.sitting.seat.z
        game.velocity.x = 0
        game.velocity.z = 0
        game.playerYaw = game.sitting.seat.rotation
        game.cameraYaw = game.sitting.seat.rotation + Math.PI
        game.cameraPitch = 0.3
      }
    } else if (seatedId.current) {
      seatedId.current = null
    }

    let ix =
      (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) -
      (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0)
    let iy =
      (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) -
      (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0)
    ix += game.joystick.x
    iy += game.joystick.y
    const magnitude = Math.hypot(ix, iy)
    if (magnitude > 1) {
      ix /= magnitude
      iy /= magnitude
    }

    const canControl = game.started && !game.paused
    const wantsMove = canControl && magnitude > 0.14

    if (game.sitting && wantsMove) {
      standUp()
    }

    const sprint = keys.has('ShiftLeft') || keys.has('ShiftRight')
    const speed = sprint ? RUN_SPEED : WALK_SPEED
    const moving = wantsMove && !game.sitting

    let vx = 0
    let vz = 0
    if (moving) {
      const forwardX = -Math.sin(game.cameraYaw)
      const forwardZ = -Math.cos(game.cameraYaw)
      const rightX = Math.cos(game.cameraYaw)
      const rightZ = -Math.sin(game.cameraYaw)
      vx = (forwardX * iy + rightX * ix) * speed
      vz = (forwardZ * iy + rightZ * ix) * speed
    }

    const response = 1 - Math.exp(-(moving ? 13 : 9) * dt)
    game.velocity.x += (vx - game.velocity.x) * response
    game.velocity.z += (vz - game.velocity.z) * response
    if (!canControl) {
      game.velocity.x = 0
      game.velocity.z = 0
    }
    if (Math.abs(game.velocity.x) < 0.001) game.velocity.x = 0
    if (Math.abs(game.velocity.z) < 0.001) game.velocity.z = 0

    if (!game.sitting) {
      const next = moveWithCollisions(
        game.position,
        game.velocity.x * dt,
        game.velocity.z * dt,
      )
      game.position.x = next.x
      game.position.z = next.z
    }

    game.speed = Math.hypot(game.velocity.x, game.velocity.z)
    game.moving = game.speed > 0.3
    game.sprinting = sprint && game.moving

    if (moving && game.speed > 0.2) {
      const targetYaw = Math.atan2(game.velocity.x, game.velocity.z)
      game.playerYaw = dampAngle(game.playerYaw, targetYaw, 13, dt)
    } else if (game.sitting) {
      game.playerYaw = game.sitting.seat.rotation
    }

    game.nearest = canControl && !game.sitting
      ? findNearestHotspot(game.position.x, game.position.z)
      : null

    const sitTarget = game.sitting ? 1 : 0
    sitAmount.current = THREE.MathUtils.damp(sitAmount.current, sitTarget, 9, dt)
    const sit = sitAmount.current
    const walk = Math.min(game.speed / WALK_SPEED, 1.3)
    const swing = Math.sin(time * 9.5) * 0.58 * walk * (1 - sit)

    if (group.current) {
      group.current.position.set(game.position.x, 0, game.position.z)
      group.current.rotation.y = game.playerYaw
    }

    if (body.current) {
      body.current.position.y =
        -0.29 * sit + Math.abs(Math.sin(time * 9.5)) * 0.02 * walk * (1 - sit)
    }
    if (leftLeg.current) leftLeg.current.rotation.x = -1.5 * sit + swing
    if (rightLeg.current) rightLeg.current.rotation.x = -1.5 * sit - swing
    if (leftArm.current) leftArm.current.rotation.x = -0.18 * sit - swing * 0.85
    if (rightArm.current) rightArm.current.rotation.x = -0.18 * sit + swing * 0.85

    const camTargetY = 1.25 - 0.32 * sit
    target.current.lerp(
      new THREE.Vector3(game.position.x, camTargetY, game.position.z),
      1 - Math.exp(-14 * dt),
    )

    const cosPitch = Math.cos(game.cameraPitch)
    desired.current.set(
      game.position.x + Math.sin(game.cameraYaw) * cosPitch * game.cameraDistance,
      camTargetY + Math.sin(game.cameraPitch) * game.cameraDistance + 0.35,
      game.position.z + Math.cos(game.cameraYaw) * cosPitch * game.cameraDistance,
    )
    if (desired.current.y < 0.9) desired.current.y = 0.9

    const offsetX = desired.current.x - game.position.x
    const offsetY = desired.current.y - camTargetY
    const offsetZ = desired.current.z - game.position.z
    const clearance = cameraClearance(
      game.position.x,
      camTargetY,
      game.position.z,
      offsetX,
      offsetY,
      offsetZ,
    )
    const obstructed = clearance < 1
    if (obstructed) {
      const t = Math.max(clearance - 0.04, 0.16)
      desired.current.set(
        game.position.x + offsetX * t,
        camTargetY + offsetY * t,
        game.position.z + offsetZ * t,
      )
      if (desired.current.y < 0.9) desired.current.y = 0.9
    }

    camera.position.lerp(desired.current, 1 - Math.exp(-(obstructed ? 28 : 16) * dt))
    camera.lookAt(target.current)
  })

  return (
    <group ref={group}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.2} depthWrite={false} />
      </mesh>

      <group ref={body}>
        <group ref={leftLeg} position={[-0.13, 0.78, 0]}>
          <mesh position={[0, -0.34, 0]} castShadow={shadows}>
            <capsuleGeometry args={[0.085, 0.46, 4, 8]} />
            <meshStandardMaterial color={PANTS} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.68, 0.055]} castShadow={shadows}>
            <boxGeometry args={[0.17, 0.1, 0.25]} />
            <meshStandardMaterial color={SHOE} roughness={0.7} />
          </mesh>
        </group>
        <group ref={rightLeg} position={[0.13, 0.78, 0]}>
          <mesh position={[0, -0.34, 0]} castShadow={shadows}>
            <capsuleGeometry args={[0.085, 0.46, 4, 8]} />
            <meshStandardMaterial color={PANTS} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.68, 0.055]} castShadow={shadows}>
            <boxGeometry args={[0.17, 0.1, 0.25]} />
            <meshStandardMaterial color={SHOE} roughness={0.7} />
          </mesh>
        </group>

        <mesh position={[0, 1.08, 0]} castShadow={shadows}>
          <capsuleGeometry args={[0.22, 0.4, 6, 12]} />
          <meshStandardMaterial color={avatarColor} roughness={0.8} />
        </mesh>

        <mesh position={[0, 1.13, -0.21]} castShadow={shadows}>
          <boxGeometry args={[0.33, 0.4, 0.17]} />
          <meshStandardMaterial color={PACK} roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.31, -0.21]} castShadow={shadows}>
          <boxGeometry args={[0.2, 0.13, 0.19]} />
          <meshStandardMaterial color="#5d7a4d" roughness={0.9} />
        </mesh>

        <group ref={leftArm} position={[-0.355, 1.32, 0]} rotation={[0, 0, 0.08]}>
          <mesh position={[0, -0.22, 0]} castShadow={shadows}>
            <capsuleGeometry args={[0.065, 0.38, 4, 8]} />
            <meshStandardMaterial color={avatarColor} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.46, 0]} castShadow={shadows}>
            <sphereGeometry args={[0.068, 10, 10]} />
            <meshStandardMaterial color={SKIN} roughness={0.7} />
          </mesh>
        </group>
        <group ref={rightArm} position={[0.355, 1.32, 0]} rotation={[0, 0, -0.08]}>
          <mesh position={[0, -0.22, 0]} castShadow={shadows}>
            <capsuleGeometry args={[0.065, 0.38, 4, 8]} />
            <meshStandardMaterial color={avatarColor} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.46, 0]} castShadow={shadows}>
            <sphereGeometry args={[0.068, 10, 10]} />
            <meshStandardMaterial color={SKIN} roughness={0.7} />
          </mesh>
        </group>

        {avatarType === 'robot' ? (
          <>
            <mesh position={[0, 1.62, 0]} castShadow={shadows}>
              <boxGeometry args={[0.38, 0.34, 0.34]} />
              <meshStandardMaterial color="#c8d8d4" metalness={0.45} roughness={0.38} />
            </mesh>
            <mesh position={[0, 1.84, 0]} castShadow={shadows}>
              <cylinderGeometry args={[0.025, 0.025, 0.12, 8]} />
              <meshStandardMaterial color={avatarColor} emissive={avatarColor} emissiveIntensity={0.35} />
            </mesh>
            <mesh position={[0, 1.91, 0]}>
              <sphereGeometry args={[0.055, 12, 12]} />
              <meshStandardMaterial color={avatarColor} emissive={avatarColor} emissiveIntensity={0.8} />
            </mesh>
          </>
        ) : avatarType === 'dino' ? (
          <>
            <mesh position={[0, 1.62, 0]} castShadow={shadows}>
              <sphereGeometry args={[0.2, 18, 14]} />
              <meshStandardMaterial color={avatarColor} roughness={0.72} />
            </mesh>
            <mesh position={[0, 1.56, 0.18]} castShadow={shadows}>
              <coneGeometry args={[0.11, 0.27, 12]} />
              <meshStandardMaterial color={avatarColor} roughness={0.72} />
            </mesh>
            {[-0.12, 0, 0.12].map((x) => (
              <mesh key={x} position={[x, 1.85, -0.02]} rotation={[0, 0, -x * 3]} castShadow={shadows}>
                <coneGeometry args={[0.065, 0.14, 6]} />
                <meshStandardMaterial color="#d4f06a" roughness={0.75} />
              </mesh>
            ))}
          </>
        ) : (
          <>
            <mesh position={[0, 1.61, 0]} castShadow={shadows}>
              <sphereGeometry args={[0.185, 20, 20]} />
              <meshStandardMaterial color={SKIN} roughness={0.7} />
            </mesh>
            <mesh position={[0, 1.68, -0.01]} scale={[1, 0.74, 1]} castShadow={shadows}>
              <sphereGeometry args={[0.192, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
              <meshStandardMaterial color={HAIR} roughness={0.95} />
            </mesh>
          </>
        )}
        <mesh position={[-0.066, 1.62, 0.166]}>
          <sphereGeometry args={[0.021, 8, 8]} />
          <meshStandardMaterial color="#26301f" roughness={0.4} />
        </mesh>
        <mesh position={[0.066, 1.62, 0.166]}>
          <sphereGeometry args={[0.021, 8, 8]} />
          <meshStandardMaterial color="#26301f" roughness={0.4} />
        </mesh>
        {avatarType === 'default' && <mesh position={[0, 1.46, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.155, 0.045, 8, 20]} />
          <meshStandardMaterial color={SCARF} roughness={0.75} />
        </mesh>}

        <mesh position={[-0.16, 1.2, 0.205]} rotation={[0, 0, 0.12]}>
          <boxGeometry args={[0.045, 0.5, 0.02]} />
          <meshStandardMaterial color={SCARF} roughness={0.8} />
        </mesh>
        <mesh position={[0.16, 1.2, 0.205]} rotation={[0, 0, -0.12]}>
          <boxGeometry args={[0.045, 0.5, 0.02]} />
          <meshStandardMaterial color={SCARF} roughness={0.8} />
        </mesh>
      </group>
    </group>
  )
}
