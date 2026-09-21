import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, BellRing, Trophy, Wand2, Search, FileText, Bot, Settings, LogOut, Ghost, X, Code, User, BookMarked, Sparkles, ChevronDown, ChevronRight, Users, Video, TrendingUp, Mail, Megaphone, BookOpen, LayoutTemplate, Globe , ShieldAlert, MessageCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/utils/cn'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, logout } = useAuthStore()
  const { theme } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()

  // State to manage open/closed accordion groups
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Prompt, Sites e Leads'])

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

    const menuGroups = [
    {
      label: 'Painel',
      items: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Painel' },
          { to: '/ranking', icon: Trophy, label: 'Top Global' }
      ]
    },
    {
      label: 'Inteligência de Mercado',
      items: [
        { to: '/offers', icon: BellRing, label: 'Tracker de Ofertas' }
      ]
    },
    {
      label: 'Prompt, Sites e Leads',
      items: [
        { to: '/creator', icon: Wand2, label: 'Creator IA' },
        { to: '/library', icon: BookMarked, label: 'Biblioteca IA' },
        { to: '/prompt-builder', icon: Code, label: 'Prompt Builder' },
        { to: '/builder', icon: LayoutTemplate, label: 'Hospedar Novo Site' },
        { to: '/sites', icon: Globe, label: 'Meus Sites' },
          { to: '/chatbots', icon: Bot, label: 'Chatbots de IA' },
        { to: '/scanner', icon: Search, label: 'Scanner de Leads' },
      ]
    },
    {
      label: 'TikTok Shop',
      items: [
        { to: '/tiktok/persona', icon: Users, label: 'Gerador de Persona' },
        { to: '/tiktok/persona-history', icon: BookMarked, label: 'Histórico de Persona' },
        { to: '/tiktok/scripts', icon: Video, label: 'Roteiros Virais' },
        { to: '/tiktok/ads', icon: TrendingUp, label: 'Copy para Anúncios' }
        ]
      },
      {
        label: 'Marketing Digital',
        items: [
          { to: '/marketing/vsl', icon: Video, label: 'Fábrica de VSLs' },
          { to: '/marketing/plr', icon: BookOpen, label: 'Máquina de PLR / E-books' },
          { to: '/marketing/ads', icon: Megaphone, label: 'Gerador de Anúncios' },
          { to: '/marketing/emails', icon: Mail, label: 'Funil de E-mail' }
      ]
    },
    {
      label: 'Organização',
      items: [
        { to: '/contracts', icon: FileText, label: 'CRM (Kanban)' },
      ]
    },
    {
      label: 'Sistemas e Integrações',
      items: [
        { to: '/integrations', icon: Settings, label: 'Integrações' },
        { to: '/affiliates', icon: Ghost, label: 'Programa de Afiliados' },
      ]
    },
    {
      label: 'Conta',
      items: [
        { to: '/settings', icon: User, label: 'Meu Perfil' },
      ]
    }
  ]

  if (user?.email === 'willrandrier@gmail.com') {
    menuGroups.push({
      label: 'PAINEL ADM',
      items: [
        { to: '/admin', icon: ShieldAlert, label: 'Liberação de Acesso' }
      ]
    })
  }

  // Automatically expand group if a child is active group if a child is active
  useEffect(() => {
    menuGroups.forEach(group => {
      const hasActiveChild = group.items.some(item => location.pathname === item.to)
      if (hasActiveChild && !expandedGroups.includes(group.label)) {
        setExpandedGroups(prev => [...prev, group.label])
      }
    })
  }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-screen w-72 bg-panel/90 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 flex-shrink-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent opacity-50 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            {theme.logoUrl ? (
              <img src={theme.logoUrl} alt={theme.agencyName} className="w-8 h-8 rounded-lg object-cover shadow-lg border border-white/10" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Sparkles className="w-5 h-5" />
              </div>
            )}
            <span className="font-bold text-xl text-white tracking-tight truncate max-w-[140px]">{theme.agencyName}</span>
          </div>
          <button onClick={onClose} className="md:hidden text-textSecondary hover:text-white relative z-10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {menuGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.label)
            
            // Se o grupo só tiver 1 item (como Painel, Organização, Conta), a gente só exibe o item direto sem Accordion
            if (group.items.length === 1) {
              const link = group.items[0]
              return (
                <div key={link.to} className="space-y-1">
                  <NavLink
                    to={link.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 text-sm font-semibold",
                        isActive 
                          ? "bg-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
                          : "text-textSecondary hover:bg-white/5 hover:text-white"
                      )
                    }
                  >
                    <link.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110")} />
                    {link.label}
                  </NavLink>
                </div>
              )
            }

            // Se for um grupo com vÁƒÂ¡rios itens, usamos o Accordion (gaveta)
            return (
              <div key={group.label} className="space-y-2">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between w-full px-2 py-2 text-sm font-bold text-textSecondary hover:text-white transition-colors"
                >
                  <span className="uppercase tracking-widest text-[10px] opacity-70">{group.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 opacity-70 transition-transform" />
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-70 transition-transform" />
                  )}
                </button>
                
                <div 
                  className={cn(
                    "space-y-1 overflow-hidden transition-all duration-300 ease-in-out pl-2 border-l border-white/5 ml-2",
                    isExpanded ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0"
                  )}
                >
                  {group.items.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium",
                          isActive 
                            ? "bg-primary/20 text-white shadow-sm border border-primary/20" 
                            : "text-textSecondary hover:bg-white/5 hover:text-white"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <link.icon className={cn("w-4 h-4 transition-transform duration-300 group-hover:scale-110", isActive ? "text-primary" : "")} />
                          {link.label}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-3 mb-4 px-2">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover border border-primary/50"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primaryLight flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Usuário'}</p>
              <p className="text-xs text-textSecondary truncate">{user?.email || 'email@exemplo.com'}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full">
              <a
                href="https://wa.me/5584996162332?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20no%20GhostMarket%20AI"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-textSecondary hover:bg-panelHover hover:text-white transition-colors border border-border/30 bg-background"
                title="Suporte no WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-success" />
                <span className="truncate">Suporte</span>
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-textSecondary hover:bg-panelHover hover:text-error transition-colors border border-border/30 bg-background"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
                <span className="truncate">Sair</span>
              </button>
            </div>
        </div>
      </aside>
    </>
  )
}
