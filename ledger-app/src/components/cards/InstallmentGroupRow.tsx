import type { InstallmentGroup } from '../../hooks/useCardTransactions'
import type { Category } from '../../context/DataContext'
import { formatCurrency, formatDayShort } from '../../lib/format'

export function InstallmentGroupRow({ group, category }: { group: InstallmentGroup; category?: Category }) {
  const pct = (group.paidCount / group.installmentsTotal) * 100

  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-2xl shadow-sm space-y-3">
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${category?.color ?? '#727785'}22`, color: category?.color ?? '#727785' }}
          >
            <span className="material-symbols-outlined text-[20px]">{category?.icon ?? 'receipt_long'}</span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-on-surface truncate">{group.description}</div>
            <div className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wide">
              {formatCurrency(group.installmentAmount)} / parcela
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-data font-bold text-sm text-on-surface">{formatCurrency(group.totalValue)}</div>
          <div className="text-[11px] text-on-surface-variant">valor total</div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold text-on-surface-variant uppercase">
          <span>
            {group.paidCount}/{group.installmentsTotal} parcelas pagas
          </span>
          <span>{pct.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
          <div className="bg-brand-blue h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-outline-variant">
        {group.remainingCount > 0 ? (
          <>
            <span className="text-xs font-bold text-brand-orange">
              Faltam {group.remainingCount}x de {formatCurrency(group.installmentAmount)}
            </span>
            <span className="text-xs text-on-surface-variant">
              {group.nextDueDate ? `Próxima ${formatDayShort(group.nextDueDate)}` : ''}
            </span>
          </>
        ) : (
          <span className="text-xs font-bold text-brand-teal flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Quitado
          </span>
        )}
      </div>
    </div>
  )
}
