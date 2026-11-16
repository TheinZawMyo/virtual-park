export default function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className="pointer-events-none absolute left-1/2 top-24 z-40 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 animate-rise sm:top-28">
      <div className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3">
        <span className="h-2 w-2 shrink-0 animate-soft-pulse rounded-full bg-[#d4f06a]" />
        <div className="min-w-0">
          <div className="truncate text-[12px] font-medium text-white">{toast.title}</div>
          {toast.detail && (
            <div className="truncate text-[10.5px] text-white/45">{toast.detail}</div>
          )}
        </div>
      </div>
    </div>
  )
}
