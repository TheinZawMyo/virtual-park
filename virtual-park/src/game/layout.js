export const PARK_RADIUS = 34
export const PLAYER_RADIUS = 0.42
export const PROXIMITY_RANGE = 14
export const PATH_HALF = 2.2
export const PLAZA_RADIUS = 6.2
export const POND = { x: 15, z: -14, r: 6.6 }
export const PAGODA = { x: -17, z: -15, r: 4.5 }
export const FOUNTAIN = { x: 0, z: 0, r: 2.45 }
export const BOARD = {
  x: 4.8,
  z: 3.9,
  rotation: Math.atan2(-4.8, 2.5),
}

export const TREE_FOLIAGE = ['#5f9648', '#528a43', '#6ba14e', '#497f3d', '#7aa855']

function mulberry32(seed) {
  let a = seed
  return function random() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20261116)
const between = (a, b) => a + rand() * (b - a)

export const BENCHES = [
  {
    id: 'bench-linden',
    x: -3.7,
    z: 8.6,
    rotation: Math.PI / 2,
    name: 'Linden Bench',
    body: 'A carved linden-wood bench with a clear view of the north promenade. The trees behind it were planted when the park opened.',
  },
  {
    id: 'bench-south',
    x: -3.7,
    z: -8.4,
    rotation: Math.PI / 2,
    name: 'Promenade Bench',
    body: 'Set back from the crossing, this is the quietest of the promenade benches — especially in the early morning.',
  },
  {
    id: 'bench-east',
    x: 3.7,
    z: -8.4,
    rotation: -Math.PI / 2,
    name: 'East Walk Bench',
    body: 'A favourite with dog-walkers. From here the fountain is framed by two rows of linden trees.',
  },
  {
    id: 'bench-north',
    x: 3.7,
    z: 20.2,
    rotation: -Math.PI / 2,
    name: 'North Gate Bench',
    body: 'The last bench before the north gate. Look up — the canopy above is thickest here in summer.',
  },
  {
    id: 'bench-pond',
    x: 10.6,
    z: -21.4,
    rotation: Math.atan2(15 - 10.6, -14 + 21.4),
    name: 'Reed Bench',
    body: 'Tucked into the reeds on the south bank of Mirror Pond. The water catches the sky for most of the day.',
  },
]

export const LAMPS = [
  { x: -3.2, z: -16 },
  { x: 3.2, z: 16 },
  { x: -16, z: 3.2 },
  { x: 16, z: -3.2 },
  { x: -3.2, z: 26.5 },
  { x: 3.2, z: -26.5 },
]

const stoneStart = { x: 3.7, z: -3.7 }
const stoneEnd = { x: 9.2, z: -9.2 }
export const STEPPING_STONES = Array.from({ length: 7 }, (_, i) => {
  const t = i / 6
  const nx = stoneStart.x + (stoneEnd.x - stoneStart.x) * t
  const nz = stoneStart.z + (stoneEnd.z - stoneStart.z) * t
  const curve = Math.sin(t * Math.PI) * 0.7
  return {
    x: nx + curve * 0.7,
    z: nz - curve * 0.7,
    r: 0.5 + (i % 3) * 0.06,
    rotation: rand() * Math.PI,
  }
})

const AVOID = [
  ...BENCHES.map((b) => ({ x: b.x, z: b.z, r: 2.1 })),
  ...LAMPS.map((l) => ({ x: l.x, z: l.z, r: 1.3 })),
  { x: BOARD.x, z: BOARD.z, r: 2.1 },
  { x: FOUNTAIN.x, z: FOUNTAIN.z, r: PLAZA_RADIUS + 2.4 },
  { x: POND.x, z: POND.z, r: POND.r + 2.2 },
  { x: PAGODA.x, z: PAGODA.z, r: PAGODA.r + 4.2 },
  ...STEPPING_STONES.map((s) => ({ x: s.x, z: s.z, r: 1.1 })),
]

const dist2 = (ax, az, bx, bz) => {
  const dx = ax - bx
  const dz = az - bz
  return dx * dx + dz * dz
}

export const TREES = []
let treeAttempts = 0
while (TREES.length < 88 && treeAttempts < 12000) {
  treeAttempts += 1
  const angle = rand() * Math.PI * 2
  const radius = Math.sqrt(rand()) * (PARK_RADIUS - 4.5)
  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius

  if (Math.abs(x) < 3.5 || Math.abs(z) < 3.5) continue
  if (AVOID.some((a) => dist2(x, z, a.x, a.z) < a.r * a.r)) continue
  if (TREES.some((t) => dist2(x, z, t.x, t.z) < 2.7 * 2.7)) continue

  TREES.push({
    id: `tree-${TREES.length}`,
    x,
    z,
    s: between(0.82, 1.32),
    type: rand() < 0.36 ? 'pine' : 'round',
    rotation: rand() * Math.PI * 2,
    color: Math.floor(rand() * TREE_FOLIAGE.length),
  })
}

export const TUFTS = []
let tuftAttempts = 0
while (TUFTS.length < 380 && tuftAttempts < 5000) {
  tuftAttempts += 1
  const angle = rand() * Math.PI * 2
  const radius = Math.sqrt(rand()) * (PARK_RADIUS - 2.4)
  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius
  if (Math.abs(x) < 2.7 || Math.abs(z) < 2.7) continue
  if (dist2(x, z, FOUNTAIN.x, FOUNTAIN.z) < (PLAZA_RADIUS + 0.6) ** 2) continue
  if (dist2(x, z, POND.x, POND.z) < (POND.r + 0.8) ** 2) continue
  if (dist2(x, z, PAGODA.x, PAGODA.z) < (PAGODA.r + 2.4) ** 2) continue
  TUFTS.push({
    x,
    z,
    s: between(0.55, 1.5),
    rotation: rand() * Math.PI * 2,
    color: rand() < 0.5 ? '#77a656' : '#86b35f',
  })
}

const FLOWER_COLORS = ['#f7e7a9', '#f4b8c6', '#e8e4d4', '#f0c96f', '#c9b6e8']
export const FLOWERS = []
let flowerAttempts = 0
while (FLOWERS.length < 130 && flowerAttempts < 4000) {
  flowerAttempts += 1
  const angle = rand() * Math.PI * 2
  const radius = Math.sqrt(rand()) * (PARK_RADIUS - 3.2)
  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius
  if (Math.abs(x) < 3.0 || Math.abs(z) < 3.0) continue
  if (dist2(x, z, FOUNTAIN.x, FOUNTAIN.z) < (PLAZA_RADIUS + 0.8) ** 2) continue
  if (dist2(x, z, POND.x, POND.z) < (POND.r + 0.7) ** 2) continue
  if (dist2(x, z, PAGODA.x, PAGODA.z) < (PAGODA.r + 2.1) ** 2) continue
  FLOWERS.push({
    x,
    z,
    s: between(0.7, 1.35),
    color: FLOWER_COLORS[Math.floor(rand() * FLOWER_COLORS.length)],
  })
}

export const ROCKS = []
for (let i = 0; i < 26; i += 1) {
  const angle = rand() * Math.PI * 2
  const radius = POND.r + between(0.5, 2.8)
  ROCKS.push({
    x: POND.x + Math.cos(angle) * radius,
    z: POND.z + Math.sin(angle) * radius,
    s: between(0.35, 0.95),
    rotation: rand() * Math.PI * 2,
    color: rand() < 0.5 ? '#8b8f88' : '#747a75',
  })
}
for (let i = 0; i < 9; i += 1) {
  const angle = rand() * Math.PI * 2
  const radius = between(PARK_RADIUS - 4, PARK_RADIUS - 1.5)
  ROCKS.push({
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius,
    s: between(0.4, 1.05),
    rotation: rand() * Math.PI * 2,
    color: rand() < 0.5 ? '#8b8f88' : '#747a75',
  })
}

export const HOTSPOTS = [
  {
    id: 'board',
    type: 'info',
    icon: 'info',
    category: 'Welcome',
    title: 'Lumen Park',
    subtitle: 'A pocket of green in the middle of nowhere',
    position: { x: BOARD.x, z: BOARD.z },
    radius: 2.9,
    body: 'The heart of the park is the crossing of the two promenades. Stroll north to the fountain, or follow the stepping stones east to Mirror Pond.\n\nThis is a prototype built with React, Three.js and React Three Fiber. Everything you see is generated in code — no external models or textures.',
  },
  {
    id: 'fountain',
    type: 'landmark',
    icon: 'fountain',
    category: 'Landmark',
    title: 'The Singing Fountain',
    subtitle: 'Central Plaza',
    position: { x: 0, z: -3.9 },
    radius: 2.7,
    body: 'At the centre of the plaza a low stone fountain recirculates rainwater. Its soft chime is the park\u2019s unofficial clock.\n\nCircular jets keep the basin moving all day, while the lanterns take over when the sun goes down.',
  },
  {
    id: 'pond',
    type: 'nature',
    icon: 'water',
    category: 'Nature',
    title: 'Mirror Pond',
    subtitle: 'Reeds, lilies and patient koi',
    position: { x: 9.1, z: -9.1 },
    radius: 3.1,
    body: 'A shallow, planted pond edged with reeds and river stones. Dragonflies patrol the surface in summer, and koi shelter beneath the lily pads.\n\nPlease stay on the bank — the water is for looking, not wading.',
  },
  {
    id: 'pagoda',
    type: 'landmark',
    icon: 'pagoda',
    category: 'Landmark',
    title: 'ShweDagon Pagoda',
    subtitle: 'A golden stupa on the northwest lawn',
    position: { x: PAGODA.x, z: PAGODA.z },
    radius: 6.6,
    body: 'A gilded stupa modelled on Yangon\u2019s ShweDagon Pagoda, scaled down for the northwest lawn. Its bell-shaped dome is ringed with bands of gold and crowned by a jewelled hti.\n\nAt dusk the spire catches the last light, and a warm glow rings the terrace long after the promenade lamps come on.',
  },
  ...BENCHES.map((bench) => ({
    id: bench.id,
    type: 'bench',
    icon: 'bench',
    category: 'Seating',
    title: bench.name,
    subtitle: 'Press E to take a seat',
    position: { x: bench.x, z: bench.z },
    radius: 2.6,
    seat: { x: bench.x, z: bench.z, rotation: bench.rotation },
    body: bench.body,
  })),
]

export const OBSTACLES = []
TREES.forEach((t) => OBSTACLES.push({ x: t.x, z: t.z, r: 0.48 * t.s }))
BENCHES.forEach((b) => OBSTACLES.push({ x: b.x, z: b.z, r: 0.86 }))
LAMPS.forEach((l) => OBSTACLES.push({ x: l.x, z: l.z, r: 0.32 }))
ROCKS.forEach((r) => {
  if (r.s > 0.5) OBSTACLES.push({ x: r.x, z: r.z, r: r.s * 0.55 })
})
OBSTACLES.push({ x: BOARD.x, z: BOARD.z, r: 0.7 })
OBSTACLES.push({ x: FOUNTAIN.x, z: FOUNTAIN.z, r: FOUNTAIN.r })
OBSTACLES.push({ x: POND.x, z: POND.z, r: POND.r + 0.35 })
OBSTACLES.push({ x: PAGODA.x, z: PAGODA.z, r: PAGODA.r - 0.1 })

export function moveWithCollisions(position, dx, dz) {
  let x = position.x
  let z = position.z

  const blocked = (nx, nz) => {
    if (Math.hypot(nx, nz) > PARK_RADIUS - 1.2) return true
    for (let i = 0; i < OBSTACLES.length; i += 1) {
      const o = OBSTACLES[i]
      const rr = o.r + PLAYER_RADIUS
      if (dist2(nx, nz, o.x, o.z) < rr * rr) return true
    }
    return false
  }

  const nextX = x + dx
  if (!blocked(nextX, z)) x = nextX
  const nextZ = z + dz
  if (!blocked(x, nextZ)) z = nextZ

  return { x, z }
}

export function findNearestHotspot(x, z) {
  let best = null
  let bestDistance = Infinity
  for (const spot of HOTSPOTS) {
    const distance = Math.hypot(x - spot.position.x, z - spot.position.z)
    if (distance < spot.radius && distance < bestDistance) {
      best = spot
      bestDistance = distance
    }
  }
  return best
}

export function getLocationName(x, z) {
  if (dist2(x, z, PAGODA.x, PAGODA.z) < (PAGODA.r + 9) ** 2) return 'ShweDagon Pagoda'
  if (dist2(x, z, POND.x, POND.z) < (POND.r + 7) ** 2) return 'Mirror Pond'
  if (dist2(x, z, 0, 0) < (PLAZA_RADIUS + 2.5) ** 2) return 'Central Plaza'
  if (Math.abs(x) < 4.6 && Math.abs(z) >= 4.6) {
    return z < 0 ? 'North Promenade' : 'South Promenade'
  }
  if (Math.abs(z) < 4.6) return x < 0 ? 'West Promenade' : 'East Promenade'

  const north = z < 0
  const east = x > 0
  if (north) return east ? 'Northeast Lawn' : 'Northwest Lawn'
  return east ? 'Southeast Lawn' : 'Southwest Lawn'
}
