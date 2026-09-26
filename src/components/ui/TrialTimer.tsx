import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '@/config/firebase'
import { Clock } from 'lucide-react'

export const TrialTimer = () => {
  const [timeLeft, setTimeLeft] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const expiresAt = localStorage.getItem('trial_expires_at')
    if (!expiresAt) return

    const interval = setInterval(async () => {
      const now = Date.now()
      const diff = parseInt(expiresAt) - now

      if (diff <= 0) {
        clearInterval(interval)
        localStorage.removeItem('trial_expires_at')
        await auth.signOut()
        navigate('/login?trial_ended=true')
      } else {
        const m = Math.floor((diff / 1000) / 60)
        const s = Math.floor((diff / 1000) % 60)
        setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [navigate])

  if (!timeLeft) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-blue-600/90 backdrop-blur-md border border-blue-400/50 text-white px-6 py-3 rounded-full shadow-[0_4px_30px_rgba(37,99,235,0.5)] flex items-center gap-3 font-medium animate-bounce">
      <Clock className="w-5 h-5" />
      <span>Tempo de Teste: <span className="font-mono font-bold text-lg">{timeLeft}</span></span>
    </div>
  )
}
