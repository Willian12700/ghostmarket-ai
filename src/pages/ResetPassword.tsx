import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Ghost, Loader2, ArrowRight, Lock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/toastStore'
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { motion } from 'framer-motion'

export const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const oobCode = searchParams.get('oobCode')
  
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isValidCode, setIsValidCode] = useState<boolean | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const { addToast } = useToastStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!oobCode) {
      setIsValidCode(false)
      return
    }

    // Verify the code when the page loads
    const checkCode = async () => {
      try {
        const userEmail = await verifyPasswordResetCode(auth, oobCode)
        setEmail(userEmail)
        setIsValidCode(true)
      } catch (error) {
        setIsValidCode(false)
      }
    }
    
    checkCode()
  }, [oobCode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword.length < 6) {
      addToast('A senha deve ter pelo menos 6 caracteres.', 'error')
      return
    }
    
    if (newPassword !== confirmPassword) {
      addToast('As senhas não coincidem.', 'error')
      return
    }
    
    setLoading(true)
    try {
      await confirmPasswordReset(auth, oobCode!, newPassword)
      addToast('Senha redefinida com sucesso!', 'success')
      setSuccess(true)
    } catch (error: any) {
      addToast('Ocorreu um erro ao redefinir a senha.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  }

  const staggerForm = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  if (isValidCode === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  if (isValidCode === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
        <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Link inválido ou expirado</h1>
        <p className="text-textSecondary max-w-md mb-8">
          O link de recuperação de senha que você tentou acessar não é mais válido. Por favor, solicite um novo link na página de login.
        </p>
        <Link to="/login">
          <Button size="lg">Voltar para o Login</Button>
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-success/10 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="relative z-10">
          <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Senha alterada com sucesso!</h1>
          <p className="text-textSecondary max-w-md mb-8">
            Sua nova senha foi salva e sua conta está segura. Agora você já pode acessar a plataforma.
          </p>
          <Link to="/login">
            <Button size="lg" className="px-10 h-14 group">
              Fazer Login Agora
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[128px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[128px] pointer-events-none translate-x-1/2 translate-y-1/2" />
      
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={staggerForm} 
        className="w-full max-w-md relative z-10"
      >
        <motion.div variants={fadeInUp} className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-panel border border-border shadow-[0_0_30px_rgba(139,92,246,0.15)] mb-6 group">
            <Ghost className="w-8 h-8 text-secondary group-hover:text-accent transition-colors" />
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Crie uma nova senha</h1>
          <p className="text-textSecondary">
            Defina uma nova senha para <strong className="text-white">{email}</strong>
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-panel/80 backdrop-blur-xl border border-border rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary opacity-20 pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="space-y-4">
              <Input
                label="Nova Senha"
                type="password"
                placeholder="No mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-background focus:ring-secondary/50 transition-all duration-300"
              />
              
              <Input
                label="Confirme a Nova Senha"
                type="password"
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background focus:ring-secondary/50 transition-all duration-300"
              />
            </div>

            <Button type="submit" className="w-full h-12 text-base mt-2 shadow-[0_0_20px_rgba(139,92,246,0.2)]" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Redefinir Senha'
              )}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}
