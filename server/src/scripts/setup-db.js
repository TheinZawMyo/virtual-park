import { pool } from '../db.js'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS parks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS park_features (
  id SERIAL PRIMARY KEY,
  park_id INTEGER REFERENCES parks(id) ON DELETE CASCADE,
  kind VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  x DOUBLE PRECISION DEFAULT 0,
  y DOUBLE PRECISION DEFAULT 0,
  z DOUBLE PRECISION DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  avatar_type VARCHAR(100) DEFAULT 'default',
  avatar_color VARCHAR(50) DEFAULT '#ffffff',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS park_players (
  id SERIAL PRIMARY KEY,
  park_id INTEGER REFERENCES parks(id) ON DELETE CASCADE,
  player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
  x DOUBLE PRECISION DEFAULT 0,
  y DOUBLE PRECISION DEFAULT 0,
  z DOUBLE PRECISION DEFAULT 0,
  rotation JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (park_id, player_id)
);
`

async function main() {
  try {
    await pool.query(SCHEMA)
    console.log('[setup-db] schema ready')
  } catch (err) {
    console.error('[setup-db] failed:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()