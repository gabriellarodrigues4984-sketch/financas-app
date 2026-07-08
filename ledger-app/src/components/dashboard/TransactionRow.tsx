import type { Transaction } from '../../hooks/useMonthData'
import type { Category, Card } from '../../context/DataContext'
import { formatCurrency, formatDayShort } from '../../lib/format'

export function TransactionRow({
  tx,
  category,
  card,
  onDelete,
}: {
  tx: Transaction
  category?: Category
  card?: Card
  onDelete?: (id: string) => void
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-surface-container-lowest group">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${category?.color ?? '#727785'}22`, color: category?.color ?? '#727785' }}
        >
          <span className="material-symbols-outlined text-[20px]">{category?.icon ?? 'receipt_long'}</span>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-on-surface truncate">{tx.description}</div>
          <div className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wide truncate">
            {tx.payment_type === 'credito' ? `Crédito${card ? ` • ${card.name}` : ''}` : 'Débito'}
            {tx.installments_total > 1 ? ` • ${tx.installment_number}/${tx.installments_total}` : ''}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <div className="font-data text-brand-red text-sm">- {formatCurrency(Number(tx.amount))}</div>
          <div className="text-[11px] text-on-surface-variant">{formatDayShort(tx.date)}</div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(tx.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity material-symbols-outlined text-[18px] text-on-surface-variant hover:text-brand-red p-1"
            aria-label="Excluir"
          >
            delete
          </button>
        )}
      </div>
    </div>
  )
}
