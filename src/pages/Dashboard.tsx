import { useState, useMemo, useEffect } from 'react'
import { DollarSign, ShoppingCart, TrendingUp, Calendar, Zap, ArrowUpRight, Activity, ArrowDownRight, Target } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

import { useDigitalizaStore } from '@/store/digitalizaStore'
import { useAuthStore } from '@/store/authStore'
import { db } from '@/config/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

export const Dashboard = () => {
  const { contracts, syncContracts, fetchWorkspaces, activeWorkspace } = useDigitalizaStore()
  const { user } = useAuthStore()
  const [dateFilter, setDateFilter] = useState<'hoje' | 'semana' | 'mes' | 'ano'>('semana')
  const [firebaseTransactions, setFirebaseTransactions] = useState<any[]>([])

  useEffect(() => {
    if (!user?.email && !user?.uid) return
    
    // Sync SaaS transactions
    const userIdsToQuery = user?.email && user?.uid && user.email !== user.uid 
      ? [user.uid, user.email] 
      : [user?.uid || user?.email || '']

    const q = query(
      collection(db, 'transactions'),
      where('userId', 'in', userIdsToQuery)
    )
    const unsubscribeTxs = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setFirebaseTransactions(txs)
    })
    
    // Fetch Workspaces
    const unsubscribeWorkspaces = fetchWorkspaces(user?.uid || '')
    
    return () => {
      unsubscribeTxs()
      unsubscribeWorkspaces()
    }
  }, [user])

  useEffect(() => {
    if (activeWorkspace) {
      return syncContracts()
    } else if (user?.email) {
      return syncContracts(user.email)
    }
  }, [activeWorkspace, syncContracts, user])

  // Combine CRM Contacts and Firebase Transactions that are PAID
  const allPaidTransactions = useMemo(() => {
    const closedContracts = contracts
      .filter(c => (c.status || '').toLowerCase() === 'fechado' || (c.status || '').toLowerCase() === 'aprovado')
      .map(c => {
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
        }
        
        if (isNaN(rawMs)) {
          rawMs = Date.now()
        }
        return {
          id: c.id,
          amount: Number(c.amount || 0),
          date: rawMs,
          clientName: c.client,
          source: 'CRM'
        }
      })

    const saasTxs = firebaseTransactions
      .filter(t => {
        const s = (t.status || '').toLowerCase().trim()
        return s === 'aprovado' || s === 'paid' || s === 'approved' || s === 'fechado'
      })
      .map(t => {
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
        }

        if (isNaN(timestampMs)) {
          timestampMs = Date.now()
        }

        return {
          id: t.id,
          amount: Number(t.transaction_amount || t.amount || 0),
          date: timestampMs,
          clientName: t.customer?.name || t.clientName || t.buyerName || 'Cliente Online',
          source: 'SaaS'
        }
      })

    return [...closedContracts, ...saasTxs].sort((a, b) => b.date - a.date)
  }, [contracts, firebaseTransactions])

  const calculateMetrics = () => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    
    // Últimos 7 dias (Acumulado)
    const startOfWeekTime = startOfToday - (6 * 24 * 60 * 60 * 1000);
    
    // Últimos 30 dias (Performance Mensal)
    const startOfMonthTime = startOfToday - (29 * 24 * 60 * 60 * 1000);
    
    // Este ano
    const startOfYearTime = new Date(now.getFullYear(), 0, 1).getTime()

    let hoje = 0, semana = 0, mes = 0, ano = 0
    let ontem = 0, semanaPassada = 0, mesPassado = 0, anoPassado = 0

    allPaidTransactions.forEach(tx => {
      // Atual
      if (tx.date >= startOfToday) hoje += tx.amount
      if (tx.date >= startOfWeekTime) semana += tx.amount
      if (tx.date >= startOfMonthTime) mes += tx.amount
      if (tx.date >= startOfYearTime) ano += tx.amount
      
      // Anterior (simplificado para tendencias)
      if (tx.date >= startOfToday - (24 * 60 * 60 * 1000) && tx.date < startOfToday) ontem += tx.amount
      if (tx.date >= startOfWeekTime - (7 * 24 * 60 * 60 * 1000) && tx.date < startOfWeekTime) semanaPassada += tx.amount
      if (tx.date >= startOfMonthTime - (30 * 24 * 60 * 60 * 1000) && tx.date < startOfMonthTime) mesPassado += tx.amount
      if (tx.date >= startOfYearTime - (365 * 24 * 60 * 60 * 1000) && tx.date < startOfYearTime) anoPassado += tx.amount
    })

    return { 
      hoje, semana, mes, ano,
      tendenciaHoje: ontem ? ((hoje - ontem) / ontem) * 100 : 100,
      tendenciaSemana: semanaPassada ? ((semana - semanaPassada) / semanaPassada) * 100 : 100,
      tendenciaMes: mesPassado ? ((mes - mesPassado) / mesPassado) * 100 : 100,
      tendenciaAno: anoPassado ? ((ano - anoPassado) / anoPassado) * 100 : 100,
    }
  }

  const [monthlyGoal, setMonthlyGoal] = useState<number>(() => {
    const saved = localStorage.getItem('ghost_monthly_goal')
    return saved ? Number(saved) : 50000
  })

  const { hoje, semana, mes, ano, tendenciaHoje, tendenciaSemana, tendenciaMes, tendenciaAno } = calculateMetrics()

  // Chart Data Generator
  const salesData = useMemo(() => {
    const now = new Date()
    const data = []
    
    let daysToSubtract = dateFilter === 'hoje' ? 1 : dateFilter === 'semana' ? 7 : dateFilter === 'mes' ? 30 : 365
    
    for (let i = daysToSubtract - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1
      
      const dayTotal = allPaidTransactions
        .filter(tx => tx.date >= startOfDay && tx.date <= endOfDay)
        .reduce((sum, tx) => sum + tx.amount, 0)
        
      data.push({
        day: dateFilter === 'ano' 
          ? d.toLocaleDateString('pt-BR', { month: 'short' }) 
          : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        revenue: dayTotal
      })
    }

    // Se for ano, agrupa por ms
    if (dateFilter === 'ano') {
      const monthlyData = data.reduce((acc, curr) => {
        const month = curr.day
        if (!acc[month]) acc[month] = 0
        acc[month] += curr.revenue
        return acc
      }, {} as Record<string, number>)
      
      return Object.entries(monthlyData).map(([day, revenue]) => ({ day, revenue }))
    }
    
    return data
  }, [dateFilter, allPaidTransactions])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24, duration: 0.4 } }
  }

  const MetricCard = ({ title, value, trend, icon: Icon, description }: any) => {
    const isPositive = trend >= 0;
    return (
      <motion.div variants={itemVariants} className="bg-surface/40 backdrop-blur-md border-border border rounded-2xl p-6 relative overflow-hidden group hover:border-accent/40 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(139,92,246,0.12)] hover:-translate-y-1">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none transition-transform duration-500 group-hover:scale-150 group-hover:bg-accent/10" />
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xs font-bold text-textSecondary uppercase tracking-widest">{title}</h3>
          <div className="p-2 rounded-xl bg-surface-elevated border border-border group-hover:border-accent/30 transition-colors">
            <Icon className="w-4 h-4 text-accent" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-textPrimary tracking-tight mb-2">{formatCurrency(value)}</div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md ${isPositive ? 'text-success bg-success/10' : 'text-error bg-error/10'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
          <p className="text-xs text-textMuted font-medium">{description}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-[1400px] w-full mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <Zap className="w-3 h-3 fill-accent" /> Modo Elite Ativado
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-textPrimary tracking-tight">
            Olá, {user?.name?.split(' ')[0] || 'Usuário'}.
          </h1>
          <p className="text-textSecondary mt-2 text-lg font-medium">Visão estratégica do seu império digital.</p>
        </div>


      </motion.div>

      {/* GHOST GOAL AUTO-TRACKING */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
        className="bg-surface-elevated/80 backdrop-blur-xl border border-border rounded-2xl p-6 relative overflow-hidden mb-8 group hover:-translate-y-1 hover:border-accent/30 transition-all duration-300 shadow-sm"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-70" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="w-full md:w-auto">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Target className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg font-extrabold text-textPrimary tracking-tight">Objetivo Mensal</h3>
            </div>
            <div className="flex items-center gap-3 bg-surface/50 p-1.5 rounded-lg border border-border/50 focus-within:border-accent/50 transition-colors w-full md:w-48">
              <span className="text-textMuted font-bold pl-2">R$</span>
              <input 
                type="number" 
                className="bg-transparent text-textPrimary font-bold w-full focus:outline-none"
                value={monthlyGoal}
                onChange={(e) => {
                  setMonthlyGoal(Number(e.target.value))
                  localStorage.setItem('ghost_monthly_goal', e.target.value)
                }}
              />
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-1">Progresso Atual</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-textPrimary tracking-tight">{formatCurrency(mes)}</span>
                  <span className="text-sm font-bold text-textMuted">/ {formatCurrency(monthlyGoal)}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-accent">{Math.min(100, (mes / (monthlyGoal || 1)) * 100).toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="w-full bg-surface rounded-full h-4 border border-border overflow-hidden p-0.5">
              <div 
                className="bg-gradient-to-r from-accent/80 to-accent h-full rounded-full transition-all duration-1000 ease-out relative shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                style={{ width: `${Math.min(100, (mes / (monthlyGoal || 1)) * 100)}%` }}
              >
                <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-border/50 flex flex-col sm:flex-row gap-4 items-center justify-between relative z-10">
          <div className="text-sm font-medium">
            {mes >= monthlyGoal ? (
              <span className="text-success flex items-center gap-2 bg-success/10 px-3 py-1.5 rounded-lg border border-success/20">
                <TrendingUp className="w-4 h-4" /> Meta superada em {formatCurrency(mes - monthlyGoal)}!
              </span>
            ) : (
              <span className="text-textSecondary">
                Faltam <span className="text-textPrimary font-bold">{formatCurrency(monthlyGoal - mes)}</span> para atingir a meta do mês.
              </span>
            )}
          </div>
          {mes < monthlyGoal && (
            <div className="bg-accent/10 border border-accent/20 text-accent px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.1)] hover:bg-accent/20 transition-colors cursor-default">
              <Activity className="w-4 h-4" /> Insight: Aumente as campanhas de remarketing.
            </div>
          )}
        </div>
      </motion.div>

      {/* BOTTOM SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3, duration: 0.4 }}
        className="grid gap-6 grid-cols-1 lg:grid-cols-12"
      >
        {/* TOP METRICS GRID (4 CARDS) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4 lg:col-span-3"
        >
          <MetricCard title="Hoje" value={hoje} trend={tendenciaHoje} icon={Calendar} description="vs. ontem" />
          <MetricCard title="Esta Semana" value={semana} trend={tendenciaSemana} icon={TrendingUp} description="vs. sem. passada" />
          <MetricCard title="Este Mês" value={mes} trend={tendenciaMes} icon={ShoppingCart} description="vs. mês passado" />
          <MetricCard title="Este Ano" value={ano} trend={tendenciaAno} icon={DollarSign} description="vs. ano passado" />
        </motion.div>

        {/* CHART BLOCK */}
        <div className="lg:col-span-6 bg-surface-elevated/60 backdrop-blur-xl border border-border rounded-2xl p-6 lg:p-8 relative overflow-hidden group flex flex-col min-h-[400px] hover:border-accent/30 transition-all duration-300">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 relative z-10 shrink-0">
            <div>
              <h3 className="text-xl font-extrabold text-textPrimary tracking-tight mb-1">Crescimento de Receita</h3>
              <p className="text-sm text-textSecondary font-medium">Análise de escalabilidade temporal</p>
            </div>
            
            <div className="flex items-center p-1 bg-surface/80 border border-border rounded-lg mt-4 sm:mt-0 backdrop-blur-sm">
              <button 
                onClick={() => setDateFilter('semana')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${dateFilter === 'semana' ? 'bg-accent text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]' : 'text-textSecondary hover:text-textPrimary hover:bg-surface-elevated'}`}
              >
                7 Dias
              </button>
              <button 
                onClick={() => setDateFilter('mes')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200 whitespace-nowrap ${dateFilter === 'mes' ? 'bg-accent text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]' : 'text-textSecondary hover:text-textPrimary hover:bg-surface-elevated'}`}
              >
                30 Dias
              </button>
              <button 
                onClick={() => setDateFilter('ano')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200 whitespace-nowrap ${dateFilter === 'ano' ? 'bg-accent text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]' : 'text-textSecondary hover:text-textPrimary hover:bg-surface-elevated'}`}
              >
                12 Meses
              </button>
            </div>
          </div>
          
          <div className="flex-1 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenueGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                  dataKey="day" 
                  stroke="#71717A" 
                  fontSize={12}
                  fontWeight={500}
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#71717A" 
                  fontSize={12}
                  fontWeight={500}
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `R$ ${value}`}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ stroke: 'rgba(139,92,246,0.2)', strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(10,10,13,0.95)', 
                    backdropFilter: 'blur(12px)',
                    borderColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(139,92,246,0.15)',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ color: '#fff', fontWeight: '800', fontSize: '16px' }}
                  labelStyle={{ color: '#A1A1AA', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}
                  formatter={(value: any) => [formatCurrency(value as number), 'Receita']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--accent)" 
                  strokeWidth={3}
                  activeDot={{ r: 6, fill: "var(--accent)", stroke: "#fff", strokeWidth: 2, style: { filter: 'drop-shadow(0px 0px 8px var(--accent))' } }}
                  fillOpacity={1} 
                  fill="url(#colorRevenueGlow)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT TRANSACTIONS BLOCK */}
        <div className="lg:col-span-3 bg-surface-elevated/60 backdrop-blur-xl border border-border rounded-2xl p-6 flex flex-col relative overflow-hidden group hover:border-accent/30 transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-extrabold text-textPrimary tracking-tight">Atividade Recente</h3>
            <div className="bg-success/10 text-success text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-success/20">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_8px_#10B981]"></span>
              Live
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto pr-2 flex-1 custom-scrollbar">
            {allPaidTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center h-full opacity-70">
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mb-3 border border-border">
                  <Activity className="w-6 h-6 text-textMuted" />
                </div>
                <p className="text-textSecondary text-sm font-medium">Nenhuma atividade recente.</p>
              </div>
            ) : (
              allPaidTransactions.slice(0, 8).map((tx, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, ease: "easeOut" }}
                  key={tx.id} 
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface/50 border border-border/50 hover:border-accent/40 hover:bg-surface transition-all duration-200 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-success/10 border border-success/20 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-success/20 transition-all duration-300">
                    <DollarSign className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-textPrimary truncate">{tx.clientName}</p>
                    <p className="text-[10px] text-textSecondary mt-0.5 font-bold uppercase tracking-wider">{tx.source}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold text-success">+{formatCurrency(tx.amount)}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
