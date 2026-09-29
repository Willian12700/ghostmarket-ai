import { useState } from 'react'
import { useDigitalizaStore } from '@/store/digitalizaStore'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CRMTableProps {
  onSelectLead: (id: string) => void
}

export function CRMTable({ onSelectLead }: CRMTableProps) {
  const { contracts } = useDigitalizaStore()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredContracts = contracts.filter(c => 
    !c.isDeleted &&
    (c.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getPriorityBadge = (priority?: string) => {
    switch(priority) {
      case 'alta': return <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded-md text-xs">Alta</span>
      case 'media': return <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-md text-xs">Média</span>
      case 'baixa': return <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded-md text-xs">Baixa</span>
      default: return null
    }
  }

  return (
    <div className="flex flex-col h-full absolute inset-0 px-4 md:px-8 pb-4">
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Buscar leads, empresas, emails..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md bg-surface border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="flex-1 bg-surface/50 border border-white/5 rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-sm text-textSecondary whitespace-nowrap">
            <thead className="bg-surface border-b border-white/5 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-medium text-white">Contato / Empresa</th>
                <th className="px-4 py-3 font-medium text-white">Status</th>
                <th className="px-4 py-3 font-medium text-white">Valor</th>
                <th className="px-4 py-3 font-medium text-white">Prioridade</th>
                <th className="px-4 py-3 font-medium text-white">Última Interação</th>
                <th className="px-4 py-3 font-medium text-white">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map(contract => (
                <tr 
                  key={contract.id} 
                  onClick={() => onSelectLead(contract.id)}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{contract.client}</div>
                    <div className="text-xs text-textSecondary">{contract.company || contract.email || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-surface border border-white/10 rounded-md text-xs">
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-success">
                    R$ {contract.amount.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    {getPriorityBadge(contract.priority)}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {contract.lastInteraction ? format(new Date(contract.lastInteraction), "dd 'de' MMM, yyyy", { locale: ptBR }) : '-'}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {contract.responsible || '-'}
                  </td>
                </tr>
              ))}
              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-textSecondary">
                    Nenhum lead encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
