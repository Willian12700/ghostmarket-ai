import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInAnonymously } from 'firebase/auth'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'
import { Ghost, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

export const TrialLogin = () => {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleTestAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (code.length !== 6) {
      setError('O cdigo deve ter exatos 6 dgitos.')
      return
    }

    setLoading(true)
    try {
      // Sign in anonymously first to get read/write access
      const userCred = await signInAnonymously(auth)
      const uid = userCred.user.uid

      const docRef = doc(db, 'trial_codes', code)
      const snap = await getDoc(docRef)

      if (!snap.exists()) {
        await auth.signOut()
        setError('Cdigo invlido ou no encontrado.')
        setLoading(false)
        return
      }

      const data = snap.data()
      if (data.activatedAt) {
        await auth.signOut()
        setError('Este cdigo j foi utilizado por outra pessoa.')
        setLoading(false)
        return
      }

      // Activate the code! 5 minutes from now.
      const expiresAt = Date.now() + 5 * 60 * 1000;
      await updateDoc(docRef, {
        activatedAt: serverTimestamp(),
        uid,
        expiresAt
      })

      // Salva no localstorage o limite local pra fazer logout
      localStorage.setItem('trial_expires_at', expiresAt.toString())
      
      // Manda pro painel
      navigate('/dashboard')

    } catch (err: any) {
      console.error(err)
      await auth.signOut().catch(() => {})
      if (err.code === 'auth/admin-restricted-operation' || err.code === 'auth/operation-not-allowed') {
        setError('Login Annimo est desativado no Firebase. Avise o dono do sistema para ativar!')
      } else {
        setError('Ocorreu um erro ao validar o cdigo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0b0714] border border-white/5 rounded-3xl p-8 relative z-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/30 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Ghost className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-white text-center">Acesso VIP (5 Minutos)</h1>
          <p className="text-textSecondary text-center mt-2 text-sm">Insira o cdigo de 6 dgitos fornecido no WhatsApp para testar a mquina.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleTestAccess} className="space-y-6">
          <div>
            <input 
              type="text" 
              value={code} 
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0,6))}
              className="w-full h-16 bg-[#050505] border border-white/10 rounded-xl text-center text-3xl font-mono text-white tracking-[0.5em] focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/10"
              placeholder="000000"
              required
            />
          </div>

          <Button type="submit" disabled={loading || code.length !== 6} className="w-full h-12 text-base font-bold bg-white text-black hover:bg-white/90">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Entrar no Sistema <ArrowRight className="w-5 h-5 ml-2" /></>}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <button onClick={() => navigate('/')} className="text-xs text-white/30 hover:text-white/60">Voltar para a pgina inicial</button>
        </div>
      </motion.div>
    </div>
  )
}
