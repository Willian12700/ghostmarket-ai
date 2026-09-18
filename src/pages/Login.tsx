import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Ghost, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/config/firebase'

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primaryLight/10 rounded-full blur-[128px] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-panel border border-border shadow-lg mb-6 hover:border-primary/50 transition-colors">
            <Ghost className="w-8 h-8 text-primary" />
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Bem-vindo de volta ao GhostMarket AI.</h1>
          <p className="text-textSecondary">Acesse sua central de operações.</p>
        </div>

        <div className="bg-panel border border-border rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              
              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full mt-6" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar na plataforma'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-textSecondary">
              Ainda não tem conta?
            </span>
            <Link
              to="/#planos"
              className="ml-2 text-primary hover:text-primaryLight font-medium"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
