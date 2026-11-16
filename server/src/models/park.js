import { query } from '../db.js'

export const ParkModel = {
  async findAll() {
    const { rows } = await query(
      `SELECT id, name, description, location, created_at
       FROM parks
       ORDER BY created_at DESC`
    )
    return rows
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT id, name, description, location, created_at
       FROM parks
       WHERE id = $1`,
      [id]
    )
    return rows[0] || null
  },

  async create({ name, description, location }) {
    const { rows } = await query(
      `INSERT INTO parks (name, description, location)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, location, created_at`,
      [name, description, location]
    )
    return rows[0]
  },

  async update(id, { name, description, location }) {
    const { rows } = await query(
      `UPDATE parks
       SET name = COALESCE($2, name),
           description = COALESCE($3, description),
           location = COALESCE($4, location)
       WHERE id = $1
       RETURNING id, name, description, location, updated_at`,
      [id, name, description, location]
    )
    return rows[0] || null
  },

  async remove(id) {
    const { rowCount } = await query(`DELETE FROM parks WHERE id = $1`, [id])
    return rowCount > 0
  },
}

export const FeatureModel = {
  async findByParkId(parkId) {
    const { rows } = await query(
      `SELECT id, park_id, kind, name, x, y, z, metadata, created_at
       FROM park_features
       WHERE park_id = $1
       ORDER BY created_at ASC`,
      [parkId]
    )
    return rows
  },

  async create({ parkId, kind, name, x, y, z, metadata = {} }) {
    const { rows } = await query(
      `INSERT INTO park_features (park_id, kind, name, x, y, z, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, park_id, kind, name, x, y, z, metadata, created_at`,
      [parkId, kind, name, x, y, z, JSON.stringify(metadata)]
    )
    return rows[0]
  },

  async update(id, fields) {
    const setClauses = []
    const values = []
    let idx = 1
    for (const [key, val] of Object.entries(fields)) {
      setClauses.push(`${key} = $${idx++}`)
      values.push(val)
    }
    values.push(id)
    const { rows } = await query(
      `UPDATE park_features
       SET ${setClauses.join(', ')}
       WHERE id = $${idx}
       RETURNING id, park_id, kind, name, x, y, z, metadata, updated_at`,
      values
    )
    return rows[0] || null
  },

  async remove(id) {
    const { rowCount } = await query(`DELETE FROM park_features WHERE id = $1`, [id])
    return rowCount > 0
  },
}

export const UserModel = {
  async findAll() {
    const { rows } = await query(
      `SELECT id, username, email, created_at FROM users ORDER BY created_at DESC`
    )
    return rows
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT id, username, email, created_at FROM users WHERE id = $1`,
      [id]
    )
    return rows[0] || null
  },

  async create({ username, email }) {
    const { rows } = await query(
      `INSERT INTO users (username, email) VALUES ($1, $2) RETURNING id, username, email, created_at`,
      [username, email]
    )
    return rows[0]
  },
}

export const PlayerModel = {
  async findAll() {
    const { rows } = await query(
      `SELECT id, username, display_name, avatar_type, avatar_color, created_at, last_seen_at
       FROM players
       ORDER BY created_at DESC`
    )
    return rows
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT id, username, display_name, avatar_type, avatar_color, created_at, last_seen_at
       FROM players
       WHERE id = $1`,
      [id]
    )
    return rows[0] || null
  },

  async findByUsername(username) {
    const { rows } = await query(
      `SELECT id, username, display_name, avatar_type, avatar_color, created_at, last_seen_at
       FROM players
       WHERE username = $1`,
      [username]
    )
    return rows[0] || null
  },

  async create({ username, displayName, avatarType, avatarColor }) {
    const { rows } = await query(
      `INSERT INTO players (username, display_name, avatar_type, avatar_color)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, display_name, avatar_type, avatar_color, created_at`,
      [username, displayName || username, avatarType, avatarColor]
    )
    return rows[0]
  },

  async update(id, { displayName, avatarType, avatarColor }) {
    const { rows } = await query(
      `UPDATE players
       SET display_name = COALESCE($2, display_name),
           avatar_type = COALESCE($3, avatar_type),
           avatar_color = COALESCE($4, avatar_color),
           last_seen_at = NOW()
       WHERE id = $1
       RETURNING id, username, display_name, avatar_type, avatar_color, last_seen_at`,
      [id, displayName, avatarType, avatarColor]
    )
    return rows[0] || null
  },

  async touch(id) {
    await query(`UPDATE players SET last_seen_at = NOW() WHERE id = $1`, [id])
  },
}

export const ParkPlayerModel = {
  async findActiveByParkId(parkId) {
    const { rows } = await query(
      `SELECT pp.id, pp.player_id, pp.park_id, pp.x, pp.y, pp.z, pp.rotation, pp.joined_at, pp.is_active,
              p.username, p.display_name, p.avatar_type, p.avatar_color
       FROM park_players pp
       JOIN players p ON p.id = pp.player_id
       WHERE pp.park_id = $1 AND pp.is_active = true
       ORDER BY pp.joined_at ASC`,
      [parkId]
    )
    return rows
  },

  async upsert({ parkId, playerId, x, y, z, rotation }) {
    const { rows } = await query(
      `INSERT INTO park_players (park_id, player_id, x, y, z, rotation, is_active, joined_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
       ON CONFLICT (park_id, player_id)
       DO UPDATE SET x = EXCLUDED.x,
                     y = EXCLUDED.y,
                     z = EXCLUDED.z,
                     rotation = EXCLUDED.rotation,
                     is_active = true,
                     joined_at = NOW()
       RETURNING id, park_id, player_id, x, y, z, rotation, is_active, joined_at`,
      [parkId, playerId, x, y, z, rotation || '{}']
    )
    return rows[0]
  },

  async setInactive(parkId, playerId) {
    await query(
      `UPDATE park_players SET is_active = false WHERE park_id = $1 AND player_id = $2`,
      [parkId, playerId]
    )
  },

  async setAllInactiveByPark(parkId) {
    await query(`UPDATE park_players SET is_active = false WHERE park_id = $1`, [parkId])
  },
}