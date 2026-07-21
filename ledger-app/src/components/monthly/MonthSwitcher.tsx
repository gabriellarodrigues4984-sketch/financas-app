import { monthLabel } from '../../lib/format'

export function MonthSwitcher({
  year,
  monthIndex0,
  onPrev,
  onNext,
}: {
  year: number
  monthIndex0: number
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex items-center justify-between bg-surface-container-low rounded-xl px-2 py-1.5">
      <button onClick={onPrev} className="p-2 rounded-lg hover:bg-surface-container-high" aria-label="Mês anterior">
        <span className="material-symbols-outlined text-on-surface-variant">chevron_left</span>
      </button>
      <span className="font-display font-bold text-sm text-on-background capitalize">
        {monthLabel(year, monthIndex0)}
      </span>
      <button onClick={onNext} className="p-2 rounded-lg hover:bg-surface-container-high" aria-label="Próximo mês">
        <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
      </button>
    </div>
  )
}
