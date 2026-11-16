export const SPAWN = { x: 0, z: 17 }

export const game = {
  position: { x: SPAWN.x, z: SPAWN.z },
  velocity: { x: 0, z: 0 },
  playerYaw: Math.PI,
  cameraYaw: 0,
  cameraPitch: 0.36,
  cameraDistance: 7.4,
  speed: 0,
  moving: false,
  sprinting: false,
  sitting: null,
  nearest: null,
  paused: true,
  started: false,
  joystick: { x: 0, y: 0 },
  keys: new Set(),
  dragging: false,
}

export function resetPlayer() {
  game.position.x = SPAWN.x
  game.position.z = SPAWN.z
  game.velocity.x = 0
  game.velocity.z = 0
  game.playerYaw = Math.PI
  game.cameraYaw = 0
  game.cameraPitch = 0.36
  game.cameraDistance = 7.4
  game.sitting = null
  game.nearest = null
  game.speed = 0
}

export function standUp() {
  const seat = game.sitting?.seat
  game.sitting = null
  if (seat) {
    game.position.x = seat.x + Math.sin(seat.rotation) * 1.4
    game.position.z = seat.z + Math.cos(seat.rotation) * 1.4
  }
  game.velocity.x = 0
  game.velocity.z = 0
}
