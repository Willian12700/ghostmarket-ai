import { Component, ErrorInfo, ReactNode } from 'react'
import { ShieldAlert, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import { db, auth } from '@/config/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  showDetails: boolean
  copied: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
    copied: false
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    this.setState({ errorInfo })

    try {
      addDoc(collection(db, 'system_errors'), {
        message: error?.message || 'Unknown error',
        stack: error?.stack || '',
        componentStack: errorInfo?.componentStack || '',
        href: window.location.href,
        pathname: window.location.pathname,
        userUid: auth.currentUser?.uid || 'anonymous',
        userEmail: auth.currentUser?.email || '',
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent
      }).catch(err => console.error('Failed to log error to Firestore:', err))
    } catch (e) {
      console.error('Logging exception:', e)
    }
  }

  private handleCopy = () => {
    const { error, errorInfo } = this.state
    const text = `Erro: ${error?.message}\nURL: ${window.location.href}\nStack: ${error?.stack}\nComponent: ${errorInfo?.componentStack}`
    navigator.clipboard.writeText(text)
    this.setState({ copied: true })
    setTimeout(() => this.setState({ copied: false }), 2000)
  }

  public render() {
    if (this.state.hasError) {
      const { error, errorInfo, showDetails, copied } = this.state

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="bg-panel border border-border rounded-xl p-8 max-w-lg w-full text-center shadow-xl">
            <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-white mb-3">Ocorreu um erro ao carregar esta página.</h1>
            <p className="text-textSecondary text-sm mb-6">
              Nossos sistemas detectaram uma falha inesperada. Tente atualizar a página.
            </p>

            {error?.message && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
                <p className="text-xs font-mono text-red-400 break-words font-semibold">
                  {error.message}
                </p>
              </div>
            )}

            <div className="space-y-3 mb-6">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null })
                  window.location.reload()
                }}
                className="w-full bg-primary hover:bg-primaryLight text-white font-medium h-10 px-4 rounded-md transition-colors"
              >
                Tentar novamente
              </button>

              <button
                type="button"
                onClick={() => this.setState({ showDetails: !showDetails })}
                className="w-full bg-white/5 hover:bg-white/10 text-textSecondary text-xs py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-1.5"
              >
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showDetails ? 'Ocultar Detalhes Técnicos' : 'Ver Detalhes Técnicos (Debug)'}
              </button>
            </div>

            {showDetails && (
              <div className="mt-4 text-left">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-textSecondary font-semibold">Stack Trace:</span>
                  <button
                    onClick={this.handleCopy}
                    className="text-xs flex items-center gap-1 text-primary hover:underline"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <pre className="text-[11px] font-mono bg-black/60 p-3 rounded-lg text-textSecondary overflow-x-auto max-h-48 border border-white/5 custom-scrollbar">
                  {error?.stack || 'Sem stack disponível'}
                  {errorInfo?.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

