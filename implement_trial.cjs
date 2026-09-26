const fs = require('fs');

// 1. Update AdminPanel.tsx to add Trial Code Generator
let adminCode = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

const trialGeneratorCode = `
  const [generatedCode, setGeneratedCode] = useState('')
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)

  const generateTrialCode = async () => {
    setIsGeneratingCode(true)
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      await setDoc(doc(db, 'trial_codes', code), {
        code,
        createdAt: serverTimestamp(),
        activatedAt: null,
        uid: null,
        expiresAt: null
      })
      setGeneratedCode(code)
      addToast('Código de 5 Minutos Gerado com Sucesso!', 'success')
    } catch (e) {
      console.error(e)
      addToast('Erro ao gerar código', 'error')
    } finally {
      setIsGeneratingCode(false)
    }
  }
`;

// Insert the state and function
adminCode = adminCode.replace(/const \[freeAccessEmail, setFreeAccessEmail\] = useState\(''\)/, trialGeneratorCode + '\n  const [freeAccessEmail, setFreeAccessEmail] = useState(\'\')');

const trialSectionUI = `
          {/* Sessão de Código Temporário */}
          <Card className="bg-[#0b0714] border-white/5 mb-8">
            <CardHeader className="border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl">Gerar Teste Grátis (5 Minutos)</CardTitle>
                  <p className="text-sm text-white/50">Crie um código de 6 dígitos para um Lead testar o painel temporariamente sem precisar criar conta.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-white/70 mb-2 block">Código Gerado</label>
                  <div className="flex items-center justify-between p-4 bg-[#050505] border border-white/10 rounded-xl">
                    <span className="text-2xl font-mono tracking-[0.5em] text-white font-bold">{generatedCode || '------'}</span>
                    {generatedCode && (
                      <Button variant="secondary" onClick={() => { navigator.clipboard.writeText(generatedCode); addToast('Copiado!', 'success'); }}>
                        Copiar
                      </Button>
                    )}
                  </div>
                </div>
                <Button onClick={generateTrialCode} disabled={isGeneratingCode} className="h-[74px] px-8 bg-blue-600 hover:bg-blue-700">
                  {isGeneratingCode ? 'Gerando...' : 'Gerar Código'}
                </Button>
              </div>
            </CardContent>
          </Card>
`;

// Insert UI into AdminPanel return (before NicheManager)
adminCode = adminCode.replace(/<NicheManager \/>/, trialSectionUI + '\n        <NicheManager />');

// Ensure Clock is imported
if (!adminCode.includes('Clock')) {
  adminCode = adminCode.replace(/Globe, X, ExternalLink } from 'lucide-react'/, "Globe, X, ExternalLink, Clock } from 'lucide-react'");
}

fs.writeFileSync('src/pages/AdminPanel.tsx', adminCode, 'utf8');

// 2. Create TrialLogin.tsx
const trialLoginCode = `import { useState } from 'react'
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
              onChange={(e) => setCode(e.target.value.replace(/\\D/g, '').slice(0,6))}
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
`;
fs.writeFileSync('src/pages/TrialLogin.tsx', trialLoginCode, 'utf8');

// 3. Create TrialTimer.tsx
const trialTimerCode = `import { useEffect, useState } from 'react'
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
        setTimeLeft(\`\${m.toString().padStart(2, '0')}:\${s.toString().padStart(2, '0')}\`)
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
`;
fs.writeFileSync('src/components/ui/TrialTimer.tsx', trialTimerCode, 'utf8');

// 4. Update MainLayout.tsx
let mainLayoutCode = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');
mainLayoutCode = mainLayoutCode.replace("import { SalesNotifier } from '@/components/ui/SalesNotifier'", "import { SalesNotifier } from '@/components/ui/SalesNotifier'\nimport { TrialTimer } from '@/components/ui/TrialTimer'");

// Modify checkSubscription logic
mainLayoutCode = mainLayoutCode.replace("if (isAuthenticated) {\n      checkSubscription();\n    }", `if (isAuthenticated) {
      if (user?.isAnonymous) {
        setHasSubscription(true)
        setIsSuspended(false)
      } else {
        checkSubscription()
      }
    }`);

// Render TrialTimer
mainLayoutCode = mainLayoutCode.replace("<ToastContainer />\n      <SalesNotifier />", "<ToastContainer />\n      <SalesNotifier />\n      {user?.isAnonymous && <TrialTimer />}");

fs.writeFileSync('src/layouts/MainLayout.tsx', mainLayoutCode, 'utf8');

// 5. Update App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace("import { Landing } from '@/pages/Landing'", "import { Landing } from '@/pages/Landing'\nimport { TrialLogin } from '@/pages/TrialLogin'");
appCode = appCode.replace('<Route path="/login" element={<Login />} />', '<Route path="/login" element={<Login />} />\n            <Route path="/trial" element={<TrialLogin />} />');
fs.writeFileSync('src/App.tsx', appCode, 'utf8');

// 6. Update Landing.tsx to add Trial button
let landingCode = fs.readFileSync('src/pages/Landing.tsx', 'utf8');
const trialBtn = `
                <div className="mt-8 flex justify-center">
                  <a href="https://wa.me/5584996162332?text=Ol%C3%A1!+Estou+no+site+e+gostaria+de+um+c%C3%B3digo+de+5+minutos+para+testar+o+sistema+por+dentro." target="_blank" className="text-sm text-white/50 hover:text-white underline decoration-white/30 underline-offset-4 flex items-center gap-2 transition-colors">
                    <Clock className="w-4 h-4" /> Quer testar 5 minutos de graça no X1? Me peça um código temporário.
                  </a>
                </div>
`;
// Insert before "Os Primeiros 10 Vão Dominar"
landingCode = landingCode.replace(/<div className="mt-20 border-t border-white\/5 pt-16">/, trialBtn + '\n<div className="mt-20 border-t border-white/5 pt-16">');
// Import Clock in Landing if missing
if (!landingCode.includes('Clock,')) {
  landingCode = landingCode.replace(/MessageCircle} from 'lucide-react'/, 'MessageCircle, Clock} from "lucide-react"');
}
fs.writeFileSync('src/pages/Landing.tsx', landingCode, 'utf8');

