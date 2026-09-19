import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/toastStore'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '@/config/firebase'

export const Register = () => {
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status')
  const isSuccess = status === 'success'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const [loading, setLoading] = useState(false)
  const { addToast } = useToastStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isSuccess) {
      addToast('Você precisa assinar um plano primeiro.', 'info')
      navigate('/')
    }
  }, [isSuccess, navigate, addToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      addToast('Preencha todos os campos.', 'error')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      addToast('As senhas não coincidem.', 'error')
      return
    }
    
    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      await updateProfile(userCredential.user, { displayName: formData.name })
      
      addToast('Conta criada com sucesso!', 'success')
      navigate('/dashboard')
    } catch (error: any) {
      console.error(error)
      if (error.code === 'auth/email-already-in-use') {
        addToast('Este e-mail já está em uso.', 'error')
      } else {
        addToast('Ocorreu um erro ao criar a conta.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isSuccess) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primaryLight/10 rounded-full blur-[128px] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-success/10 border border-success/20 shadow-lg mb-6">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Pagamento confirmado!</h1>
          <p className="text-textSecondary">Seu pagamento foi processado. Agora crie sua conta para acessar o GhostMarket AI.</p>
        </div>

        <div className="bg-panel border border-border rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome"
              placeholder="Seu nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            
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
            
            <Input
              label="Confirmar senha"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />

            <Button type="submit" className="w-full mt-6" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar minha conta'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
