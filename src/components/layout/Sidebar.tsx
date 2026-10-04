import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, BellRing, Trophy, Wand2, Search, FileText, Bot, Settings, LogOut, Ghost, X, Code, BookMarked, LayoutTemplate, Globe, Image as ImageIcon, ShieldAlert, MessageCircle, SearchCode, Crown, NotebookPen } from 'lucide-react'
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

  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Prompt, Sites e Leads', 'Digitaliza Comercial', 'PAINEL ADM'])

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
        { to: '/ide', icon: Code, label: 'Ghost IDE (BETA)', badge: 'NOVO' },
        { to: '/image-to-link', icon: ImageIcon, label: 'Converter Imagem (URL)' },
        { to: '/sites', icon: Globe, label: 'Meus Sites' },
        { to: '/chatbots', icon: Bot, label: 'Chatbots de IA' },
        { to: '/scanner', icon: Search, label: 'Scanner de Leads' },
        { to: '/cnpj', icon: SearchCode, label: 'Dossiê CNPJ' },
        { to: '/scripts', icon: MessageCircle, label: 'Scripts X1' },
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
        { to: '/admin/notes', icon: NotebookPen, label: 'Backlog / Notas' },
      ]
    })
  }

  menuGroups.push({
    label: 'Digitaliza Comercial',
    items: [
      { to: '/digitaliza-crm', icon: FileText, label: 'CRM Compartilhado', badge: 'PRO' },
    ]
  })

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  }, [location.pathname]);

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside 
        className={cn(
          "fixed top-0 left-0 h-full bg-background/95 backdrop-blur-2xl border-r border-border transition-transform duration-300 ease-out z-50 flex flex-col shadow-[20px_0_40px_rgba(0,0,0,0.5)]",
          "w-[280px]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-border bg-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] relative">
              <div className="absolute inset-0 bg-black/20 rounded-xl"></div>
              <Ghost className="w-5 h-5 text-white relative z-10" />
            </div>
            <span className="font-black text-xl text-textPrimary tracking-tight">GhostMarket</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-surface text-textSecondary hover:text-textPrimary lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          <div className="space-y-6">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-black text-textMuted uppercase tracking-widest group hover:text-textPrimary transition-colors"
                >
                  {group.label}
                  <svg 
                    className={cn("w-3.5 h-3.5 transition-transform duration-300", expandedGroups.includes(group.label) ? "rotate-90 text-accent" : "")} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <div 
                  className={cn(
                    "space-y-1 overflow-hidden transition-all duration-300",
                    expandedGroups.includes(group.label) ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0"
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
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group relative overflow-hidden",
                          isActive 
                            ? "text-white bg-gradient-to-r from-accent/20 to-transparent border border-accent/20 shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]"
                            : "text-textSecondary hover:text-textPrimary hover:bg-surface/50 border border-transparent"
                        )}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full shadow-[0_0_10px_var(--accent)]" />
                        )}
                        <Icon className={cn(
                          "w-4 h-4 transition-all duration-300",
                          isActive ? "text-accent drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" : "text-textMuted group-hover:text-textPrimary"
                        )} />
                        <span>{item.label}</span>
                        {(item as any).badge && (
                          <span className="ml-auto text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(139,92,246,0.5)]">
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

        <div className="p-5 border-t border-border bg-surface-elevated/30 backdrop-blur-xl space-y-4">
          
          <a
            href="https://wa.me/5584996162332?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20no%20GhostMarket%20AI"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:-translate-y-0.5 active:scale-95 bg-accent border border-accent/50 relative overflow-hidden group"
            title="Suporte no WhatsApp"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
            <MessageCircle className="w-5 h-5 relative z-10" />
            <span className="tracking-wide relative z-10">Suporte Exclusivo</span>
          </a>

          <div className="flex gap-2">
            <NavLink
              to="/settings"
              className={({ isActive }) => cn(
                "flex-1 flex justify-center items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                isActive 
                  ? "text-textPrimary bg-surface-elevated border border-border shadow-sm"
                  : "text-textSecondary hover:text-textPrimary hover:bg-surface border border-transparent"
              )}
            >
              <Settings className="w-4 h-4" /> Config
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex-1 flex justify-center items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-textSecondary hover:text-error hover:bg-error/10 border border-transparent transition-all duration-200 group"
            >
              <LogOut className="w-4 h-4 group-hover:text-error transition-colors" />
              Sair
            </button>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface/80 border border-border/50 shadow-sm backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-10 h-10 rounded-full bg-surface-elevated border border-accent/30 flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_10px_rgba(139,92,246,0.2)] relative z-10">
              <Crown className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0 relative z-10">
              <p className="text-sm font-bold text-textPrimary truncate">
                {user?.name || 'Usuário Elite'}
              </p>
              <p className="text-[10px] font-black text-accent truncate uppercase tracking-widest">
                {user?.email === 'willrandrier@gmail.com' ? 'Administrador' : 'Membro Elite'}
              </p>
            </div>
          </div>

        </div>
      </aside>
    </>
  )
}
