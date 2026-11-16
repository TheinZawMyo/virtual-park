import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

export const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || 'virtual_park',
})

pool.on('connect', () => {
  console.log('[db] connected to PostgreSQL')
})

pool.on('error', (err) => {
  console.error('[db] unexpected error on idle client', err)
  process.exit(-1)
})

export async function query(text, params) {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  console.log('[db] query', { text: text.substring(0, 60), duration, rows: res.rowCount })
  return res
}

export default { pool, query }