import { useAuth } from '../../context/AuthContext'

export function ConnectGoogleScreen() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background">
      <div className="w-16 h-16 rounded-2xl bg-brand-blue flex items-center justify-center mb-5 shadow-lg shadow-brand-blue/20">
        <span className="material-symbols-outlined text-white text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          account_balance_wallet
        </span>
      </div>
      <h1 className="font-wordmark font-bold text-2xl text-on-background mb-1">Grão Finanças</h1>
      <p className="text-on-surface-variant text-sm font-medium italic mb-4">
        De grão em grão, o seu futuro na mão
      </p>
      <p className="text-on-surface-variant text-sm max-w-xs mb-8">
        Conecte sua conta Google para acessar seus dados financeiros. Da próxima vez, você entra direto — sem senha.
      </p>
      <button
        onClick={signInWithGoogle}
        className="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant rounded-xl px-6 py-3.5 shadow-sm hover:shadow-md active:scale-[0.98] transition-all font-medium text-on-surface"
      >
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.4 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.4-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.8 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 5.4 29.6 3 24 3c-7.7 0-14.3 4.4-17.7 10.7z"/>
          <path fill="#4CAF50" d="M24 45c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6c-2.2 1.5-5 2.4-7.7 2.4-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.6 40.5 16.2 45 24 45z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.6C41.8 36 45 30.6 45 24c0-1.4-.1-2.4-.4-3.5z"/>
        </svg>
        Continuar com Google
      </button>
      <p className="text-xs text-on-surface-variant/70 mt-6 max-w-xs">
        Seus dados ficam vinculados só à sua conta e nunca são compartilhados.
      </p>
    </div>
  )
}
