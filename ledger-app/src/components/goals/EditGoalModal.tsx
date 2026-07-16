import { useEffect, useState } from 'react'
import type { Goal } from '../../context/DataContext'
import { parseCurrencyInput } from '../../lib/format'

const ICON_OPTIONS = ['flag', 'directions_car', 'flight_takeoff', 'home', 'savings', 'school', 'redeem']
const COLOR_OPTIONS = ['#377EC0', '#12BAAA', '#F04F52', '#F7891F', '#5460AC']

export function EditGoalModal({
  goal,
  onClose,
  onSave,
  onDelete,
}: {
  goal: Goal | null
  onClose: () => void
  onSave: (
    goalId: string,
    input: Partial<{
      name: string
      subtitle: string | null
      target_amount: number
      current_amount: number
      target_date: string | null
      icon: string
      color: string
    }>
  ) => Promise<void>
  onDelete: (goalId: string) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [icon, setIcon] = useState(ICON_OPTIONS[0])
  const [color, setColor] = useState(COLOR_OPTIONS[0])
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    if (goal) {
      setName(goal.name)
      setSubtitle(goal.subtitle ?? '')
      setTargetAmount(String(Number(goal.target_amount)).replace('.', ','))
      setCurrentAmount(String(Number(goal.current_amount)).replace('.', ','))
      setTargetDate(goal.target_date ?? '')
      setIcon(goal.icon)
      setColor(goal.color)
      setConfirmingDelete(false)
    }
  }, [goal])

  if (!goal) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !goal) return
    setSaving(true)
    try {
      await onSave(goal.id, {
        name: name.trim(),
        subtitle: subtitle.trim() || null,
        target_amount: parseCurrencyInput(targetAmount),
        current_amount: parseCurrencyInput(currentAmount),
        target_date: targetDate || null,
        icon,
        color,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!goal) return
    setSaving(true)
    try {
      await onDelete(goal.id)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up sm:animate-pop-in max-h-[90vh] overflow-y-auto scrollbar-none">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-display text-on-background">Editar Meta</h2>
            <button className="material-symbols-outlined p-1 hover:bg-surface-container-high rounded-full text-on-surface-variant" onClick={onClose} type="button">
              close
            </button>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Nome da meta</label>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-4"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Subtítulo (opcional)</label>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-4"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Valor alvo</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-data text-on-surface-variant text-sm">R$</span>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 pl-9 pr-3 font-data"
                    inputMode="decimal"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Valor já guardado</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-data text-on-surface-variant text-sm">R$</span>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 pl-9 pr-3 font-data"
                    inputMode="decimal"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant -mt-2">
              Ajuste "Valor já guardado" direto aqui se precisar corrigir o saldo da meta (em vez de lançar um aporte).
            </p>
            <div>
              <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Data alvo</label>
              <input
                type="date"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-3"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-2 uppercase">Ícone</label>
              <div className="flex gap-2 flex-wrap">
                {ICON_OPTIONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      icon === i ? 'border-brand-blue bg-brand-blue/10 text-brand-blue' : 'border-outline-variant text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{i}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-2 uppercase">Cor</label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-transform"
                    style={{ backgroundColor: c, transform: color === c ? 'scale(1.1)' : 'scale(1)' }}
                  >
                    {color === c && <span className="material-symbols-outlined text-white text-[18px]">check</span>}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold mt-2 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-60"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>

            {confirmingDelete ? (
              <div className="flex items-center gap-2 justify-center pt-1">
                <span className="text-xs text-on-surface-variant">Excluir esta meta?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving}
                  className="text-xs font-bold text-brand-red"
                >
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
                Excluir meta
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
