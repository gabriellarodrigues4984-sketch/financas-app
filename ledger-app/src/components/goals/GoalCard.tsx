import { useState } from 'react'
import type { Goal } from '../../context/DataContext'
import { formatCurrency, parseCurrencyInput } from '../../lib/format'

export function GoalCard({
  goal,
  onContribute,
  onEdit,
}: {
  goal: Goal
  onContribute: (goalId: string, amount: number) => Promise<void>
  onEdit: (goal: Goal) => void
}) {
  const [mode, setMode] = useState<'aportar' | 'retirar' | null>(null)
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)

  const target = Number(goal.target_amount)
  const current = Number(goal.current_amount)
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0

  async function submitContribution() {
    if (!mode) return
    const amount = parseCurrencyInput(value)
    if (amount <= 0) return
    setSaving(true)
    try {
      await onContribute(goal.id, mode === 'retirar' ? -amount : amount)
      setValue('')
      setMode(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-2xl shadow-sm">
      <div className="flex justify-between items-start mb-4 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${goal.color}22`, color: goal.color }}
          >
            <span className="material-symbols-outlined">{goal.icon}</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-on-surface truncate">{goal.name}</h3>
            {goal.subtitle && <div className="text-xs text-on-surface-variant truncate">{goal.subtitle}</div>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onEdit(goal)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high"
            aria-label="Editar meta"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button
            onClick={() => setMode(mode ? null : 'aportar')}
            className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1.5 rounded-full"
            style={{ backgroundColor: `${goal.color}18`, color: goal.color }}
          >
            + / − Valor
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-xs text-on-surface-variant">{pct.toFixed(0)}% concluído</span>
          <span className="font-data text-sm font-bold" style={{ color: goal.color }}>
            {formatCurrency(current)} <span className="text-on-surface-variant font-body font-normal">/ {formatCurrency(target)}</span>
          </span>
        </div>
        <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: goal.color }} />
        </div>
      </div>

      {mode && (
        <div className="mt-4 pt-4 border-t border-outline-variant space-y-3">
          <div className="flex p-1 bg-surface-container-low rounded-xl">
            <button
              type="button"
              onClick={() => setMode('aportar')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
                mode === 'aportar' ? 'bg-surface text-brand-teal shadow-sm' : 'text-on-surface-variant'
              }`}
            >
              + APORTAR
            </button>
            <button
              type="button"
              onClick={() => setMode('retirar')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
                mode === 'retirar' ? 'bg-surface text-brand-red shadow-sm' : 'text-on-surface-variant'
              }`}
            >
              − RETIRAR
            </button>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-data text-on-surface-variant text-sm">R$</span>
              <input
                autoFocus
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-2.5 pl-9 pr-3 font-data text-sm"
                placeholder="0,00"
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitContribution()}
              />
            </div>
            <button
              onClick={submitContribution}
              disabled={saving}
              className="px-4 rounded-xl font-bold text-white text-sm disabled:opacity-60"
              style={{ backgroundColor: mode === 'retirar' ? '#F04F52' : goal.color }}
            >
              {saving ? '...' : 'OK'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
