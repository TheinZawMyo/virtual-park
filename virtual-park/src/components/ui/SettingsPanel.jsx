import {
  BookOpen,
  Check,
  Layers,
  Map,
  Moon,
  RotateCcw,
  Settings,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  X,
} from 'lucide-react'
import { TIME_ORDER, TIME_PRESETS } from '../../game/presets'

const TIME_ICONS = {
  dawn: Sunrise,
  day: Sun,
  sunset: Sunset,
  night: Moon,
}

function Toggle({ icon: Icon, label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-left transition hover:border-white/15 hover:bg-white/[0.06]"
    >
      <span className="flex items-center gap-2.5">
        <Icon size={15} className="text-white/45" />
        <span className="text-[13px] text-white/85">{label}</span>
      </span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-[#d4f06a]' : 'bg-white/15'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-[#0b1410] transition-transform ${
            checked ? 'translate-x-[1.15rem]' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}

function ControlRow({ keys, label }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.025] px-2.5 py-1.5">
      <span className="flex items-center gap-1">{keys}</span>
      <span className="text-[11px] text-white/45">{label}</span>
    </div>
  )
}

export default function SettingsPanel({ settings, isTouch, updateSettings, onClose, onReset }) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[3px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="animate-rise glass-panel no-scrollbar max-h-[90dvh] w-full max-w-[440px] overflow-y-auto rounded-3xl p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-[#d4f06a]">
              <Settings size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white">Park settings</h2>
              <p className="text-[11px] text-white/40">Tune the light and the interface.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="grid h-8 w-8 place-items-center rounded-lg text-white/45 transition hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[9px] font-medium uppercase tracking-[0.26em] text-white/40">
              Time of day
            </span>
            <span className="text-[10px] text-white/30">{TIME_PRESETS[settings.timeOfDay].label}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {TIME_ORDER.map((key) => {
              const Icon = TIME_ICONS[key]
              const active = settings.timeOfDay === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateSettings({ timeOfDay: key })}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 text-[10px] font-medium transition ${
                    active
                      ? 'border-[#d4f06a]/50 bg-[#d4f06a] text-[#0b1410]'
                      : 'border-white/8 bg-white/[0.03] text-white/55 hover:border-white/15 hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon size={16} />
                  {TIME_PRESETS[key].label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mb-5">
          <span className="mb-2 block text-[9px] font-medium uppercase tracking-[0.26em] text-white/40">
            Interface
          </span>
          <div className="space-y-1.5">
            <Toggle
              icon={Map}
              label="Minimap"
              checked={settings.showMinimap}
              onChange={(value) => updateSettings({ showMinimap: value })}
            />
            {!isTouch && (
              <Toggle
                icon={BookOpen}
                label="On-screen guide"
                checked={settings.showHelp}
                onChange={(value) => updateSettings({ showHelp: value })}
              />
            )}
            <Toggle
              icon={Sparkles}
              label="Hotspot markers"
              checked={settings.showMarkers}
              onChange={(value) => updateSettings({ showMarkers: value })}
            />
            <Toggle
              icon={Layers}
              label="Shadows"
              checked={settings.shadows}
              onChange={(value) => updateSettings({ shadows: value })}
            />
          </div>
        </div>

        <div className="mb-5">
          <span className="mb-2 block text-[9px] font-medium uppercase tracking-[0.26em] text-white/40">
            Controls
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {isTouch ? (
              <>
                <ControlRow keys={<span className="keycap">Stick</span>} label="Walk" />
                <ControlRow keys={<span className="keycap">Drag</span>} label="Look" />
                <ControlRow keys={<span className="keycap">Tap</span>} label="Interact" />
                <ControlRow keys={<span className="keycap">Prompt</span>} label="Sit / read" />
              </>
            ) : (
              <>
                <ControlRow
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
                <ControlRow keys={<span className="keycap">Shift</span>} label="Sprint" />
                <ControlRow keys={<span className="keycap">E</span>} label="Interact" />
                <ControlRow keys={<span className="keycap">Esc</span>} label="Close" />
                <ControlRow keys={<span className="keycap">Drag</span>} label="Look" />
                <ControlRow keys={<span className="keycap">Scroll</span>} label="Zoom" />
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-white/8 pt-4">
          <button
            type="button"
            onClick={onReset}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[12px] font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            <RotateCcw size={14} />
            Reset position
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#d4f06a] px-3 py-2.5 text-[12px] font-semibold text-[#0b1410] transition hover:bg-[#e2fa83]"
          >
            <Check size={14} />
            Back to the park
          </button>
        </div>
      </div>
    </div>
  )
}
