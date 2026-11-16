import { useCallback, useEffect, useRef, useState } from "react"
import Experience from "./components/scene/Experience"
import Hud from "./components/ui/Hud"
import InfoModal from "./components/ui/InfoModal"
import Intro from "./components/ui/Intro"
import SettingsPanel from "./components/ui/SettingsPanel"
import Toast from "./components/ui/Toast"
import { game, resetPlayer, standUp } from "./game/state"
import { parkApi } from "./api"
import { useParkWS } from "./hooks/useParkWS"
import OtherPlayers from "./components/scene/OtherPlayers"

function detectTouch() {
  return (
    typeof window !== "undefined" &&
    Boolean(window.matchMedia?.("(pointer: coarse)").matches)
  )
}

function initialSettings(isTouch) {
  return {
    timeOfDay: "day",
    shadows: !isTouch,
    showMinimap: true,
    showHelp: !isTouch,
    showMarkers: true,
  }
}

export default function App() {
  const [isTouch] = useState(detectTouch)
  const [settings, setSettings] = useState(() => initialSettings(isTouch))
  const [started, setStarted] = useState(false)
  const [modal, setModal] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const [player, setPlayer] = useState(null)
  const [remotePlayers, setRemotePlayers] = useState([])
  const [wsError, setWsError] = useState(null)

  const showToast = useCallback((title, detail) => {
    setToast({ title, detail })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3400)
  }, [])

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  const {
    connected,
    error: wsConnError,
    joinPark,
    leavePark,
    movePlayer,
    sendChat,
    getPlayers,
  } = useParkWS({
    parkId: player?.parkId || 1,
    playerName: player?.playerName,
    avatarType: player?.avatarType,
    avatarColor: player?.avatarColor,
    onMessage: (msg) => {
      switch (msg.type) {
        case "error":
          setWsError(msg.error)
          break
        case "joined_park":
          setPlayer((prev) => ({ ...prev, ...msg.player }))
          break
        case "player_joined":
          setRemotePlayers((prev) => {
            const exists = prev.some((p) => p.id === msg.player.id)
            if (exists) return prev
            return [...prev, msg.player]
          })
          break
        case "player_left":
          setRemotePlayers((prev) => prev.filter((p) => p.id !== msg.playerId))
          break
        case "player_moved":
          if (msg.playerId === player?.id) return
          setRemotePlayers((prev) =>
            prev.map((p) =>
              p.id === msg.playerId
                ? { ...p, x: msg.x, y: msg.y, z: msg.z, rotation: msg.rotation }
                : p
            )
          )
          break
        case "player_list":
          setRemotePlayers(
            msg.players.filter((p) => p.id !== player?.id).map((p) => ({
              id: p.player_id,
              playerName: p.username,
              displayName: p.display_name,
              avatarType: p.avatar_type,
              avatarColor: p.avatar_color,
              x: p.x,
              y: p.y,
              z: p.z,
              rotation: p.rotation || {},
            }))
          )
          break
        case "chat_message":
          showToast(
            `${msg.playerName} says`,
            msg.message
          )
          break
      }
    },
  })

  useEffect(() => {
    if (wsConnError) {
      showToast("Connection error", wsConnError)
      setWsError(null)
    }
  }, [wsConnError, showToast])

  useEffect(() => {
    game.started = started
    game.paused = !started || Boolean(modal) || settingsOpen
  }, [started, modal, settingsOpen])

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const toggleHelp = useCallback(() => {
    setSettings((prev) => ({ ...prev, showHelp: !prev.showHelp }))
  }, [])

  const handleInteract = useCallback(
    (spot) => {
      if (!spot) return
      if (spot.type === "bench") {
        if (game.sitting?.id === spot.id) {
          standUp()
          showToast("Back on your feet", spot.title)
        } else {
          game.sitting = spot
          showToast("Sitting down", `${spot.title} \u00b7 press E to stand`)
        }
      } else {
        setModal(spot)
      }
    },
    [showToast]
  )

  const handleStart = useCallback(
    ({ playerName, avatarType, avatarColor }) => {
      setStarted(true)
      game.started = true
      game.paused = false
      game.cameraYaw = 0
      game.cameraPitch = 0.36
      setPlayer({
        parkId: 1,
        playerName,
        avatarType,
        avatarColor,
        x: game.position.x,
        y: 0,
        z: game.position.z,
        rotation: { y: game.playerYaw },
      })
      showToast(
        "Welcome to Lumen Park",
        isTouch
          ? "Use the stick to walk \u00b7 drag to look \u00b7 tap prompts"
          : "WASD to walk \u00b7 drag to look \u00b7 E to interact"
      )
    },
    [showToast, isTouch]
  )

  useEffect(() => {
    if (!started || !player) return
    let lastSend = 0
    const raf = requestAnimationFrame(function tick(now) {
      requestAnimationFrame(tick)
      if (now - lastSend < 100) return
      lastSend = now
      movePlayer(game.position.x, 0, game.position.z, { y: game.playerYaw })
    })
    return () => cancelAnimationFrame(raf)
  }, [started, player, movePlayer])

  const handleReset = useCallback(() => {
    resetPlayer()
    setSettingsOpen(false)
    showToast("Returned to the south gate", "Wander as long as you like")
  }, [showToast])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code === "Escape") {
        if (modal) setModal(null)
        else if (settingsOpen) setSettingsOpen(false)
        return
      }
      const tag = event.target?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return

      if (!started && (event.code === "Enter" || event.code === "Space")) {
        event.preventDefault()
        return
      }
      if (started && !modal && !settingsOpen) {
        if (event.code === "KeyH") toggleHelp()
        if (event.code === "KeyM") {
          setSettings((prev) => ({ ...prev, showMinimap: !prev.showMinimap }))
        }
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [modal, settingsOpen, started, toggleHelp])

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#08120b] font-sans text-white">
      {!started && (
        <Intro
          onStart={handleStart}
          isTouch={isTouch}
        />
      )}

      {started && (
        <>
          <Experience
            settings={settings}
            onInteract={handleInteract}
            remotePlayers={remotePlayers}
            localPlayerId={player?.id}
          />

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.38))]" />

          <Hud
            settings={settings}
            isTouch={isTouch}
            canInteract={started && !modal && !settingsOpen}
            onInteract={handleInteract}
            onOpenSettings={() => setSettingsOpen(true)}
            onToggleHelp={toggleHelp}
            onFullscreen={toggleFullscreen}
          />

          <Toast toast={toast} />

          {modal && <InfoModal spot={modal} onClose={() => setModal(null)} />}

          {settingsOpen && (
            <SettingsPanel
              settings={settings}
              isTouch={isTouch}
              updateSettings={updateSettings}
              onClose={() => setSettingsOpen(false)}
              onReset={handleReset}
            />
          )}
        </>
      )}
    </div>
  )
}
