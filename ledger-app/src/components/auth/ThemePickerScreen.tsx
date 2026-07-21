import { useState } from 'react'
import { useTheme, type AppTheme } from '../../context/ThemeContext'

const OPTIONS: { id: AppTheme; label: string; tagline: string; swatches: string[]; bg: string; accent: string }[] = [
  {
    id: 'classico',
    label: 'Clássico',
    tagline: 'Tons de azul, visual direto e objetivo.',
    swatches: ['#377EC0', '#5460AC', '#12BAAA', '#F04F52'],
    bg: '#f7f9ff',
    accent: '#377EC0',
  },
  {
    id: 'blossom',
    label: 'Blossom',
    tagline: 'Tons suaves, visual delicado e acolhedor.',
    swatches: ['#C6577A', '#A6779C', '#6FA383', '#D98A5E'],
    bg: '#FBF3F0',
    accent: '#C6577A',
  },
]

export function ThemePickerScreen() {
  const { setTheme } = useTheme()
  const [selected, setSelected] = useState<AppTheme>('classico')
  const [saving, setSaving] = useState(false)

  async function handleConfirm() {
    setSaving(true)
    try {
      await setTheme(selected)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 text-center bg-background">
      <div className="w-14 h-14 rounded-2xl bg-brand-blue flex items-center justify-center mb-4 shadow-lg shadow-brand-blue/20">
        <span className="material-symbols-outlined text-white text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          palette
        </span>
      </div>
      <h1 className="font-display font-bold text-2xl text-on-background mb-2">Escolha o seu estilo</h1>
      <p className="text-on-surface-variant text-sm max-w-sm mb-8">
        Dá pra trocar quando quiser depois, no menu do seu perfil.
      </p>

      <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            className={`text-left rounded-2xl border-2 p-4 transition-all ${
              selected === opt.id ? 'shadow-lg' : 'border-outline-variant opacity-80 hover:opacity-100'
            }`}
            style={{
              backgroundColor: opt.bg,
              borderColor: selected === opt.id ? opt.accent : undefined,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-bold text-base" style={{ color: opt.accent }}>
                {opt.label}
              </span>
              {selected === opt.id && (
                <span
                  className="material-symbols-outlined text-white text-[16px] rounded-full p-0.5"
                  style={{ backgroundColor: opt.accent }}
                >
                  check
                </span>
              )}
            </div>
            <div className="flex gap-1.5 mb-3">
              {opt.swatches.map((c) => (
                <div key={c} className="w-6 h-6 rounded-full" style={{ backgroundColor: c }} />
              ))}
            </div>
            <p className="text-xs" style={{ color: opt.accent, opacity: 0.85 }}>
              {opt.tagline}
            </p>
          </button>
        ))}
      </div>

      <button
        onClick={handleConfirm}
        disabled={saving}
        className="text-white px-8 py-3.5 rounded-xl font-bold shadow-lg active:scale-[0.98] transition-transform disabled:opacity-60"
        style={{ backgroundColor: OPTIONS.find((o) => o.id === selected)!.accent }}
      >
        {saving ? 'Salvando...' : 'Continuar'}
      </button>
    </div>
  )
}
