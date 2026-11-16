import { useEffect, useRef, useState, useCallback } from 'react'

const WS_BASE = import.meta.env.VITE_WS_BASE || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`

function getSessionPlayerKey() {
  let key = sessionStorage.getItem('vp_player_key')
  if (!key) {
    key = `visitor-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`
    sessionStorage.setItem('vp_player_key', key)
  }
  return key
}

export function useParkWS({ parkId, playerName, avatarType, avatarColor, onMessage }) {
  const wsRef = useRef(null)
  const reconnectRef = useRef(null)
  const stoppedRef = useRef(false)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const callbacks = useRef(onMessage)
  const configRef = useRef({ parkId, playerName, avatarType, avatarColor })

  useEffect(() => {
    callbacks.current = onMessage
    configRef.current = { parkId, playerName, avatarType, avatarColor }
  }, [onMessage, parkId, playerName, avatarType, avatarColor])

  const connect = useCallback(() => {
    if (stoppedRef.current) return
    const state = wsRef.current?.readyState
    if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) return
    if (reconnectRef.current) {
      window.clearTimeout(reconnectRef.current)
      reconnectRef.current = null
    }

    const ws = new WebSocket(WS_BASE)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      setError(null)
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        callbacks.current?.(msg)
      } catch (err) {
        console.error('[ws] bad message', err)
      }
    }

    ws.onclose = () => {
      setConnected(false)
      wsRef.current = null
      if (stoppedRef.current) return
      // Auto-reconnect after 2 seconds
      reconnectRef.current = window.setTimeout(() => {
        connect()
      }, 2000)
    }

    ws.onerror = (err) => {
      if (stoppedRef.current) return
      console.error('[ws] error', err)
      setError('WebSocket connection failed')
    }
  }, [WS_BASE])

  const send = useCallback((payload) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload))
      return true
    }
    return false
  }, [])

  const joinPark = useCallback(
    (pId, pName, aType, aColor, x, y, z, rotation) => {
      configRef.current = { parkId: pId, playerName: pName, avatarType: aType, avatarColor: aColor }
      send({
        type: 'join_park',
        parkId: pId,
        playerKey: getSessionPlayerKey(),
        playerName: pName,
        avatarType: aType,
        avatarColor: aColor,
        x,
        y,
        z,
        rotation,
      })
    },
    [send]
  )

  const leavePark = useCallback(() => {
    send({ type: 'leave_park' })
  }, [send])

  const movePlayer = useCallback(
    (x, y, z, rotation) => {
      const { parkId: pId, playerName: pName } = configRef.current
      send({
        type: 'player_move',
        parkId: pId,
        playerName: pName,
        x,
        y,
        z,
        rotation,
      })
    },
    [send]
  )

  const sendChat = useCallback((message) => {
    const { parkId: pId, playerName: pName } = configRef.current
    return send({ type: 'chat_message', parkId: pId, playerName: pName, message })
  }, [send])

  const sendVoiceStatus = useCallback((enabled) => {
    send({ type: 'voice_status', enabled })
  }, [send])

  const sendVoiceSignal = useCallback((toPlayerId, signal) => {
    send({ type: 'voice_signal', toPlayerId, signal })
  }, [send])

  const getPlayers = useCallback(() => {
    const { parkId: pId } = configRef.current
    send({ type: 'get_players', parkId: pId })
  }, [send])

  useEffect(() => {
    stoppedRef.current = false
    connect()
    return () => {
      stoppedRef.current = true
      if (reconnectRef.current) {
        window.clearTimeout(reconnectRef.current)
        reconnectRef.current = null
      }
      const ws = wsRef.current
      wsRef.current = null
      if (!ws) return
      if (ws.readyState === WebSocket.CONNECTING) {
        // close() during CONNECTING logs "closed before the connection is
        // established"; wait until it opens, then close cleanly.
        ws.onopen = () => ws.close()
        ws.onclose = null
        ws.onerror = null
        ws.onmessage = null
      } else {
        ws.close()
      }
    }
  }, [connect])

  return {
    connected,
    error,
    joinPark,
    leavePark,
    movePlayer,
    sendChat,
    sendVoiceStatus,
    sendVoiceSignal,
    getPlayers,
  }
}
