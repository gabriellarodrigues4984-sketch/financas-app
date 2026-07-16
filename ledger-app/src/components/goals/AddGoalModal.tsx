import { useState } from 'react'
import { parseCurrencyInput } from '../../lib/format'

const ICON_OPTIONS = ['flag', 'directions_car', 'flight_takeoff', 'home', 'savings', 'school', 'redeem']
const COLOR_OPTIONS = ['#377EC0', '#12BAAA', '#F04F52', '#F7891F', '#5460AC']

export function AddGoalModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (input: {
    name: string
    subtitle?: string
    target_amount: number
    target_date?: string | null
    icon?: string
    color?: string
  }) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [icon, setIcon] = useState(ICON_OPTIONS[0])
  const [color, setColor] = useState(COLOR_OPTIONS[0])
  const [saving, setSaving] = useState(false)

  if (!open) return null

  function reset() {
    setName('')
    setSubtitle('')
    setTargetAmount('')
    setTargetDate('')
    setIcon(ICON_OPTIONS[0])
    setColor(COLOR_OPTIONS[0])
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        subtitle: subtitle.trim() || undefined,
        target_amount: parseCurrencyInput(targetAmount),
        target_date: targetDate || null,
        icon,
        color,
      })
      reset()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={reset} />
      <div className="relative w-full max-w-md bg-surface rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up sm:animate-pop-in max-h-[90vh] overflow-y-auto scrollbar-none">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-display text-on-background">Nova Meta</h2>
            <button className="material-symbols-outlined p-1 hover:bg-surface-container-high rounded-full text-on-surface-variant" onClick={reset} type="button">
              close
            </button>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Nome da meta</label>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-4"
                placeholder="Ex: Viagem Europa"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Subtítulo (opcional)</label>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-4"
                placeholder="Ex: Eurotrip 15 dias"
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
                    placeholder="0,00"
                    inputMode="decimal"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Data alvo</label>
                <input
                  type="date"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-3"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
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
              {saving ? 'Salvando...' : 'Criar Meta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
