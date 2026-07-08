import { useState } from 'react'

const COLOR_OPTIONS = ['#377EC0', '#5460AC', '#12BAAA', '#F7891F', '#F04F52', '#8A05BE', '#21C25E']

export function AddCardModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (input: { name: string; color: string; closing_day: number | null; due_day: number | null }) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_OPTIONS[0])
  const [closingDay, setClosingDay] = useState('')
  const [dueDay, setDueDay] = useState('')
  const [saving, setSaving] = useState(false)

  if (!open) return null

  function reset() {
    setName('')
    setColor(COLOR_OPTIONS[0])
    setClosingDay('')
    setDueDay('')
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        color,
        closing_day: closingDay ? Number(closingDay) : null,
        due_day: dueDay ? Number(dueDay) : null,
      })
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
            <h2 className="text-xl font-bold font-display text-on-background">Novo Cartão</h2>
            <button className="material-symbols-outlined p-1 hover:bg-surface-container-high rounded-full text-on-surface-variant" onClick={reset} type="button">
              close
            </button>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">
                Nome do cartão
              </label>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-4"
                placeholder="Ex: Nubank, Inter, PicPay..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <p className="text-[11px] text-on-surface-variant mt-1.5">
                Serve só para identificar o cartão nos seus gastos — não pedimos número nem dados sensíveis.
              </p>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Fecha dia</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-4"
                  placeholder="Ex: 20"
                  value={closingDay}
                  onChange={(e) => setClosingDay(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wide text-on-surface-variant block mb-1 uppercase">Vence dia</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-4"
                  placeholder="Ex: 28"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                />
              </div>
            </div>

            <button
              className="w-full bg-brand-purple text-white py-4 rounded-xl font-bold mt-2 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-60"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Adicionar Cartão'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
