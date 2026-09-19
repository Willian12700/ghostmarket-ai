import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Ghost, Loader2, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { motion, Variants } from 'framer-motion'

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [resetting, setResetting] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const { addToast } = useToastStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      addToast('Preencha todos os campos.', 'error')
      return
    }
    
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password)
      addToast('Bem-vindo de volta!', 'success')
      navigate('/dashboard')
    } catch (error: any) {
      addToast('E-mail ou senha incorretos.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!formData.email) {
      addToast('Por favor, digite seu e-mail no campo acima para resetar a senha.', 'error')
      return
    }
    
    setResetting(true)
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false
      }
      
      await sendPasswordResetEmail(auth, formData.email, actionCodeSettings)
      addToast('E-mail de recuperação enviado! Verifique sua caixa de entrada.', 'success')
    } catch (error: any) {
      addToast('Erro ao enviar e-mail. Verifique se o endereço está correto.', 'error')
    } finally {
      setResetting(false)
    }
  }

  // Animation variants
  const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  }

  const slideInRight: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  }

  const staggerForm: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  }

  const itemFadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  }

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      
      {/* LEFT SIDE - Form */}
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={slideInLeft} 
        className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center relative z-10 px-8 sm:px-16 lg:px-24 bg-background shadow-2xl"
      >
        <Link to="/" className="absolute top-8 left-8 sm:left-16 lg:left-24 flex items-center gap-2 group">
          <Ghost className="w-6 h-6 text-secondary group-hover:text-accent transition-colors" />
          <span className="font-bold text-xl tracking-tight text-white">GhostMarket_<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">AI</span></span>
        </Link>

        <motion.div variants={staggerForm} initial="hidden" animate="visible" className="w-full max-w-sm mx-auto mt-12">
          <motion.div variants={itemFadeUp} className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">Bem-vindo de volta</h1>
            <p className="text-textSecondary text-sm sm:text-base">Acesse sua central de operações e continue construindo o futuro.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={itemFadeUp} className="space-y-4">
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-panel focus:ring-secondary/50 transition-all duration-300"
              />
              
              <div className="relative">
                <Input
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-panel focus:ring-secondary/50 transition-all duration-300"
                />
                <button 
                  type="button" 
                  onClick={handleResetPassword}
                  disabled={resetting}
                  className="absolute right-0 top-0 text-xs text-secondary hover:text-accent transition-colors font-medium disabled:opacity-50"
                >
                  {resetting ? 'Enviando...' : 'Esqueceu a senha?'}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemFadeUp}>
              <Button type="submit" className="w-full h-12 text-base group relative overflow-hidden" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    <span className="relative z-10 flex items-center justify-center">
                      Acessar Plataforma
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div variants={itemFadeUp} className="mt-8 text-center text-sm">
            <span className="text-textSecondary">
              Ainda não tem conta?
            </span>
            <Link
              to="/#planos"
              className="ml-2 text-secondary hover:text-accent font-semibold transition-colors"
            >
              Criar conta agora
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* RIGHT SIDE - Aesthetic Graphic */}
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={slideInRight} 
        className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center bg-panel"
      >
        {/* Animated Background Gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-[150px] opacity-70 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-[120px] opacity-70 animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#27272A 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3 }} />

        {/* Floating Element */}
        <motion.div 
          animate={{ y: [-10, 10, -10] }} 
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 p-12 max-w-xl"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-3xl blur opacity-30"></div>
          <div className="relative bg-background/50 backdrop-blur-xl border border-border/50 rounded-3xl p-10 shadow-2xl">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white leading-tight mb-4">
              Crie, gerencie e escale seu negócio digital <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">em um só lugar.</span>
            </h2>
            <p className="text-lg text-textSecondary mb-8 leading-relaxed">
              Deixe a IA estruturar o código, enquanto você foca na estratégia. O GhostMarket automatiza sua esteira de produtos de ponta a ponta.
            </p>
            
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-white shadow-md
                    ${i === 1 ? 'bg-primary' : i === 2 ? 'bg-secondary' : 'bg-accent'}`}
                  >
                    {i === 1 ? 'UI' : i === 2 ? 'DB' : 'AI'}
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium text-textSecondary">+ de 3.000 usuários ativos</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
