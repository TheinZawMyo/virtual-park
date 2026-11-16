import { ArrowRight, X } from 'lucide-react'
import { SpotIcon } from './Hud'

const ACCENT = {
  bench: '#e9c48f',
  info: '#d4f06a',
  landmark: '#a9d8ff',
  nature: '#8fe6c4',
}

export default function InfoModal({ spot, onClose }) {
  if (!spot) return null
  const accent = ACCENT[spot.type] ?? '#d4f06a'
  const paragraphs = spot.body.split('\n\n')

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[3px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="animate-rise glass-panel w-full max-w-lg overflow-hidden rounded-3xl">
        <div className="relative border-b border-white/8 p-5 pb-4 sm:p-6 sm:pb-5">
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full opacity-20 blur-3xl"
            style={{ background: accent }}
          />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border"
                style={{
                  background: `${accent}1a`,
                  borderColor: `${accent}55`,
                  color: accent,
                }}
              >
                <SpotIcon icon={spot.icon} size={21} />
              </div>
              <div>
                <span
                  className="mb-1 inline-block rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em]"
                  style={{ borderColor: `${accent}44`, color: accent, background: `${accent}12` }}
                >
                  {spot.category}
                </span>
                <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  {spot.title}
                </h2>
                <p className="mt-0.5 text-[12px] text-white/45">{spot.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/45 transition hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-3 p-5 sm:p-6">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-[13px] leading-relaxed text-white/65">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/8 px-5 py-4 sm:px-6">
          <span className="hidden text-[10px] uppercase tracking-[0.2em] text-white/30 sm:block">
            Esc to close
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl bg-[#d4f06a] px-4 py-2.5 text-[12px] font-semibold text-[#0b1410] transition hover:bg-[#e2fa83]"
          >
            Back to the park
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
