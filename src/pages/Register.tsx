import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CheckCircle2, Loader2, ShieldAlert, Ghost } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/toastStore'
import { createUserWithEmailAndPassword, updateProfile, deleteUser } from 'firebase/auth'
import { auth, db } from '@/config/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

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
  const [errorMsg, setErrorMsg] = useState('')
  const { addToast } = useToastStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isSuccess) {
      addToast('Você precisa assinar um plano primeiro.', 'info')
      navigate('/')
    }
  }, [isSuccess, navigate, addToast])

  const verifyApprovedPurchase = async (rawEmail: string): Promise<{ approved: boolean; docId: string }> => {
    const lowerEmail = rawEmail.toLowerCase().trim()
    const exactEmail = rawEmail.trim()

    const checkOnce = async () => {
      const lowerSnap = await getDoc(doc(db, 'allowed_users', lowerEmail))
      if (lowerSnap.exists() && lowerSnap.data()?.status === 'approved') {
        return { approved: true, docId: lowerEmail }
      }
      if (exactEmail !== lowerEmail) {
        const exactSnap = await getDoc(doc(db, 'allowed_users', exactEmail))
        if (exactSnap.exists() && exactSnap.data()?.status === 'approved') {
          return { approved: true, docId: exactEmail }
        }
      }
      return { approved: false, docId: lowerEmail }
    }

    // 1ª tentativa imediata
    const firstTry = await checkOnce()
    if (firstTry.approved) return firstTry

    // Caso o webhook da Cakto esteja levando alguns segundos após o PIX, aguarda 2.5s e tenta mais uma vez
    await new Promise(resolve => setTimeout(resolve, 2500))
    return await checkOnce()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    const cleanName = formData.name.trim()
    const cleanEmail = formData.email.toLowerCase().trim()

    if (!cleanName || !cleanEmail || !formData.password || !formData.confirmPassword) {
      addToast('Preencha todos os campos.', 'error')
      return
    }
    if (formData.password.length < 6) {
      addToast('A senha deve ter pelo menos 6 caracteres.', 'error')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      addToast('As senhas não coincidem.', 'error')
      return
    }

    setLoading(true)
    try {
      // 1. Cria credencial temporária no Firebase Auth para autenticar a leitura segura no Firestore
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, formData.password)

      // 2. Verifica no Firestore se este e-mail REALMENTE possui pagamento aprovado pelo Webhook ou Admin
      const verification = await verifyApprovedPurchase(formData.email)

      if (!verification.approved) {
        // E-mail NÃO possui compra aprovada! Remove imediatamente o usuário do Auth e bloqueia
        try {
          await deleteUser(userCredential.user)
        } catch {
          await auth.signOut()
        }
        await auth.signOut()
        const msg =
          'Nenhum pagamento aprovado foi encontrado para este e-mail. Digite exatamente o mesmo e-mail utilizado na compra.'
        setErrorMsg(msg)
        addToast(msg, 'error')
        setLoading(false)
        return
      }

      // 3. Compra legítima confirmada! Atualiza perfil e marca a conta como vinculada
      await updateProfile(userCredential.user, { displayName: cleanName })

      await setDoc(
        doc(db, 'allowed_users', verification.docId),
        {
          email: cleanEmail,
          registeredUid: userCredential.user.uid,
          registeredName: cleanName,
          accountCreatedAt: new Date().toISOString()
        },
        { merge: true }
      )

      addToast('Conta ativada com sucesso!', 'success')
      navigate('/dashboard')
    } catch (error: any) {
      console.error(error)
      if (error.code === 'auth/email-already-in-use') {
        setErrorMsg('Este e-mail já possui uma conta criada. Faça login para acessar.')
        addToast('Este e-mail já está em uso. Faça login.', 'error')
      } else {
        setErrorMsg('Ocorreu um erro ao validar seu cadastro. Tente novamente.')
        addToast('Ocorreu um erro ao criar a conta.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isSuccess) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#09090B] relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-5">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">Ativar acesso à plataforma</h1>
          <p className="text-sm text-zinc-400">
            Informe <strong className="text-zinc-200">exatamente o mesmo e-mail</strong> utilizado no pagamento para liberar sua conta.
          </p>
        </div>

        <div className="bg-[#0E0E11] border border-zinc-800/90 rounded-2xl shadow-2xl p-7">
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs text-red-300 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome completo"
              placeholder="Seu nome"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="E-mail utilizado na compra"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Crie uma senha"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />

            <Input
              label="Confirmar senha"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
            />

            <Button type="submit" className="w-full mt-6" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verificando compra e criando conta...
                </>
              ) : (
                'Validar Compra e Criar Conta'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center flex items-center justify-between text-xs text-zinc-500">
            <Link to="/login" className="hover:text-zinc-300 transition-colors">
              Já possui conta? Fazer Login
            </Link>
            <span className="inline-flex items-center gap-1 text-zinc-600">
              <Ghost className="w-3.5 h-3.5" /> GhostMarket OS
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
