import { useState, useEffect } from 'react'
import { Plus, GripVertical, Edit2, Trash2, UserCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useDigitalizaStore, DigitalizaContract, CRMStatus } from '@/store/digitalizaStore'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'

const COLUMNS: { id: CRMStatus; title: string; color: string }[] = [
  { id: 'Lead', title: 'Lead (Prospect)', color: 'text-textSecondary border-border' },
  { id: 'Contato', title: 'Em Contato', color: 'text-primary border-primary/50' },
  { id: 'Proposta', title: 'Proposta Enviada', color: 'text-warning border-warning/50' },
  { id: 'Fechado', title: 'Venda Fechada', color: 'text-success border-success/50' },
]

export const ALLOWED_EMAILS = [
  'oliveiramirandaisaac@gmail.com',
  'josehenrique9373@gmail.com',
  'kaios8252@gmail.com',
  'daviizcl.0003@gmail.com',
  'el6084905@gmail.com',
  'adrianodeoliveiracarneiro13@gmail.com',
  'caioqsilva09@gmail.com',
  'willrandrier@gmail.com'
]

function DroppableColumn({ col, children, count }: { col: typeof COLUMNS[0], children: React.ReactNode, count: number }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  return (
    <div 
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] bg-panel/50 border rounded-xl flex flex-col transition-colors ${isOver ? 'border-primary shadow-[0_0_15px_rgba(139,92,246,0.3)] bg-primary/5' : 'border-border'}`}
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

function DraggableCard({ card, onEdit, onDelete }: { card: DigitalizaContract, onEdit: (c: DigitalizaContract) => void, onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.id })
  const style = { transform: CSS.Transform.toString(transform), opacity: isDragging ? 0.4 : 1 }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="bg-background border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors group relative"
    >
      <div className="flex items-start gap-2">
        <div {...attributes} {...listeners} className="mt-1 text-textMuted hover:text-textSecondary">
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-textPrimary truncate pr-2">{card.client}</h4>
            <span className="text-sm font-medium text-success whitespace-nowrap">
              R$ {card.amount.toLocaleString('pt-BR')}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {card.phone && <span className="text-[10px] bg-white/5 text-textSecondary px-1.5 py-0.5 rounded border border-white/5">{card.phone}</span>}
            {card.instagram && <span className="text-[10px] bg-white/5 text-textSecondary px-1.5 py-0.5 rounded border border-white/5">{card.instagram}</span>}
            {card.city && <span className="text-[10px] bg-white/5 text-textSecondary px-1.5 py-0.5 rounded border border-white/5">{card.city}</span>}
          </div>

          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-border">
            <UserCircle2 className="w-3.5 h-3.5 text-textMuted" />
            <span className="text-[10px] text-textMuted truncate">{card.addedByName || card.addedByEmail.split('@')[0]}</span>
          </div>
        </div>
      </div>
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
        <button onClick={() => onEdit(card)} className="p-1.5 bg-background/80 hover:bg-white/10 rounded-md text-textSecondary hover:text-primary backdrop-blur-sm">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(card.id)} className="p-1.5 bg-background/80 hover:bg-danger/20 rounded-md text-textSecondary hover:text-danger backdrop-blur-sm">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export const DigitalizaCRM = () => {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  const { contracts, isSynced, syncContracts, addContract, updateContract, deleteContract } = useDigitalizaStore()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    client: '',
    amount: '',
    phone: '',
    instagram: '',
    city: '',
    status: 'Lead' as CRMStatus
  })

  useEffect(() => {
    if (user?.email && ALLOWED_EMAILS.includes(user.email.toLowerCase())) {
      const unsubscribe = syncContracts()
      return () => unsubscribe()
    }
  }, [user])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const cardId = active.id as string
      const newStatus = over.id as CRMStatus
      
      const card = contracts.find(c => c.id === cardId)
      if (card && card.status !== newStatus) {
        await updateContract(cardId, { status: newStatus })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.client || !formData.amount) {
      addToast('Preencha o nome do cliente e o valor!', 'error')
      return
    }

    try {
      if (editingId) {
        await updateContract(editingId, {
          client: formData.client,
          amount: Number(formData.amount),
          phone: formData.phone,
          instagram: formData.instagram,
          city: formData.city,
          status: formData.status
        })
        addToast('Lead atualizado com sucesso!', 'success')
      } else {
        await addContract({
          client: formData.client,
          amount: Number(formData.amount),
          phone: formData.phone,
          instagram: formData.instagram,
          city: formData.city,
          status: formData.status,
          date: new Date().toISOString().split('T')[0],
          addedByEmail: user?.email || 'Desconhecido',
          addedByName: user?.displayName || user?.email?.split('@')[0] || 'Desconhecido'
        })
        addToast('Novo lead adicionado!', 'success')
      }
      setIsModalOpen(false)
      setEditingId(null)
      setFormData({ client: '', amount: '', phone: '', instagram: '', city: '', status: 'Lead' })
    } catch (error) {
      addToast('Erro ao salvar lead', 'error')
    }
  }

  const openEdit = (card: DigitalizaContract) => {
    setFormData({
      client: card.client,
      amount: card.amount.toString(),
      phone: card.phone || '',
      instagram: card.instagram || '',
      city: card.city || '',
      status: card.status
    })
    setEditingId(card.id)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lead do CRM Compartilhado?')) {
      await deleteContract(id)
      addToast('Lead removido', 'success')
    }
  }

  if (!user?.email || !ALLOWED_EMAILS.includes(user.email.toLowerCase())) {
    return (
      <div className="flex-1 p-4 md:p-8 flex items-center justify-center relative min-h-[calc(100vh-64px)] overflow-hidden">
        <AnimatedBackground />
        <div className="text-center z-10">
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h2>
          <p className="text-textSecondary">Você não tem permissão para acessar o CRM da Digitaliza Comercial.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 md:p-8 flex flex-col h-[calc(100vh-64px)] relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 z-10 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            Digitaliza CRM <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-md tracking-widest border border-primary/30">SHARED BOARD</span>
          </h1>
          <p className="text-textSecondary mt-1">CRM Compartilhado - Equipe Digitaliza Comercial</p>
        </div>
        <Button onClick={() => {
          setEditingId(null)
          setFormData({ client: '', amount: '', phone: '', instagram: '', city: '', status: 'Lead' })
          setIsModalOpen(true)
        }} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Adicionar Lead
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar z-10 pb-4">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full min-h-[500px]">
            {COLUMNS.map(col => {
              const columnCards = contracts.filter(c => c.status === col.id)
              return (
                <DroppableColumn key={col.id} col={col} count={columnCards.length}>
                  {columnCards.map(card => (
                    <DraggableCard key={card.id} card={card} onEdit={openEdit} onDelete={handleDelete} />
                  ))}
                </DroppableColumn>
              )
            })}
          </div>
          <DragOverlay>
            {activeId ? (
              <div className="bg-background border border-primary/50 shadow-2xl rounded-lg p-3 opacity-90 scale-105 rotate-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-textPrimary">{contracts.find(c => c.id === activeId)?.client}</h4>
                  <span className="text-sm text-success">R$ {contracts.find(c => c.id === activeId)?.amount}</span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">{editingId ? 'Editar Lead' : 'Novo Lead'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">Nome da Empresa / Cliente</label>
                <Input value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} placeholder="Ex: Padaria do Zé" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">Possível Valor (R$)</label>
                  <Input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="1500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value as CRMStatus})}
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-textPrimary outline-none focus:border-primary"
                  >
                    {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">Telefone / WhatsApp</label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(11) 99999-9999" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">Instagram</label>
                  <Input value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} placeholder="@empresa" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">Cidade</label>
                  <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="São Paulo" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                <Button type="button" variant="ghost" onClick={() => {setIsModalOpen(false); setEditingId(null)}}>Cancelar</Button>
                <Button type="submit">{editingId ? 'Salvar Alterações' : 'Adicionar ao Board'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
