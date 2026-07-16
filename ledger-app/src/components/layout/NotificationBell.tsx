import { useEffect, useRef, useState } from 'react'
import { useData } from '../../context/DataContext'
import { useMonthData } from '../../hooks/useMonthData'
import { formatCurrency } from '../../lib/format'

interface Alert {
  id: string
  label: string
  detail: string
  amount?: number
  severity: 'atrasado' | 'em_breve'
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { cards } = useData()

  const now = new Date()
  const { fixedCosts } = useMonthData(now.getFullYear(), now.getMonth())
  const today = now.getDate()

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const alerts: Alert[] = []

  for (const fc of fixedCosts) {
    if (!fc.due_day || fc.payment?.paid) continue
    const diff = fc.due_day - today
    if (diff < 0) {
      alerts.push({
        id: `fc-${fc.id}`,
        label: fc.name,
        detail: `Venceu há ${Math.abs(diff)} dia${Math.abs(diff) === 1 ? '' : 's'} e ainda não foi marcado como pago`,
        amount: Number(fc.payment?.paid_amount ?? fc.amount),
        severity: 'atrasado',
      })
    } else if (diff <= 5) {
      alerts.push({
        id: `fc-${fc.id}`,
        label: fc.name,
        detail: diff === 0 ? 'Vence hoje' : `Vence em ${diff} dia${diff === 1 ? '' : 's'}`,
        amount: Number(fc.payment?.paid_amount ?? fc.amount),
        severity: 'em_breve',
      })
    }
  }

  for (const card of cards) {
    if (!card.due_day) continue
    const diff = card.due_day - today
    if (diff >= 0 && diff <= 3) {
      alerts.push({
        id: `card-${card.id}`,
        label: `Fatura do ${card.name}`,
        detail: diff === 0 ? 'Vence hoje' : `Vence em ${diff} dia${diff === 1 ? '' : 's'}`,
        severity: 'em_breve',
      })
    }
  }

  alerts.sort((a, b) => (a.severity === 'atrasado' ? -1 : 1) - (b.severity === 'atrasado' ? -1 : 1))

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-surface-container-low p-1.5 rounded-full"
        aria-label="Notificações"
      >
        notifications
        {alerts.length > 0 && (
          <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-brand-red" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden animate-pop-in origin-top-right">
          <div className="px-4 py-3 border-b border-outline-variant">
            <span className="text-sm font-bold text-on-surface">Notificações</span>
          </div>
          {alerts.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <span className="material-symbols-outlined text-on-surface-variant text-[28px] mb-1 block">
                notifications_off
              </span>
              <p className="text-xs text-on-surface-variant">Nenhum alerta por enquanto.</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant">
              {alerts.map((a) => (
                <div key={a.id} className="px-4 py-3 flex items-start gap-3">
                  <span
                    className={`material-symbols-outlined text-[18px] mt-0.5 ${
                      a.severity === 'atrasado' ? 'text-brand-red' : 'text-brand-orange'
                    }`}
                  >
                    {a.severity === 'atrasado' ? 'error' : 'schedule'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-on-surface truncate">{a.label}</div>
                    <div className="text-xs text-on-surface-variant">{a.detail}</div>
                  </div>
                  {a.amount !== undefined && (
                    <div className="text-xs font-data font-bold text-on-surface shrink-0">{formatCurrency(a.amount)}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
