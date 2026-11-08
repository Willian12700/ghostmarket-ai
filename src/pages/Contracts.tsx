import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  MessageCircle,
  Wand2,
  FileText,
  Search,
  MapPin,
  Briefcase,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useContractStore, Contract, CRMStatus } from '@/store/contractStore'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

const COLUMNS: { id: CRMStatus; title: string; dot: string; badge: string }[] = [
  { id: 'Lead', title: 'Lead (Prospect)', dot: 'bg-zinc-400', badge: 'text-zinc-300 border-zinc-700 bg-zinc-900' },
  { id: 'Contato', title: 'Em Contato', dot: 'bg-blue-400', badge: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  { id: 'Proposta', title: 'Proposta Enviada', dot: 'bg-amber-400', badge: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { id: 'Fechado', title: 'Venda Fechada', dot: 'bg-emerald-400', badge: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' }
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))

function DroppableColumn({
  col,
  children,
  count,
  totalAmount
}: {
  col: (typeof COLUMNS)[0]
  children: React.ReactNode
  count: number
  totalAmount: number
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: col.id
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[295px] bg-[#0E0E11] border rounded-xl flex flex-col transition-colors ${
        isOver ? 'border-zinc-500 bg-[#121216]' : 'border-zinc-800/80'
      }`}
    >
      <div className="p-3.5 border-b border-zinc-800/80 bg-[#09090B]/60 rounded-t-xl">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${col.dot}`} />
            <span className="text-xs font-semibold text-zinc-200">{col.title}</span>
          </div>
          <span className="text-[11px] font-mono font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md tabular-nums">
            {count}
          </span>
        </div>
        <div className="text-xs font-mono text-zinc-500 tabular-nums">
          Total: <span className="text-zinc-300 font-semibold">{formatCurrency(totalAmount)}</span>
        </div>
      </div>
      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto custom-scrollbar">{children}</div>
    </div>
  )
}

function DraggableCard({
  card,
  onEdit,
  onDelete,
  onOpenCreator,
  onOpenProposal
}: {
  card: Contract
  onEdit: (c: Contract) => void
  onDelete: (id: string) => void
  onOpenCreator: (c: Contract) => void
  onOpenProposal: (c: Contract) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: card
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1
  }

  const cleanPhone = (card.phone || '').replace(/\D/g, '')

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Olá ${card.client}, tudo bem?`)
    if (cleanPhone) {
      const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
      window.open(`https://wa.me/${fullPhone}?text=${msg}`, '_blank')
    } else {
      window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank')
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-[#09090B] border border-zinc-800/90 hover:border-zinc-700 rounded-xl p-3.5 transition-all group relative"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h4 className="font-semibold text-[13px] text-zinc-100 truncate">{card.client}</h4>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {card.niche && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                <Briefcase className="w-2.5 h-2.5" />
                {card.niche}
              </span>
            )}
            {card.city && (
              <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
                <MapPin className="w-2.5 h-2.5" />
                {card.city}
              </span>
            )}
          </div>
        </div>
        <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing p-1 -mt-1 -mr-1 text-zinc-600 hover:text-zinc-300">
          <GripVertical className="w-4 h-4" />
        </div>
      </div>

      <div className="text-base font-bold text-white tabular-nums mb-2">{formatCurrency(card.amount)}</div>

      {card.notes && (
        <p className="text-[11px] text-zinc-500 line-clamp-2 mb-2.5 bg-zinc-900/60 border border-zinc-800/60 rounded-lg px-2.5 py-1.5">
          {card.notes}
        </p>
      )}

      {/* Quick Action Bar */}
      <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/70 text-xs text-zinc-500">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleWhatsApp}
            title={cleanPhone ? `Chamar no WhatsApp (${card.phone})` : 'Enviar mensagem no WhatsApp'}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3 h-3" />
            <span>Zap</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenCreator(card)}
            title="Gerar script personalizado no Creator IA"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[10px] font-medium transition-colors cursor-pointer"
          >
            <Wand2 className="w-3 h-3" />
            <span>IA</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenProposal(card)}
            title="Gerar Proposta Comercial em PDF"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[10px] font-medium transition-colors cursor-pointer"
          >
            <FileText className="w-3 h-3" />
            <span>PDF</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(card)}
            className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
            title="Editar"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(card.id)}
            className="p-1 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
            title="Excluir"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export const Contracts = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { contracts, addContract, updateContract, deleteContract, syncContracts } = useContractStore()
  const { addToast } = useToastStore()

  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    client: '',
    amount: '',
    phone: '',
    niche: '',
    city: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Lead' as CRMStatus
  })

  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (user?.email) {
      const unsubscribe = syncContracts(user.email)
      return () => unsubscribe()
    }
  }, [user, syncContracts])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(KeyboardSensor)
  )

  const filteredContracts = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return contracts
    return contracts.filter(
      c =>
        c.client?.toLowerCase().includes(q) ||
        c.niche?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
    )
  }, [contracts, search])

  const metrics = useMemo(() => {
    const closed = contracts.filter(c => c.status === 'Fechado')
    const open = contracts.filter(c => c.status !== 'Fechado')
    const closedTotal = closed.reduce((sum, c) => sum + Number(c.amount || 0), 0)
    const openTotal = open.reduce((sum, c) => sum + Number(c.amount || 0), 0)
    const convRate = contracts.length > 0 ? (closed.length / contracts.length) * 100 : 0
    return { closedTotal, openTotal, convRate, totalCount: contracts.length, closedCount: closed.length }
  }, [contracts])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.data.current) {
      const newStatus = over.id as CRMStatus
      const currentContract = active.data.current as Contract

      if (currentContract.status !== newStatus) {
        updateContract(currentContract.id, { status: newStatus })
        addToast(
          newStatus === 'Fechado'
            ? 'Venda fechada! Valor contabilizado no seu Dashboard.'
            : `Card movido para ${newStatus}!`,
          'success'
        )
      }
    }
  }

  const handleOpenModal = (contract?: Contract) => {
    if (contract) {
      setEditingId(contract.id)
      setFormData({
        client: contract.client,
        amount: contract.amount.toString(),
        phone: contract.phone || '',
        niche: contract.niche || '',
        city: contract.city || '',
        notes: contract.notes || '',
        date: contract.date,
        status: contract.status
      })
    } else {
      setEditingId(null)
      setFormData({
        client: '',
        amount: '',
        phone: '',
        niche: '',
        city: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Lead'
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.client || !formData.amount) {
      addToast('Preencha o nome do cliente e o valor.', 'error')
      return
    }

    const payload = {
      client: formData.client.trim(),
      amount: Number(formData.amount),
      phone: formData.phone.trim(),
      niche: formData.niche.trim(),
      city: formData.city.trim(),
      notes: formData.notes.trim(),
      date: formData.date,
      status: formData.status
    }

    if (editingId) {
      updateContract(editingId, payload)
      addToast('Negociação atualizada!', 'success')
    } else {
      if (user?.email) {
        addContract(user.email, payload)
        addToast('Lead adicionado ao pipeline!', 'success')
      }
    }

    setIsModalOpen(false)
  }

  const handleOpenCreator = (card: Contract) => {
    const params = new URLSearchParams()
    if (card.client) params.set('clientName', card.client)
    if (card.niche) params.set('niche', card.niche)
    if (card.phone) params.set('phone', card.phone)
    navigate(`/creator?${params.toString()}`)
  }

  const handleOpenProposal = (card: Contract) => {
    const params = new URLSearchParams()
    if (card.client) params.set('client', card.client)
    if (card.amount) params.set('amount', String(card.amount))
    navigate(`/proposta?${params.toString()}`)
  }

  const activeContract = activeId ? contracts.find(c => c.id === activeId) : null

  return (
    <div className="space-y-5 h-[calc(100vh-110px)] flex flex-col">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">Pipeline Comercial (CRM Kanban)</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Arraste os cards entre as etapas. Vendas na coluna <strong className="text-zinc-300">Venda Fechada</strong> somam automaticamente no seu Dashboard.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filtrar cliente, nicho..."
              className="h-9 pl-8 pr-3 rounded-lg bg-[#0E0E11] border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 w-48 sm:w-56"
            />
          </div>
          <Button onClick={() => handleOpenModal()} className="h-9 px-4 text-xs font-semibold">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-500 font-medium block">Em Negociação</span>
            <span className="text-lg font-bold text-zinc-100 tabular-nums">{formatCurrency(metrics.openTotal)}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-500 font-medium block">Vendas Fechadas</span>
            <span className="text-lg font-bold text-emerald-400 tabular-nums">{formatCurrency(metrics.closedTotal)}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-500 font-medium block">Taxa de Fechamento</span>
            <span className="text-lg font-bold text-zinc-100 tabular-nums">{metrics.convRate.toFixed(1)}%</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-500 font-medium block">Total de Leads</span>
            <span className="text-lg font-bold text-zinc-100 tabular-nums">{metrics.totalCount}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex-1 flex gap-3.5 overflow-x-auto pb-3 custom-scrollbar min-h-0">
          {COLUMNS.map(col => {
            const colCards = filteredContracts.filter(c => c.status === col.id)
            const totalAmount = colCards.reduce((sum, c) => sum + Number(c.amount || 0), 0)
            return (
              <DroppableColumn key={col.id} col={col} count={colCards.length} totalAmount={totalAmount}>
                {colCards.map(card => (
                  <DraggableCard
                    key={card.id}
                    card={card}
                    onEdit={handleOpenModal}
                    onDelete={deleteContract}
                    onOpenCreator={handleOpenCreator}
                    onOpenProposal={handleOpenProposal}
                  />
                ))}
              </DroppableColumn>
            )
          })}
        </div>

        <DragOverlay>
          {activeContract ? (
            <div className="bg-[#0E0E11] border-2 border-zinc-400 rounded-xl p-3.5 shadow-2xl opacity-95 w-[280px] rotate-2 cursor-grabbing">
              <div className="flex items-start justify-between mb-1.5">
                <h4 className="font-semibold text-sm text-white">{activeContract.client}</h4>
                <GripVertical className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="text-base font-bold text-emerald-400 tabular-nums mb-1">
                {formatCurrency(activeContract.amount)}
              </div>
              <div className="text-[11px] text-zinc-500">
                {new Date(activeContract.date).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modal Add / Edit Lead */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E0E11] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingId ? 'Editar Negociação' : 'Adicionar Lead ao Pipeline'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3.5">
              <Input
                label="Nome da Empresa / Cliente *"
                placeholder="Ex: Clínica Odonto Prime"
                value={formData.client}
                onChange={e => setFormData({ ...formData, client: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Valor do Contrato (R$) *"
                  type="number"
                  placeholder="Ex: 1500"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                />
                <Input
                  label="WhatsApp / Telefone"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Nicho / Segmento"
                  placeholder="Ex: Odontologia"
                  value={formData.niche}
                  onChange={e => setFormData({ ...formData, niche: e.target.value })}
                />
                <Input
                  label="Cidade"
                  placeholder="Ex: São Paulo"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Data"
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Etapa do Funil</label>
                  <select
                    className="w-full h-10 px-3 rounded-lg bg-[#09090B] border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-600"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as CRMStatus })}
                  >
                    {COLUMNS.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Observações / Próximo Passo</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ex: Cliente pediu proposta de Landing Page + Chatbot para sexta-feira..."
                  className="w-full rounded-lg bg-[#09090B] border border-zinc-800 p-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar no CRM</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
