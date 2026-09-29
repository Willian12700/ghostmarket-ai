import { useState, useEffect } from 'react'
import { useDigitalizaStore } from '@/store/digitalizaStore'
import { Search, Command, ArrowRight, User, Trash2 } from 'lucide-react'

interface CRMCommandPaletteProps {
  onClose: () => void
  onSelectLead: (id: string) => void
  onOpenTrash: () => void
}

export function CRMCommandPalette({ onClose, onSelectLead, onOpenTrash }: CRMCommandPaletteProps) {
  const { contracts } = useDigitalizaStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const activeContracts = contracts.filter(c => !c.isDeleted)

  const filtered = activeContracts.filter(c => 
    c.client.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase()) || 
    c.company?.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 10) // show top 10

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-background/50">
          <Search className="w-5 h-5 text-textSecondary" />
          <input 
            type="text" 
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar leads, contatos, ou comandos..." 
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-textSecondary"
          />
          <div className="flex items-center gap-1 text-xs text-textSecondary bg-white/5 px-2 py-1 rounded">
            <span className="font-mono">ESC</span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
          {search === '' && (
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-textSecondary mb-2 uppercase tracking-wider">Ações Rápidas</h3>
              
              <button 
                onClick={() => { onClose(); onOpenTrash(); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
              >
                <div className="w-8 h-8 rounded-md bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white group-hover:text-primary transition-colors">Acessar Lixeira</div>
                  <div className="text-xs text-textSecondary">Visualizar e restaurar leads excluídos</div>
                </div>
                <ArrowRight className="w-4 h-4 text-textSecondary group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
              </button>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-textSecondary mb-2 uppercase tracking-wider">Leads Encontrados</h3>
              <div className="flex flex-col gap-1">
                {filtered.map(lead => (
                  <button 
                    key={lead.id}
                    onClick={() => {
                      onSelectLead(lead.id)
                      onClose()
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white group-hover:text-primary transition-colors">{lead.client}</div>
                      <div className="text-xs text-textSecondary truncate">{lead.company || lead.email || 'Sem empresa'} • {lead.status}</div>
                    </div>
                    <span className="text-xs text-success mr-2">R$ {lead.amount.toLocaleString('pt-BR')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {search !== '' && filtered.length === 0 && (
            <div className="py-8 text-center text-textSecondary text-sm">
              Nenhum resultado encontrado para "{search}"
            </div>
          )}
        </div>
        
        <div className="bg-background/80 border-t border-white/5 px-4 py-2 flex items-center justify-between text-xs text-textSecondary">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Command className="w-3 h-3" /> para abrir</span>
            <span>Use as setas para navegar</span>
          </div>
          <span>Digitaliza CRM</span>
        </div>
      </div>
    </div>
  )
}
