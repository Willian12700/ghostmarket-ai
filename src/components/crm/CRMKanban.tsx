import { useState } from 'react'
import { useDigitalizaStore, CRMStatus, DigitalizaContract } from '@/store/digitalizaStore'
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent, useDroppable, useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, DollarSign, Building, CheckSquare } from 'lucide-react'

interface CRMKanbanProps {
  onSelectLead: (id: string) => void
}

const COLUMNS: { id: CRMStatus; title: string; color: string }[] = [
  { id: 'Novo', title: 'Novo Lead', color: 'border-blue-500/50' },
  { id: 'Contato', title: 'Em Contato', color: 'border-yellow-500/50' },
  { id: 'Qualificado', title: 'Qualificado', color: 'border-purple-500/50' },
  { id: 'Proposta', title: 'Proposta', color: 'border-orange-500/50' },
  { id: 'Negociação', title: 'Negociação', color: 'border-pink-500/50' },
  { id: 'Fechado', title: 'Fechado', color: 'border-green-500/50' },
  { id: 'Perdido', title: 'Perdido', color: 'border-red-500/50' }
]

function DroppableColumn({ col, count, children }: { col: typeof COLUMNS[0], count: number, children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })

  return (
    <div 
      ref={setNodeRef} 
      className={`flex-1 min-w-[280px] flex flex-col bg-surface/30 rounded-xl border border-white/5 overflow-hidden transition-colors ${isOver ? 'bg-surface/50 border-primary/50' : ''}`}
    >
      <div className={`p-3 border-b border-white/5 bg-surface/50 border-t-2 ${col.color}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">{col.title}</h3>
          <span className="text-xs font-medium bg-background px-2 py-0.5 rounded-full text-textSecondary">{count}</span>
        </div>
      </div>
      <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </div>
  )
}

function DraggableCard({ card, onClick }: { card: DigitalizaContract, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: card
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (!isDragging) onClick()
      }}
      className={`bg-surface border border-white/10 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-white/20 transition-all ${isDragging ? 'shadow-2xl z-50' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-white text-sm">{card.client}</h4>
          {card.isFavorite && <span className="text-yellow-400 text-[10px]">★</span>}
          {card.isPinned && <span className="text-primary text-[10px]">📌</span>}
        </div>
        <div className="flex gap-1 items-center">
          {card.score !== undefined && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-white/5 ${
              card.score >= 80 ? 'text-success' : card.score >= 50 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {card.score}
            </span>
          )}
          {card.priority === 'alta' && <span className="w-2 h-2 rounded-full bg-red-500 mt-0.5 shrink-0" />}
          {card.priority === 'media' && <span className="w-2 h-2 rounded-full bg-yellow-500 mt-0.5 shrink-0" />}
        </div>
      </div>
      
      {card.company && (
        <div className="flex items-center gap-1.5 text-xs text-textSecondary mb-2">
          <Building className="w-3 h-3" />
          <span className="truncate">{card.company}</span>
        </div>
      )}

      {(card.checklist?.length || 0) > 0 && (
        <div className="flex items-center gap-1.5 text-[10px] text-textSecondary mb-2 bg-white/5 w-fit px-1.5 py-0.5 rounded">
          <CheckSquare className="w-3 h-3" />
          <span>{card.checklist?.filter(c => c.completed).length}/{card.checklist?.length}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 text-xs">
        <div className="flex items-center gap-1 text-success font-medium">
          <DollarSign className="w-3 h-3" />
          {card.amount.toLocaleString('pt-BR')}
        </div>
        
        {card.nextActionDate && (
          <div className="flex items-center gap-1 text-primary">
            <Calendar className="w-3 h-3" />
            {new Date(card.nextActionDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          </div>
        )}
        {!card.nextActionDate && card.lastInteraction && (
          <div className="flex items-center gap-1 text-textSecondary">
            <Calendar className="w-3 h-3" />
            {new Date(card.lastInteraction).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  )
}

export function CRMKanban({ onSelectLead }: CRMKanbanProps) {
  const { contracts, updateContract } = useDigitalizaStore()
  const [activeId, setActiveId] = useState<string | null>(null)

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

  const activeCard = activeId ? contracts.find(c => c.id === activeId) : null

  return (
    <div className="h-full w-full overflow-x-auto overflow-y-hidden custom-scrollbar px-4 md:px-8 pb-4 absolute inset-0">
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 h-full min-h-[500px]">
          {COLUMNS.map(col => {
            const columnCards = contracts.filter(c => c.status === col.id && !c.isDeleted)
            return (
              <DroppableColumn key={col.id} col={col} count={columnCards.length}>
                {columnCards.map(card => (
                  <DraggableCard key={card.id} card={card} onClick={() => onSelectLead(card.id)} />
                ))}
              </DroppableColumn>
            )
          })}
        </div>
        <DragOverlay>
          {activeCard ? (
            <div className="bg-surface border border-primary/50 shadow-2xl rounded-lg p-3 opacity-90 scale-105 rotate-2 w-[250px]">
              <div className="font-medium text-white text-sm mb-2">{activeCard.client}</div>
              <div className="text-xs text-success">R$ {activeCard.amount.toLocaleString('pt-BR')}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
