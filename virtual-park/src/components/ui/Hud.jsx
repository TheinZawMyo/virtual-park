import { useEffect, useState } from 'react'
import {
  Armchair,
  HelpCircle,
  Info,
  Landmark,
  Leaf,
  Map,
  MapPin,
  Maximize2,
  MessageCircle,
  Mic,
  MousePointer,
  Move,
  Settings,
  Sparkles,
  Waves,
} from 'lucide-react'
import { getLocationName } from '../../game/layout'
import { game } from '../../game/state'
import Minimap from './Minimap'
import TouchJoystick from './TouchJoystick'

export function SpotIcon({ icon, size = 16, className }) {
  const Icon =
    icon === 'bench'
      ? Armchair
      : icon === 'water'
        ? Waves
        : icon === 'fountain'
          ? Sparkles
          : icon === 'pagoda'
            ? Landmark
            : Info
  return <Icon size={size} className={className} />
}

function IconButton({ label, onClick, active = false, children, className = '', disabled = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-10 w-10 place-items-center rounded-xl border backdrop-blur-md transition-all ${
        active
          ? 'border-[#d4f06a]/50 bg-[#d4f06a] text-[#0a120d]'
          : 'border-white/10 bg-black/30 text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white'
      } ${disabled ? 'cursor-not-allowed opacity-40' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

function HelpRow({ keys, label }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5">{keys}</span>
      <span className="text-[11px] text-white/50">{label}</span>
    </div>
  )
}

export default function Hud({
  settings,
  isTouch,
  canInteract,
  onInteract,
  onOpenSettings,
  onToggleHelp,
  onFullscreen,
  chatOpen,
  chatAvailable,
  onToggleChat,
  voiceEnabled,
  voiceAvailable,
  onToggleVoice,
}) {
  const [snapshot, setSnapshot] = useState(() => ({
    location: getLocationName(game.position.x, game.position.z),
    nearest: null,
    sitting: null,
    speed: 0,
    x: Math.round(game.position.x),
    z: Math.round(game.position.z),
  }))

  useEffect(() => {
    let raf
    let last = 0
    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      if (now - last < 110) return
      last = now
      const location = getLocationName(game.position.x, game.position.z)
      const x = Math.round(game.position.x)
      const z = Math.round(game.position.z)
      setSnapshot((prev) => {
        if (
          prev.location === location &&
          prev.nearest?.id === game.nearest?.id &&
          prev.sitting?.id === game.sitting?.id &&
          prev.x === x &&
          prev.z === z
        ) {
          return prev
        }
        return {
          location,
          nearest: game.nearest,
          sitting: game.sitting,
          speed: game.speed,
          x,
          z,
        }
      })
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const activeSpot = snapshot.sitting || snapshot.nearest
  const promptVisible = canInteract && Boolean(activeSpot)
  const promptAction = snapshot.sitting
    ? 'Stand up'
    : activeSpot?.type === 'bench'
      ? 'Sit down'
      : 'View info'

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="pointer-events-auto animate-fade glass-soft flex items-center gap-3 rounded-2xl px-3.5 py-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#d4f06a] text-[#12200f]">
            <Leaf size={18} strokeWidth={2.4} />
          </div>
          <div className="pr-1">
            <div className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/40">
              Virtual park
            </div>
            <div className="text-sm font-semibold tracking-wide text-white">Lumen Park</div>
          </div>
          <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/55 sm:flex">
            <MapPin size={11} className="text-[#d4f06a]" />
            {snapshot.location}
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <IconButton
            label={chatAvailable ? 'Open nearby player chat' : 'Move closer to a player to chat'}
            active={chatOpen}
            onClick={onToggleChat}
            disabled={!chatAvailable}
          >
            <MessageCircle size={17} />
          </IconButton>
          <IconButton
            label={voiceEnabled ? 'Turn off your microphone' : 'Turn on your mic to speak'}
            active={voiceEnabled}
            onClick={onToggleVoice}
            disabled={!voiceAvailable && !voiceEnabled}
          >
            <Mic size={17} />
          </IconButton>
          {!isTouch && (
            <IconButton
              label="Toggle guide (H)"
              active={settings.showHelp}
              onClick={onToggleHelp}
            >
              <HelpCircle size={17} />
            </IconButton>
          )}
          <IconButton label="Fullscreen" onClick={onFullscreen} className="hidden sm:grid">
            <Maximize2 size={17} />
          </IconButton>
          <IconButton label="Settings" onClick={onOpenSettings}>
            <Settings size={17} />
          </IconButton>
        </div>
      </div>

      <div className="mt-auto flex items-end justify-between gap-4">
        {!isTouch && settings.showHelp ? (
          <div className="pointer-events-auto hidden w-60 animate-rise rounded-2xl p-4 glass-panel sm:block">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[9px] font-medium uppercase tracking-[0.28em] text-white/40">
                Controls
              </span>
              <span className="text-[9px] text-white/30">H to hide</span>
            </div>
            <div className="space-y-2.5">
              <HelpRow
                keys={
                  <>
                    <span className="keycap">W</span>
                    <span className="keycap">A</span>
                    <span className="keycap">S</span>
                    <span className="keycap">D</span>
                  </>
                }
                label="Walk"
              />
              <HelpRow keys={<span className="keycap">Shift</span>} label="Sprint" />
              <HelpRow
                keys={
                  <span className="flex items-center gap-1 text-white/60">
                    <MousePointer size={13} /> Drag
                  </span>
                }
                label="Look around"
              />
              <HelpRow keys={<span className="keycap">E</span>} label="Interact" />
              <HelpRow keys={<span className="keycap">Esc</span>} label="Close menus" />
            </div>
            <div className="mt-3 flex items-center gap-1.5 border-t border-white/8 pt-2.5 text-[10px] text-white/35">
              <Move size={11} /> Walk the paths to discover landmarks.
            </div>
          </div>
        ) : (
          <div />
        )}

        {settings.showMinimap && (
          <div className="pointer-events-auto w-32 animate-fade rounded-2xl p-2.5 glass-panel sm:w-44 [@media(max-height:520px)]:w-36">
            <div className="mb-1.5 flex items-center justify-between px-0.5">
              <span className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.22em] text-white/45">
                <Map size={11} /> Park map
              </span>
              <span className="hidden text-[9px] text-white/30 sm:inline">N ↑</span>
            </div>
            <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/10">
              <Minimap showMarkers={settings.showMarkers} />
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-2 px-0.5 text-[9px] text-white/35">
              <span className="truncate">{snapshot.location}</span>
              <span className="hidden shrink-0 tabular-nums sm:inline">
                {snapshot.x}, {snapshot.z}
              </span>
            </div>
          </div>
        )}
      </div>

      {promptVisible && (
        <div className="absolute bottom-56 left-1/2 z-30 w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 animate-rise sm:bottom-7">
          <button
            type="button"
            onClick={() => onInteract(activeSpot)}
            className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl border border-[#d4f06a]/30 bg-[#0f1b12]/90 px-3.5 py-2.5 text-left shadow-[0_18px_50px_-18px_rgba(0,0,0,0.9)] backdrop-blur-xl transition hover:border-[#d4f06a]/60 hover:bg-[#152418]/95"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#d4f06a] text-[#0d1a10]">
              <SpotIcon icon={snapshot.sitting ? 'bench' : activeSpot.icon} size={17} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-[#d4f06a]/80">
                {promptAction}
              </span>
              <span className="block truncate text-sm font-medium text-white">
                {snapshot.sitting ? snapshot.sitting.title : activeSpot.title}
              </span>
            </span>
            {!isTouch && <span className="keycap shrink-0">E</span>}
          </button>
        </div>
      )}

      {isTouch && <TouchJoystick />}
    </div>
  )
}
