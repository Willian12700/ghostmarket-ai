import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ChevronDown,
  Info,
  ShoppingCart,
  Wand2,
  Code,
  Search,
  LayoutTemplate,
  CodeXml,
  FileText,
  TrendingUp,
  DollarSign,
  Receipt,
  Ghost,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

import { useDigitalizaStore } from '@/store/digitalizaStore'
import { useContractStore } from '@/store/contractStore'
import { useAuthStore } from '@/store/authStore'
import { db } from '@/config/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

const QUICK_TOOLS = [
  {
    title: 'Creator IA',
    desc: 'Abordagens & scripts WhatsApp',
    to: '/creator',
    icon: Wand2,
    badge: 'POPULAR',
    gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
    iconColor: 'text-purple-400',
    borderHover: 'hover:border-purple-500/50'
  },
  {
    title: 'Prompt Builder',
    desc: 'Prompts prontos para sites/SaaS',
    to: '/prompt-builder',
    icon: Code,
    badge: 'PRO',
    gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
    iconColor: 'text-blue-400',
    borderHover: 'hover:border-blue-500/50'
  },
  {
    title: 'Scanner de Leads',
    desc: 'Extrair clientes no Google Maps',
    to: '/scanner',
    icon: Search,
    badge: 'HOT',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    iconColor: 'text-emerald-400',
    borderHover: 'hover:border-emerald-500/50'
  },
  {
    title: 'Hospedar Site',
    desc: 'Publique HTML + botão WhatsApp',
    to: '/builder',
    icon: LayoutTemplate,
    gradient: 'from-fuchsia-500/20 via-pink-500/10 to-transparent',
    iconColor: 'text-fuchsia-400',
    borderHover: 'hover:border-fuchsia-500/50'
  },
  {
    title: 'AI Workspace',
    desc: 'Edite códigos ao vivo com IA',
    to: '/code-workspace',
    icon: CodeXml,
    badge: 'NOVO',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    iconColor: 'text-amber-400',
    borderHover: 'hover:border-amber-500/50'
  },
  {
    title: 'CRM Kanban',
    desc: 'Pipeline e contratos fechados',
    to: '/contracts',
    icon: FileText,
    gradient: 'from-indigo-500/20 via-violet-500/10 to-transparent',
    iconColor: 'text-indigo-400',
    borderHover: 'hover:border-indigo-500/50'
  }
]

export const Dashboard = () => {
  const navigate = useNavigate()
  const { contracts: digitalizaContracts, syncContracts: syncDigitaliza, fetchWorkspaces, activeWorkspace } = useDigitalizaStore()
  const { contracts: crmContracts, syncContracts: syncCrmContracts } = useContractStore()
  const { user } = useAuthStore()

  const contracts = useMemo(() => {
    const map = new Map<string, any>()
    digitalizaContracts.forEach(c => map.set(c.id, c))
    crmContracts.forEach(c => map.set(c.id, c))
    return Array.from(map.values())
  }, [digitalizaContracts, crmContracts])

  const [dateFilter, setDateFilter] = useState<'hoje' | 'ontem' | '7dias' | '30dias' | 'sempre'>('30dias')
  const [selectedProduct, setSelectedProduct] = useState<string>('all')
  const [rightPanelTab, setRightPanelTab] = useState<'products' | 'recent'>('products')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [firebaseTransactions, setFirebaseTransactions] = useState<any[]>([])

  useEffect(() => {
    if (!user?.email && !user?.uid) return

    const userIdsToQuery = Array.from(
      new Set([user?.uid, user?.email].filter((id): id is string => Boolean(id && id.trim())))
    )
    if (userIdsToQuery.length === 0) return

    const q = query(collection(db, 'transactions'), where('userId', 'in', userIdsToQuery))
    const unsubscribeTxs = onSnapshot(
      q,
      snapshot => {
        const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setFirebaseTransactions(txs)
      },
      err => {
        console.warn('Transactions onSnapshot error (handled):', err)
      }
    )

    const unsubscribeWorkspaces = fetchWorkspaces(user?.uid || '')

    return () => {
      unsubscribeTxs()
      unsubscribeWorkspaces()
    }
  }, [user])

  useEffect(() => {
    const unsubs: Array<() => void> = []
    if (activeWorkspace) {
      unsubs.push(syncDigitaliza())
    } else if (user?.email) {
      unsubs.push(syncDigitaliza(user.email))
    }
    if (user?.email) {
      unsubs.push(syncCrmContracts(user.email))
    }
    return () => unsubs.forEach(fn => fn && fn())
  }, [activeWorkspace, syncDigitaliza, syncCrmContracts, user])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setLastUpdate(new Date())
      setIsRefreshing(false)
    }, 600)
  }

  // Parse all paid transactions
  const allPaidTransactions = useMemo(() => {
    const closedContracts = contracts
      .filter(c => c.status === 'Fechado')
      .map(c => {
        let rawMs = Date.now()
        if (c.date) {
          if (typeof c.date === 'string' && c.date.includes('/')) {
            const parts = c.date.split('/')
            if (parts.length === 3) rawMs = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime()
          } else if (typeof c.date === 'string' && c.date.includes('-')) {
            const parts = c.date.split('-')
            if (parts.length === 3) rawMs = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime()
          } else if (typeof (c.date as any)?.toMillis === 'function') {
            rawMs = (c.date as any).toMillis()
          } else {
            rawMs = new Date(c.date).getTime()
          }
        }
        if (isNaN(rawMs)) rawMs = Date.now()

        return {
          id: c.id,
          amount: Number(c.amount || 0),
          date: rawMs,
          clientName: c.client || 'Cliente CRM',
          source: 'CRM',
          product: 'Contrato CRM'
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

        const productName = t.offer?.name || t.product?.name || t.source || 'Assinatura SaaS'

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

  // Available product names for the filter dropdown
  const productOptions = useMemo(() => {
    const set = new Set<string>()
    allPaidTransactions.forEach(t => {
      if (t.product) set.add(t.product)
    })
    return Array.from(set)
  }, [allPaidTransactions])

  // Apply Period + Product Filter
  const filteredTransactions = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

    return allPaidTransactions.filter(t => {
      if (selectedProduct !== 'all' && t.product !== selectedProduct) return false

      if (dateFilter === 'sempre') return true
      if (dateFilter === 'hoje') return t.date >= startOfToday
      if (dateFilter === 'ontem') return t.date >= startOfToday - 86400000 && t.date < startOfToday
      if (dateFilter === '7dias') return t.date >= startOfToday - 6 * 86400000
      if (dateFilter === '30dias') return t.date >= startOfToday - 29 * 86400000
      return true
    })
  }, [allPaidTransactions, dateFilter, selectedProduct])

  // Previous period for trend comparison
  const previousFilteredTransactions = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

    return allPaidTransactions.filter(t => {
      if (selectedProduct !== 'all' && t.product !== selectedProduct) return false

      if (dateFilter === 'sempre') return false
      if (dateFilter === 'hoje') return t.date >= startOfToday - 86400000 && t.date < startOfToday
      if (dateFilter === 'ontem') return t.date >= startOfToday - 2 * 86400000 && t.date < startOfToday - 86400000
      if (dateFilter === '7dias') return t.date >= startOfToday - 13 * 86400000 && t.date < startOfToday - 7 * 86400000
      if (dateFilter === '30dias') return t.date >= startOfToday - 59 * 86400000 && t.date < startOfToday - 30 * 86400000
      return false
    })
  }, [allPaidTransactions, dateFilter, selectedProduct])

  // Metrics calculation
  const currentRevenue = filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0)
  const previousRevenue = previousFilteredTransactions.reduce((acc, curr) => acc + curr.amount, 0)
  const currentSalesCount = filteredTransactions.length
  const previousSalesCount = previousFilteredTransactions.length
  const averageTicket = currentSalesCount > 0 ? currentRevenue / currentSalesCount : 0

  const revenueTrend = previousRevenue ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : currentRevenue > 0 ? 100 : 0
  const salesCountTrend = previousSalesCount ? ((currentSalesCount - previousSalesCount) / previousSalesCount) * 100 : currentSalesCount > 0 ? 100 : 0

  // Open CRM Pipeline
  const openPipelineValue = useMemo(() => {
    return contracts
      .filter(c => c.status !== 'Fechado')
      .reduce((sum, c) => sum + Number(c.amount || 0), 0)
  }, [contracts])

  // Chart Data Generator
  const chartData = useMemo(() => {
    const data = []

    if (dateFilter === 'hoje' || dateFilter === 'ontem') {
      const targetDate = dateFilter === 'hoje' ? new Date() : new Date(Date.now() - 86400000)
      for (let i = 0; i < 24; i++) {
        const hourStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), i).getTime()
        const hourEnd = hourStart + 3600000 - 1
        const total = filteredTransactions
          .filter(tx => tx.date >= hourStart && tx.date <= hourEnd)
          .reduce((sum, tx) => sum + tx.amount, 0)
        data.push({ name: `${i.toString().padStart(2, '0')}:00`, revenue: total })
      }
    } else {
      const days = dateFilter === '7dias' ? 7 : dateFilter === '30dias' ? 30 : 30
      const now = new Date()
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
        const endOfDay = startOfDay + 86400000 - 1
        const total = filteredTransactions
          .filter(tx => tx.date >= startOfDay && tx.date <= endOfDay)
          .reduce((sum, tx) => sum + tx.amount, 0)
        data.push({ name: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), revenue: total })
      }
    }
    return data
  }, [dateFilter, filteredTransactions])

  // Product Sales Map
  const productSales = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>()
    filteredTransactions.forEach(tx => {
      const p = tx.product || 'Outros'
      if (!map.has(p)) map.set(p, { count: 0, total: 0 })
      const curr = map.get(p)!
      curr.count += 1
      curr.total += tx.amount
    })
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
  }, [filteredTransactions])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const formatDateHeader = (d: Date) => {
    const ds = d.toLocaleDateString('pt-BR')
    const ts = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return `${ds} às ${ts}`
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  const firstName = user?.name ? user.name.split(' ')[0] : 'Empreendedor'

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen pb-16 text-white font-sans space-y-8"
    >
      {/* HERO WELCOME & FILTERS BAR */}
      <motion.div
        variants={itemVariants}
        className="relative rounded-xl border border-zinc-800/80 bg-[#0E0E11] p-5 sm:p-6 overflow-hidden"
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] font-mono uppercase tracking-wider mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Workspace Operacional</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              Visão Geral, {firstName}
            </h1>
            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Sincronizado em tempo real • {formatDateHeader(lastUpdate)}</span>
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Produtos Dropdown (Funcional) */}
            <div className="relative">
              <span className="absolute -top-2 left-2.5 px-1 text-[9px] font-semibold uppercase tracking-wider bg-[#0E0E11] text-zinc-500 z-10">
                Produto
              </span>
              <select
                value={selectedProduct}
                onChange={e => setSelectedProduct(e.target.value)}
                className="appearance-none h-9 pl-3 pr-8 text-xs font-medium rounded-lg border border-zinc-800 bg-[#09090B] text-zinc-200 cursor-pointer focus:outline-none focus:border-zinc-600 transition-colors min-w-[165px]"
              >
                <option value="all">Todos os produtos</option>
                {productOptions.map(prod => (
                  <option key={prod} value={prod}>
                    {prod}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Período Dropdown */}
            <div className="relative">
              <span className="absolute -top-2 left-2.5 px-1 text-[9px] font-semibold uppercase tracking-wider bg-[#0E0E11] text-zinc-500 z-10">
                Período
              </span>
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value as any)}
                className="appearance-none h-9 pl-3 pr-8 text-xs font-medium rounded-lg border border-zinc-800 bg-[#09090B] text-zinc-200 cursor-pointer focus:outline-none focus:border-zinc-600 transition-colors min-w-[145px]"
              >
                <option value="hoje">Hoje</option>
                <option value="ontem">Ontem</option>
                <option value="7dias">Últimos 7 dias</option>
                <option value="30dias">Últimos 30 dias</option>
                <option value="sempre">Todo o período</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center gap-2 h-9 px-4 text-xs font-semibold rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* QUICK LAUNCHPAD (ATALHOS RÁPIDOS DE FERRAMENTAS) */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3 px-0.5">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
            <span>Acesso Rápido aos Módulos</span>
          </h2>
          <span className="text-xs text-zinc-500 hidden sm:inline">
            Pressione <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-400 font-mono">Ctrl + K</kbd> para buscar qualquer função
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_TOOLS.map((tool, i) => {
            const Icon = tool.icon
            return (
              <button
                key={i}
                onClick={() => navigate(tool.to)}
                className="group relative text-left p-4 rounded-xl bg-[#0E0E11] border border-zinc-800/80 hover:border-zinc-700 hover:bg-[#121216] transition-all duration-200 flex flex-col justify-between min-h-[108px] cursor-pointer"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:border-zinc-700 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  {tool.badge ? (
                    <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {tool.badge}
                    </span>
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold text-zinc-100 group-hover:text-white transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{tool.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* 4 KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Vendas no Período */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl p-5 border border-zinc-800/80 bg-[#0E0E11] flex flex-col justify-between relative overflow-hidden hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400">Receita no período</span>
            <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-100 mb-3 tracking-tight tabular-nums">
            {formatCurrency(currentRevenue)}
          </div>
          <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/60">
            <div
              className="flex items-center gap-1 text-xs font-semibold tabular-nums"
              style={{ color: revenueTrend >= 0 ? '#10b981' : '#f87171' }}
            >
              {revenueTrend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(revenueTrend).toFixed(1)}%{' '}
              <span className="text-zinc-500 font-normal ml-0.5">vs. anterior</span>
            </div>
            <div className="h-5 w-14 opacity-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(-6)}>
                  <Bar dataKey="revenue" fill="#e4e4e7" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Quantidade de Vendas */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl p-5 border border-zinc-800/80 bg-[#0E0E11] flex flex-col justify-between relative overflow-hidden hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400">Vendas aprovadas</span>
            <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <ShoppingCart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-100 mb-3 tracking-tight tabular-nums">
            {currentSalesCount}
          </div>
          <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/60">
            <div
              className="flex items-center gap-1 text-xs font-semibold tabular-nums"
              style={{ color: salesCountTrend >= 0 ? '#10b981' : '#f87171' }}
            >
              {salesCountTrend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(salesCountTrend).toFixed(1)}%{' '}
              <span className="text-zinc-500 font-normal ml-0.5">vs. anterior</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-medium">
              Ativas
            </span>
          </div>
        </motion.div>

        {/* Card 3: Ticket Médio */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl p-5 border border-zinc-800/80 bg-[#0E0E11] flex flex-col justify-between relative overflow-hidden hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400">Ticket médio</span>
            <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-100 mb-3 tracking-tight tabular-nums">
            {formatCurrency(averageTicket)}
          </div>
          <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/60 text-xs text-zinc-500">
            <span>Média por contrato/venda</span>
            <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
          </div>
        </motion.div>

        {/* Card 4: Pipeline CRM & Economia */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl p-5 border border-zinc-800/80 bg-[#0E0E11] flex flex-col justify-between relative overflow-hidden hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400">
              {openPipelineValue > 0 ? 'Pipeline em aberto (CRM)' : 'Economia de stack'}
            </span>
            <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <Ghost className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-100 mb-3 tracking-tight tabular-nums">
            {openPipelineValue > 0 ? formatCurrency(openPipelineValue) : formatCurrency(Math.max(currentRevenue * 0.08, 197))}
          </div>
          <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/60 text-xs text-zinc-500">
            <span>
              {openPipelineValue > 0
                ? 'Propostas ativas no funil'
                : 'Economia mensal estimada'}
            </span>
            <button
              onClick={() => navigate('/contracts')}
              className="text-zinc-200 font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Abrir CRM
            </button>
          </div>
        </motion.div>
      </div>

      {/* CHARTS & SALES FEED ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Side: Main Revenue AreaChart */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 rounded-xl p-6 border border-zinc-800/80 bg-[#0E0E11] flex flex-col h-[410px]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-200">Evolução de Receita Líquida</h3>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                  Tempo Real
                </span>
              </div>
              <p className="text-2xl font-bold text-white mt-1 tabular-nums">{formatCurrency(currentRevenue)}</p>
            </div>
            <div className="text-xs text-zinc-500">
              {selectedProduct === 'all' ? 'Todos os produtos e contratos' : `Filtrado por: ${selectedProduct}`}
            </div>
          </div>

          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e4e4e7" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#e4e4e7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  tickFormatter={val => `R$ ${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090B',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    color: '#fafafa',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
                  }}
                  itemStyle={{ color: '#fafafa', fontWeight: 600 }}
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Receita']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#fafafa"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right Side: Tabbed Products & Recent Sales */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl p-6 border border-zinc-800/80 bg-[#0E0E11] flex flex-col h-[410px]"
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-1 bg-[#09090B] p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setRightPanelTab('products')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  rightPanelTab === 'products'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Por Produto ({productSales.length})
              </button>
              <button
                onClick={() => setRightPanelTab('recent')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  rightPanelTab === 'recent'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Últimas Vendas ({filteredTransactions.length})
              </button>
            </div>
            <Info className="w-3.5 h-3.5 text-zinc-600" />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2.5">
            {rightPanelTab === 'products' ? (
              productSales.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3 text-zinc-500">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-zinc-300">Nenhuma venda registrada neste período</p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Suas vendas da Cakto e contratos fechados no CRM aparecerão automaticamente aqui.
                  </p>
                </div>
              ) : (
                productSales.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[#09090B] hover:bg-zinc-900/80 border border-zinc-800/80 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-300 font-mono font-semibold text-xs">
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-zinc-100 truncate">{item.name}</p>
                      <div className="flex items-center text-[11px] mt-0.5 gap-2 tabular-nums">
                        <span className="font-semibold text-zinc-300">{formatCurrency(item.total)}</span>
                        <span className="text-zinc-700">•</span>
                        <span className="text-zinc-500">
                          {item.count} {item.count === 1 ? 'venda' : 'vendas'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : filteredTransactions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3 text-zinc-500">
                  <Receipt className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-zinc-300">Sem transações no período</p>
                <p className="text-[11px] text-zinc-500 mt-1">Altere o filtro de período acima para ver transações anteriores.</p>
              </div>
            ) : (
              filteredTransactions.slice(0, 15).map((tx, idx) => (
                <div
                  key={tx.id || idx}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#09090B] hover:bg-zinc-900/80 border border-zinc-800/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-100 truncate">{tx.clientName}</p>
                      <p className="text-[11px] text-zinc-500 truncate">
                        {tx.product} • {new Date(tx.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold tabular-nums text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      +{formatCurrency(tx.amount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
