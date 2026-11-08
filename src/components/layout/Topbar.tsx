import { Menu, Bell, Loader2, Search, Command, Crown } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, onSnapshot, writeBatch, doc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/store/authStore'
import { useContractStore } from '@/store/contractStore'
import { getTierForAmount } from '@/pages/Ranking'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

interface TopbarProps {
  title: string
  description?: string
  onMenuClick?: () => void
  onOpenCommandPalette?: () => void
}

export const Topbar = ({ title, description, onMenuClick, onOpenCommandPalette }: TopbarProps) => {
  const { user } = useAuthStore()
  const { contracts } = useContractStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const currentRankTier = useMemo(() => {
    const total = contracts
      .filter(c => c.status === 'Fechado')
      .reduce((acc, c) => acc + Number(c.amount || 0), 0)
    return getTierForAmount(total)
  }, [contracts])

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    const userIds = Array.from(new Set([user.uid, user.email].filter((id): id is string => Boolean(id && id.trim()))))
    if (userIds.length === 0) {
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', 'in', userIds)
    )

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const notifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        notifs.sort((a: any, b: any) => {
          const timeA = a.createdAt?.toMillis() || 0
          const timeB = b.createdAt?.toMillis() || 0
          return timeB - timeA
        })
        setNotifications(notifs)
        setLoading(false)
      },
      error => {
        console.error('Erro ao buscar notificações:', error)
        setLoading(false)
      }
    )

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
    <header className="h-16 bg-[#09090B]/85 backdrop-blur-xl border-b border-zinc-800/80 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white lg:hidden transition-colors shrink-0"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="flex items-baseline gap-3 min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight truncate">
            {title}
          </h1>
          {description && (
            <span className="text-xs text-zinc-500 hidden xl:inline truncate">
              {description}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {/* Command Palette Search Trigger */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2.5 h-9 px-3 rounded-lg bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title="Ir para ferramenta (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden md:inline text-xs font-medium pr-3">
              Buscar ferramenta...
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-950 border border-zinc-800 rounded">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative h-9 w-9 flex items-center justify-center bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 rounded-lg transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#09090B]" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-[340px] sm:w-[360px] bg-[#0E0E11] border border-zinc-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-40 overflow-hidden flex flex-col"
                >
                  <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="font-semibold text-xs text-white">Notificações</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-zinc-400 hover:text-white font-medium cursor-pointer"
                      >
                        Marcar como lidas
                      </button>
                    )}
                  </div>

                  <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <span className="text-zinc-500 text-xs">Nenhuma notificação no momento.</span>
                      </div>
                    ) : (
                      notifications.map(n => {
                        const timeStr = n.createdAt
                          ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true, locale: ptBR })
                          : 'agora mesmo'

                        return (
                          <div
                            key={n.id}
                            className={`p-3.5 border-b border-zinc-800/60 hover:bg-zinc-900/60 transition-colors ${
                              n.unread ? 'bg-zinc-900/30' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-xs font-semibold ${n.unread ? 'text-white' : 'text-zinc-300'}`}>
                                {n.title}
                              </h4>
                              <span className="text-[10px] text-zinc-500 font-mono shrink-0 ml-2">{timeStr}</span>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed">{n.text}</p>
                          </div>
                        )
                      })
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Rank Plaque Pill */}
        <Link
          to="/ranking"
          title="Ver Patentes e Ranking Global"
          className={`hidden md:flex items-center gap-1.5 h-9 px-2.5 rounded-lg border text-[11px] font-mono font-bold transition-colors ${currentRankTier.bgClass} ${currentRankTier.colorClass} ${currentRankTier.borderClass}`}
        >
          <span>{currentRankTier.icon}</span>
          <span>{currentRankTier.badgeText}</span>
        </Link>

        {/* User Profile Pill */}
        <Link
          to="/settings"
          title="Configurações da Agência"
          className="hidden sm:flex items-center gap-2 h-9 pl-2 pr-3 rounded-lg bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <div className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.name || 'User'} className="w-full h-full object-cover" />
            ) : (
              <Crown className="w-3 h-3 text-zinc-300" />
            )}
          </div>
          <span className="text-xs font-medium text-zinc-200 max-w-[100px] truncate">
            {user?.name?.split(' ')[0] || 'Conta'}
          </span>
        </Link>
      </div>
    </header>
  )
}
