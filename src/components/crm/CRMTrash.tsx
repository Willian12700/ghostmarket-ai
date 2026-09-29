import { useState } from 'react'
import { useDigitalizaStore } from '@/store/digitalizaStore'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { RefreshCcw, Trash, AlertTriangle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface CRMTrashProps {
  onClose: () => void
}

export function CRMTrash({ onClose }: CRMTrashProps) {
  const { contracts, restoreContract, permanentDelete } = useDigitalizaStore()
  const [searchTerm, setSearchTerm] = useState('')

  const deletedContracts = contracts.filter(c => c.isDeleted)
  
  const filteredContracts = deletedContracts.filter(c => 
    c.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRestore = async (id: string) => {
    await restoreContract(id)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Aviso: Esta ação é irreversível. Deseja excluir permanentemente este lead?')) {
      await permanentDelete(id)
    }
  }

  return (
    <div className="flex flex-col h-full absolute inset-0 px-4 md:px-8 pb-4 bg-background z-20">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onClose} className="px-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trash className="w-5 h-5 text-red-400" />
              Lixeira
            </h2>
            <p className="text-xs text-textSecondary">Leads excluídos permanecem aqui e podem ser restaurados.</p>
          </div>
        </div>

        <input 
          type="text" 
          placeholder="Buscar na lixeira..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-xs bg-surface border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-400/50 transition-colors"
        />
      </div>

      {deletedContracts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-surface/30 border border-white/5 rounded-xl">
          <Trash className="w-12 h-12 text-white/10 mb-4" />
          <h3 className="text-lg font-medium text-white mb-1">Lixeira Vazia</h3>
          <p className="text-sm text-textSecondary">Não há leads excluídos no momento.</p>
        </div>
      ) : (
        <div className="flex-1 bg-surface/50 border border-white/5 rounded-xl overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left text-sm text-textSecondary whitespace-nowrap">
              <thead className="bg-surface border-b border-white/5 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-medium text-white">Contato / Empresa</th>
                  <th className="px-4 py-3 font-medium text-white">Status Original</th>
                  <th className="px-4 py-3 font-medium text-white">Data de Exclusão</th>
                  <th className="px-4 py-3 font-medium text-white text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map(contract => (
                  <tr 
                    key={contract.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{contract.client}</div>
                      <div className="text-xs text-textSecondary">{contract.company || contract.email || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-surface border border-white/10 rounded-md text-xs opacity-50">
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {contract.deletedAt ? format(new Date(contract.deletedAt), "dd 'de' MMM, yyyy 'às' HH:mm", { locale: ptBR }) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button 
                        onClick={() => handleRestore(contract.id)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-md text-xs font-medium transition-colors"
                        title="Restaurar"
                      >
                        <RefreshCcw className="w-3.5 h-3.5 inline-block mr-1" />
                        Restaurar
                      </button>
                      <button 
                        onClick={() => handleDelete(contract.id)}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md text-xs font-medium transition-colors"
                        title="Excluir Permanentemente"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 inline-block mr-1" />
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredContracts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-textSecondary">
                      Nenhum resultado encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
