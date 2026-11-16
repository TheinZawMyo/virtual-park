import { WebSocketServer, WebSocket } from "ws"
import { ParkPlayerModel, PlayerModel } from "../models/park.js"

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

        let player = await PlayerModel.findByUsername(playerName)
        if (!player) {
          player = await PlayerModel.create({
            username: playerName,
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

        if (!this.parkRooms.has(parkId)) {
          this.parkRooms.set(parkId, new Set())
        }
        this.parkRooms.get(parkId).add(ws)

        await ParkPlayerModel.upsert({
          parkId,
          playerId: player.id,
          x: msg.x ?? 0,
          y: msg.y ?? 0,
          z: msg.z ?? 0,
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
              x: msg.x ?? 0,
              y: msg.y ?? 0,
              z: msg.z ?? 0,
              rotation: msg.rotation ?? {},
            },
          },
          ws
        )

        const players = await ParkPlayerModel.findActiveByParkId(parkId)
        this.send(ws, { type: "player_list", players })
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
            x,
            y,
            z,
            rotation,
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

        const { message } = msg
        if (!message || typeof message !== "string") {
          this.send(ws, { type: "error", error: "message is required" })
          return
        }

        this.broadcastToPark(info.parkId, {
          type: "chat_message",
          playerId: info.playerId,
          playerName: info.playerName,
          avatarColor: info.avatarColor,
          message,
          timestamp: Date.now(),
        }, ws)
        break
      }

      case "get_players": {
        if (!info.parkId) {
          this.send(ws, { type: "error", error: "not in a park" })
          return
        }
        const players = await ParkPlayerModel.findActiveByParkId(info.parkId)
        this.send(ws, { type: "player_list", players })
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
