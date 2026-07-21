import { useState } from 'react'
import type { FixedCostWithPayment } from '../../hooks/useMonthData'
import { formatCurrency, parseCurrencyInput } from '../../lib/format'

export function FixedCostRow({
  item,
  onTogglePaid,
  onChangeAmount,
  onEdit,
}: {
  item: FixedCostWithPayment
  onTogglePaid: (item: FixedCostWithPayment) => void
  onChangeAmount: (item: FixedCostWithPayment, amount: number) => void
  onEdit: (item: FixedCostWithPayment) => void
}) {
  const paid = item.payment?.paid ?? false
  const currentAmount = Number(item.payment?.paid_amount ?? item.amount)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(currentAmount.toFixed(2).replace('.', ','))

  function commit() {
    setEditing(false)
    const value = parseCurrencyInput(draft)
    if (value !== currentAmount) onChangeAmount(item, value)
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-2xl flex items-center gap-4 shadow-sm">
      <button
        onClick={() => onTogglePaid(item)}
        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
          paid ? 'bg-brand-teal text-white' : 'border-2 border-outline-variant'
        }`}
        aria-label={paid ? 'Marcar como não pago' : 'Marcar como pago'}
      >
        {paid && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${item.variable ? 'text-brand-orange' : 'text-on-surface'}`}>
          {item.name}
        </div>
        <div className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
          {item.variable ? 'Variável' : item.due_day ? `Vence todo dia ${item.due_day}` : 'Fixo'}
        </div>
      </div>
      <div className="w-24 shrink-0">
        {editing ? (
          <input
            autoFocus
            className="w-full bg-transparent border-b border-brand-blue text-right font-data py-1"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
          />
        ) : (
          <button
            onClick={() => {
              setDraft(currentAmount.toFixed(2).replace('.', ','))
              setEditing(true)
            }}
            className="w-full border-b border-outline-variant text-right font-data py-1 text-on-surface"
          >
            {formatCurrency(currentAmount)}
          </button>
        )}
      </div>
      <button
        onClick={() => onEdit(item)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high shrink-0"
        aria-label="Editar custo fixo"
      >
        <span className="material-symbols-outlined text-[18px]">edit</span>
      </button>
    </div>
  )
}
