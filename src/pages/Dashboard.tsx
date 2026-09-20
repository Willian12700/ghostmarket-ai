import { useState, useMemo, useEffect } from 'react'
import { DollarSign,  Plus, ShoppingCart, TrendingUp, Calendar, Zap,  ArrowUpRight, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

import { useContractStore } from '@/store/contractStore'
import { useAuthStore } from '@/store/authStore'
import { db } from '@/config/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

export const Dashboard = () => {
  const { contracts, syncContracts } = useContractStore()
  const { user } = useAuthStore()
  const [dateFilter, setDateFilter] = useState<'hoje' | 'semana' | 'mes' | 'ano'>('semana')
  const [firebaseTransactions, setFirebaseTransactions] = useState<any[]>([])

  useEffect(() => {
    if (!user?.email && !user?.uid) return
    
    // Sync SaaS transactions
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user?.email || user?.uid)
    )
    const unsubscribeTxs = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setFirebaseTransactions(txs)
    })
    
    // Sync CRM contracts
    const unsubscribeCrm = syncContracts(user?.email || user?.uid || '')
    
    return () => {
      unsubscribeTxs()
      unsubscribeCrm()
    }
  }, [user])

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
          clientName: t.customer?.name || t.clientName || 'Cliente Online',
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

    allPaidTransactions.forEach(tx => {
      if (tx.date >= startOfToday) hoje += tx.amount
      if (tx.date >= startOfWeekTime) semana += tx.amount
      if (tx.date >= startOfMonthTime) mes += tx.amount
      if (tx.date >= startOfYearTime) ano += tx.amount
    })

    return { hoje, semana, mes, ano }
  }

  const { hoje, semana, mes, ano } = calculateMetrics()

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
    show: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-3">
            <Zap className="w-3 h-3 fill-primary" /> Modo Elite Ativado
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Olá, {user?.name?.split(' ')[0] || 'Usuário'}.
          </h1>
          <p className="text-textSecondary mt-2 text-lg">Visão geral do seu império digital.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-primary hover:bg-primaryLight text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:-translate-y-1">
            <Plus className="w-5 h-5" /> Registrar Venda
          </button>
        </div>
      </motion.div>

      {/* TOP METRICS GRID (4 CARDS) */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* Card Hoje */}
        <motion.div variants={itemVariants} className="bg-panel border-border border rounded-2xl p-6 relative overflow-hidden group hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-widest">Hoje</h3>
            <div className="p-2 rounded-lg bg-background border border-border">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{formatCurrency(hoje)}</div>
          <p className="text-xs text-success flex items-center mt-2 font-medium">
            <ArrowUpRight className="w-3 h-3 mr-1" /> Faturamento diÃ¡rio
          </p>
        </motion.div>

        {/* Card Semana */}
        <motion.div variants={itemVariants} className="bg-panel border-border border rounded-2xl p-6 relative overflow-hidden group hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-widest">Esta Semana</h3>
            <div className="p-2 rounded-lg bg-background border border-border">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{formatCurrency(semana)}</div>
          <p className="text-xs text-textSecondary flex items-center mt-2 font-medium">
            Acumulado nos Ãºltimos 7 dias
          </p>
        </motion.div>

        {/* Card MÃªs */}
        <motion.div variants={itemVariants} className="bg-panel border-border border rounded-2xl p-6 relative overflow-hidden group hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-widest">Este MÃªs</h3>
            <div className="p-2 rounded-lg bg-background border border-border">
              <ShoppingCart className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{formatCurrency(mes)}</div>
          <p className="text-xs text-textSecondary flex items-center mt-2 font-medium">
            Performance mensal
          </p>
        </motion.div>

        {/* Card Ano */}
        <motion.div variants={itemVariants} className="bg-panel border-border border rounded-2xl p-6 relative overflow-hidden group hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-widest">Este Ano</h3>
            <div className="p-2 rounded-lg bg-background border border-border">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{formatCurrency(ano)}</div>
          <p className="text-xs text-textSecondary flex items-center mt-2 font-medium">
            Receita anual bruta
          </p>
        </motion.div>
      </motion.div>

      {/* BOTTOM SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3 }}
        className="grid gap-6 md:grid-cols-7"
      >
        {/* CHART BLOCK */}
        <div className="md:col-span-5 bg-panel border border-border rounded-3xl p-6 lg:p-8 relative overflow-hidden group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight mb-1">VisÃ£o de Crescimento</h3>
              <p className="text-sm text-textSecondary font-medium">Acompanhe a escalabilidade do seu negÃ³cio</p>
            </div>
            
            <div className="flex items-center p-1 bg-background border border-border rounded-lg mt-4 sm:mt-0">
              <button 
                onClick={() => setDateFilter('semana')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${dateFilter === 'semana' ? 'bg-primary text-white shadow-md' : 'text-textSecondary hover:text-white'}`}
              >
                7 Dias
              </button>
              <button 
                onClick={() => setDateFilter('mes')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${dateFilter === 'mes' ? 'bg-primary text-white shadow-md' : 'text-textSecondary hover:text-white'}`}
              >
                30 Dias
              </button>
              <button 
                onClick={() => setDateFilter('ano')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${dateFilter === 'ano' ? 'bg-primary text-white shadow-md' : 'text-textSecondary hover:text-white'}`}
              >
                12 Meses
              </button>
            </div>
          </div>
          
          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenueGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="day" 
                  stroke="#6b7280" 
                  fontSize={12}
                  fontWeight={500}
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  fontWeight={500}
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `R$ ${value}`}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(10,10,10,0.8)', 
                    backdropFilter: 'blur(10px)',
                    borderColor: 'rgba(139,92,246,0.3)', 
                    borderRadius: '16px', 
                    boxShadow: '0 0 30px rgba(139,92,246,0.2)',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ color: '#fff', fontWeight: '800', fontSize: '16px' }}
                  labelStyle={{ color: '#9CA3AF', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}
                  formatter={(value: any) => [formatCurrency(value as number), 'Faturamento']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--color-primary)" 
                  strokeWidth={4}
                  activeDot={{ r: 8, fill: "var(--color-primary)", stroke: "#fff", strokeWidth: 3, style: { filter: 'drop-shadow(0px 0px 10px var(--color-primary))' } }}
                  fillOpacity={1} 
                  fill="url(#colorRevenueGlow)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT TRANSACTIONS BLOCK */}
        <div className="md:col-span-2 bg-panel border border-border rounded-3xl p-6 flex flex-col relative overflow-hidden group">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-extrabold text-white tracking-tight">NotificaÃ§Ãµes</h3>
            <div className="bg-success/10 text-success text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-success/20">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_8px_#22C55E]"></span>
              Live
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto pr-2 flex-1 custom-scrollbar">
            {allPaidTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center h-full">
                <Activity className="w-10 h-10 text-border mb-3" />
                <p className="text-textSecondary text-sm font-medium">Nenhuma venda registrada ainda.</p>
              </div>
            ) : (
              allPaidTransactions.slice(0, 8).map((tx, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  key={tx.id} 
                  className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border hover:border-primary/40 transition-colors group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-success/10 border border-success/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{tx.clientName}</p>
                    <p className="text-[10px] text-textSecondary mt-0.5 font-medium uppercase tracking-wider">{tx.source}</p>
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
