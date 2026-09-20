import { Menu, Bell, Loader2 } from 'lucide-react'
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
    if (!user?.email) {
      setLoading(false)
      return
    }

    // Usando onSnapshot para real-time. Sem orderBy para evitar precisar de index composto na Firebase. 
    // Ordenamos no front-end.
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.email)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      // Ordena por data (mais recentes primeiro)
      notifs.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis() || 0
        const timeB = b.createdAt?.toMillis() || 0
        return timeB - timeA
      })
      setNotifications(notifs)
      setLoading(false)
    }, (error) => {
      console.error("Erro ao buscar notificações:", error)
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
    <header className="h-20 bg-background/60 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="text-textSecondary hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">{title}</h1>
          {description && <p className="text-sm text-textSecondary hidden sm:block font-medium mt-0.5">{description}</p>}
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
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-error rounded-full animate-pulse border border-background"></span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-2xl z-40 overflow-hidden flex flex-col">
                <div className="p-3 border-b border-border bg-background/50 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-textPrimary">Notificações</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-primary cursor-pointer hover:underline">
                      Marcar como lidas
                    </button>
                  )}
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center text-textSecondary text-sm">
                      Nenhuma notificação no momento.
                    </div>
                  ) : (
                    notifications.map(n => {
                      const timeStr = n.createdAt 
                        ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true, locale: ptBR })
                        : 'agora mesmo'
                        
                      return (
                        <div key={n.id} className={`p-4 border-b border-border/50 hover:bg-white/5 cursor-pointer transition-colors ${n.unread ? 'bg-primary/5' : ''}`}>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm font-semibold ${n.unread ? 'text-primary' : 'text-textPrimary'}`}>{n.title}</h4>
                            <span className="text-[10px] text-textSecondary">{timeStr}</span>
                          </div>
                          <p className="text-xs text-textSecondary">{n.text}</p>
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
