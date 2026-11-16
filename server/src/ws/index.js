import { WebSocketServer, WebSocket } from "ws"
import { ParkPlayerModel, PlayerModel } from "../models/park.js"

const CHAT_VOICE_RANGE = 14

export class ParkWebSocketServer {
  constructor(server, options = {}) {
    this.wss = new WebSocketServer({ server, path: options.path || "/ws" })
    this.clients = new Map()
    this.parkRooms = new Map()
    this.setup()
  }

  setup() {
    this.wss.on("connection", (ws, req) => {
      const clientId = crypto.randomUUID()
      this.clients.set(ws, {
        id: clientId,
        parkId: null,
        playerId: null,
        playerName: null,
        avatarType: null,
        avatarColor: null,
        x: 0,
        y: 0,
        z: 0,
      })

      console.log(`[ws] client connected: ${clientId}`)

      ws.on("message", (raw) => {
        try {
          const msg = JSON.parse(raw.toString())
          this.handleMessage(ws, msg)
        } catch (err) {
          this.send(ws, { type: "error", error: "invalid json" })
        }
      })

      ws.on("close", () => {
        this.handleDisconnect(ws)
      })

      ws.on("error", (err) => {
        console.error("[ws] client error", err.message)
        this.handleDisconnect(ws)
      })

      this.send(ws, { type: "welcome", clientId })
    })
  }

  async handleMessage(ws, msg) {
    const info = this.clients.get(ws)
    if (!info) return

    switch (msg.type) {
      case "join_park": {
        const { parkId, playerName, avatarType, avatarColor } = msg
        const playerKey = typeof msg.playerKey === "string" && msg.playerKey.length <= 100
          ? msg.playerKey
          : playerName
        if (!parkId || !playerName) {
          this.send(ws, {
            type: "error",
            error: "parkId and playerName are required",
          })
          return
        }

        if (info.parkId) {
          await this.leavePark(ws, info)
        }

        let player = await PlayerModel.findByUsername(playerKey)
        if (!player) {
          player = await PlayerModel.create({
            username: playerKey,
            displayName: playerName,
            avatarType,
            avatarColor,
          })
        } else {
          await PlayerModel.update(player.id, {
            displayName: playerName,
            avatarType,
            avatarColor,
          })
        }

        info.parkId = parkId
        info.playerId = player.id
        info.playerName = playerName
        info.avatarType = avatarType || "default"
        info.avatarColor = avatarColor || "#ffffff"
        info.voiceEnabled = false
        info.x = Number.isFinite(msg.x) ? msg.x : 0
        info.y = Number.isFinite(msg.y) ? msg.y : 0
        info.z = Number.isFinite(msg.z) ? msg.z : 0

        if (!this.parkRooms.has(parkId)) {
          this.parkRooms.set(parkId, new Set())
        }
        this.parkRooms.get(parkId).add(ws)

        await ParkPlayerModel.upsert({
          parkId,
          playerId: player.id,
          x: info.x,
          y: info.y,
          z: info.z,
          rotation: msg.rotation ?? {},
        })

        this.send(ws, {
          type: "joined_park",
          parkId,
          player: {
            id: player.id,
            username: player.username,
            displayName: player.display_name,
            avatarType: player.avatar_type,
            avatarColor: player.avatar_color,
          },
        })

        this.broadcastToPark(
          parkId,
          {
            type: "player_joined",
            player: {
              id: player.id,
              username: player.username,
              displayName: player.display_name,
              avatarType: player.avatar_type,
              avatarColor: player.avatar_color,
              voiceEnabled: false,
              x: info.x,
              y: info.y,
              z: info.z,
              rotation: msg.rotation ?? {},
            },
          },
          ws
        )

        const players = await ParkPlayerModel.findActiveByParkId(parkId)
        this.send(ws, { type: "player_list", players: this.withVoiceStatus(parkId, players) })
        break
      }

      case "leave_park": {
        await this.leavePark(ws, info)
        this.send(ws, { type: "left_park" })
        break
      }

      case "player_move": {
        if (!info.parkId || !info.playerId) {
          this.send(ws, { type: "error", error: "not in a park" })
          return
        }

        const { x, y, z, rotation } = msg
        if (Number.isFinite(x)) info.x = x
        if (Number.isFinite(y)) info.y = y
        if (Number.isFinite(z)) info.z = z
        await ParkPlayerModel.upsert({
          parkId: info.parkId,
          playerId: info.playerId,
          x,
          y,
          z,
          rotation,
        })

        this.broadcastToPark(
          info.parkId,
          {
            type: "player_moved",
            playerId: info.playerId,
            playerName: info.playerName,
            x: info.x,
            y: info.y,
            z: info.z,
            rotation,
            voiceEnabled: Boolean(info.voiceEnabled),
          },
          ws
        )
        break
      }

      case "chat_message": {
        if (!info.parkId || !info.playerId) {
          this.send(ws, { type: "error", error: "not in a park" })
          return
        }

        const message = typeof msg.message === "string" ? msg.message.trim().slice(0, 500) : ""
        if (!message) {
          this.send(ws, { type: "error", error: "message is required" })
          return
        }

        const recipients = this.broadcastToNearby(info.parkId, info, {
          type: "chat_message",
          playerId: info.playerId,
          playerName: info.playerName,
          avatarColor: info.avatarColor,
          message,
          timestamp: Date.now(),
        }, ws)
        if (recipients === 0) {
          this.send(ws, { type: "error", error: "No players are nearby to receive your message." })
        }
        break
      }

      case "voice_status": {
        if (!info.parkId || !info.playerId) {
          this.send(ws, { type: "error", error: "not in a park" })
          return
        }
        info.voiceEnabled = Boolean(msg.enabled)
        this.broadcastToPark(info.parkId, {
          type: "voice_status",
          playerId: info.playerId,
          enabled: info.voiceEnabled,
        })
        break
      }

      case "voice_signal": {
        if (!info.parkId || !info.playerId) {
          this.send(ws, { type: "error", error: "not in a park" })
          return
        }
        const room = this.parkRooms.get(info.parkId)
        const targetId = Number(msg.toPlayerId)
        if (!Number.isInteger(targetId) || !msg.signal || typeof msg.signal !== "object") return
        for (const peerWs of room || []) {
          const peer = this.clients.get(peerWs)
          const distance = peer ? Math.hypot((peer.x ?? 0) - info.x, (peer.z ?? 0) - info.z) : Infinity
          if (peer?.playerId === targetId && peer.parkId === info.parkId && distance <= CHAT_VOICE_RANGE) {
            this.send(peerWs, {
              type: "voice_signal",
              fromPlayerId: info.playerId,
              signal: msg.signal,
            })
          }
        }
        break
      }

      case "get_players": {
        if (!info.parkId) {
          this.send(ws, { type: "error", error: "not in a park" })
          return
        }
        const players = await ParkPlayerModel.findActiveByParkId(info.parkId)
        this.send(ws, { type: "player_list", players: this.withVoiceStatus(info.parkId, players) })
        break
      }

      case "ping":
        this.send(ws, { type: "pong", ts: Date.now() })
        break

      default:
        this.send(ws, { type: "error", error: "unknown message type" })
    }
  }

  async leavePark(ws, info) {
    if (!info.parkId) return

    const room = this.parkRooms.get(info.parkId)
    if (room) {
      room.delete(ws)
      if (room.size === 0) {
        this.parkRooms.delete(info.parkId)
      }
    }

    if (info.playerId) {
      await ParkPlayerModel.setInactive(info.parkId, info.playerId)
    }

    this.broadcastToPark(
      info.parkId,
      {
        type: "player_left",
        playerId: info.playerId,
        playerName: info.playerName,
      },
      ws
    )

    info.parkId = null
    info.playerId = null
    info.playerName = null
    info.avatarType = null
    info.avatarColor = null
    info.voiceEnabled = false
    info.x = 0
    info.y = 0
    info.z = 0
  }

  async handleDisconnect(ws) {
    const info = this.clients.get(ws)
    if (info) {
      await this.leavePark(ws, info)
      console.log(`[ws] client disconnected: ${info.id}`)
      this.clients.delete(ws)
    }
  }

  send(ws, payload) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload))
    }
  }

  withVoiceStatus(parkId, players) {
    const room = this.parkRooms.get(parkId)
    const voiceEnabledIds = new Set(
      [...(room || [])]
        .map((peerWs) => this.clients.get(peerWs))
        .filter((peer) => peer?.voiceEnabled)
        .map((peer) => peer.playerId)
    )
    return players.map((player) => ({
      ...player,
      voice_enabled: voiceEnabledIds.has(player.player_id),
    }))
  }

  broadcastToPark(parkId, payload, excludeWs) {
    const room = this.parkRooms.get(parkId)
    if (!room) return
    const json = JSON.stringify(payload)
    for (const ws of room) {
      if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
        ws.send(json)
      }
    }
  }

  broadcastToNearby(parkId, origin, payload, excludeWs) {
    const room = this.parkRooms.get(parkId)
    if (!room) return 0
    const json = JSON.stringify(payload)
    let recipients = 0
    for (const ws of room) {
      if (ws === excludeWs || ws.readyState !== WebSocket.OPEN) continue
      const peer = this.clients.get(ws)
      if (!peer || peer.parkId !== parkId) continue
      const distance = Math.hypot((peer.x ?? 0) - origin.x, (peer.z ?? 0) - origin.z)
      if (distance <= CHAT_VOICE_RANGE) {
        ws.send(json)
        recipients += 1
      }
    }
    return recipients
  }

  broadcastAll(payload, excludeWs) {
    const json = JSON.stringify(payload)
    for (const [ws] of this.clients) {
      if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
        ws.send(json)
      }
    }
  }

  close() {
    this.wss.close()
  }
}
