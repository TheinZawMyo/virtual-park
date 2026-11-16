import { useState } from "react"
import { ArrowRight, Armchair, Leaf, MousePointer, Move, Sparkles, User, Package } from "lucide-react"

const AVATARS = [
  { id: "default", label: "Default", color: "#d9a06b", icon: User },
  { id: "robot", label: "Robot", color: "#ff6b6b", icon: Package },
  { id: "dino", label: "Dino", color: "#4ecdc4", icon: Armchair },
]

export default function Intro({ onStart, isTouch }) {
  const [playerName, setPlayerName] = useState(localStorage.getItem("vp_player_name") || "Visitor")
  const [avatarType, setAvatarType] = useState(localStorage.getItem("vp_avatar_type") || "default")
  const [avatarColor, setAvatarColor] = useState(localStorage.getItem("vp_avatar_color") || "#d9a06b")

  const features = [
    {
      icon: Move,
      title: "Wander",
      detail: isTouch
        ? "Use the on-screen stick to stroll the promenades."
        : "WASD or the on-screen stick. Hold Shift to jog the promenades.",
    },
    {
      icon: MousePointer,
      title: "Look around",
      detail: isTouch
        ? "Drag anywhere on the park to orbit your view."
        : "Drag anywhere on the park to orbit. Scroll to zoom.",
    },
    {
      icon: Armchair,
      title: "Slow down",
      detail: isTouch
        ? "Tap the prompt near benches, the board, the pond or the pagoda."
        : "Walk up to benches, the board, the pond or the pagoda and press E.",
    },
  ]

  const handleStart = () => {
    localStorage.setItem("vp_player_name", playerName)
    localStorage.setItem("vp_avatar_type", avatarType)
    localStorage.setItem("vp_avatar_color", avatarColor)
    onStart({ playerName, avatarType, avatarColor })
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#050b07]/80 via-[#050b07]/25 to-[#050b07]/90 p-5">
      <div className="pointer-events-none absolute -left-28 top-1/4 h-80 w-80 rounded-full bg-[#d4f06a]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-[#8fc9b0]/10 blur-3xl" />

      <div className="animate-rise relative w-full max-w-2xl text-center">
        <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-[#d4f06a]/30 bg-[#d4f06a]/10 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-[#d4f06a] sm:text-[10px] sm:tracking-[0.22em]">
          <Leaf size={12} className="shrink-0" />
          <span>Interactive prototype</span>
          <span className="hidden sm:inline">· React Three Fiber</span>
        </div>

        <h1 className="text-5xl font-semibold tracking-[-0.035em] text-white sm:text-7xl">
          Lumen <span className="text-[#d4f06a]">Park</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[13px] leading-relaxed text-white/55 sm:text-sm">
          A pocket-sized 3D park you can walk through. Follow the promenades, find the
          fountain and the golden ShweDagon Pagoda, then take a seat by Mirror Pond.
        </p>

        <div className="mx-auto mt-8 grid max-w-xl gap-2.5 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass-soft rounded-2xl px-3.5 py-3.5 text-left"
            >
              <feature.icon size={17} className="mb-2 text-[#d4f06a]" />
              <div className="text-[12px] font-semibold text-white">{feature.title}</div>
              <div className="mt-0.5 text-[10.5px] leading-relaxed text-white/40">
                {feature.detail}
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-sm rounded-3xl border border-[#d4f06a]/20 bg-[#0f1b12]/80 px-5 py-6 backdrop-blur-xl shadow-[0_20px_60px_-18px_rgba(0,0,0,0.9)]">
          <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#d4f06a]/80">
            <User size={13} /> Create your avatar
          </div>

          <div className="mb-4">
            <label className="block text-[11px] mb-1.5 text-white/60">Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.trim())}
              maxLength={20}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white text-sm outline-none focus:border-[#d4f06a] transition"
              placeholder="Visitor"
            />
          </div>

          <div className="mb-4">
            <label className="block text-[11px] mb-1.5 text-white/60">Avatar style</label>
            <div className="flex gap-2">
              {AVATARS.map((a) => {
                const Icon = a.icon
                const active = avatarType === a.id
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setAvatarType(a.id)
                      setAvatarColor(a.color)
                    }}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 transition text-xs font-medium capitalize ${active
                      ? "border-[#d4f06a]/60 bg-[#d4f06a]/20 text-white"
                      : "border-white/10 text-white/50 hover:border-white/25"}`}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mb-0.5" style={{ backgroundColor: a.color }}>
                      <Icon size={14} />
                    </div>
                    <span>{a.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/8">
            <button
              type="button"
              onClick={handleStart}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#d4f06a] px-6 py-3 text-sm font-semibold text-[#0b1410] shadow-[0_20px_60px_-20px_rgba(212,240,106,0.55)] transition hover:bg-[#e2fa83]"
            >
              Enter the park
              <ArrowRight size={16} className="transition-transform hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        <div className="mt-10 text-[10px] text-white/25">
          Built with React, Three.js and React Three Fiber · No downloads, no sign-in
        </div>
      </div>
    </div>
  )
}
