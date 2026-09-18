import { useState } from 'react'
import { Plus, Edit2, Trash2, FileText } from 'lucide-react'
import { useContractStore, Contract } from '@/store/contractStore'
import { useToastStore } from '@/store/toastStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export const Contracts = () => {
  const { contracts, addContract, updateContract, deleteContract } = useContractStore()
  const { addToast } = useToastStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    client: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Ativo' as 'Ativo' | 'Finalizado'
  })

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
        status: 'Ativo'
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
      addToast('Contrato atualizado!', 'success')
    } else {
      addContract({
        ...formData,
        amount: Number(formData.amount)
      })
      addToast('Contrato criado com sucesso!', 'success')
    }
    
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este contrato?')) {
      deleteContract(id)
      addToast('Contrato excluído!', 'info')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Contratos</h2>
          <p className="text-textSecondary">Total: {contracts.length} contratos</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo contrato
        </Button>
      </div>

      <Card className="overflow-hidden">
        {contracts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-panelHover text-textSecondary border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Cliente</th>
                  <th className="px-6 py-4 font-medium">Valor</th>
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-panelHover/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-textPrimary">{contract.client}</td>
                    <td className="px-6 py-4 text-primary">{formatCurrency(contract.amount)}</td>
                    <td className="px-6 py-4 text-textSecondary">
                      {new Date(contract.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                        contract.status === 'Ativo' 
                          ? 'bg-success/10 text-success border-success/20' 
                          : 'bg-panel text-textSecondary border-border'
                      }`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(contract)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(contract.id)} className="text-error hover:bg-error/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-panelHover rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-textSecondary" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Nenhum contrato cadastrado</h3>
            <p className="text-textSecondary mb-6">Comece adicionando seu primeiro contrato.</p>
            <Button onClick={() => handleOpenModal()}>
              Novo contrato
            </Button>
          </div>
        )}
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-panel border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold">{editingId ? 'Editar Contrato' : 'Novo Contrato'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-textSecondary hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <Input
                label="Nome do cliente"
                placeholder="Ex: Empresa XYZ"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                required
              />
              <Input
                label="Valor (R$)"
                type="number"
                placeholder="0.00"
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
                <label className="text-sm font-medium text-textSecondary">Status</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Salvar contrato
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
