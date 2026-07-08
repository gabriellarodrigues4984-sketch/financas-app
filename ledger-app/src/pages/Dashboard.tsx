import { useState } from 'react'
import { useMonthData, type Transaction } from '../hooks/useMonthData'
import { useData } from '../context/DataContext'
import { formatCurrency, MONTH_NAMES } from '../lib/format'
import { ExpenseModal } from '../components/expense/ExpenseModal'
import { AddFixedCostModal } from '../components/dashboard/AddFixedCostModal'
import { FixedCostRow } from '../components/dashboard/FixedCostRow'
import { TransactionRow } from '../components/dashboard/TransactionRow'
import { EmptyState } from '../components/EmptyState'
import { Link } from 'react-router-dom'

export function Dashboard() {
  const now = new Date()
  const year = now.getFullYear()
  const monthIndex0 = now.getMonth()

  const { categories, cards } = useData()
  const {
    transactions,
    fixedCosts,
    totals,
    addTransaction,
    updateTransaction,
    addFixedCost,
    toggleFixedCostPaid,
    setFixedCostAmount,
  } = useMonthData(year, monthIndex0)

  const [expenseOpen, setExpenseOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [fixedCostOpen, setFixedCostOpen] = useState(false)

  function openEditExpense(tx: Transaction) {
    setEditingTx(tx)
    setExpenseOpen(true)
  }

  function closeExpenseModal() {
    setExpenseOpen(false)
    setEditingTx(null)
  }

  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]))
  const cardById = Object.fromEntries(cards.map((c) => [c.id, c]))

  return (
    <div className="space-y-6 pb-6">
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-low p-4 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
            Saldo Atual
          </span>
          <div className="text-xl font-data font-bold text-on-surface truncate">
            {formatCurrency(totals.saldoAcumulado)}
          </div>
        </div>
        <div className="bg-brand-red/10 p-4 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-red block mb-1">
            Gastos do Mês
          </span>
          <div className="text-xl font-data font-bold text-brand-red truncate">
            {formatCurrency(totals.gastosDoMes)}
          </div>
        </div>
      </section>

      <button
        onClick={() => {
          setEditingTx(null)
          setExpenseOpen(true)
        }}
        className="w-full bg-brand-red hover:bg-brand-red/90 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-red/20 transition-transform active:scale-[0.98]"
      >
        <span className="material-symbols-outlined">add_circle</span>
        Nova Despesa
      </button>

      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-display font-bold text-lg text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-brand-orange">event_repeat</span>
            Custos Fixos
          </h2>
          <button
            onClick={() => setFixedCostOpen(true)}
            className="text-brand-blue font-bold text-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Novo
          </button>
        </div>
        {fixedCosts.length === 0 ? (
          <EmptyState
            icon="event_repeat"
            title="Nenhum custo fixo ainda"
            subtitle="Cadastre aluguel, internet, assinaturas e outras contas recorrentes."
          />
        ) : (
          <div className="space-y-3">
            {fixedCosts.map((fc) => (
              <FixedCostRow key={fc.id} item={fc} onTogglePaid={toggleFixedCostPaid} onChangeAmount={setFixedCostAmount} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-display font-bold text-lg text-on-background">Últimas Transações</h2>
          <Link to="/mensal" className="text-brand-blue font-bold text-sm">Ver todas</Link>
        </div>
        {transactions.length === 0 ? (
          <EmptyState
            icon="receipt_long"
            title="Nenhuma despesa este mês"
            subtitle="Toque em “Nova Despesa” para registrar seu primeiro gasto."
          />
        ) : (
          <div className="rounded-2xl overflow-hidden border border-outline-variant divide-y divide-outline-variant shadow-sm">
            {transactions.slice(0, 6).map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                category={tx.category_id ? categoryById[tx.category_id] : undefined}
                card={tx.card_id ? cardById[tx.card_id] : undefined}
                onEdit={openEditExpense}
              />
            ))}
          </div>
        )}
      </section>

      <p className="text-center text-xs text-on-surface-variant">{MONTH_NAMES[monthIndex0]} de {year}</p>

      <ExpenseModal
        open={expenseOpen}
        onClose={closeExpenseModal}
        editingTx={editingTx}
        onSave={editingTx ? (input) => updateTransaction(editingTx.id, input) : addTransaction}
      />
      <AddFixedCostModal open={fixedCostOpen} onClose={() => setFixedCostOpen(false)} onSave={addFixedCost} />
    </div>
  )
}
