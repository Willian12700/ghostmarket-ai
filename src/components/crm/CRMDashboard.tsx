import { useDigitalizaStore } from '@/store/digitalizaStore'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Users, TrendingUp, DollarSign, CheckCircle2, LayoutGrid, List, BarChart2, Plus } from 'lucide-react'

interface CRMDashboardProps {
  view: 'kanban' | 'table' | 'analytics'
  setView: (view: 'kanban' | 'table' | 'analytics') => void
  onNewLead: () => void
}

export function CRMDashboard({ view, setView, onNewLead }: CRMDashboardProps) {
  const { contracts } = useDigitalizaStore()

  const totalContacts = contracts.length
  const newLeads = contracts.filter(c => c.status === 'Novo').length
  const inNegotiation = contracts.filter(c => ['Qualificado', 'Proposta', 'Negociação'].includes(c.status)).length
  const converted = contracts.filter(c => c.status === 'Fechado').length
  
  const conversionRate = totalContacts > 0 ? Math.round((converted / totalContacts) * 100) : 0

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 shrink-0 z-10 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Centro de Comando <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-md tracking-widest border border-primary/30">CRM</span>
          </h1>
          <p className="text-textSecondary mt-1">Gerencie seus contatos, oportunidades e funil de vendas</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-surface border border-white/5 rounded-lg p-1">
            <button
              onClick={() => setView('kanban')}
              className={`p-2 rounded-md transition-colors flex items-center justify-center ${view === 'kanban' ? 'bg-primary/20 text-primary' : 'text-textSecondary hover:text-white'}`}
              title="Kanban"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('table')}
              className={`p-2 rounded-md transition-colors flex items-center justify-center ${view === 'table' ? 'bg-primary/20 text-primary' : 'text-textSecondary hover:text-white'}`}
              title="Tabela"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('analytics')}
              className={`p-2 rounded-md transition-colors flex items-center justify-center ${view === 'analytics' ? 'bg-primary/20 text-primary' : 'text-textSecondary hover:text-white'}`}
              title="Analytics"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
          </div>
          
          <Button onClick={onNewLead} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Contato
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 flex flex-col gap-2 border-white/5 bg-surface/50 backdrop-blur-md">
          <div className="flex items-center gap-2 text-textSecondary text-sm font-medium">
            <Users className="w-4 h-4 text-primary" />
            Total de Contatos
          </div>
          <div className="text-2xl font-bold text-white">{totalContacts}</div>
        </Card>
        
        <Card className="p-4 flex flex-col gap-2 border-white/5 bg-surface/50 backdrop-blur-md">
          <div className="flex items-center gap-2 text-textSecondary text-sm font-medium">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Novos Leads
          </div>
          <div className="text-2xl font-bold text-white">{newLeads}</div>
        </Card>
        
        <Card className="p-4 flex flex-col gap-2 border-white/5 bg-surface/50 backdrop-blur-md">
          <div className="flex items-center gap-2 text-textSecondary text-sm font-medium">
            <DollarSign className="w-4 h-4 text-yellow-400" />
            Em Negociação
          </div>
          <div className="text-2xl font-bold text-white">{inNegotiation}</div>
        </Card>
        
        <Card className="p-4 flex flex-col gap-2 border-white/5 bg-surface/50 backdrop-blur-md">
          <div className="flex items-center gap-2 text-textSecondary text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-success" />
            Convertidos
          </div>
          <div className="text-2xl font-bold text-white">{converted}</div>
        </Card>
        
        <Card className="p-4 flex flex-col gap-2 border-white/5 bg-surface/50 backdrop-blur-md">
          <div className="flex items-center gap-2 text-textSecondary text-sm font-medium">
            <BarChart2 className="w-4 h-4 text-purple-400" />
            Conversão
          </div>
          <div className="text-2xl font-bold text-white">{conversionRate}%</div>
        </Card>
      </div>
    </div>
  )
}
