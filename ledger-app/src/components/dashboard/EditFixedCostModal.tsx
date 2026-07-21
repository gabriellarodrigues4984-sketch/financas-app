import { useEffect, useState } from 'react'
import { useData } from '../../context/DataContext'
import { parseCurrencyInput } from '../../lib/format'
import type { FixedCost } from '../../hooks/useMonthData'

export function EditFixedCostModal({
  item,
  onClose,
  onSave,
  onDelete,
}: {
  item: FixedCost | null
  onClose: () => void
  onSave: (
    id: string,
    input: Partial<{ name: string; category_id: string | null; due_day: number | null; amount: number; variable: boolean }>
  ) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const { categories } = useData()
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [dueDay, setDueDay] = useState('')
  const [amount, setAmount] = useState('')
  const [variable, setVariable] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    if (item) {
      setName(item.name)
      setCategoryId(item.category_id ?? '')
      setDueDay(item.due_day ? String(item.due_day) : '')
      setAmount(String(Number(item.amount)).replace('.', ','))
      setVariable(item.variable)
      setConfirmingDelete(false)
    }
  }, [item])

  if (!item) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !item) return
    setSaving(true)
    try {
      await onSave(item.id, {
        name: name.trim(),
        category_id: categoryId || null,
        due_day: dueDay ? Number(dueDay) : null,
        amount: parseCurrencyInput(amount),
        variable,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!item) return
    setSaving(true)
    try {
      await onDelete(item.id)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up sm:animate-pop-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-display text-on-background">Editar Custo Fixo</h2>
            <button className="material-symbols-outlined p-1 hover:bg-surface-container-high rounded-full text-on-surface-variant" onClick={onClose} type="button">
              close
            </button>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Nome</label>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-4"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
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
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Dia do vencimento</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-4"
                  placeholder="Ex: 10"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">
                Valor {variable ? '(estimado / padrão)' : ''}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-data text-on-surface-variant">R$</span>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 pl-10 pr-4 font-data"
                  placeholder="0,00"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-on-surface-variant">
              <input type="checkbox" checked={variable} onChange={(e) => setVariable(e.target.checked)} className="w-4 h-4 rounded" />
              Valor varia todo mês (ex: conta de luz)
            </label>

            <button
              className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold mt-2 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-60"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>

            {confirmingDelete ? (
              <div className="flex items-center gap-2 justify-center pt-1">
                <span className="text-xs text-on-surface-variant">Excluir este custo fixo e todo o histórico dele?</span>
                <button type="button" onClick={handleDelete} disabled={saving} className="text-xs font-bold text-brand-red">
                  Sim, excluir
                </button>
                <button type="button" onClick={() => setConfirmingDelete(false)} className="text-xs font-bold text-on-surface-variant">
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="w-full text-brand-red text-xs font-bold uppercase tracking-wide py-1"
              >
                Excluir custo fixo
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
