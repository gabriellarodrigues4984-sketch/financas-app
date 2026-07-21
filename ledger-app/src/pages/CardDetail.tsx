import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useCardTransactions } from '../hooks/useCardTransactions'
import { formatCurrency } from '../lib/format'
import { TransactionRow } from '../components/dashboard/TransactionRow'
import { InstallmentGroupRow } from '../components/cards/InstallmentGroupRow'
import { EmptyState } from '../components/EmptyState'

export function CardDetail() {
  const { cardId } = useParams<{ cardId: string }>()
  const navigate = useNavigate()
  const { cards, categories } = useData()
  const { loading, singleTransactions, inProgress, finished, totals, deleteTransaction } = useCardTransactions(cardId)
  const [showFinished, setShowFinished] = useState(false)

  const card = cards.find((c) => c.id === cardId)
  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]))

  if (!card) {
    return (
      <div className="pb-6">
        <button onClick={() => navigate('/cartoes')} className="flex items-center gap-1 text-brand-blue font-bold text-sm mb-4">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Voltar
        </button>
        <EmptyState icon="credit_card" title="Cartão não encontrado" subtitle="Ele pode ter sido arquivado ou removido." />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      <button onClick={() => navigate('/cartoes')} className="flex items-center gap-1 text-brand-blue font-bold text-sm">
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        Voltar
      </button>

      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${card.color}22`, color: card.color }}
        >
          <span className="material-symbols-outlined text-[24px]">credit_card</span>
        </div>
        <div className="min-w-0">
          <h1 className="font-display font-bold text-xl text-on-background truncate">{card.name}</h1>
          <div className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">
            {card.closing_day ? `Fecha dia ${card.closing_day}` : ''}
            {card.closing_day && card.due_day ? ' · ' : ''}
            {card.due_day ? `Vence dia ${card.due_day}` : ''}
            {!card.closing_day && !card.due_day ? 'Sem datas cadastradas' : ''}
          </div>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3">
        <div className="bg-brand-red/10 p-4 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-red block mb-1">Este mês</span>
          <div className="text-lg font-data font-bold text-brand-red truncate">{formatCurrency(totals.totalThisMonth)}</div>
        </div>
        <div className="bg-brand-orange/10 p-4 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-orange block mb-1">
            Ainda vai fechar
          </span>
          <div className="text-lg font-data font-bold text-brand-orange truncate">{formatCurrency(totals.totalCommitted)}</div>
        </div>
        <div className="bg-surface-container-low p-4 rounded-2xl col-span-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
            Total já gasto neste cartão (histórico)
          </span>
          <div className="text-xl font-data font-bold text-on-surface truncate">{formatCurrency(totals.totalAllTime)}</div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <section>
            <h2 className="font-display font-bold text-lg text-on-background mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-orange">calendar_month</span>
              Parcelamentos em andamento
            </h2>
            {inProgress.length === 0 ? (
              <EmptyState
                icon="event_available"
                title="Nenhuma parcela em aberto"
                subtitle="As compras parceladas ainda não pagas por completo aparecem aqui."
              />
            ) : (
              <div className="space-y-3">
                {inProgress.map((g) => (
                  <InstallmentGroupRow key={g.groupId} group={g} category={g.categoryId ? categoryById[g.categoryId] : undefined} />
                ))}
              </div>
            )}
          </section>

          {finished.length > 0 && (
            <section>
              <button
                onClick={() => setShowFinished((v) => !v)}
                className="flex items-center gap-1 text-sm font-bold text-on-surface-variant mb-3"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showFinished ? 'expand_less' : 'expand_more'}
                </span>
                Parcelamentos quitados ({finished.length})
              </button>
              {showFinished && (
                <div className="space-y-3">
                  {finished.map((g) => (
                    <InstallmentGroupRow key={g.groupId} group={g} category={g.categoryId ? categoryById[g.categoryId] : undefined} />
                  ))}
                </div>
              )}
            </section>
          )}

          <section>
            <h2 className="font-display font-bold text-lg text-on-background mb-3">Compras à vista</h2>
            {singleTransactions.length === 0 ? (
              <EmptyState icon="receipt_long" title="Nenhuma compra à vista" subtitle="Compras no crédito sem parcelamento aparecem aqui." />
            ) : (
              <div className="rounded-2xl overflow-hidden border border-outline-variant divide-y divide-outline-variant shadow-sm">
                {singleTransactions.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    tx={tx}
                    category={tx.category_id ? categoryById[tx.category_id] : undefined}
                    onDelete={deleteTransaction}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
