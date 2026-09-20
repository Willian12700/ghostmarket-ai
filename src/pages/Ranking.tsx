import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Trophy, Medal, Award, Loader2, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface RankedUser {
  id: string
  name: string
  email: string
  photoURL: string
  totalSales: number
}

export const Ranking = () => {
  const [users, setUsers] = useState<RankedUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)
        const startOfMonthMs = startOfMonth.getTime()

        // 1. Fetch Users
        const usersSnap = await getDocs(collection(db, 'users'))
        const usersMap: Record<string, RankedUser> = {}
        
        usersSnap.forEach(doc => {
          const data = doc.data()
          const email = (data.email || '').toLowerCase()
          const uid = data.uid || ''
          const userObj = {
            id: doc.id,
            name: data.name || email.split('@')[0] || 'Usuário Anônimo',
            email: data.email || '',
            photoURL: data.photoURL || '',
            totalSales: 0
          }
          
          if (email) usersMap[email] = userObj
          if (uid) usersMap[uid] = userObj
          usersMap[doc.id] = userObj
        })

        // 2. Fetch SaaS Transactions
        const txsSnap = await getDocs(collection(db, 'transactions'))
        txsSnap.forEach(doc => {
          const t = doc.data()
          const status = (t.status || '').toLowerCase().trim()
          if (status === 'aprovado' || status === 'paid' || status === 'approved' || status === 'fechado') {
            
            let timestampMs = Date.now()
            if (t.timestamp && typeof t.timestamp.toMillis === 'function') {
              timestampMs = t.timestamp.toMillis()
            } else if (t.date_created) {
              timestampMs = new Date(t.date_created).getTime()
            } else if (t.date) {
              if (typeof t.date === 'string' && t.date.includes('/')) {
                const parts = t.date.split('/')
                if (parts.length === 3) {
                  timestampMs = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime()
                }
              } else if (typeof t.date === 'string' && t.date.includes('-')) {
                 const parts = t.date.split('-')
                 if (parts.length === 3) {
                   timestampMs = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime()
                 }
              } else {
                 timestampMs = new Date(t.date).getTime()
              }
            } else if (t.createdAt?.toMillis) {
              timestampMs = t.createdAt.toMillis()
            }

            if (timestampMs >= startOfMonthMs) {
              const uKey = (t.userId || '').toLowerCase()
              if (uKey && usersMap[uKey]) {
                usersMap[uKey].totalSales += Number(t.transaction_amount || t.amount || 0)
              }
            }
          }
        })

        // 3. Fetch CRM Contracts
        const crmSnap = await getDocs(collection(db, 'crm_contracts'))
        crmSnap.forEach(doc => {
          const c = doc.data()
          const status = (c.status || '').toLowerCase().trim()
          if (status === 'fechado' || status === 'aprovado') {
            
            let rawMs = Date.now()
            if (c.date) {
              if (c.date.includes('/')) {
                const parts = c.date.split('/')
                if (parts.length === 3) {
                  rawMs = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime()
                }
              } else if (c.date.includes('-')) {
                const parts = c.date.split('-')
                if (parts.length === 3) {
                  rawMs = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime()
                }
              } else {
                rawMs = new Date(c.date).getTime()
              }
            } else if (c.createdAt?.toMillis) {
              rawMs = c.createdAt.toMillis()
            }
            
            if (rawMs >= startOfMonthMs) {
              const uKey = (c.userId || '').toLowerCase()
              if (uKey && usersMap[uKey]) {
                usersMap[uKey].totalSales += Number(c.amount || 0)
              }
            }
          }
        })

        // Filter out duplicate user objects that were added by both email and uid keys.
        // We can just take the unique user objects from the map values.
        const uniqueUsers = Array.from(new Set(Object.values(usersMap)))
        
        // 4. Convert and Sort
        let userList = uniqueUsers
        userList.sort((a, b) => {
          if (b.totalSales !== a.totalSales) {
            return b.totalSales - a.totalSales // descending sales
          }
          // if tied (e.g. 0 sales), sort by name ascending
          return a.name.localeCompare(b.name)
        })

        // Get Top 10
        userList = userList.slice(0, 10)
        setUsers(userList)
      } catch (error) {
        console.error("Erro ao buscar ranking:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRanking()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-400" />
    if (index === 1) return <Medal className="w-6 h-6 text-gray-300" />
    if (index === 2) return <Medal className="w-6 h-6 text-amber-700" />
    return <Award className="w-5 h-5 text-textSecondary/50" />
  }

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          Ranking Global
        </h2>
        <p className="text-textSecondary mt-2">
          Top 10 usuários com maior faturamento este mês. O ranking é atualizado em tempo real.
        </p>
      </div>

      <Card className="border-border shadow-[0_0_20px_rgba(139,92,246,0.1)] bg-panel">
        <CardHeader className="border-b border-border bg-background/30">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            Top Performers do Mês
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 text-textSecondary">
              Nenhum dado encontrado para gerar o ranking.
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {users.map((u, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={u.id} 
                  className={`flex items-center justify-between p-4 sm:p-6 transition-colors hover:bg-white/5 \${i < 3 ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 font-bold text-lg">
                      {getRankIcon(i)}
                    </div>
                    
                    <div className="relative">
                      {u.photoURL ? (
                        <img src={u.photoURL} alt={u.name} className="w-12 h-12 rounded-full object-cover border-2 border-border" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl border-2 border-border">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {i === 0 && (
                        <span className="absolute -top-2 -right-2 text-xl">👑</span>
                      )}
                    </div>

                    <div>
                      <h3 className={`font-bold text-base sm:text-lg \${i === 0 ? 'text-yellow-400' : 'text-textPrimary'}`}>
                        {u.name}
                      </h3>
                      {i < 3 && <span className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wider">Top {i+1} Empreendedor</span>}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm sm:text-base font-extrabold text-success flex items-center justify-end gap-1">
                      {u.totalSales > 0 && <ArrowUpRight className="w-4 h-4" />}
                      {formatCurrency(u.totalSales)}
                    </p>
                    <p className="text-xs text-textSecondary font-medium">Faturamento no Mês</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
