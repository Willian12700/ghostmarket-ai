import { useState } from 'react'
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react'
import { useContractStore, Contract, CRMStatus } from '@/store/contractStore'
import { useToastStore } from '@/store/toastStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const COLUMNS: { id: CRMStatus, title: string, color: string }[] = [
  { id: 'Lead', title: 'Novos Leads', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { id: 'Contato', title: 'Em Contato', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  { id: 'Proposta', title: 'Negociação', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { id: 'Fechado', title: 'Venda Fechada', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
]

export const Contracts = () => {
  const { contracts, addContract, updateContract, deleteContract } = useContractStore()
  const { addToast } = useToastStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    client: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Lead' as CRMStatus
  })

  const [draggedId, setDraggedId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, status: CRMStatus) => {
    e.preventDefault()
    if (draggedId) {
      updateContract(draggedId, { status })
      setDraggedId(null)
    }
  }

  const handleOpenModal = (contract?: Contract) => {
    if (contract) {
      setEditingId(contract.id)
      setFormData({
        client: contract.client,
        amount: contract.amount.toString(),
        date: contract.date,
        status: contract.status
      })
    } else {
      setEditingId(null)
      setFormData({
        client: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Lead'
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.client || !formData.amount) {
      addToast('Preencha os campos obrigatórios.', 'error')
      return
    }

    if (editingId) {
      updateContract(editingId, {
        ...formData,
        amount: Number(formData.amount)
      })
      addToast('Card atualizado!', 'success')
    } else {
      addContract({
        ...formData,
        amount: Number(formData.amount)
      })
      addToast('Lead adicionado ao funil!', 'success')
    }
    
    setIsModalOpen(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Funil de Vendas (CRM)</h2>
          <p className="text-textSecondary">Arraste os cards para atualizar o status da negociação.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Card
        </Button>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const columnCards = contracts.filter(c => c.status === col.id)
          
          return (
            <div 
              key={col.id} 
              className="flex-1 min-w-[280px] bg-panel/50 border border-border rounded-xl flex flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-0.5 rounded text-xs font-semibold border ${col.color}`}>
                    {col.title}
                  </div>
                </div>
                <div className="text-sm font-medium text-textSecondary bg-background px-2 py-0.5 rounded-full">
                  {columnCards.length}
                </div>
              </div>

              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {columnCards.length === 0 ? (
                  <div className="h-24 flex items-center justify-center border-2 border-dashed border-border rounded-lg text-sm text-textSecondary/50">
                    Solte cards aqui
                  </div>
                ) : (
                  columnCards.map(card => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card.id)}
                      className="bg-panel border border-border hover:border-primary/50 rounded-lg p-3 cursor-grab active:cursor-grabbing shadow-sm transition-colors group relative"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white">{card.client}</h4>
                        <GripVertical className="w-4 h-4 text-textSecondary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-lg font-bold text-primary mb-2">
                        {formatCurrency(card.amount)}
                      </div>
                      <div className="flex items-center justify-between text-xs text-textSecondary">
                        <span>{new Date(card.date).toLocaleDateString('pt-BR')}</span>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(card)} className="p-1 hover:text-white transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteContract(card.id)} className="p-1 text-error hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-panel border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold">{editingId ? 'Editar Card' : 'Novo Card no Funil'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-textSecondary hover:text-white">x</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <Input
                label="Nome do Lead / Empresa"
                placeholder="Ex: Barbearia do João"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                required
              />
              <Input
                label="Valor Estimado (R$)"
                type="number"
                placeholder="997.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
              <Input
                label="Data"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary">Estágio do Funil</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as CRMStatus })}
                >
                  {COLUMNS.map(col => (
                    <option key={col.id} value={col.id}>{col.title}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
