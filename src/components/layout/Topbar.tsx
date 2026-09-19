
import { Menu, Bell } from 'lucide-react'
import { useState } from 'react'

interface TopbarProps {
  title: string
  description?: string
  onMenuClick?: () => void
}

export const Topbar = ({ title, description, onMenuClick }: TopbarProps) => {
  const [showNotifications, setShowNotifications] = useState(false)
  const notifications = [
    { id: 1, title: 'Nova Venda!', text: 'Alguém comprou seu SaaS.', time: 'agora mesmo', unread: true },
    { id: 2, title: 'Copiloto Atualizado', text: 'A IA está mais rápida.', time: 'há 2 horas', unread: true },
    { id: 3, title: 'Bem-vindo', text: 'Sua assinatura está ativa.', time: 'há 1 dia', unread: false },
  ]

  return (
    <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden text-textSecondary hover:text-textPrimary transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          {description && <p className="text-sm text-textSecondary hidden sm:block">{description}</p>}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-success">Sistema online</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-textSecondary hover:text-textPrimary hover:bg-white/5 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-error rounded-full animate-pulse border border-background"></span>
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-2xl z-40 overflow-hidden flex flex-col">
                <div className="p-3 border-b border-border bg-background/50 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-textPrimary">Notificações</h3>
                  <span className="text-xs text-primary cursor-pointer hover:underline">Marcar como lidas</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-4 border-b border-border/50 hover:bg-white/5 cursor-pointer transition-colors ${n.unread ? 'bg-primary/5' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-semibold ${n.unread ? 'text-primary' : 'text-textPrimary'}`}>{n.title}</h4>
                        <span className="text-[10px] text-textSecondary">{n.time}</span>
                      </div>
                      <p className="text-xs text-textSecondary">{n.text}</p>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center border-t border-border bg-background/50">
                  <span className="text-xs text-textSecondary hover:text-textPrimary cursor-pointer">Ver todas</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
