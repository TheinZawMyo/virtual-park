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
          <h2 className="text-sm font-semibold text-white">Lumen Park အဖွဲ့စကားပြော</h2>
          <p className="mt-0.5 text-[10px] text-white/40">
            {connected ? `${onlineCount} ယောက် အနီးရှိ · မိုက်ဖွင့် ${voiceCount} ယောက်` : 'ချိတ်ဆက်နေသည်…'}
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
            <p className="mt-1 max-w-56 text-[10px] leading-relaxed text-white/35">အနီးရှိ ကစားသမားအုပ်စုနဲ့ စကားစပြောလိုက်ပါ။</p>
          </div>
        ) : messages.map((message, index) => {
          const mine = Boolean(message.localEcho) || message.playerId === player?.id
          const senderName = mine ? (player?.playerName || 'သင်') : (message.playerName || message.displayName || 'Player')
          const initial = senderName.trim().charAt(0) || '•'
          const time = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(message.timestamp || Date.now())
          return (
            <article key={`${message.timestamp}-${message.playerId}-${index}`} className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/15 text-[10px] font-semibold text-[#10180f]" style={{ backgroundColor: message.avatarColor || (mine ? player?.avatarColor : '#91a88b') }} aria-hidden="true">
                {initial}
              </span>
              <div className={`flex min-w-0 max-w-[84%] flex-col ${mine ? 'items-end' : 'items-start'}`}>
                <div className="mb-1 flex items-center gap-2 px-1">
                  <span className="truncate text-[9px] font-medium text-white/55">{senderName}</span>
                  <time className="shrink-0 text-[8px] tabular-nums text-white/30">{time}</time>
                </div>
                <p className={`break-words rounded-2xl px-3 py-2 text-xs leading-relaxed ${mine ? 'rounded-tr-sm bg-[#d4f06a] text-[#14200f]' : 'rounded-tl-sm border border-white/8 bg-white/[0.07] text-white/85'}`}>
                  {message.message}
                </p>
              </div>
            </article>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className={`border-t border-white/8 px-4 py-2 text-[10px] leading-relaxed ${voiceError ? 'text-rose-300' : 'text-[#d4f06a]/70'}`}>
        {voiceError || (voiceEnabled
          ? 'သင်ပြောနေပါသည်။ အနီးရှိကစားသမားများက မိုက်ဖွင့်စရာမလိုဘဲ နားထောင်နိုင်သည်။'
          : 'အနီးရှိသူပြောသံကို မိုက်ပိတ်ထားလည်း နားထောင်နိုင်သည်။ ကိုယ်ပြောလိုမှ မိုက်ဖွင့်ပါ။')}
      </div>

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
