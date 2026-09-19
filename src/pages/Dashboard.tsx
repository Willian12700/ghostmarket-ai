import { useState, useMemo, useEffect } from 'react'
import { DollarSign, Briefcase, Users, CreditCard, CheckCircle2, Clock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useContractStore } from '@/store/contractStore'
import { useAuthStore } from '@/store/authStore'
import { db } from '@/config/firebase'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'

export const Dashboard = () => {
  const { contracts } = useContractStore()
  const { user } = useAuthStore()
  const [dateFilter, setDateFilter] = useState<'hoje' | 'semana' | 'mes' | 'ano'>('semana')
  const [firebaseTransactions, setFirebaseTransactions] = useState<any[]>([])

  // Busca Vendas do SaaS do Firebase (Webhooks)
  useEffect(() => {
    if (!user?.email) return
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.email),
      orderBy('timestamp', 'desc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setFirebaseTransactions(txs)
    })
    return () => unsubscribe()
  }, [user])

  // Calcula estatísticas reais (CRM + Vendas SaaS)
  const totalRevenue = useMemo(() => {
    const crmRevenue = contracts
      .filter(c => c.status === 'Fechado')
      .reduce((acc, curr) => acc + curr.amount, 0)
    
    const saasRevenue = firebaseTransactions
      .filter(tx => tx.status === 'Aprovado')
      .reduce((acc, curr) => acc + (curr.amount || 0), 0)
      
    return crmRevenue + saasRevenue
  }, [contracts, firebaseTransactions])

  const activeProjects = useMemo(() => {
    return contracts.filter(c => c.status === 'Proposta' || c.status === 'Contato').length
  }, [contracts])

  const capturedLeads = contracts.length

  // Mescla as transações do CRM com as transações do Webhook SaaS
  const recentTransactions = useMemo(() => {
    const crmTxs = contracts.map(c => ({
      id: c.id,
      clientName: c.client,
      amount: c.amount,
      status: c.status === 'Fechado' ? 'Fechado' : 'Em Negociação',
      date: c.date,
      // Usar string para sort se possivel, senao usar data fixa (CRM local guarda apenas DD/MM/YYYY)
      _rawDate: new Date(c.date.split('/').reverse().join('-')).getTime() || 0
    }))

    const saasTxs = firebaseTransactions.map(tx => ({
      id: tx.id,
      clientName: tx.clientName,
      amount: tx.amount,
      status: tx.status === 'Aprovado' ? 'Fechado' : tx.status,
      date: tx.date || new Date().toLocaleDateString('pt-BR'),
      _rawDate: tx.timestamp?.toMillis() || Date.now()
    }))

    const combined = [...crmTxs, ...saasTxs]
    // Ordena do mais recente para o mais antigo (Aproximação)
    combined.sort((a, b) => b._rawDate - a._rawDate)
    
    return combined.slice(0, 5)
  }, [contracts, firebaseTransactions])

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Fechado': return <CheckCircle2 className="w-4 h-4 text-success" />
      default: return <Clock className="w-4 h-4 text-warning" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Fechado': return 'text-success bg-success/10'
      default: return 'text-warning bg-warning/10'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Visão Geral</h2>
        
        {/* Date Filters */}
        <div className="flex bg-panel border border-border rounded-lg p-1">
          <button 
            onClick={() => setDateFilter('hoje')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${dateFilter === 'hoje' ? 'bg-primary text-white' : 'text-textSecondary hover:text-white'}`}
          >
            Hoje
          </button>
          <button 
            onClick={() => setDateFilter('semana')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${dateFilter === 'semana' ? 'bg-primary text-white' : 'text-textSecondary hover:text-white'}`}
          >
            Semana
          </button>
          <button 
            onClick={() => setDateFilter('mes')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${dateFilter === 'mes' ? 'bg-primary text-white' : 'text-textSecondary hover:text-white'}`}
          >
            Mês
          </button>
          <button 
            onClick={() => setDateFilter('ano')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${dateFilter === 'ano' ? 'bg-primary text-white' : 'text-textSecondary hover:text-white'}`}
          >
            1 Ano
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-textSecondary">
              Receita total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-textSecondary flex items-center mt-1">
              +0% em relação ao período anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-textSecondary">
              Projetos ativos
            </CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-textSecondary mt-1">
              Nenhum projeto finalizado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-textSecondary">
              Leads capturados
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{capturedLeads}</div>
            <p className="text-xs text-textSecondary flex items-center mt-1">
              0 novos leads
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Chart */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Desempenho de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272A" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#9CA3AF" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111111', borderColor: '#27272A', borderRadius: '8px' }}
                    itemStyle={{ color: '#F3F4F6' }}
                    formatter={(value: any) => [formatCurrency(value as number), 'Receita']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#7C3AED" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Últimas transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CreditCard className="w-10 h-10 text-textSecondary/30 mb-3" />
                <p className="text-textSecondary">Nenhuma transação encontrada neste período.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getStatusColor(tx.status)}`}>
                        {getStatusIcon(tx.status)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-textPrimary">{tx.clientName}</p>
                        <p className="text-xs text-textSecondary">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{formatCurrency(tx.amount)}</p>
                      <p className={`text-xs mt-0.5 ${tx.status === 'Fechado' ? 'text-success' : 'text-warning'}`}>
                        {tx.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
