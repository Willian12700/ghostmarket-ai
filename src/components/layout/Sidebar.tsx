import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, BellRing, Trophy, Wand2, Search, FileText, Bot, Settings, LogOut, Ghost, X, Code, User, BookMarked, Users, Video, TrendingUp, Mail, Megaphone, BookOpen, LayoutTemplate, Globe, Image as ImageIcon, ShieldAlert, MessageCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Prompt, Sites e Leads', 'TikTok Shop', 'Marketing Digital'])

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
        { to: '/dashboard', icon: LayoutDashboard, label: 'Resumo Global' },
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
        { to: '/image-to-link', icon: ImageIcon, label: 'Converter Imagem (URL)' },
        { to: '/sites', icon: Globe, label: 'Meus Sites' },
        { to: '/chatbots', icon: Bot, label: 'Chatbots de IA' },
        { to: '/scanner', icon: Search, label: 'Scanner de Leads' },
        { to: '/scripts', icon: MessageCircle, label: 'Scripts X1' },
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
      label: 'Gestão',
      items: [
        { to: '/contracts', icon: FileText, label: 'CRM (Kanban)' },
      ]
    }
  ]

  if (user?.email === 'willrandrier@gmail.com') {
    menuGroups.push({
      label: 'PAINEL ADM',
      items: [
        { to: '/admin', icon: ShieldAlert, label: 'Liberação de Acesso' },
      ]
    })
  }

  // Automatically expand group if a child is active
  useEffect(() => {
    menuGroups.forEach(group => {
      const hasActiveChild = group.items.some(item => location.pathname === item.to || location.pathname.startsWith(item.to + '/'))
      if (hasActiveChild && !expandedGroups.includes(group.label)) {
        setExpandedGroups(prev => [...prev, group.label])
      }
    })
  }, [location.pathname])

  // Effect to close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  }, [location.pathname]);

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside 
        className={cn(
          "fixed top-0 left-0 h-full bg-background-secondary border-r border-border transition-transform duration-300 ease-out z-50 flex flex-col shadow-2xl",
          "w-[260px]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-border bg-background/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20 shadow-glow-sm">
              <Ghost className="w-5 h-5 text-accent" />
            </div>
            <span className="font-bold text-lg text-textPrimary tracking-tight">GhostMarket</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-surface text-textSecondary hover:text-textPrimary lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <div className="space-y-6">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-textMuted uppercase tracking-wider group hover:text-textSecondary transition-colors"
                >
                  {group.label}
                  <svg 
                    className={cn("w-3.5 h-3.5 transition-transform duration-200", expandedGroups.includes(group.label) ? "rotate-90" : "")} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <div 
                  className={cn(
                    "space-y-0.5 overflow-hidden transition-all duration-300",
                    expandedGroups.includes(group.label) ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"
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
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                          isActive 
                            ? "text-textPrimary bg-surface-elevated border border-border shadow-sm"
                            : "text-textSecondary hover:text-textPrimary hover:bg-surface border border-transparent"
                        )}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-accent rounded-r-full shadow-glow" />
                        )}
                        <Icon className={cn(
                          "w-4 h-4 transition-colors",
                          isActive ? "text-accent" : "text-textMuted group-hover:text-textSecondary"
                        )} />
                        {item.label}
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-border bg-background/30 backdrop-blur-sm space-y-4">
          
          {/* Support Button - Premium Moving Gradient */}
          <a
            href="https://wa.me/5584996162332?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20no%20GhostMarket%20AI"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-glow hover:scale-[1.02] active:scale-95 animate-bg-shift bg-gradient-to-r from-accent via-secondary to-accent border border-white/20"
            title="Suporte no WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="tracking-wide">Suporte Exclusivo</span>
          </a>

          <div className="flex gap-2">
            <NavLink
              to="/settings"
              className={({ isActive }) => cn(
                "flex-1 flex justify-center items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "text-textPrimary bg-surface-elevated border border-border shadow-sm"
                  : "text-textSecondary hover:text-textPrimary hover:bg-surface border border-border/50"
              )}
            >
              <Settings className="w-4 h-4" /> Config
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex-1 flex justify-center items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-textSecondary hover:text-error hover:bg-error/10 border border-border/50 transition-all duration-200 group"
            >
              <LogOut className="w-4 h-4 group-hover:text-error transition-colors" />
              Sair
            </button>
          </div>

          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface border border-border shadow-sm">
            <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center overflow-hidden shrink-0">
              <User className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-textPrimary truncate">
                {user?.name || 'Usuário Premium'}
              </p>
              <p className="text-[10px] font-semibold text-textMuted truncate uppercase tracking-wider">
                {user?.email === 'willrandrier@gmail.com' ? 'Administrador' : 'Membro Elite'}
              </p>
            </div>
          </div>

        </div>
      </aside>
    </>
  )
}
