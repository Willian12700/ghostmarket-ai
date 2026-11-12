import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { CopilotChat } from '@/components/ui/CopilotChat'
import { OnboardingModal } from '@/components/ui/OnboardingModal'
import { CommandPalette } from '@/components/ui/CommandPalette'
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
  '/dashboard': { title: 'Painel de Controle', description: 'Acompanhe suas vendas, projetos, métricas e atalhos rápidos em um único lugar.' },
  '/creator': { title: 'Creator IA', description: 'Gere abordagens irresistíveis e scripts personalizados para fechar vendas no WhatsApp.' },
  '/library': { title: 'Biblioteca IA', description: 'Todo o seu histórico de abordagens, prompts e criações salvas na nuvem.' },
  '/prompt-builder': { title: 'Prompt Builder Pro', description: 'Engenharia de prompts estruturados para criar sites, landing pages e sistemas SaaS.' },
  '/builder': { title: 'GhostStudio & Hospedagem', description: 'Crie sites em tempo real com 55+ modelos prontos e configure o Painel Admin do Cliente.' },
  '/sites': { title: 'Meus Sites Hospedados', description: 'Gerencie seus sites ativos, painel administrativo do lojista e relatórios de acessos.' },
  '/hosted-sites': { title: 'Meus Sites Hospedados', description: 'Gerencie seus sites ativos, painel administrativo do lojista e relatórios de acessos.' },
  '/proposta': { title: 'Propostas & Contratos PDF', description: 'Gere propostas comerciais executivas e contratos de prestação de serviços prontos para impressão.' },
  '/code-workspace': { title: 'AI Code Workspace', description: 'Edite, melhore e personalize o código dos seus projetos com inteligência artificial.' },
  '/ai-code-workspace': { title: 'AI Code Workspace', description: 'Edite, melhore e personalize o código dos seus projetos com inteligência artificial.' },
  '/ide': { title: 'Ghost IDE (Beta)', description: 'Ambiente de desenvolvimento integrado na nuvem para projetos avançados.' },
  '/image-to-link': { title: 'Converter Imagem em URL', description: 'Hospede imagens rapidamente e gere links diretos para usar em suas páginas.' },
  '/videos': { title: 'Vídeos e Links', description: 'Hospede vídeos na nuvem e gere links rápidos de reprodução e compartilhamento.' },
  '/video-links': { title: 'Vídeos e Links', description: 'Hospede vídeos na nuvem e gere links rápidos de reprodução e compartilhamento.' },
  '/chatbots': { title: 'Chatbots de IA', description: 'Configure assistentes virtuais inteligentes para atender e converter visitantes nos seus sites.' },
  '/scanner': { title: 'Scanner de Leads', description: 'Encontre empresas locais no Google Maps com oportunidades comerciais reais.' },
  '/cnpj': { title: 'Dossiê CNPJ', description: 'Consulte quadro societário, capital social e contatos empresariais em segundos.' },
  '/scripts': { title: 'Scripts X1 de Alta Conversão', description: 'Mensagens prontas e personalizáveis para abordagem, follow-up e quebra de objeções.' },
  '/offers': { title: 'Tracker de Ofertas', description: 'Monitore produtos em alta, variações de preços e oportunidades de mercado.' },
  '/contracts': { title: 'CRM Comercial (Kanban)', description: 'Gerencie seus leads, propostas enviadas e contratos fechados em um painel visual.' },
  '/digitaliza-crm': { title: 'Digitaliza CRM Compartilhado', description: 'Workspace colaborativo para equipes de vendas com metas, kanban e métricas.' },
  '/ranking': { title: 'Top Global', description: 'Ranking oficial dos membros que mais faturam na comunidade GhostMarket.' },
  '/tutoriais': { title: 'Tutoriais & Aulas', description: 'Treinamentos práticos passo a passo para dominar todas as ferramentas da plataforma.' },
  '/tutorials': { title: 'Tutoriais & Aulas', description: 'Treinamentos práticos passo a passo para dominar todas as ferramentas da plataforma.' },
  '/atualizacoes': { title: 'Novidades & Atualizações', description: 'Mural oficial de lançamentos e recursos adicionados na plataforma.' },
  '/updates': { title: 'Novidades & Atualizações', description: 'Mural oficial de lançamentos e recursos adicionados na plataforma.' },
  '/admin/atualizacoes': { title: 'Disparar Atualizações (Admin)', description: 'Publique novas notas de versão e envie alertas de atualização para o sininho de todos os membros.' },
  '/admin/updates': { title: 'Disparar Atualizações (Admin)', description: 'Publique novas notas de versão e envie alertas de atualização para o sininho de todos os membros.' },
  '/vip': { title: 'Comunidade VIP', description: 'Acesse o grupo oficial e exclusivo para membros Elite no WhatsApp.' },
  '/grupo-vip': { title: 'Comunidade VIP', description: 'Acesse o grupo oficial e exclusivo para membros Elite no WhatsApp.' },
  '/integrations': { title: 'Integrações & Webhooks', description: 'Conecte seu gateway de pagamento para sincronizar suas vendas automaticamente.' },
  '/settings': { title: 'Minha Agência (White-Label)', description: 'Personalize o GhostMarket com o nome, foto e cores da sua marca.' },
  '/admin': { title: 'Painel Administrativo', description: 'Gerencie usuários, libere acessos VIP, crie códigos de teste e monitore o sistema.' },
  '/admin/notes': { title: 'Backlog & Notas Internas', description: 'Organize tarefas, ideias e anotações administrativas da operação.' },
  '/socio': { title: 'Painel do Sócio', description: 'Gere códigos VIP temporários e acompanhe os resultados da parceria.' },
  '/quiz/analytics': { title: 'Analytics do Quiz', description: 'Acompanhe visualizações, funil de conversão e respostas detalhadas dos leads.' },
  '/finance': { title: 'Gestão Financeira', description: 'Controle completo de entradas, saídas e lucro líquido da sua operação.' },
  '/jarvis': { title: 'J.A.R.V.I.S. • Central Autônoma', description: 'Painel executivo de criação de vídeos, inteligência de horários e aceleração para o Gemini Ultra.' },
  '/products': { title: 'Meus Produtos', description: 'Gerencie seus produtos e gere links de checkout personalizados.' },
  '/affiliates': { title: 'Central de Afiliados', description: 'Acompanhe materiais de divulgação e comissões como afiliado.' }
}

export const MainLayout = () => {
  const { isAuthenticated, user } = useAuthStore()
  const { syncTheme } = useThemeStore()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null)
  const [isSuspended, setIsSuspended] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      const unsubscribe = syncTheme(user.uid)
      return () => unsubscribe()
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    let unsubscribe: () => void

    const checkSubscription = () => {
      if (!user?.email) return

      const cleanEmail = user.email.toLowerCase().trim()

      // Master Admin & Sócio possuem acesso garantido
      if (cleanEmail === 'willrandrier@gmail.com' || cleanEmail === 'souza.abencoado4@gmail.com') {
        setHasSubscription(true)
        setIsSuspended(false)
        return
      }

      try {
        const docRef = doc(db, 'allowed_users', cleanEmail)

        unsubscribe = onSnapshot(
          docRef,
          docSnap => {
            if (docSnap.exists()) {
              const status = docSnap.data().status
              if (status === 'approved') {
                setHasSubscription(true)
                setIsSuspended(false)
                if (docSnap.data().used !== true) {
                  setShowOnboarding(true)
                }
              } else if (status === 'suspended') {
                setHasSubscription(false)
                setIsSuspended(true)
              } else {
                setHasSubscription(false)
                setIsSuspended(false)
              }
            } else {
              setHasSubscription(false)
              setIsSuspended(false)
            }
          },
          error => {
            console.error('Error listening to subscription:', error)
            setHasSubscription(false)
          }
        )
      } catch (error) {
        console.error('Error setting up subscription listener:', error)
        setHasSubscription(false)
      }
    }

    if (isAuthenticated) {
      if (user?.isAnonymous) {
        const expiresAt = Number(localStorage.getItem('trial_expires_at') || 0)
        if (!expiresAt || Date.now() >= expiresAt) {
          localStorage.removeItem('trial_expires_at')
          useAuthStore.getState().logout()
          setHasSubscription(false)
        } else {
          setHasSubscription(true)
          setIsSuspended(false)
        }
      } else {
        checkSubscription()
      }
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
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
            <Button
              size="lg"
              variant="secondary"
              onClick={() =>
                window.open(
                  'https://api.whatsapp.com/send?phone=5584996162332&text=Olá,%20minha%20conta%20na%20GhostMarket%20foi%20suspensa%20e%20gostaria%20de%20ajuda.',
                  '_blank'
                )
              }
            >
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
          Nenhuma assinatura ativa foi encontrada para o e-mail <br />
          <strong className="text-white">{user?.email}</strong>.
        </p>
        <p className="text-textSecondary max-w-md mx-auto mb-8">
          Se você acabou de pagar, aguarde alguns minutos e atualize a página. Se você ainda não possui um plano, assine agora para liberar o seu acesso.
        </p>
        <div className="flex gap-4">
          <Button size="lg" onClick={() => (window.location.href = '/')}>
            Ver Planos
          </Button>
          <Button size="lg" variant="secondary" onClick={() => window.location.reload()}>
            Atualizar Página
          </Button>
        </div>
      </div>
    )
  }

  const info = pageInfo[location.pathname] || {
    title: 'GhostMarket AI',
    description: 'Plataforma integrada de inteligência artificial, prospecção e vendas.'
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[264px]' : 'ml-0'}`}>
        <Topbar
          title={info.title}
          description={info.description}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
      <CopilotChat />
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
      <ToastContainer />
      <SalesNotifier />
      {user?.isAnonymous && <TrialTimer />}
    </div>
  )
}
