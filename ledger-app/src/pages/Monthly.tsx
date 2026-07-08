import { useState } from 'react'
import { useMonthData, type Transaction } from '../hooks/useMonthData'
import { useData } from '../context/DataContext'
import { addMonths, formatCurrency, parseCurrencyInput } from '../lib/format'
import { ExpenseModal } from '../components/expense/ExpenseModal'
import { AddFixedCostModal } from '../components/dashboard/AddFixedCostModal'
import { FixedCostRow } from '../components/dashboard/FixedCostRow'
import { TransactionRow } from '../components/dashboard/TransactionRow'
import { CategoryChart } from '../components/monthly/CategoryChart'
import { MonthSwitcher } from '../components/monthly/MonthSwitcher'
import { EmptyState } from '../components/EmptyState'

export function Monthly() {
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), monthIndex0: now.getMonth() })
  const { categories, cards } = useData()
  const {
    transactions,
    incomes,
    fixedCosts,
    totals,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addIncome,
    addFixedCost,
    toggleFixedCostPaid,
    setFixedCostAmount,
    byCategory,
  } = useMonthData(cursor.year, cursor.monthIndex0)

  const [expenseOpen, setExpenseOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [fixedCostOpen, setFixedCostOpen] = useState(false)
  const [incomeOpen, setIncomeOpen] = useState(false)

  function openNewExpense() {
    setEditingTx(null)
    setExpenseOpen(true)
  }

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
  const chartData = Array.from(byCategory.entries()).map(([categoryId, value]) => ({ categoryId, value }))

  return (
    <div className="space-y-6 pb-6">
      <MonthSwitcher
        year={cursor.year}
        monthIndex0={cursor.monthIndex0}
        onPrev={() => setCursor(addMonths(cursor.year, cursor.monthIndex0, -1))}
        onNext={() => setCursor(addMonths(cursor.year, cursor.monthIndex0, 1))}
      />

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-low p-4 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
            Saldo do Mês
          </span>
          <div className="text-lg font-data font-bold text-on-surface truncate">{formatCurrency(totals.saldo)}</div>
        </div>
        <div className="bg-brand-red/10 p-4 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-red block mb-1">Gastos</span>
          <div className="text-lg font-data font-bold text-brand-red truncate">{formatCurrency(totals.gastosDoMes)}</div>
        </div>
        <div className="bg-brand-teal/10 p-4 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-teal block mb-1">Entradas</span>
          <div className="text-lg font-data font-bold text-brand-teal truncate">{formatCurrency(totals.entradasTotal)}</div>
        </div>
        <div className="bg-surface-container-low p-4 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
            Débito / Crédito
          </span>
          <div className="text-sm font-data font-bold text-on-surface">
            {formatCurrency(totals.debitoTotal)} <span className="text-on-surface-variant font-body">/</span>{' '}
            {formatCurrency(totals.creditoTotal)}
          </div>
        </div>
      </section>
      <div className="bg-surface-container-low p-4 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
            Débito / Crédito
          </span>
          <div className="text-sm font-data font-bold text-on-surface">
            {formatCurrency(totals.debitoTotal)} <span className="text-on-surface-variant font-body">/</span>{' '}
            {formatCurrency(totals.creditoTotal)}
          </div>
        </div>
      </section>

      <div className="bg-brand-blue/10 p-4 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-blue block mb-1">
            Saldo Acumulado
          </span>
          <span className="text-[11px] text-on-surface-variant">
            Saldo anterior ({formatCurrency(totals.saldoAnterior)}) + saldo deste mês
          </span>
        </div>
        <div className="text-lg font-data font-bold text-brand-blue truncate">
          {formatCurrency(totals.saldoAcumulado)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={openNewExpense}
          className="bg-brand-red text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-red/20 active:scale-[0.98] transition-transform"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Despesa
        </button>
        <button
          onClick={() => setIncomeOpen(true)}
          className="bg-brand-teal text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-teal/20 active:scale-[0.98] transition-transform"
        >
          <span className="material-symbols-outlined text-[20px]">payments</span>
          Entrada
        </button>
      </div>

      <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm">
        <h2 className="font-display font-bold text-lg text-on-background mb-4">Gastos por categoria</h2>
        <CategoryChart data={chartData} categories={categories} total={totals.gastosDoMes} />
      </section>

      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-display font-bold text-lg text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-brand-orange">calendar_today</span>
            Custos Fixos
          </h2>
          <button onClick={() => setFixedCostOpen(true)} className="text-brand-blue font-bold text-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Novo
          </button>
        </div>
        {fixedCosts.length === 0 ? (
          <EmptyState icon="event_repeat" title="Nenhum custo fixo" subtitle="Cadastre seus custos recorrentes na Dashboard ou aqui mesmo." />
        ) : (
          <div className="space-y-3">
            {fixedCosts.map((fc) => (
              <FixedCostRow key={fc.id} item={fc} onTogglePaid={toggleFixedCostPaid} onChangeAmount={setFixedCostAmount} />
            ))}
          </div>
        )}
      </section>

      {incomes.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-lg text-on-background mb-3">Entradas do mês</h2>
          <div className="rounded-2xl overflow-hidden border border-outline-variant divide-y divide-outline-variant shadow-sm">
            {incomes.map((inc) => (
              <div key={inc.id} className="flex items-center justify-between p-4 bg-surface-container-lowest">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <div className="text-sm font-medium text-on-surface">{inc.description}</div>
                </div>
                <div className="font-data text-brand-teal text-sm">+ {formatCurrency(Number(inc.amount))}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display font-bold text-lg text-on-background mb-3">Transações</h2>
        {transactions.length === 0 ? (
          <EmptyState icon="receipt_long" title="Nenhuma despesa neste mês" subtitle="Os lançamentos aparecem aqui assim que forem cadastrados." />
        ) : (
          <div className="rounded-2xl overflow-hidden border border-outline-variant divide-y divide-outline-variant shadow-sm">
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                category={tx.category_id ? categoryById[tx.category_id] : undefined}
                card={tx.card_id ? cardById[tx.card_id] : undefined}
                onEdit={openEditExpense}
                onDelete={deleteTransaction}
              />
            ))}
          </div>
        )}
      </section>

      <ExpenseModal
        open={expenseOpen}
        onClose={closeExpenseModal}
        editingTx={editingTx}
        onSave={editingTx ? (input) => updateTransaction(editingTx.id, input) : addTransaction}
      />
      <AddFixedCostModal open={fixedCostOpen} onClose={() => setFixedCostOpen(false)} onSave={addFixedCost} />
      <IncomeModal open={incomeOpen} onClose={() => setIncomeOpen(false)} onSave={addIncome} />
    </div>
  )
}

function IncomeModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (input: { description: string; amount: number; date: string }) => Promise<void>
}) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)

  if (!open) return null

  function reset() {
    setDescription('')
    setAmount('')
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) return
    setSaving(true)
    try {
      await onSave({ description: description.trim(), amount: parseCurrencyInput(amount), date })
      reset()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={reset} />
      <div className="relative w-full max-w-md bg-surface rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up sm:animate-pop-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-display text-on-background">Nova Entrada</h2>
            <button className="material-symbols-outlined p-1 hover:bg-surface-container-high rounded-full text-on-surface-variant" onClick={reset} type="button">
              close
            </button>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Valor</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-data text-on-surface-variant">R$</span>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 pl-10 pr-4 font-data text-xl"
                  placeholder="0,00"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Descrição</label>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-4"
                placeholder="Ex: Salário, Extra..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Data</label>
              <input
                type="date"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-4"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <button
              className="w-full bg-brand-teal text-white py-4 rounded-xl font-bold mt-2 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-60"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar Entrada'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
