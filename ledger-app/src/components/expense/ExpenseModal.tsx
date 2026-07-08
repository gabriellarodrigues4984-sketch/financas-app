import { useState } from 'react'
import { useData } from '../../context/DataContext'
import { parseCurrencyInput } from '../../lib/format'
import type { PaymentType } from '../../lib/database.types'

interface ExpenseModalProps {
  open: boolean
  onClose: () => void
  onSave: (input: {
    description: string
    amount: number
    category_id: string | null
    payment_type: PaymentType
    card_id: string | null
    date: string
    installments_total?: number
  }) => Promise<void>
}

const INSTALLMENT_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12]

export function ExpenseModal({ open, onClose, onSave }: ExpenseModalProps) {
  const { categories, cards } = useData()
  const [paymentType, setPaymentType] = useState<PaymentType>('debito')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [cardId, setCardId] = useState('')
  const [installments, setInstallments] = useState(1)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  function resetAndClose() {
    setAmount('')
    setDescription('')
    setCategoryId('')
    setCardId('')
    setInstallments(1)
    setPaymentType('debito')
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
            <h2 className="text-xl font-bold font-display text-on-background">Nova Despesa</h2>
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
                  <div>
                    <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Parcelas</label>
                    <select
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-3 appearance-none"
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                    >
                      {INSTALLMENT_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n === 1 ? 'À vista' : `${n}x`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {error && <p className="text-brand-red text-sm">{error}</p>}

            <button
              className="w-full bg-brand-red text-white py-4 rounded-xl font-bold mt-2 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-60"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar Despesa'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
