import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Trophy,
  Wand2,
  Search,
  FileText,
  Bot,
  Settings,
  LogOut,
  Ghost,
  X,
  Code,
  BookMarked,
  LayoutTemplate,
  Globe,
  Image as ImageIcon,
  Video,
  ShieldAlert,
  MessageCircle,
  SearchCode,
  Crown,
  NotebookPen,
  Key,
  PieChart,
  CodeXml,
  GraduationCap,
  Command,
  ArrowUpRight,
  Sparkles,
  Megaphone
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onOpenCommandPalette?: () => void
}

export const Sidebar = ({ isOpen, onClose, onOpenCommandPalette }: SidebarProps) => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    'Visão Geral',
    'Inteligência de Mercado',
    'Estúdio & Prospecção',
    'Gestão & CRM',
    'Administração',
    'Painel Sócio'
  ])

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupLabel)
        ? prev.filter(g => g !== groupLabel)
        : [...prev, groupLabel]
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isPartner = user?.email === 'souza.abencoado4@gmail.com'
  const isAdmin = user?.email === 'willrandrier@gmail.com'
  const hasRealEmail = Boolean(user?.email && user.email.includes('@') && !user.email.startsWith('Teste VIP'))

  const isTrial = Boolean(
    !isAdmin && !isPartner && !hasRealEmail && (user?.isAnonymous || user?.email?.startsWith('Teste VIP'))
  )

  if (hasRealEmail || isAdmin || isPartner) {
    if (typeof window !== 'undefined' && localStorage.getItem('trial_expires_at')) {
      localStorage.removeItem('trial_expires_at')
    }
  }

  let menuGroups = [
    {
      label: 'Visão Geral',
      items: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Resumo Global' },
        { to: '/atualizacoes', icon: Sparkles, label: 'Novidades & Updates' },
        { to: '/tutoriais', icon: GraduationCap, label: 'Tutoriais & Aulas' },
        { to: '/ranking', icon: Trophy, label: 'Ranking Global' }
      ]
    },
    {
      label: 'Estúdio & Prospecção',
      items: [
        { to: '/scanner', icon: Search, label: 'Scanner de Leads' },
        { to: '/cnpj', icon: SearchCode, label: 'Dossiê CNPJ' },
        { to: '/creator', icon: Wand2, label: 'Creator IA' },
        { to: '/scripts', icon: MessageCircle, label: 'Scripts X1' },
        { to: '/prompt-builder', icon: Code, label: 'Modelos & Prompts' },
        { to: '/code-workspace', icon: CodeXml, label: 'AI Code Workspace' },
        { to: '/builder', icon: LayoutTemplate, label: 'GhostStudio & Hospedar' },
        { to: '/sites', icon: Globe, label: 'Meus Sites' },
        { to: '/chatbots', icon: Bot, label: 'Chatbots de IA' },
        { to: '/library', icon: BookMarked, label: 'Biblioteca IA' },
        { to: '/image-to-link', icon: ImageIcon, label: 'Imagem para URL' },
        { to: '/videos', icon: Video, label: 'Vídeos & Links' }
      ]
    },
    {
      label: 'Gestão & CRM',
      items: [
        { to: '/contracts', icon: FileText, label: 'CRM Comercial (Kanban)' },
        { to: '/proposta', icon: FileText, label: 'Proposta & Contrato PDF' },
        { to: '/finance', icon: PieChart, label: 'Financeiro & Receita' }
      ]
    }
  ]

  if (isPartner) {
    menuGroups = menuGroups.filter(g => !['Gestão & CRM', 'Administração'].includes(g.label))
    menuGroups.unshift({
      label: 'Painel Sócio',
      items: [
        { to: '/socio', icon: Key, label: 'Gerar Códigos VIP' },
        { to: '/quiz/analytics', icon: PieChart, label: 'Quiz Analytics' }
      ]
    })
  }

  if (isAdmin) {
    menuGroups.push({
      label: 'Administração',
      items: [
        { to: '/admin', icon: ShieldAlert, label: 'Liberação de Acesso' },
        { to: '/atualizacoes', icon: Megaphone, label: 'Disparar Atualizações' },
        { to: '/quiz/analytics', icon: PieChart, label: 'Quiz Analytics' },
        { to: '/tutoriais?action=new', icon: Video, label: 'Publicar Tutorial' },
        { to: '/admin/notes', icon: NotebookPen, label: 'Backlog & Notas' }
      ]
    })
  }

  useEffect(() => {
    if (window.innerWidth < 1024) {
      onClose()
    }
  }, [location.pathname])

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-[#09090B] border-r border-zinc-800/80 transition-transform duration-200 ease-out z-50 flex flex-col',
          'w-[264px]',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Minimal Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Ghost className="w-4 h-4 text-zinc-100" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[15px] text-white tracking-tight">GhostMarket</span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                OS
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white lg:hidden transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar space-y-5">
          {/* Quick Search Bar */}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800/90 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-medium">
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                <span>Ir para ferramenta...</span>
              </div>
              <kbd className="flex items-center gap-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </button>
          )}

          {/* Discreet Executive Community Link */}
          {!isTrial && (
            <NavLink
              to="/vip"
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs transition-colors',
                  isActive
                    ? 'bg-zinc-900 border-zinc-700 text-white'
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:text-white'
                )
              }
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-medium">Comunidade VIP (WhatsApp)</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
            </NavLink>
          )}

          {/* Menu Groups */}
          <div className="space-y-5">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  <span>{group.label}</span>
                  <svg
                    className={cn(
                      'w-3 h-3 transition-transform duration-200 text-zinc-600',
                      expandedGroups.includes(group.label) ? 'rotate-90' : ''
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div
                  className={cn(
                    'space-y-0.5 overflow-hidden transition-all duration-200',
                    expandedGroups.includes(group.label) ? 'max-h-[650px] opacity-100 mt-1' : 'max-h-0 opacity-0'
                  )}
                >
                  {group.items.map((item, index) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')

                    return (
                      <NavLink
                        key={index}
                        to={item.to}
                        className={cn(
                          'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors group relative',
                          isActive
                            ? 'text-white bg-zinc-800/80'
                            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-4 h-4 shrink-0 transition-colors',
                            isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                        {(item as any).badge && (
                          <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 shrink-0">
                            {(item as any).badge}
                          </span>
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Profile & Actions */}
        <div className="p-3 border-t border-zinc-800/80 bg-[#09090B] space-y-2">
          <div className="flex gap-1.5">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  'flex-1 flex justify-center items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                  isActive
                    ? 'text-white bg-zinc-800 border-zinc-700'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border-zinc-800/80'
                )
              }
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Agência</span>
            </NavLink>
            <a
              href="https://api.whatsapp.com/send?phone=5584996162332&text=Ol%C3%A1%2C%20preciso%20de%20suporte%20no%20GhostMarket%20AI"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex justify-center items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800/80 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Suporte</span>
            </a>
            <button
              onClick={handleLogout}
              title="Sair da conta"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-zinc-800/80 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
            <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.name || 'User'} className="w-full h-full object-cover" />
              ) : (
                <Crown className="w-3.5 h-3.5 text-zinc-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-100 truncate">
                {user?.name || 'Membro GhostMarket'}
              </p>
              <p className="text-[10px] font-mono text-zinc-500 truncate">
                {isAdmin ? 'Admin' : isPartner ? 'Sócio' : 'Licença Ativa'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
