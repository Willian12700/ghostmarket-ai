
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Wand2, Search, FileText, Settings, LogOut, X, Code, User, BookMarked, Sparkles } from 'lucide-react'
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Painel' },
    { to: '/creator', icon: Wand2, label: 'Creator IA' },
    { to: '/library', icon: BookMarked, label: 'Biblioteca IA' },
    { to: '/prompt-builder', icon: Code, label: 'Prompt Builder (Sites)' },
    { to: '/scanner', icon: Search, label: 'Scanner de Leads' },
    { to: '/contracts', icon: FileText, label: 'CRM (Kanban)' },
    { to: '/settings', icon: User, label: 'Meu Perfil' },
    { to: '/integrations', icon: Settings, label: 'Integrações' },
  ]

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
        "fixed top-0 left-0 z-50 h-screen w-64 bg-panel border-r border-border flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-3">
            {theme.logoUrl ? (
              <img src={theme.logoUrl} alt={theme.agencyName} className="w-8 h-8 rounded object-cover" />
            ) : (
              <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
            )}
            <span className="font-bold text-lg text-white tracking-tight truncate w-32">{theme.agencyName}</span>
          </div>
          <button onClick={onClose} className="md:hidden text-textSecondary hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-textSecondary hover:bg-panelHover hover:text-textPrimary"
                )
              }
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
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
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-textSecondary hover:bg-panelHover hover:text-error transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
