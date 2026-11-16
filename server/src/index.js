import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { ParkWebSocketServer } from './ws/index.js'
import apiRouter from './routes/api.js'
import { pool } from './db.js'
import dotenv from 'dotenv'

dotenv.config()

const PORT = Number(process.env.PORT) || 5000

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', apiRouter)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'not found' })
})

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'internal server error' })
})

const httpServer = createServer(app)

const wsServer = new ParkWebSocketServer(httpServer, {
  path: process.env.WS_PATH || '/ws',
})

httpServer.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`WebSocket endpoint: ws://localhost:${PORT}${process.env.WS_PATH || '/ws'}`)

  try {
    await pool.query('SELECT 1')
    console.log('[db] PostgreSQL connection verified')
  } catch (err) {
    console.error('[db] PostgreSQL connection failed:', err.message)
  }
})

export { app, httpServer, wsServer }