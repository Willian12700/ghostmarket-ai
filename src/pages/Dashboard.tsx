import { useState, useMemo, useEffect } from 'react'
import { ArrowUpRight, ArrowDownRight, RefreshCw, ChevronDown, Info, ShoppingCart } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

import { useDigitalizaStore } from '@/store/digitalizaStore'
import { useAuthStore } from '@/store/authStore'
import { db } from '@/config/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

// Theme Colors for Cakto Style
const C = {
  bg: '#090d0b',
  cardBg: '#151917',
  border: '#1f2421',
  textMain: '#ffffff',
  textMuted: '#8b8e8c',
  green: '#00c48c',
  greenDark: '#008b63',
}

export const Dashboard = () => {
  const { contracts, syncContracts, fetchWorkspaces, activeWorkspace } = useDigitalizaStore()
  const { user } = useAuthStore()
  
  const [dateFilter, setDateFilter] = useState<'hoje' | 'ontem' | '7dias' | '30dias' | 'sempre'>('30dias')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [firebaseTransactions, setFirebaseTransactions] = useState<any[]>([])

  useEffect(() => {
    if (!user?.email && !user?.uid) return
    
    const userIdsToQuery = user?.email && user?.uid && user.email !== user.uid 
      ? [user.uid, user.email] 
      : [user?.uid || user?.email || '']

    const q = query(collection(db, 'transactions'), where('userId', 'in', userIdsToQuery))
    const unsubscribeTxs = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setFirebaseTransactions(txs)
    })
    
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

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setLastUpdate(new Date())
      setIsRefreshing(false)
    }, 800)
  }

  // Parse all transactions
  const allPaidTransactions = useMemo(() => {
    const closedContracts = contracts
      .filter(c => c.status === 'Fechado')
      .map(c => {
        let rawMs = Date.now()
        if (c.date) {
          if (c.date.includes('/')) {
            const parts = c.date.split('/')
            if (parts.length === 3) rawMs = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime()
          } else if (c.date.includes('-')) {
            const parts = c.date.split('-')
            if (parts.length === 3) rawMs = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime()
          } else {
            rawMs = new Date(c.date).getTime()
          }
        }
        if (isNaN(rawMs)) rawMs = Date.now()
        
        return {
          id: c.id,
          amount: Number(c.amount || 0),
          date: rawMs,
          clientName: c.client,
          source: 'CRM',
          product: 'CRM Contract'
        }
      })

    const saasTxs = firebaseTransactions
      .filter(t => {
        const s = (t.status || '').toLowerCase().trim()
        return s === 'aprovado' || s === 'paid' || s === 'approved' || s === 'fechado'
      })
      .map(t => {
        let timestampMs = Date.now()
        if (t.timestamp?.toMillis) {
          timestampMs = t.timestamp.toMillis()
        } else if (t.date_created) {
          timestampMs = new Date(t.date_created).getTime()
        } else if (t.date) {
          if (typeof t.date === 'string' && t.date.includes('/')) {
            const parts = t.date.split('/')
            if (parts.length === 3) timestampMs = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime()
          } else if (typeof t.date === 'string' && t.date.includes('-')) {
             const parts = t.date.split('-')
             if (parts.length === 3) timestampMs = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime()
          } else {
             timestampMs = new Date(t.date).getTime()
          }
        }
        if (isNaN(timestampMs)) timestampMs = Date.now()

        // Discover product name
        const productName = t.offer?.name || t.product?.name || t.source || 'SaaS'

        return {
          id: t.id,
          amount: Number(t.transaction_amount || t.amount || 0),
          date: timestampMs,
          clientName: t.customer?.name || t.clientName || t.buyerName || 'Cliente Online',
          source: 'SaaS',
          product: productName
        }
      })

    return [...closedContracts, ...saasTxs].sort((a, b) => b.date - a.date)
  }, [contracts, firebaseTransactions])

  // Apply Filter
  const filteredTransactions = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    
    if (dateFilter === 'sempre') return allPaidTransactions
    if (dateFilter === 'hoje') return allPaidTransactions.filter(t => t.date >= startOfToday)
    if (dateFilter === 'ontem') return allPaidTransactions.filter(t => t.date >= startOfToday - 86400000 && t.date < startOfToday)
    if (dateFilter === '7dias') return allPaidTransactions.filter(t => t.date >= startOfToday - (6 * 86400000))
    if (dateFilter === '30dias') return allPaidTransactions.filter(t => t.date >= startOfToday - (29 * 86400000))
    
    return allPaidTransactions
  }, [allPaidTransactions, dateFilter])

  // Get previous period for trends
  const previousFilteredTransactions = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    
    if (dateFilter === 'sempre') return [] // no previous for always
    if (dateFilter === 'hoje') return allPaidTransactions.filter(t => t.date >= startOfToday - 86400000 && t.date < startOfToday)
    if (dateFilter === 'ontem') return allPaidTransactions.filter(t => t.date >= startOfToday - (2 * 86400000) && t.date < startOfToday - 86400000)
    if (dateFilter === '7dias') return allPaidTransactions.filter(t => t.date >= startOfToday - (13 * 86400000) && t.date < startOfToday - (7 * 86400000))
    if (dateFilter === '30dias') return allPaidTransactions.filter(t => t.date >= startOfToday - (59 * 86400000) && t.date < startOfToday - (30 * 86400000))
    
    return []
  }, [allPaidTransactions, dateFilter])

  // Metrics calculation
  const currentRevenue = filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0)
  const previousRevenue = previousFilteredTransactions.reduce((acc, curr) => acc + curr.amount, 0)
  const currentSalesCount = filteredTransactions.length
  const previousSalesCount = previousFilteredTransactions.length

  const revenueTrend = previousRevenue ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 100
  const salesCountTrend = previousSalesCount ? ((currentSalesCount - previousSalesCount) / previousSalesCount) * 100 : 100

  // Chart Data Generator
  const chartData = useMemo(() => {
    const data = []
    
    if (dateFilter === 'hoje' || dateFilter === 'ontem') {
      // Hourly data (24h)
      const targetDate = dateFilter === 'hoje' ? new Date() : new Date(Date.now() - 86400000)
      for (let i = 0; i < 24; i++) {
        const hourStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), i).getTime()
        const hourEnd = hourStart + 3600000 - 1
        const total = filteredTransactions.filter(tx => tx.date >= hourStart && tx.date <= hourEnd).reduce((sum, tx) => sum + tx.amount, 0)
        data.push({ name: `${i.toString().padStart(2, '0')}:00`, revenue: total })
      }
    } else {
      // Daily data
      let days = dateFilter === '7dias' ? 7 : dateFilter === '30dias' ? 30 : 365
      const now = new Date()
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
        const endOfDay = startOfDay + 86400000 - 1
        const total = filteredTransactions.filter(tx => tx.date >= startOfDay && tx.date <= endOfDay).reduce((sum, tx) => sum + tx.amount, 0)
        data.push({ name: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), revenue: total })
      }
    }
    return data
  }, [dateFilter, filteredTransactions])

  // Product Sales Map
  const productSales = useMemo(() => {
    const map = new Map<string, { count: number, total: number }>()
    filteredTransactions.forEach(tx => {
      const p = tx.product || 'Outros'
      if (!map.has(p)) map.set(p, { count: 0, total: 0 })
      const curr = map.get(p)!
      curr.count += 1
      curr.total += tx.amount
    })
    return Array.from(map.entries()).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.total - a.total)
  }, [filteredTransactions])

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  const formatDateHeader = (d: Date) => {
    const ds = d.toLocaleDateString('pt-BR')
    const ts = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return `${ds} ǭs ${ts}`
  }

  return (
    <div className="min-h-screen p-8 text-white font-sans" style={{ backgroundColor: C.bg }}>
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: C.textMain }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: C.textMuted }}>Ǜltima atualizaǜo: {formatDateHeader(lastUpdate)}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Produtos Dropdown */}
          <div className="relative group">
            <span className="absolute -top-2.5 left-3 px-1 text-[11px] font-semibold bg-[#151917]" style={{ color: C.textMuted }}>Produtos</span>
            <button className="flex items-center justify-between h-10 px-4 text-sm font-medium rounded-lg border w-48 transition-colors"
              style={{ backgroundColor: C.cardBg, borderColor: C.border, color: C.textMain }}>
              Todos os produtos
              <ChevronDown className="w-4 h-4 opacity-50" />
            </button>
          </div>

          {/* Period Dropdown */}
          <div className="relative group">
            <span className="absolute -top-2.5 left-3 px-1 text-[11px] font-semibold bg-[#151917]" style={{ color: C.textMuted }}>Perodo</span>
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="appearance-none h-10 px-4 pr-10 text-sm font-medium rounded-lg border w-40 cursor-pointer focus:outline-none"
              style={{ backgroundColor: C.cardBg, borderColor: C.border, color: C.textMain }}
            >
              <option value="hoje">Hoje</option>
              <option value="ontem">Ontem</option>
              <option value="7dias">sltimos 7 dias</option>
              <option value="30dias">sltimos 30 dias</option>
              <option value="sempre">Sempre</option>
            </select>
            <ChevronDown className="w-4 h-4 opacity-50 absolute right-4 top-3 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <button 
            onClick={handleRefresh}
            className="flex items-center justify-center gap-2 h-10 px-4 text-sm font-bold rounded-lg transition-colors hover:brightness-110"
            style={{ backgroundColor: C.greenDark, color: '#fff' }}
          >
            Atualizar
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Metric 1 */}
        <div className="rounded-xl p-5 border flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: C.cardBg, borderColor: C.border }}>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-medium" style={{ color: C.textMuted }}>Vendas no perodo</h3>
            <Info className="w-3.5 h-3.5 opacity-50 cursor-pointer hover:opacity-100" style={{ color: C.textMuted }} />
          </div>
          <div className="text-3xl font-bold mb-3" style={{ color: C.textMain }}>
            {formatCurrency(currentRevenue)}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: revenueTrend >= 0 ? C.green : '#f87171' }}>
              {revenueTrend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(revenueTrend).toFixed(1)}% <span style={{ color: C.textMuted, fontWeight: 'normal' }}>vs. incio do perodo</span>
            </div>
            
            {/* Sparkline decoration */}
            <div className="h-6 w-16 opacity-70">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(-5)}>
                  <Bar dataKey="revenue" fill={C.green} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl p-5 border flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: C.cardBg, borderColor: C.border }}>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-medium" style={{ color: C.textMuted }}>Quantidade de vendas</h3>
            <Info className="w-3.5 h-3.5 opacity-50 cursor-pointer hover:opacity-100" style={{ color: C.textMuted }} />
          </div>
          <div className="text-3xl font-bold mb-3" style={{ color: C.textMain }}>
            {currentSalesCount}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: salesCountTrend >= 0 ? C.green : '#f87171' }}>
              {salesCountTrend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(salesCountTrend).toFixed(1)}% <span style={{ color: C.textMuted, fontWeight: 'normal' }}>vs. incio do perodo</span>
            </div>
            
            {/* Sparkline decoration */}
            <div className="h-6 w-16 opacity-70">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(-5)}>
                  <Bar dataKey="revenue" fill={C.green} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Metric 3 (Custom for GhostMarket) */}
        <div className="rounded-xl p-5 border flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: C.cardBg, borderColor: C.border }}>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-medium" style={{ color: C.textMuted }}>Economia gerada</h3>
            <Info className="w-3.5 h-3.5 opacity-50 cursor-pointer hover:opacity-100" style={{ color: C.textMuted }} />
          </div>
          <div className="text-3xl font-bold mb-3" style={{ color: C.green }}>
            <span className="text-lg mr-1 text-green-500">
              <ArrowUpRight className="w-5 h-5 inline" />
            </span>
            {formatCurrency(currentRevenue * 0.05)} {/* Simulated metric */}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs" style={{ color: C.textMuted }}>
              Voc economiza mais usando a nossa plataforma.
            </div>
            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
               <span role="img" aria-label="ghost">👻</span>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Main Chart */}
        <div className="lg:col-span-2 rounded-xl p-6 border flex flex-col h-[400px]" style={{ backgroundColor: C.cardBg, borderColor: C.border }}>
          <div className="mb-6">
            <h3 className="text-base font-bold" style={{ color: C.textMain }}>Receita lquida</h3>
            <p className="text-xl font-bold mt-1" style={{ color: C.textMain }}>{formatCurrency(currentRevenue)}</p>
          </div>
          
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.green} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={C.green} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2421" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: C.textMuted, fontSize: 10 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: C.textMuted, fontSize: 10 }}
                  tickFormatter={(val) => `R$ ${val}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151917', borderColor: '#1f2421', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: C.green }}
                  formatter={(value: any) => [formatCurrency(value), 'Receita']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={C.green} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Products List */}
        <div className="rounded-xl p-6 border flex flex-col h-[400px]" style={{ backgroundColor: C.cardBg, borderColor: C.border }}>
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-base font-bold" style={{ color: C.textMain }}>Vendas de produtos</h3>
            <Info className="w-3.5 h-3.5 opacity-50 cursor-pointer hover:opacity-100" style={{ color: C.textMuted }} />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
            {productSales.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm" style={{ color: C.textMuted }}>
                Sem produtos para exibir neste perodo.
              </div>
            ) : (
              productSales.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-900/20 border border-purple-500/20 flex items-center justify-center shrink-0">
                     <span role="img" aria-label="ghost">👻</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: C.textMain }}>{item.name}</p>
                    <div className="flex items-center text-xs mt-0.5 gap-2">
                      <span style={{ color: C.green }}>{formatCurrency(item.total)}</span>
                      <span style={{ color: C.textMuted }}>•</span>
                      <span style={{ color: C.textMuted }}>
                        <ShoppingCart className="w-3 h-3 inline mr-1 opacity-70" />
                        {item.count} {item.count === 1 ? 'venda' : 'vendas'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
