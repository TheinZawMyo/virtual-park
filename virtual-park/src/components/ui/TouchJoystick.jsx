import { useRef, useState } from 'react'
import { game } from '../../game/state'

const RADIUS = 42

export default function TouchJoystick() {
  const baseRef = useRef(null)
  const activePointer = useRef(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })

  const update = (event) => {
    const base = baseRef.current
    if (!base) return
    const rect = base.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let dx = event.clientX - cx
    let dy = event.clientY - cy
    const distance = Math.hypot(dx, dy)
    if (distance > RADIUS) {
      dx = (dx / distance) * RADIUS
      dy = (dy / distance) * RADIUS
    }
    setKnob({ x: dx, y: dy })
    game.joystick.x = dx / RADIUS
    game.joystick.y = -dy / RADIUS
  }

  const release = () => {
    activePointer.current = null
    setKnob({ x: 0, y: 0 })
    game.joystick.x = 0
    game.joystick.y = 0
  }

  return (
    <div className="pointer-events-auto absolute bottom-6 left-5">
      <div
        ref={baseRef}
        onPointerDown={(event) => {
          activePointer.current = event.pointerId
          event.currentTarget.setPointerCapture(event.pointerId)
          update(event)
        }}
        onPointerMove={(event) => {
          if (activePointer.current !== event.pointerId) return
          update(event)
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onPointerLeave={(event) => {
          if (activePointer.current === event.pointerId && !event.currentTarget.hasPointerCapture(event.pointerId)) {
            release()
          }
        }}
        className="relative h-32 w-32 touch-none select-none rounded-full border border-white/15 bg-black/25 backdrop-blur-md"
      >
        <div className="absolute inset-6 rounded-full border border-white/10" />
        <div className="absolute left-1/2 top-3 -translate-x-1/2 text-[9px] uppercase tracking-[0.28em] text-white/35">
          Move
        </div>
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 rounded-full border border-[#d4f06a]/60 bg-[#d4f06a]/25 shadow-[0_0_20px_rgba(212,240,106,0.25)]"
          style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
        />
      </div>
    </div>
  )
}
