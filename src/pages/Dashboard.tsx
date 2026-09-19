import { useState, useMemo, useEffect } from 'react'
import { DollarSign, RefreshCw, Plus, ShoppingCart, TrendingUp, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

import { useContractStore } from '@/store/contractStore'
import { useAuthStore } from '@/store/authStore'
import { db } from '@/config/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

export const Dashboard = () => {
  const { contracts, syncContracts } = useContractStore()
  const { user } = useAuthStore()
  const [dateFilter, setDateFilter] = useState<'hoje' | 'semana' | 'mes' | 'ano'>('semana')
  const [firebaseTransactions, setFirebaseTransactions] = useState<any[]>([])

  // Busca Vendas do SaaS do Firebase (Webhooks) e Sincroniza CRM
  useEffect(() => {
    if (!user?.email) return
    
    // Sync SaaS transactions
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.email)
    )
    const unsubscribeTxs = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setFirebaseTransactions(txs)
    })
    
    // Sync CRM contracts
    const unsubscribeCrm = syncContracts(user.email)
    
    return () => {
      unsubscribeTxs()
      unsubscribeCrm()
    }
  }, [user])

  // Helper para verificar se a data está no filtro selecionado
  const isWithinFilter = (timestampMs: number, filter: string) => {
    if (!timestampMs) return true // Se não tiver data, mostra por padrão
    
    const now = new Date()
    const date = new Date(timestampMs)
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const itemDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

    if (filter === 'hoje') {
      return itemDay === today
    }
    if (filter === 'semana') {
      const dayOfWeek = now.getDay()
      const startOfWeek = today - (dayOfWeek * 24 * 60 * 60 * 1000)
      return itemDay >= startOfWeek
    }
    if (filter === 'mes') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }
    if (filter === 'ano') {
      return date.getFullYear() === now.getFullYear()
    }
    return true
  }

  // Prepara todas as transações unificadas e padronizadas com _rawDate
  const allCombinedTransactions = useMemo(() => {
    const crmTxs = contracts.map(c => {
      // Tenta fazer o parse da data DD/MM/YYYY do Kanban
      let rawMs = Date.now()
      if (c.date) {
        const parts = c.date.split('/')
        if (parts.length === 3) {
          rawMs = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime()
        }
      }
      return {
        id: c.id,
        clientName: c.client,
        amount: c.amount,
        status: c.status === 'Fechado' ? 'Fechado' : 'Em Negociação',
        date: c.date,
        _rawDate: rawMs,
        isCRM: true
      }
    })

    const saasTxs = firebaseTransactions.map(tx => ({
      id: tx.id,
      clientName: tx.clientName,
      amount: tx.amount,
      status: tx.status === 'Aprovado' ? 'Fechado' : tx.status,
      date: tx.date || new Date().toLocaleDateString('pt-BR'),
      _rawDate: tx.timestamp?.toMillis() || Date.now(),
      isCRM: false
    }))

    return [...crmTxs, ...saasTxs]
  }, [contracts, firebaseTransactions])

  // Aplica o filtro de data na lista unificada
  const filteredTransactions = useMemo(() => {
    return allCombinedTransactions.filter(tx => isWithinFilter(tx._rawDate, dateFilter))
  }, [allCombinedTransactions, dateFilter])

  // Calcula estatísticas REAIS baseadas no filtro selecionado
  const totalRevenue = useMemo(() => {
    return filteredTransactions
      .filter(tx => tx.status === 'Fechado')
      .reduce((acc, curr) => acc + (curr.amount || 0), 0)
  }, [filteredTransactions])

  const activeProjects = useMemo(() => {
    return filteredTransactions.filter(tx => tx.isCRM && tx.status !== 'Fechado').length
  }, [filteredTransactions])

  const capturedLeads = useMemo(() => {
    return filteredTransactions.filter(tx => tx.isCRM).length
  }, [filteredTransactions])

  const recentTransactions = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => b._rawDate - a._rawDate)
    return sorted.slice(0, 5)
  }, [filteredTransactions])

  // Mock de gráfico (para manter o visual bonito, já que não temos datas reais nos leads do kanban)
  const salesData = [
    { day: 'Seg', revenue: totalRevenue * 0.1 },
    { day: 'Ter', revenue: totalRevenue * 0.2 },
    { day: 'Qua', revenue: totalRevenue * 0.15 },
    { day: 'Qui', revenue: totalRevenue * 0.4 },
    { day: 'Sex', revenue: totalRevenue * 0.6 },
    { day: 'Sáb', revenue: totalRevenue * 0.8 },
    { day: 'Dom', revenue: totalRevenue }
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }



  return (
    <div className="space-y-6">
      
      {/* HEADER PRINCIPAL (CENTRAL DE PERFORMANCE) */}
      <div className="bg-[#0b0416] rounded-2xl p-8 border border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.05)] relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4 tracking-wider">
            <Activity className="w-3 h-3" />
            CENTRAL DE PERFORMANCE
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Olá, {user?.name?.split(' ')[0] || 'Usuário'}.</h1>
          <p className="text-textSecondary mb-6">Sua performance de vendas atualizada em tempo real.</p>
          
          {/* Filtros em Pílulas (Pills) */}
          <div className="flex bg-[#130922] border border-primary/20 rounded-full p-1 w-fit">
            <button 
              onClick={() => setDateFilter('hoje')}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${dateFilter === 'hoje' ? 'bg-primary text-white shadow-md' : 'text-textSecondary hover:text-white'}`}
            >
              Hoje
            </button>
            <button 
              onClick={() => setDateFilter('semana')}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${dateFilter === 'semana' ? 'bg-primary text-white shadow-md' : 'text-textSecondary hover:text-white'}`}
            >
              7 dias
            </button>
            <button 
              onClick={() => setDateFilter('mes')}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${dateFilter === 'mes' ? 'bg-primary text-white shadow-md' : 'text-textSecondary hover:text-white'}`}
            >
              30 dias
            </button>
            <button 
              onClick={() => setDateFilter('ano')}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${dateFilter === 'ano' ? 'bg-primary text-white shadow-md' : 'text-textSecondary hover:text-white'}`}
            >
              12 meses
            </button>
          </div>
        </div>

        <div className="z-10 md:text-right">
          <p className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-2">FATURAMENTO TOTAL</p>
          <div className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            {formatCurrency(totalRevenue)}
          </div>
          
          <div className="flex items-center md:justify-end gap-3">
            <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <Plus className="w-4 h-4" /> Registrar venda
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-[#1a0f2e] hover:bg-[#23153d] border border-primary/30 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4 text-textSecondary" /> Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-[#0b0416] border border-primary/10 rounded-2xl p-6 relative overflow-hidden group hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[11px] font-bold text-textSecondary uppercase tracking-widest">PROJETOS ATIVOS</h3>
            <ShoppingCart className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
          </div>
          <div className="text-3xl font-extrabold text-white">{activeProjects}</div>
        </div>

        <div className="bg-[#0b0416] border border-primary/10 rounded-2xl p-6 relative overflow-hidden group hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[11px] font-bold text-textSecondary uppercase tracking-widest">LEADS CAPTURADOS</h3>
            <TrendingUp className="w-4 h-4 text-success/60 group-hover:text-success transition-colors" />
          </div>
          <div className="text-3xl font-extrabold text-white">{capturedLeads}</div>
        </div>

        <div className="bg-[#0b0416] border border-primary/10 rounded-2xl p-6 relative overflow-hidden group hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[11px] font-bold text-textSecondary uppercase tracking-widest">TICKET MÉDIO</h3>
            <DollarSign className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {formatCurrency(totalRevenue > 0 && activeProjects > 0 ? totalRevenue / activeProjects : 0)}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid gap-6 md:grid-cols-7">
        
        {/* CHART BLOCK */}
        <div className="md:col-span-4 bg-[#0b0416] border border-primary/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-1">EVOLUÇÁO</p>
              <h3 className="text-sm font-medium text-white">Faturamento x Vendas</h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.8)]"></span> Faturamento</span>
            </div>
          </div>
          
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenueGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                <XAxis 
                  dataKey="day" 
                  stroke="#6b7280" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000000', borderColor: '#7C3AED', borderRadius: '12px', boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  labelStyle={{ color: '#9CA3AF' }}
                  formatter={(value: any) => [formatCurrency(value as number), 'Receita']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#a78bfa" 
                  strokeWidth={3}
                  activeDot={{ r: 6, fill: "#fff", stroke: "#a78bfa", strokeWidth: 3 }}
                  fillOpacity={1} 
                  fill="url(#colorRevenueGlow)" 
                  style={{ filter: 'drop-shadow(0px 0px 8px rgba(139,92,246,0.5))' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT TRANSACTIONS BLOCK */}
        <div className="md:col-span-3 bg-[#0b0416] border border-primary/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-1">TEMPO REAL</p>
              <h3 className="text-sm font-medium text-white">Vendas recentes</h3>
            </div>
            <div className="bg-success/20 text-success text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-success/30">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
              Live
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto pr-2 max-h-[260px] custom-scrollbar">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-textSecondary text-sm">Nenhuma transação recente.</p>
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#11081e] border border-primary/10 hover:border-primary/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#0a1e14] border border-[#164a2e] flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-medium text-white truncate">{tx.clientName}</p>
                    <p className="text-[10px] text-textSecondary mt-0.5">{tx.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-success">+{formatCurrency(tx.amount)}</p>
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
