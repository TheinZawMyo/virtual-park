import { useEffect, useRef, useState } from 'react'
import { Send, X } from 'lucide-react'

export default function ChatPanel({ messages, player, players, connected, voiceEnabled, voiceError, onSend, onClose }) {
  const [draft, setDraft] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [messages])

  const submit = (event) => {
    event.preventDefault()
    if (!draft.trim()) return
    onSend(draft)
    setDraft('')
  }

  const onlineCount = players.length + (player ? 1 : 0)
  const voiceCount = players.filter((peer) => peer.voiceEnabled).length + (voiceEnabled ? 1 : 0)

  return (
    <section className="pointer-events-auto absolute bottom-24 right-4 z-40 flex max-h-[min(70dvh,34rem)] w-[calc(100%-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl glass-panel animate-rise sm:bottom-5 sm:right-5">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
        <div>
          <h2 className="text-sm font-semibold text-white">ပန်းခြံစကားပြော</h2>
          <p className="mt-0.5 text-[10px] text-white/40">
            {connected ? `${onlineCount} ယောက် အွန်လိုင်း · မိုက်ဖွင့် ${voiceCount} ယောက်` : 'ချိတ်ဆက်နေသည်…'}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close chat" className="grid h-8 w-8 place-items-center rounded-lg text-white/45 hover:bg-white/10 hover:text-white">
          <X size={16} />
        </button>
      </header>

      <div className="min-h-36 flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-32 flex-col items-center justify-center text-center">
            <p className="text-xs text-white/65">စကားစပြောလိုက်ပါ</p>
            <p className="mt-1 max-w-56 text-[10px] leading-relaxed text-white/35">စာပို့တာကို ဒီ park ထဲက ကစားသမားအားလုံး မြင်နိုင်ပါတယ်။</p>
          </div>
        ) : messages.map((message, index) => {
          const mine = message.playerId === player?.id
          return (
            <article key={`${message.timestamp}-${message.playerId}-${index}`} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
              <span className="mb-1 px-1 text-[9px] text-white/40">{mine ? 'သင်' : message.playerName}</span>
              <p className={`max-w-[88%] break-words rounded-2xl px-3 py-2 text-xs leading-relaxed ${mine ? 'rounded-tr-sm bg-[#d4f06a] text-[#14200f]' : 'rounded-tl-sm border border-white/8 bg-white/[0.07] text-white/85'}`}>
                {message.message}
              </p>
            </article>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {(voiceEnabled || voiceError) && (
        <div className={`border-t border-white/8 px-4 py-2 text-[10px] leading-relaxed ${voiceError ? 'text-rose-300' : 'text-[#d4f06a]/70'}`}>
          {voiceError || 'အနီးရှိသူနှင့် အသံပြောရန် နှစ်ဦးစလုံး မိုက်ဖွင့်ထားရမည်'}
        </div>
      )}

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-white/10 p-3">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={500}
          placeholder="စာတစ်ခုရေးပါ…"
          aria-label="Message"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/30 focus:border-[#d4f06a]/50"
        />
        <button type="submit" disabled={!connected || !draft.trim()} aria-label="Send message" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#d4f06a] text-[#0b1410] transition hover:bg-[#e2fa83] disabled:cursor-not-allowed disabled:opacity-40">
          <Send size={15} />
        </button>
      </form>
    </section>
  )
}
