import { Menu, Bell, Loader2, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, writeBatch, doc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/store/authStore'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TopbarProps {
  title: string
  description?: string
  onMenuClick?: () => void
}

export const Topbar = ({ title, description, onMenuClick }: TopbarProps) => {
  const { user } = useAuthStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', 'in', [user.uid, user.email])
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      notifs.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis() || 0
        const timeB = b.createdAt?.toMillis() || 0
        return timeB - timeA
      })
      setNotifications(notifs)
      setLoading(false)
    }, (error) => {
      console.error("Erro", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const unreadCount = notifications.filter(n => n.unread).length

  const markAllAsRead = async () => {
    if (unreadCount === 0) return
    const batch = writeBatch(db)
    notifications.forEach(n => {
      if (n.unread) {
        batch.update(doc(db, 'notifications', n.id), { unread: false })
      }
    })
    await batch.commit()
  }

  return (
    <header className="h-20 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-5">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg bg-surface border border-border text-textSecondary hover:text-textPrimary hover:border-borderHover lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-textPrimary tracking-tight flex items-center gap-2">
            {title}
          </h1>
          {description && <p className="text-sm text-textSecondary hidden sm:block font-medium mt-0.5">{description}</p>}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 shadow-[0_0_15px_var(--success)] shadow-success/10">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[11px] font-bold tracking-wider uppercase text-success">Sistema online</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 bg-surface border border-border text-textSecondary hover:text-textPrimary hover:border-borderHover rounded-xl transition-all duration-300"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full animate-pulse border-2 border-background shadow-[0_0_10px_var(--error)] shadow-error/50"></span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-3 w-80 bg-surface-elevated border border-border rounded-2xl shadow-2xl shadow-black/50 z-40 overflow-hidden flex flex-col animate-slide-up">
                <div className="p-4 border-b border-border bg-background/50 flex justify-between items-center backdrop-blur-md">
                  <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    Notificações
                  </h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-accent font-medium cursor-pointer hover:underline">
                      Marcar como lidas
                    </button>
                  )}
                </div>
                
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center border border-border">
                        <Bell className="w-5 h-5 text-textMuted" />
                      </div>
                      <span className="text-textSecondary text-sm font-medium">Nenhuma notificação no momento.</span>
                    </div>
                  ) : (
                    notifications.map(n => {
                      const timeStr = n.createdAt 
                        ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true, locale: ptBR })
                        : 'agora mesmo'
                        
                      return (
                        <div key={n.id} className={`p-4 border-b border-border/50 hover:bg-surface cursor-pointer transition-colors ${n.unread ? 'bg-accent/5 relative overflow-hidden' : ''}`}>
                          {n.unread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />}
                          <div className="flex justify-between items-start mb-1.5 pl-1">
                            <h4 className={`text-sm font-semibold ${n.unread ? 'text-textPrimary' : 'text-textSecondary'}`}>{n.title}</h4>
                            <span className="text-[10px] text-textMuted uppercase font-semibold tracking-wider shrink-0 ml-2">{timeStr}</span>
                          </div>
                          <p className="text-xs text-textSecondary pl-1">{n.text}</p>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
