import { useEffect, useState } from 'react'
import { useData } from '../../context/DataContext'
import { parseCurrencyInput } from '../../lib/format'
import type { PaymentType, TransactionRow as TransactionRowType } from '../../lib/database.types'

export interface ExpenseInput {
  description: string
  amount: number
  category_id: string | null
  payment_type: PaymentType
  card_id: string | null
  date: string
  installments_total?: number
  installment_start?: number
}

interface ExpenseModalProps {
  open: boolean
  onClose: () => void
  onSave: (input: ExpenseInput) => Promise<void>
  /** Quando presente, o modal edita esse lançamento em vez de criar um novo. */
  editingTx?: TransactionRowType | null
}

const INSTALLMENT_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 18, 24]

export function ExpenseModal({ open, onClose, onSave, editingTx }: ExpenseModalProps) {
  const { categories, cards } = useData()
  const isEditing = !!editingTx

  const [paymentType, setPaymentType] = useState<PaymentType>('debito')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [cardId, setCardId] = useState('')
  const [installments, setInstallments] = useState(1)
  const [installmentStart, setInstallmentStart] = useState(1)
  const [alreadyStarted, setAlreadyStarted] = useState(false)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Preenche o formulário quando abrimos em modo edição.
  useEffect(() => {
    if (open && editingTx) {
      setPaymentType(editingTx.payment_type)
      setAmount(String(editingTx.amount).replace('.', ','))
      setDescription(editingTx.description)
      setCategoryId(editingTx.category_id ?? '')
      setCardId(editingTx.card_id ?? '')
      setDate(editingTx.date)
      setInstallments(editingTx.installments_total)
      setInstallmentStart(editingTx.installment_number)
      setAlreadyStarted(false)
    } else if (open && !editingTx) {
      setPaymentType('debito')
      setAmount('')
      setDescription('')
      setCategoryId('')
      setCardId('')
      setInstallments(1)
      setInstallmentStart(1)
      setAlreadyStarted(false)
      setDate(new Date().toISOString().slice(0, 10))
    }
    setError('')
  }, [open, editingTx])

  if (!open) return null

  function resetAndClose() {
    setError('')
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = parseCurrencyInput(amount)
    if (value <= 0) {
      setError('Informe um valor válido.')
      return
    }
    if (!description.trim()) {
      setError('Informe uma descrição.')
      return
    }
    if (paymentType === 'credito' && !cardId) {
      setError('Selecione o cartão usado.')
      return
    }
    setSaving(true)
    try {
      await onSave({
        description: description.trim(),
        amount: value,
        category_id: categoryId || null,
        payment_type: paymentType,
        card_id: paymentType === 'credito' ? cardId : null,
        date,
        installments_total: paymentType === 'credito' ? installments : 1,
        installment_start: paymentType === 'credito' && alreadyStarted ? installmentStart : 1,
      })
      resetAndClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={resetAndClose}
      />
      <div className="relative w-full max-w-md bg-surface rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up sm:animate-pop-in max-h-[90vh] overflow-y-auto scrollbar-none">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-display text-on-background">
              {isEditing ? 'Editar Despesa' : 'Nova Despesa'}
            </h2>
            <button
              className="material-symbols-outlined p-1 hover:bg-surface-container-high rounded-full text-on-surface-variant"
              onClick={resetAndClose}
              type="button"
              aria-label="Fechar"
            >
              close
            </button>
          </div>

          <div className="flex p-1 bg-surface-container-low rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setPaymentType('debito')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                paymentType === 'debito' ? 'bg-surface text-brand-blue shadow-sm' : 'text-on-surface-variant'
              }`}
            >
              DÉBITO
            </button>
            <button
              type="button"
              onClick={() => setPaymentType('credito')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                paymentType === 'credito' ? 'bg-surface text-brand-blue shadow-sm' : 'text-on-surface-variant'
              }`}
            >
              CRÉDITO
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Valor</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-data text-on-surface-variant">R$</span>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 pl-10 pr-4 font-data text-xl text-on-surface"
                  placeholder="0,00"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                />
              </div>
              {isEditing && editingTx && editingTx.installments_total > 1 && (
                <p className="text-[11px] text-on-surface-variant mt-1">
                  Valor desta parcela ({editingTx.installment_number}/{editingTx.installments_total}). As demais parcelas não são alteradas.
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Descrição</label>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-4"
                placeholder="Ex: Mercado, Uber..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Categoria</label>
                <select
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-3 appearance-none"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">Selecionar</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Data</label>
                <input
                  type="date"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-3"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            {paymentType === 'credito' && (
              <div className="space-y-4 pt-2 border-t border-outline-variant">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Cartão</label>
                    {cards.length === 0 ? (
                      <p className="text-xs text-on-surface-variant py-3">
                        Nenhum cartão cadastrado ainda.
                      </p>
                    ) : (
                      <select
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-3 appearance-none"
                        value={cardId}
                        onChange={(e) => setCardId(e.target.value)}
                      >
                        <option value="">Selecionar</option>
                        {cards.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  {!isEditing && (
                    <div>
                      <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Parcelas</label>
                      <select
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-3 appearance-none"
                        value={installments}
                        onChange={(e) => {
                          const n = Number(e.target.value)
                          setInstallments(n)
                          if (installmentStart > n) setInstallmentStart(n)
                        }}
                      >
                        {INSTALLMENT_OPTIONS.map((n) => (
                          <option key={n} value={n}>
                            {n === 1 ? 'À vista' : `${n}x`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {!isEditing && installments > 1 && (
                  <div className="bg-surface-container-low rounded-xl p-3 space-y-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-on-surface cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alreadyStarted}
                        onChange={(e) => setAlreadyStarted(e.target.checked)}
                        className="rounded"
                      />
                      Essa compra já está parcelada (algumas parcelas já passaram)
                    </label>
                    {alreadyStarted && (
                      <div>
                        <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">
                          Em qual parcela você está?
                        </label>
                        <select
                          className="w-full bg-surface rounded-xl py-3 px-3 appearance-none border border-outline-variant"
                          value={installmentStart}
                          onChange={(e) => setInstallmentStart(Number(e.target.value))}
                        >
                          {Array.from({ length: installments }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>
                              {n}/{installments}
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-on-surface-variant mt-1">
                          A data acima deve ser o mês desta parcela. Vamos registrar dela até a última ({installments}/{installments}); as parcelas anteriores não entram no app.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-brand-red text-sm">{error}</p>}

            <button
              className="w-full bg-brand-red text-white py-4 rounded-xl font-bold mt-2 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-60"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Salvar Despesa'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
