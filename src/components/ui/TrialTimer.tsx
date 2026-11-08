import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '@/config/firebase'
import { Clock } from 'lucide-react'

export const TrialTimer = () => {
  const [timeLeft, setTimeLeft] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Se o usuário estiver logado com conta real, limpa timer residual e encerra
    if (auth.currentUser && !auth.currentUser.isAnonymous) {
      localStorage.removeItem('trial_expires_at')
      return
    }

    const expiresAt = localStorage.getItem('trial_expires_at')
    if (!expiresAt || isNaN(parseInt(expiresAt))) {
      // Se um usuário anônimo apagar o localStorage pelo F12, desloga imediatamente
      if (auth.currentUser?.isAnonymous) {
        auth.signOut().finally(() => navigate('/login?trial_ended=true'))
      }
      return
    }

    const interval = setInterval(async () => {
      const currentExpires = localStorage.getItem('trial_expires_at')
      const now = Date.now()
      const diff = (currentExpires ? parseInt(currentExpires) : 0) - now

      if (!currentExpires || isNaN(diff) || diff <= 0) {
        clearInterval(interval)
        localStorage.removeItem('trial_expires_at')
        await auth.signOut()
        navigate('/login?trial_ended=true')
      } else {
        const m = Math.floor(diff / 1000 / 60)
        const s = Math.floor((diff / 1000) % 60)
        setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [navigate])

  if (!timeLeft) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-zinc-900/95 backdrop-blur-md border border-zinc-700 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 text-sm font-medium">
      <Clock className="w-4 h-4 text-emerald-400" />
      <span>
        Sessão de Teste: <span className="font-mono font-bold text-emerald-400 tabular-nums">{timeLeft}</span>
      </span>
    </div>
  )
}
