export function ConfigMissingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background">
      <div className="w-16 h-16 rounded-2xl bg-brand-orange flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-white text-[32px]">settings_alert</span>
      </div>
      <h1 className="font-display font-bold text-xl text-on-background mb-2">Configuração pendente</h1>
      <p className="text-on-surface-variant text-sm max-w-sm mb-4">
        O app não encontrou as variáveis <code className="bg-surface-container-low px-1.5 py-0.5 rounded text-xs">VITE_SUPABASE_URL</code> e{' '}
        <code className="bg-surface-container-low px-1.5 py-0.5 rounded text-xs">VITE_SUPABASE_ANON_KEY</code>.
      </p>
      <div className="text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-4 max-w-sm text-sm text-on-surface-variant space-y-2">
        <p className="font-bold text-on-surface">Confira no seu provedor de hospedagem:</p>
        <p>1. Vá em <span className="font-medium text-on-surface">Settings → Environment Variables</span> do projeto.</p>
        <p>2. O nome (campo "Key") precisa ser exatamente <span className="font-mono text-on-surface">VITE_SUPABASE_URL</span> e <span className="font-mono text-on-surface">VITE_SUPABASE_ANON_KEY</span> — sem espaços, maiúsculas/minúsculas certinhas.</p>
        <p>3. O valor (campo "Value") é a Project URL e a chave anon/publishable do seu projeto Supabase (Project Settings → API).</p>
        <p>4. Depois de salvar, é preciso fazer um novo deploy (mudar variável não republica sozinho).</p>
      </div>
    </div>
  )
}
