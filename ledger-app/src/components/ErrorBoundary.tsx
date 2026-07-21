import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

// Evita tela branca: se algo quebrar durante a renderização, mostra uma mensagem
// em vez de deixar a página em branco sem nenhuma pista do que aconteceu.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('Erro não tratado na aplicação:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background">
          <div className="w-16 h-16 rounded-2xl bg-brand-red flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-white text-[32px]">error</span>
          </div>
          <h1 className="font-display font-bold text-xl text-on-background mb-2">Algo deu errado</h1>
          <p className="text-on-surface-variant text-sm max-w-sm mb-1">
            Ocorreu um erro inesperado ao carregar o app.
          </p>
          <p className="text-on-surface-variant/70 text-xs max-w-sm mb-6 font-mono break-all">
            {this.state.error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-brand-blue text-white px-6 py-3 rounded-xl font-bold"
          >
            Recarregar página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
