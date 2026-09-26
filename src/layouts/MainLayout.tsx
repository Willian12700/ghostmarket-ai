import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { CopilotChat } from '@/components/ui/CopilotChat'
import { OnboardingModal } from '@/components/ui/OnboardingModal'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { SalesNotifier } from '@/components/ui/SalesNotifier'
import { TrialTimer } from '@/components/ui/TrialTimer'
import { db } from '@/config/firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import { Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const pageInfo: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'Painel de Controle', description: 'Acompanhe suas vendas, projetos e leads em um único lugar.' },
  '/creator': { title: 'Creator IA', description: 'Crie especificações completas para transformar ideias em aplicações SaaS.' },
  '/library': { title: 'Biblioteca IA', description: 'Todo o seu histórico de criações salvas.' },
  '/scanner': { title: 'Scanner de Leads', description: 'Encontre oportunidades comerciais por localização e nicho.' },
  '/contracts': { title: 'Gestão de Contratos', description: 'Gerencie seus clientes, contratos e valores em um único painel.' },
  '/integrations': { title: 'Integração API', description: 'Conecte seu gateway de pagamento para sincronizar suas vendas automaticamente.' },
  '/settings': { title: 'Minha Agência', description: 'Personalize o GhostMarket com as cores e logo da sua marca (White-Label).' },
}

export const MainLayout = () => {
  const { isAuthenticated, user } = useAuthStore()
  const { syncTheme } = useThemeStore()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null)
  const [isSuspended, setIsSuspended] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      const unsubscribe = syncTheme(user.uid)
      return () => unsubscribe()
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    let unsubscribe: () => void;

    const checkSubscription = () => {
      if (!user?.email) return;
      
      try {
        const docRef = doc(db, 'allowed_users', user.email);
        
        // Listen in real-time
        unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const status = docSnap.data().status;
            if (status === 'approved') {
              setHasSubscription(true);
              setIsSuspended(false);
              if (docSnap.data().used !== true) {
                setShowOnboarding(true);
              }
            } else if (status === 'suspended') {
              setHasSubscription(false);
              setIsSuspended(true);
            } else {
              setHasSubscription(false);
              setIsSuspended(false);
            }
          } else {
            setHasSubscription(false);
            setIsSuspended(false);
          }
        }, (error) => {
          console.error("Error listening to subscription:", error);
          setHasSubscription(false);
        });

      } catch (error) {
        console.error("Error setting up subscription listener:", error);
        setHasSubscription(false);
      }
    }

    if (isAuthenticated) {
      if (user?.isAnonymous) {
        setHasSubscription(true)
        setIsSuspended(false)
      } else {
        checkSubscription()
      }
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (hasSubscription === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-textSecondary">Verificando sua conta...</p>
      </div>
    )
  }

  if (hasSubscription === false) {
    if (isSuspended) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <Lock className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Conta Suspensa</h2>
          <p className="text-textSecondary max-w-lg mx-auto mb-8 text-xl">
            Sua conta foi suspensa pela equipe GhostMarket por violação dos termos de uso.
          </p>
          <div className="flex gap-4">
            <Button size="lg" variant="secondary" onClick={() => window.open('https://wa.me/5584996162332?text=Olá,%20minha%20conta%20na%20GhostMarket%20foi%20suspensa%20e%20gostaria%20de%20ajuda.', '_blank')}>
              Entrar em Contato
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-error/10 text-error rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <Lock className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">Acesso Bloqueado</h2>
        <p className="text-textSecondary max-w-lg mx-auto mb-8 text-xl">
          Nenhuma assinatura ativa foi encontrada para o e-mail <br/><strong className="text-white">{user?.email}</strong>. 
        </p>
        <p className="text-textSecondary max-w-md mx-auto mb-8">
          Se você acabou de pagar, aguarde alguns minutos e atualize a página. Se você ainda não possui um plano, assine agora para liberar o seu acesso.
        </p>
        <div className="flex gap-4">
          <Button size="lg" onClick={() => window.location.href = '/'}>
            Ver Planos
          </Button>
          <Button size="lg" variant="secondary" onClick={() => window.location.reload()}>
            Atualizar Página
          </Button>
        </div>
      </div>
    )
  }

  const info = pageInfo[location.pathname] || { title: 'GhostMarket AI', description: '' }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'md:ml-72' : 'ml-0'}`}>
        <Topbar 
          title={info.title} 
          description={info.description} 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <CopilotChat />
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
      <ToastContainer />
      <SalesNotifier />
      {user?.isAnonymous && <TrialTimer />}
    </div>
  )
}
