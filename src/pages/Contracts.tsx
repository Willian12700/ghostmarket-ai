import { useState, useEffect } from 'react'
import { Plus, GripVertical, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useContractStore, Contract, CRMStatus } from '@/store/contractStore'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

const COLUMNS: { id: CRMStatus; title: string; color: string }[] = [
  { id: 'Lead', title: 'Lead (Prospect)', color: 'text-textSecondary border-border' },
  { id: 'Contato', title: 'Em Contato', color: 'text-primary border-primary/50' },
  { id: 'Proposta', title: 'Proposta Enviada', color: 'text-warning border-warning/50' },
  { id: 'Fechado', title: 'Venda Fechada', color: 'text-success border-success/50' },
]

function DroppableColumn({ col, children, count }: { col: typeof COLUMNS[0], children: React.ReactNode, count: number }) {
  const { setNodeRef, isOver } = useDroppable({
    id: col.id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] bg-panel/50 border rounded-xl flex flex-col transition-colors ${
        isOver ? 'border-primary shadow-[0_0_15px_rgba(139,92,246,0.3)] bg-primary/5' : 'border-border'
      }`}
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`px-2 py-0.5 rounded text-xs font-semibold border ${col.color}`}>
            {col.title}
          </div>
        </div>
        <div className="text-sm font-medium text-textSecondary bg-background px-2 py-0.5 rounded-full">
          {count}
        </div>
      </div>
      <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </div>
  )
}

function DraggableCard({ card, onEdit, onDelete }: { card: Contract, onEdit: (c: Contract) => void, onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: card
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-panel border border-border hover:border-primary/50 rounded-lg p-3 shadow-sm transition-colors group relative"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-white">{card.client}</h4>
        <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing p-1 -mt-1 -mr-1">
          <GripVertical className="w-4 h-4 text-textSecondary/30 hover:text-textSecondary transition-colors" />
        </div>
      </div>
      <div className="text-lg font-bold text-primary mb-2">
        {formatCurrency(card.amount)}
      </div>
      <div className="flex items-center justify-between text-xs text-textSecondary">
        <span>{new Date(card.date).toLocaleDateString('pt-BR')}</span>
        
        <div className="flex gap-1">
          <button onClick={() => onEdit(card)} className="p-1 hover:text-white transition-colors cursor-pointer relative z-10">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(card.id)} className="p-1 text-error hover:text-red-400 transition-colors cursor-pointer relative z-10">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export const Contracts = () => {
  const { user } = useAuthStore()
  const { contracts, addContract, updateContract, deleteContract, syncContracts } = useContractStore()
  const { addToast } = useToastStore()

  useEffect(() => {
    if (user?.email) {
      const unsubscribe = syncContracts(user.email)
      return () => unsubscribe()
    }
  }, [user])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    client: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Lead' as CRMStatus
  })

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.data.current) {
      const newStatus = over.id as CRMStatus;
      const currentContract = active.data.current as Contract;
      
      if (currentContract.status !== newStatus) {
        updateContract(currentContract.id, { status: newStatus });
        addToast('Status atualizado!', 'success');
      }
    }
  };

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
      if (user?.email) {
        addContract(user.email, {
          ...formData,
          amount: Number(formData.amount)
        })
        addToast('Lead adicionado ao funil!', 'success')
      }
    }
    
    setIsModalOpen(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const activeContract = activeId ? contracts.find(c => c.id === activeId) : null;

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Funil de Vendas (CRM)</h2>
          <p className="text-textSecondary">Arraste os cards para atualizar o status da negociação.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          <Plus className="w-4 h-4 mr-2" />
          Novo Card
        </Button>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {COLUMNS.map(col => {
            const columnCards = contracts.filter(c => c.status === col.id)
            
            return (
              <DroppableColumn key={col.id} col={col} count={columnCards.length}>
                {columnCards.length === 0 ? (
                  <div className="h-24 flex items-center justify-center border-2 border-dashed border-border rounded-lg text-sm text-textSecondary/50">
                    Solte cards aqui
                  </div>
                ) : (
                  columnCards.map(card => (
                    <DraggableCard 
                      key={card.id} 
                      card={card} 
                      onEdit={handleOpenModal} 
                      onDelete={deleteContract} 
                    />
                  ))
                )}
              </DroppableColumn>
            )
          })}
        </div>

        <DragOverlay>
          {activeContract ? (
            <div className="bg-panel border border-primary rounded-lg p-3 shadow-[0_0_30px_rgba(139,92,246,0.3)] opacity-90 scale-105 transform rotate-2">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-white">{activeContract.client}</h4>
                <GripVertical className="w-4 h-4 text-primary" />
              </div>
              <div className="text-lg font-bold text-primary mb-2">
                {formatCurrency(activeContract.amount)}
              </div>
              <div className="flex items-center justify-between text-xs text-textSecondary">
                <span>{new Date(activeContract.date).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-panel border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/50">
              <h3 className="text-lg font-bold text-white">{editingId ? 'Editar Card' : 'Novo Card no Funil'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-textSecondary hover:text-white transition-colors">x</button>
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
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
                <Button type="submit" className="shadow-[0_0_15px_rgba(139,92,246,0.3)]">
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
