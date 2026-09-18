import { useEffect, useState } from 'react'
import { DollarSign, Briefcase, Users, TrendingUp, Trophy, Loader2, Lock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useDashboardStore } from '@/store/dashboardStore'
import { useToastStore } from '@/store/toastStore'
import { useAuthStore } from '@/store/authStore'
import { db } from '@/config/firebase'
import { doc, getDoc } from 'firebase/firestore'

export const Dashboard = () => {
  const { totalRevenue, activeProjects, capturedLeads, salesData, leaderboard, simulateSale } = useDashboardStore()
  const { addToast } = useToastStore()
  const { user } = useAuthStore()
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user?.email) return
      
      try {
        const docRef = doc(db, 'allowed_users', user.email)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists() && docSnap.data().status === 'approved') {
          setHasSubscription(true)
        } else {
          setHasSubscription(false)
        }
      } catch (error) {
        console.error("Error checking subscription:", error)
        setHasSubscription(false)
      }
    }

    checkSubscription()
  }, [user])

  const handleSimulateSale = () => {
    setIsSimulating(true)
    const amounts = [97, 197, 297, 497]
    const amount = amounts[Math.floor(Math.random() * amounts.length)]
    
    setTimeout(() => {
      simulateSale(amount)
      addToast(`Nova venda de R$ ${amount},00!`, 'success')
      setIsSimulating(false)
    }, 600)
  }

  if (hasSubscription === null) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (hasSubscription === false) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[80vh]">
        <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Acesso Bloqueado</h2>
        <p className="text-textSecondary max-w-md mx-auto mb-8 text-lg">
          Não identificamos uma assinatura ativa vinculada ao e-mail <strong>{user?.email}</strong>. 
          Isso pode acontecer se o pagamento ainda estiver processando.
        </p>
        <a href="/#planos">
          <Button size="lg">Assinar um Plano</Button>
        </a>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Visão Geral</h2>
        <Button 
          onClick={handleSimulateSale} 
          disabled={isSimulating}
          className="shadow-primary/20 shadow-lg"
        >
          {isSimulating ? 'Venda registrada ✓' : 'Simular nova venda'}
        </Button>
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
            <p className="text-xs text-success flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5% em relação ao mês anterior
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
              3 entregues esta semana
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
            <p className="text-xs text-success flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +48 esta semana
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Chart */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Receita dos últimos 7 dias</CardTitle>
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

        {/* Leaderboard */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Ranking de vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      user.position === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                      user.position === 2 ? 'bg-slate-300/20 text-slate-300' :
                      user.position === 3 ? 'bg-amber-600/20 text-amber-600' :
                      'bg-panel text-textSecondary'
                    }`}>
                      {user.position}º
                    </div>
                    <div>
                      <p className="text-sm font-medium text-textPrimary">{user.name}</p>
                      <p className="text-xs text-textSecondary">{user.sales} vendas ({user.projects} proj)</p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-success">
                    {formatCurrency(user.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
