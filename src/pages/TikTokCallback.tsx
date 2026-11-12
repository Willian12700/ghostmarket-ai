import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export const TikTokCallback = () => {
  const [params] = useSearchParams()
  const code = params.get('code')
  const error = params.get('error')
  const [copied, setCopied] = useState(false)

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0B0F17] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl text-center space-y-4">
        {code ? (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-emerald-400">TikTok Conectado ao Jarvis!</h1>
            <p className="text-xs text-zinc-400">
              Copie o código de autorização abaixo e mande para o Jarvis no chat:
            </p>
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono break-all text-zinc-300">
              {code}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(code)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 rounded-lg text-xs transition-all"
            >
              {copied ? 'Copiado para a área de transferência!' : 'Copiar Código de Acesso'}
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-red-400">Aguardando Autorização</h1>
            <p className="text-xs text-zinc-400">
              {error || 'Nenhum código de autorização recebido.'}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
export default TikTokCallback
