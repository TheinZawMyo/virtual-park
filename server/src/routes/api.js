import { Router } from 'express'
import {
  ParkModel,
  FeatureModel,
  UserModel,
  PlayerModel,
  ParkPlayerModel,
} from '../models/park.js'

const router = Router()

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// Parks
router.get('/parks', async (_req, res) => {
  try {
    const parks = await ParkModel.findAll()
    res.json(parks)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/parks/:id', async (req, res) => {
  try {
    const park = await ParkModel.findById(req.params.id)
    if (!park) return res.status(404).json({ error: 'Park not found' })
    res.json(park)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/parks', async (req, res) => {
  try {
    const { name, description, location } = req.body
    if (!name) return res.status(400).json({ error: 'name is required' })
    const park = await ParkModel.create({ name, description, location })
    res.status(201).json(park)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/parks/:id', async (req, res) => {
  try {
    const park = await ParkModel.update(req.params.id, req.body)
    if (!park) return res.status(404).json({ error: 'Park not found' })
    res.json(park)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/parks/:id', async (req, res) => {
  try {
    const deleted = await ParkModel.remove(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Park not found' })
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Park features
router.get('/parks/:parkId/features', async (req, res) => {
  try {
    const features = await FeatureModel.findByParkId(req.params.parkId)
    res.json(features)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/parks/:parkId/features', async (req, res) => {
  try {
    const { kind, name, x, y, z, metadata } = req.body
    if (!kind || !name) {
      return res.status(400).json({ error: 'kind and name are required' })
    }
    const feature = await FeatureModel.create({
      parkId: req.params.parkId,
      kind,
      name,
      x,
      y,
      z,
      metadata,
    })
    res.status(201).json(feature)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/features/:id', async (req, res) => {
  try {
    const feature = await FeatureModel.update(req.params.id, req.body)
    if (!feature) return res.status(404).json({ error: 'Feature not found' })
    res.json(feature)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/features/:id', async (req, res) => {
  try {
    const deleted = await FeatureModel.remove(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Feature not found' })
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Users
router.get('/users', async (_req, res) => {
  try {
    const users = await UserModel.findAll()
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/users', async (req, res) => {
  try {
    const { username, email } = req.body
    if (!username) return res.status(400).json({ error: 'username is required' })
    const user = await UserModel.create({ username, email })
    res.status(201).json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Players (multiplayer profiles)
router.get('/players', async (_req, res) => {
  try {
    const players = await PlayerModel.findAll()
    res.json(players)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/players/:id', async (req, res) => {
  try {
    const player = await PlayerModel.findById(req.params.id)
    if (!player) return res.status(404).json({ error: 'Player not found' })
    res.json(player)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/players', async (req, res) => {
  try {
    const { username, displayName, avatarType, avatarColor } = req.body
    if (!username) return res.status(400).json({ error: 'username is required' })

    let player = await PlayerModel.findByUsername(username)
    if (!player) {
      player = await PlayerModel.create({
        username,
        displayName,
        avatarType,
        avatarColor,
      })
    }
    res.status(201).json(player)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/players/:id', async (req, res) => {
  try {
    const player = await PlayerModel.update(req.params.id, req.body)
    if (!player) return res.status(404).json({ error: 'Player not found' })
    res.json(player)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Active players in a park
router.get('/parks/:parkId/players', async (req, res) => {
  try {
    const players = await ParkPlayerModel.findActiveByParkId(req.params.parkId)
    res.json(players)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router