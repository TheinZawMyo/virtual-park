import { useCallback, useEffect, useRef, useState } from 'react'
import { game } from '../game/state'
import { PROXIMITY_RANGE } from '../game/layout'

const turnUrls = import.meta.env.VITE_TURN_URLS?.split(',').map((url) => url.trim()).filter(Boolean) || []
const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  ...(turnUrls.length ? [{
    urls: turnUrls,
    username: import.meta.env.VITE_TURN_USERNAME,
    credential: import.meta.env.VITE_TURN_CREDENTIAL,
  }] : []),
]
const RTC_CONFIG = { iceServers }

export function useParkVoice({ playerId, players, sendVoiceSignal, sendVoiceStatus }) {
  const [enabled, setEnabled] = useState(false)
  const [error, setError] = useState('')
  const [availablePeerIds, setAvailablePeerIds] = useState([])
  const streamRef = useRef(null)
  const peersRef = useRef(new Map())
  const pendingIceRef = useRef(new Map())
  const audioRef = useRef(new Map())
  const playersRef = useRef(players)
  const signalRef = useRef(sendVoiceSignal)

  playersRef.current = players
  signalRef.current = sendVoiceSignal

  useEffect(() => {
    const resumeRemoteAudio = () => {
      audioRef.current.forEach((audio) => audio.play().catch(() => {}))
    }
    window.addEventListener('pointerdown', resumeRemoteAudio)
    window.addEventListener('keydown', resumeRemoteAudio)
    return () => {
      window.removeEventListener('pointerdown', resumeRemoteAudio)
      window.removeEventListener('keydown', resumeRemoteAudio)
    }
  }, [])

  const peerIdsKey = availablePeerIds.map((id) => {
    const peer = playersRef.current.find((candidate) => candidate.id === id)
    return `${id}:${peer?.voiceEnabled ? 1 : 0}`
  }).join(',')

  useEffect(() => {
    if (!playerId) {
      setAvailablePeerIds((current) => current.length ? [] : current)
      return undefined
    }

    const updateNearbyPlayers = () => {
      const nearby = playersRef.current
        .filter((peer) => peer.id !== playerId &&
          Math.hypot((peer.x ?? 0) - game.position.x, (peer.z ?? 0) - game.position.z) <= PROXIMITY_RANGE)
        .map((peer) => peer.id)
        .sort((a, b) => Number(a) - Number(b))
      setAvailablePeerIds((current) =>
        current.length === nearby.length && current.every((id, index) => id === nearby[index])
          ? current
          : nearby
      )
    }

    updateNearbyPlayers()
    const timer = window.setInterval(updateNearbyPlayers, 120)
    return () => window.clearInterval(timer)
  }, [enabled, playerId])

  const closePeer = useCallback((peerId) => {
    const pc = peersRef.current.get(peerId)
    if (pc) {
      pc.onicecandidate = null
      pc.ontrack = null
      pc.onconnectionstatechange = null
      pc.close()
      peersRef.current.delete(peerId)
    }
    pendingIceRef.current.delete(peerId)
    const audio = audioRef.current.get(peerId)
    if (audio) {
      audio.pause()
      audio.srcObject = null
      audioRef.current.delete(peerId)
    }
  }, [])

  const ensurePeer = useCallback((peerId) => {
    let pc = peersRef.current.get(peerId)
    if (!pc) {
      pc = new RTCPeerConnection(RTC_CONFIG)
      peersRef.current.set(peerId, pc)
    }
    streamRef.current?.getTracks().forEach((track) => {
      if (!pc.getSenders().some((sender) => sender.track === track)) {
        pc.addTrack(track, streamRef.current)
      }
    })

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signalRef.current?.(peerId, { candidate: event.candidate.toJSON() })
      }
    }
    pc.ontrack = (event) => {
      let audio = audioRef.current.get(peerId)
      if (!audio) {
        audio = new Audio()
        audio.autoplay = true
        audio.playsInline = true
        audioRef.current.set(peerId, audio)
      }
      audio.srcObject = event.streams[0]
      audio.play().catch(() => {})
    }
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') closePeer(peerId)
    }
    return pc
  }, [closePeer])

  const handleSignal = useCallback(async ({ fromPlayerId, signal }) => {
    if (!fromPlayerId || !signal) return
    const peerId = Number(fromPlayerId)
    const peer = playersRef.current.find((candidate) => candidate.id === peerId)
    if (!peer || Math.hypot((peer.x ?? 0) - game.position.x, (peer.z ?? 0) - game.position.z) > PROXIMITY_RANGE) return
    try {
      const pc = ensurePeer(peerId)
      if (signal.description) {
        await pc.setRemoteDescription(signal.description)
        const pending = pendingIceRef.current.get(peerId) || []
        for (const candidate of pending) await pc.addIceCandidate(candidate)
        pendingIceRef.current.delete(peerId)

        if (signal.description.type === 'offer') {
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          signalRef.current?.(peerId, { description: pc.localDescription.toJSON() })
        }
      } else if (signal.candidate) {
        const candidate = new RTCIceCandidate(signal.candidate)
        if (pc.remoteDescription) {
          await pc.addIceCandidate(candidate)
        } else {
          const pending = pendingIceRef.current.get(peerId) || []
          pending.push(candidate)
          pendingIceRef.current.set(peerId, pending)
        }
      }
    } catch (err) {
      console.warn('[voice] unable to apply peer signal', err)
    }
  }, [ensurePeer])

  const toggleVoice = useCallback(async () => {
    if (enabled) {
      setEnabled(false)
      setError('')
      sendVoiceStatus(false)
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      return
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone voice requires HTTPS or localhost.')
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      streamRef.current = stream
      audioRef.current.forEach((audio) => audio.play().catch(() => {}))
      setError('')
      setEnabled(true)
      sendVoiceStatus(true)
    } catch (err) {
      setError(err?.name === 'NotAllowedError'
        ? 'Microphone access was denied. Allow mic access in browser settings and try again.'
        : err?.message || 'Could not start microphone.')
    }
  }, [enabled, sendVoiceStatus])

  useEffect(() => {
    if (!playerId) {
      peersRef.current.forEach((_, peerId) => closePeer(peerId))
      return
    }

    for (const peerId of availablePeerIds) {
      const peer = playersRef.current.find((candidate) => candidate.id === peerId)
      const remoteVoiceEnabled = Boolean(peer?.voiceEnabled)
      if (!enabled && !remoteVoiceEnabled) continue

      const pc = ensurePeer(peerId)
      // A speaker starts the session for listeners; when both speak, use one offerer.
      const shouldOffer = enabled && (!remoteVoiceEnabled || Number(playerId) < Number(peerId))
      if (shouldOffer && pc.signalingState === 'stable') {
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => signalRef.current?.(peerId, { description: pc.localDescription.toJSON() }))
          .catch((err) => console.warn('[voice] unable to create offer', err))
      }
    }

    const active = new Set(availablePeerIds.filter((peerId) => {
      const peer = playersRef.current.find((candidate) => candidate.id === peerId)
      return enabled || Boolean(peer?.voiceEnabled)
    }))
    peersRef.current.forEach((_, peerId) => {
      if (!active.has(peerId)) closePeer(peerId)
    })
  }, [enabled, playerId, peerIdsKey, ensurePeer, closePeer])

  useEffect(() => () => {
    peersRef.current.forEach((pc) => pc.close())
    peersRef.current.clear()
    audioRef.current.forEach((audio) => {
      audio.pause()
      audio.srcObject = null
    })
    audioRef.current.clear()
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  return { enabled, error, toggleVoice, handleSignal }
}
