import { useState } from 'react'
import { useData } from '../context/DataContext'
import { useMonthData } from '../hooks/useMonthData'
import { formatCurrency } from '../lib/format'
import { AddCardModal } from '../components/cards/AddCardModal'
import { EmptyState } from '../components/EmptyState'

export function Cards() {
  const now = new Date()
  const { cards, addCard, archiveCard } = useData()
  const { byCard, totals } = useMonthData(now.getFullYear(), now.getMonth())
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-surface-container-low p-4 rounded-2xl">
        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
          Total no crédito este mês
        </span>
        <div className="text-xl font-data font-bold text-on-surface">{formatCurrency(totals.creditoTotal)}</div>
      </div>

      <button
        onClick={() => setOpen(true)}
        className="w-full bg-brand-red hover:bg-brand-red/90 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-red/20 transition-transform active:scale-[0.98]"
      >
        <span className="material-symbols-outlined">add_circle</span>
        Adicionar Cartão
      </button>

      <section>
        <h2 className="font-display font-bold text-lg text-on-background mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-brand-orange">credit_card</span>
          Meus Cartões
        </h2>

        {cards.length === 0 ? (
          <EmptyState
            icon="credit_card"
            title="Nenhum cartão cadastrado"
            subtitle="Cadastre seus cartões para separar os gastos no crédito por cartão."
          />
        ) : (
          <div className="space-y-3">
            {cards.map((card) => {
              const spent = byCard.get(card.id) ?? 0
              return (
                <div key={card.id} className="bg-surface-container-lowest border border-outline-variant p-4 rounded-2xl shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${card.color}22`, color: card.color }}
                      >
                        <span className="material-symbols-outlined">credit_card</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-on-surface truncate">{card.name}</div>
                        <div className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                          {card.closing_day ? `Fecha dia ${card.closing_day}` : ''}
                          {card.closing_day && card.due_day ? ' · ' : ''}
                          {card.due_day ? `Vence dia ${card.due_day}` : ''}
                          {!card.closing_day && !card.due_day ? 'Sem datas cadastradas' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-data font-bold text-brand-red">{formatCurrency(spent)}</div>
                      <div className="text-[10px] text-on-surface-variant">este mês</div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2 border-t border-outline-variant">
                    <button
                      onClick={() => archiveCard(card.id)}
                      className="text-on-surface-variant text-xs font-bold uppercase tracking-wider hover:text-brand-red"
                    >
                      Arquivar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <AddCardModal open={open} onClose={() => setOpen(false)} onSave={addCard} />
    </div>
  )
}
