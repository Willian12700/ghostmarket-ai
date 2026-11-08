import { useState, useEffect, useMemo } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/store/authStore'
import { useContractStore } from '@/store/contractStore'
import {
  Trophy,
  Medal,
  Loader2,
  ArrowUpRight,
  Sparkles,
  Flame
} from 'lucide-react'
import { motion } from 'framer-motion'

interface RankedUser {
  id: string
  name: string
  email: string
  photoURL: string
  monthlySales: number
  allTimeSales: number
  dealsCount: number
  isSuspended?: boolean
}

export interface RankTier {
  id: string
  name: string
  minAmount: number
  badgeText: string
  colorClass: string
  bgClass: string
  borderClass: string
  icon: string
}

export const RANK_TIERS: RankTier[] = [
  {
    id: 'starter',
    name: 'Starter Digital',
    minAmount: 0,
    badgeText: 'STARTER',
    colorClass: 'text-zinc-300',
    bgClass: 'bg-zinc-800/80',
    borderClass: 'border-zinc-700',
    icon: '🥉'
  },
  {
    id: 'closer',
    name: 'Closer Pro',
    minAmount: 1500,
    badgeText: 'CLOSER PRO',
    colorClass: 'text-sky-400',
    bgClass: 'bg-sky-500/10',
    borderClass: 'border-sky-500/30',
    icon: '🥈'
  },
  {
    id: 'elite',
    name: 'Agência Elite',
    minAmount: 5000,
    badgeText: 'AGÊNCIA ELITE',
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
    icon: '🥇'
  },
  {
    id: 'club10k',
    name: 'Placa 10K Club',
    minAmount: 10000,
    badgeText: '10K CLUB',
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/30',
    icon: '💎'
  },
  {
    id: 'legend50k',
    name: 'Lenda 50K',
    minAmount: 50000,
    badgeText: 'LENDA 50K',
    colorClass: 'text-purple-400',
    bgClass: 'bg-purple-500/15',
    borderClass: 'border-purple-500/40',
    icon: '👑'
  }
]

export function getTierForAmount(amount: number): RankTier {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (amount >= RANK_TIERS[i].minAmount) {
      return RANK_TIERS[i]
    }
  }
  return RANK_TIERS[0]
}

export function getNextTierForAmount(amount: number): RankTier | null {
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (amount < RANK_TIERS[i].minAmount) {
      return RANK_TIERS[i]
    }
  }
  return null
}

export const Ranking = () => {
  const { user } = useAuthStore()
  const { contracts } = useContractStore()
  const [users, setUsers] = useState<RankedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'monthly' | 'allTime'>('monthly')

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)
        const startOfMonthMs = startOfMonth.getTime()

        const usersSnap = await getDocs(collection(db, 'users'))
        const usersMap: Record<string, RankedUser> = {}

        usersSnap.forEach(docSnap => {
          const data = docSnap.data()
          const email = (data.email || '').toLowerCase()
          const uid = data.uid || ''
          const userObj: RankedUser = {
            id: docSnap.id,
            name: data.name || email.split('@')[0] || 'Membro Ghost',
            email: data.email || '',
            photoURL: data.photoURL || '',
            monthlySales: 0,
            allTimeSales: 0,
            dealsCount: 0,
            isSuspended: data.isSuspended === true
          }

          if (email) usersMap[email] = userObj
          if (uid) usersMap[uid] = userObj
          usersMap[docSnap.id] = userObj
        })

        const parseDateMs = (dVal: any, fallbackMs = Date.now()) => {
          if (!dVal) return fallbackMs
          if (typeof dVal.toMillis === 'function') return dVal.toMillis()
          if (typeof dVal === 'string') {
            if (dVal.includes('/')) {
              const parts = dVal.split('/')
              if (parts.length === 3) {
                return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime()
              }
            }
            if (dVal.includes('-')) {
              const parts = dVal.split('-')
              if (parts.length === 3) {
                return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime()
              }
            }
            const parsed = new Date(dVal).getTime()
            if (!isNaN(parsed)) return parsed
          }
          return fallbackMs
        }

        const txsSnap = await getDocs(collection(db, 'transactions'))
        txsSnap.forEach(docSnap => {
          const t = docSnap.data()
          const status = (t.status || '').toLowerCase().trim()
          if (status === 'aprovado' || status === 'paid' || status === 'approved' || status === 'fechado') {
            const timestampMs = parseDateMs(t.timestamp || t.date_created || t.date || t.createdAt)
            const uKey = (t.userId || '').toLowerCase()
            const val = Number(t.transaction_amount || t.amount || 0)
            if (uKey && usersMap[uKey] && val > 0) {
              usersMap[uKey].allTimeSales += val
              usersMap[uKey].dealsCount += 1
              if (timestampMs >= startOfMonthMs) {
                usersMap[uKey].monthlySales += val
              }
            }
          }
        })

        const crmSnap = await getDocs(collection(db, 'crm_contracts'))
        crmSnap.forEach(docSnap => {
          const c = docSnap.data()
          const status = (c.status || '').toLowerCase().trim()
          if (status === 'fechado' || status === 'aprovado') {
            const rawMs = parseDateMs(c.date || c.createdAt)
            const uKey = (c.userId || '').toLowerCase()
            const val = Number(c.amount || 0)
            if (uKey && usersMap[uKey] && val > 0) {
              usersMap[uKey].allTimeSales += val
              usersMap[uKey].dealsCount += 1
              if (rawMs >= startOfMonthMs) {
                usersMap[uKey].monthlySales += val
              }
            }
          }
        })

        const uniqueUsers = Array.from(new Set(Object.values(usersMap))).filter(u => !u.isSuspended)
        setUsers(uniqueUsers)
      } catch (error) {
        console.error('Erro ao buscar ranking:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRanking()
  }, [])

  const sortedUsers = useMemo(() => {
    const list = [...users]
    list.sort((a, b) => {
      const valA = period === 'monthly' ? a.monthlySales : a.allTimeSales
      const valB = period === 'monthly' ? b.monthlySales : b.allTimeSales
      if (valB !== valA) return valB - valA
      return a.name.localeCompare(b.name)
    })
    return list.slice(0, 15)
  }, [users, period])

  const myStats = useMemo(() => {
    const localClosedTotal = contracts
      .filter(c => c.status === 'Fechado')
      .reduce((acc, c) => acc + Number(c.amount || 0), 0)

    const matchedUser = users.find(
      u =>
        (user?.email && u.email.toLowerCase() === user.email.toLowerCase()) ||
        (user?.uid && u.id === user.uid)
    )

    const totalRevenue = Math.max(matchedUser?.allTimeSales || 0, localClosedTotal)
    const currentTier = getTierForAmount(totalRevenue)
    const nextTier = getNextTierForAmount(totalRevenue)
    const remaining = nextTier ? Math.max(0, nextTier.minAmount - totalRevenue) : 0
    const progressPct = nextTier
      ? Math.min(100, Math.round((totalRevenue / nextTier.minAmount) * 100))
      : 100

    return { totalRevenue, currentTier, nextTier, remaining, progressPct }
  }, [users, user, contracts])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-amber-400" />
    if (index === 1) return <Medal className="w-5 h-5 text-zinc-300" />
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />
    return <span className="text-xs font-mono font-bold text-zinc-500">#{index + 1}</span>
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header & Period Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono uppercase tracking-wider mb-2">
            <Trophy className="w-3 h-3" />
            <span>Hall da Fama & Premiações</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Ranking Global & Patentes
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Feche contratos no CRM Kanban para subir de patente e desbloquear as placas oficiais da comunidade.
          </p>
        </div>

        <div className="flex items-center bg-[#0E0E11] p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setPeriod('monthly')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              period === 'monthly'
                ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            🔥 Top do Mês
          </button>
          <button
            type="button"
            onClick={() => setPeriod('allTime')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              period === 'allTime'
                ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            👑 Histórico Geral
          </button>
        </div>
      </div>

      {/* User Personal Plaque & Progress Banner */}
      <div className="bg-[#0E0E11] border border-zinc-800/90 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          <div className="lg:col-span-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-3xl shrink-0 shadow-lg">
              {myStats.currentTier.icon}
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Sua Patente Atual
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <h3 className="text-xl font-bold text-white">{myStats.currentTier.name}</h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${myStats.currentTier.bgClass} ${myStats.currentTier.colorClass} ${myStats.currentTier.borderClass}`}
                >
                  {myStats.currentTier.badgeText}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Faturamento acumulado registrado:{' '}
                <strong className="text-emerald-400">{formatCurrency(myStats.totalRevenue)}</strong>
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                {myStats.nextTier
                  ? `Próxima Conquista: ${myStats.nextTier.icon} ${myStats.nextTier.name}`
                  : 'Você atingiu a Patente Máxima da Comunidade!'}
              </span>
              <span className="font-mono font-bold text-emerald-400">{myStats.progressPct}%</span>
            </div>

            <div className="w-full h-3 bg-[#09090B] border border-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                style={{ width: `${myStats.progressPct}%` }}
              />
            </div>

            {myStats.nextTier && (
              <p className="text-[11px] text-zinc-400">
                Faltam <strong className="text-white">{formatCurrency(myStats.remaining)}</strong> em vendas fechadas no CRM para desbloquear a placa{' '}
                <strong className={myStats.nextTier.colorClass}>{myStats.nextTier.name}</strong>.
              </p>
            )}
          </div>
        </div>

        {/* All 5Plaques Showcase Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-6 pt-5 border-t border-zinc-800/80">
          {RANK_TIERS.map(t => {
            const unlocked = myStats.totalRevenue >= t.minAmount
            return (
              <div
                key={t.id}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  unlocked
                    ? 'bg-[#09090B] border-emerald-500/30 text-white'
                    : 'bg-[#09090B]/50 border-zinc-800/60 text-zinc-500 opacity-60'
                }`}
              >
                <span className="text-xl">{t.icon}</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{t.name}</div>
                  <div className="text-[10px] font-mono text-zinc-400">
                    {t.minAmount === 0 ? 'Início' : `R$ ${(t.minAmount / 1000).toFixed(1).replace('.0', '')}k+`}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="bg-[#0E0E11] border border-zinc-800/90 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {period === 'monthly'
                ? 'Top Performers do Mês Atual'
                : 'Líderes Históricos de Faturamento'}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">Atualizado em Tempo Real</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 text-sm">
            Nenhum dado encontrado para gerar o ranking.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/70">
            {sortedUsers.map((u, i) => {
              const amount = period === 'monthly' ? u.monthlySales : u.allTimeSales
              const tier = getTierForAmount(u.allTimeSales || amount)

              return (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  key={u.id}
                  className={`flex items-center justify-between p-4 sm:px-6 transition-colors hover:bg-zinc-900/50 ${
                    i === 0 ? 'bg-amber-500/[0.04]' : i < 3 ? 'bg-zinc-900/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex items-center justify-center w-8 shrink-0">
                      {getRankIcon(i)}
                    </div>

                    <div className="relative shrink-0">
                      {u.photoURL ? (
                        <img
                          src={u.photoURL}
                          alt={u.name}
                          className="w-11 h-11 rounded-full object-cover border border-zinc-700"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-zinc-900 text-emerald-400 flex items-center justify-center font-bold text-base border border-zinc-800">
                          {u.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      {i === 0 && (
                        <span className="absolute -top-2 -right-1 text-base" title="Top 1">
                          👑
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`font-bold text-sm sm:text-base truncate ${
                            i === 0 ? 'text-amber-300' : 'text-white'
                          }`}
                        >
                          {u.name}
                        </h4>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${tier.bgClass} ${tier.colorClass} ${tier.borderClass}`}
                        >
                          <span>{tier.icon}</span>
                          <span>{tier.badgeText}</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {i < 3 ? `Top #${i + 1} Destaque da Comunidade` : `Membro Verificado`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm sm:text-base font-bold text-emerald-400 flex items-center justify-end gap-1 tabular-nums">
                      {amount > 0 && <ArrowUpRight className="w-4 h-4" />}
                      {formatCurrency(amount)}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      {period === 'monthly' ? 'Faturamento no Mês' : 'Faturamento Acumulado'}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
