import { useDigitalizaStore } from '@/store/digitalizaStore'
import { Card } from '@/components/ui/Card'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'

export function CRMAnalytics() {
  const { contracts } = useDigitalizaStore()

  // 1. Leads by Status
  const statusCounts = contracts.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))

  // 2. Expected Value by Status
  const valueByStatus = contracts.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + c.amount
    return acc
  }, {} as Record<string, number>)

  const valueData = Object.entries(valueByStatus).map(([name, value]) => ({ name, value }))

  // 3. Leads by Priority
  const priorityCounts = contracts.reduce((acc, c) => {
    const p = c.priority || 'Sem prioridade'
    acc[p] = (acc[p] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const priorityData = Object.entries(priorityCounts).map(([name, value]) => ({ name, value }))
  
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280']

  return (
    <div className="h-full absolute inset-0 overflow-y-auto custom-scrollbar px-4 md:px-8 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Card className="p-6 border-white/5 bg-surface/50">
          <h3 className="text-lg font-bold text-white mb-6">Leads por Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-white/5 bg-surface/50">
          <h3 className="text-lg font-bold text-white mb-6">Valor Estimado por Status (R$)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valueData}>
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${val}`} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                  formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
                />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-white/5 bg-surface/50">
          <h3 className="text-lg font-bold text-white mb-6">Prioridade dos Leads</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="flex flex-col gap-2 ml-8">
              {priorityData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm text-textSecondary">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  {entry.name}: <span className="text-white font-medium">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}
