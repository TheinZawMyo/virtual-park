import { X } from 'lucide-react'
import { BENCHES, BOARD, LAMPS, PAGODA, POND, STEPPING_STONES, TREES } from '../../game/layout'

const CENTER = 360
const SCALE = 8

function point(x, z) {
  return [CENTER + x * SCALE, CENTER + z * SCALE]
}

function Marker({ x, z, color, label, radius = 8 }) {
  const [cx, cy] = point(x, z)
  return (
    <g>
      <circle cx={cx} cy={cy} r={radius + 4} fill="#07110b" opacity=".8" />
      <circle cx={cx} cy={cy} r={radius} fill={color} stroke="#f4f0df" strokeWidth="2" />
      {label && <title>{label}</title>}
    </g>
  )
}

function MapGraphic() {
  const [pagodaX, pagodaY] = point(PAGODA.x, PAGODA.z)
  const [pondX, pondY] = point(POND.x, POND.z)
  const [boardX, boardY] = point(BOARD.x, BOARD.z)

  return (
    <svg viewBox="0 0 720 720" className="h-full w-full" role="img" aria-label="Lumen Park map">
      <defs>
        <clipPath id="park-clip"><circle cx={CENTER} cy={CENTER} r="272" /></clipPath>
        <pattern id="water-lines" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M0 9 Q4 5 9 9 T18 9" fill="none" stroke="#b4e2dc" strokeOpacity=".22" strokeWidth="2" />
        </pattern>
      </defs>
      <circle cx={CENTER} cy={CENTER} r="286" fill="#0a160e" stroke="#c9d59d" strokeOpacity=".65" strokeWidth="2" />
      <g clipPath="url(#park-clip)">
        <rect x="74" y="74" width="572" height="572" fill="#17291b" />

        {TREES.map((tree) => {
          const [x, y] = point(tree.x, tree.z)
          return <circle key={tree.id} cx={x} cy={y} r={tree.type === 'pine' ? 5 : 6} fill={tree.color === undefined ? '#426b3e' : ['#5f9648', '#528a43', '#6ba14e', '#497f3d', '#7aa855'][tree.color]} opacity=".62" />
        })}

        <path d="M360 82 L360 638 M82 360 L638 360" fill="none" stroke="#a89b78" strokeWidth="38" strokeLinecap="round" />
        <path d="M360 82 L360 638 M82 360 L638 360" fill="none" stroke="#d8c99e" strokeOpacity=".42" strokeWidth="2" strokeDasharray="9 12" />
        <circle cx={CENTER} cy={CENTER} r="52" fill="#c9b98e" stroke="#eee1bd" strokeWidth="5" />
        <circle cx={CENTER} cy={CENTER} r="36" fill="#a8a18f" stroke="#efe7d4" strokeWidth="3" />
        <circle cx={CENTER} cy={CENTER} r="19" fill="#579aaa" stroke="#d8e8dc" strokeWidth="3" />

        <path d={`M${point(3.7, -3.7).join(' ')} L${point(9.2, -9.2).join(' ')}`} fill="none" stroke="#d8c99e" strokeWidth="11" strokeDasharray="3 11" strokeLinecap="round" />
        {STEPPING_STONES.map((stone, index) => {
          const [x, y] = point(stone.x, stone.z)
          return <ellipse key={index} cx={x} cy={y} rx="6" ry="4" fill="#b6b09e" stroke="#e2dac7" strokeWidth="1.5" transform={`rotate(-38 ${x} ${y})`} />
        })}

        <circle cx={pondX} cy={pondY} r={POND.r * SCALE} fill="#3d8790" stroke="#b8d9bd" strokeWidth="5" />
        <circle cx={pondX} cy={pondY} r={POND.r * SCALE} fill="url(#water-lines)" />
        <ellipse cx={pondX - 11} cy={pondY + 6} rx="19" ry="9" fill="#5caa91" opacity=".75" />
        <ellipse cx={pondX + 15} cy={pondY - 13} rx="12" ry="7" fill="#83b995" opacity=".75" />

        <circle cx={pagodaX} cy={pagodaY} r="48" fill="#c6a652" stroke="#f1d882" strokeWidth="4" />
        <circle cx={pagodaX} cy={pagodaY} r="34" fill="#e0b837" stroke="#fff0ad" strokeWidth="3" />
        <path d={`M${pagodaX - 17} ${pagodaY + 10} L${pagodaX} ${pagodaY - 19} L${pagodaX + 17} ${pagodaY + 10} Z`} fill="#fff0ad" />
        <path d={`M${pagodaX} ${pagodaY - 17} L${pagodaX} ${pagodaY - 33}`} stroke="#fff0ad" strokeWidth="4" />

        {BENCHES.map((bench) => <Marker key={bench.id} x={bench.x} z={bench.z} color="#d5a879" label={bench.name} radius={5} />)}
        {LAMPS.map((lamp, index) => <circle key={`lamp-${index}`} cx={point(lamp.x, lamp.z)[0]} cy={point(lamp.x, lamp.z)[1]} r="4" fill="#f4dc91" />)}
        <Marker x={BOARD.x} z={BOARD.z} color="#d4f06a" label="Information sign" radius={8} />

        <g fill="#f5f0dd" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="600" paintOrder="stroke" stroke="#17291b" strokeWidth="4" strokeLinejoin="round">
          <text x="360" y="112" textAnchor="middle">NORTH GATE</text>
          <text x="360" y="620" textAnchor="middle">MAIN GATE</text>
          <text x={pagodaX - 17} y={pagodaY + 67} textAnchor="middle">SHWEDAGON PAGODA</text>
          <text x={pondX + 3} y={pondY + 73} textAnchor="middle">MIRROR POND</text>
          <text x="360" y="438" textAnchor="middle">FOUNTAIN</text>
          <text x={boardX + 18} y={boardY + 22}>YOU ARE HERE</text>
        </g>
      </g>

      <g transform="translate(610 112)" textAnchor="middle" fill="#f4f0df">
        <path d="M0 0 L-10 28 L0 22 L10 28 Z" fill="#d4f06a" />
        <text y="44" fontSize="12" fontWeight="700">N</text>
      </g>
    </svg>
  )
}

const LEGEND = [
  ['#d4f06a', 'လမ်းညွှန်ဆိုင်းဘုတ်'],
  ['#e0b837', 'ShweDagon Pagoda'],
  ['#3d8790', 'Mirror Pond'],
  ['#579aaa', 'Fountain & Central Plaza'],
  ['#d5a879', 'Park benches'],
]

export default function ParkMapModal({ onClose }) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/65 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <section className="animate-rise glass-panel my-auto w-full max-w-5xl overflow-hidden rounded-3xl">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d4f06a]">Lumen Park</p>
            <h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">လမ်းညွှန်မြေပုံ</h2>
            <p className="mt-1 text-xs text-white/50">ပန်းခြံအတွင်း လမ်းကြောင်းများနှင့် အထင်ကရနေရာများ</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close map" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white/55 transition hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </header>

        <div className="grid gap-4 p-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:gap-6 sm:p-6">
          <div className="aspect-square overflow-hidden rounded-2xl border border-white/10 bg-[#0b170f] p-1 sm:p-2">
            <MapGraphic />
          </div>
          <aside className="flex flex-col justify-center gap-4 px-1 pb-2 sm:px-0">
            <div>
              <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Map key</h3>
              <ul className="space-y-3">
                {LEGEND.map(([color, label]) => (
                  <li key={label} className="flex items-center gap-2.5 text-xs text-white/75">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/10" style={{ backgroundColor: color }} />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[#d4f06a]/15 bg-[#d4f06a]/5 p-3.5 text-[11px] leading-relaxed text-white/55">
              ပင်မလမ်းမကြီးနှစ်ကြောင်းက အလယ်ရေပန်းမှာ ဆုံပါတယ်။ အရှေ့မြောက်ဘက်က ခြေလှမ်းကျောက်လမ်းအတိုင်း Mirror Pond ဆီ သွားနိုင်ပါတယ်။
            </div>
            <button type="button" onClick={onClose} className="rounded-xl bg-[#d4f06a] px-4 py-2.5 text-xs font-semibold text-[#0b1410] transition hover:bg-[#e2fa83]">
              ပန်းခြံသို့ ပြန်သွားမည်
            </button>
          </aside>
        </div>
      </section>
    </div>
  )
}
