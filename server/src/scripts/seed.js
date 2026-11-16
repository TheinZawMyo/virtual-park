import { pool } from '../db.js'

async function main() {
  try {
    await pool.query(
      `INSERT INTO parks (name, description, location)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      ['Lumen Park', 'A peaceful 3D virtual park for exploration and relaxation.', 'South Gate']
    )
    const parks = await pool.query('SELECT id FROM parks LIMIT 1')
    const parkId = parks.rows[0].id

    await pool.query(
      `INSERT INTO park_features (park_id, kind, name, x, y, z, metadata)
       VALUES
         ($1, 'tree', 'Oak Tree', 2, 0, -5, '{"species":"oak"}'),
         ($1, 'bench', 'Rest Bench', -3, 0, 2, '{"seats":2}'),
         ($1, 'lamppost', 'Solar Lamp', 0, 0, 0, '{"powered":true}'),
         ($1, 'rock', 'Garden Rock', 4, 0, 1, '{"size":"medium"}')
       ON CONFLICT DO NOTHING`,
      [parkId]
    )

    await pool.query(
      `INSERT INTO users (username, email)
       VALUES ('visitor', 'visitor@example.com')
       ON CONFLICT (username) DO NOTHING`
    )

    console.log('[seed] seed data inserted')
  } catch (err) {
    console.error('[seed] failed:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()