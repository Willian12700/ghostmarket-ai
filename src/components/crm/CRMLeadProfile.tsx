import { useState, useEffect } from 'react'
import { useDigitalizaStore, CRMStatus, CRMPriority, CRMChecklistItem } from '@/store/digitalizaStore'
import { Button } from '@/components/ui/Button'
import { X, Building, Mail, Phone, MapPin, Briefcase, Plus, CheckSquare, MessageSquare, Tag, Trash2, Star, Pin, Activity, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CRMLeadProfileProps {
  leadId: string
  onClose: () => void
}

export function CRMLeadProfile({ leadId, onClose }: CRMLeadProfileProps) {
  const { contracts, updateContract, moveToTrash } = useDigitalizaStore()
  const lead = contracts.find(c => c.id === leadId)
  const [activeTab, setActiveTab] = useState<'info' | 'tasks' | 'checklist' | 'history'>('info')
  
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [newNote, setNewNote] = useState('')

  // Fechar se for deletado ou nulo
  useEffect(() => {
    if (!lead || lead.isDeleted) {
      onClose()
    }
  }, [lead, onClose])

  if (!lead) return null

  const handleUpdateField = async (field: string, value: any) => {
    await updateContract(leadId, { [field]: value })
  }

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return
    const newTask = {
      id: Math.random().toString(36).substring(7),
      title: newTaskTitle,
      completed: false
    }
    const updatedTasks = [...(lead.tasks || []), newTask]
    await handleUpdateField('tasks', updatedTasks)
    setNewTaskTitle('')
  }

  const toggleTask = async (taskId: string) => {
    const updatedTasks = (lead.tasks || []).map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    )
    await handleUpdateField('tasks', updatedTasks)
  }

  const handleAddChecklist = async () => {
    if (!newChecklistItem.trim()) return
    const newItem: CRMChecklistItem = {
      id: Math.random().toString(36).substring(7),
      title: newChecklistItem,
      completed: false
    }
    const updatedChecklist = [...(lead.checklist || []), newItem]
    await handleUpdateField('checklist', updatedChecklist)
    setNewChecklistItem('')
  }

  const toggleChecklist = async (itemId: string) => {
    const updatedChecklist = (lead.checklist || []).map(t => 
      t.id === itemId ? { ...t, completed: !t.completed } : t
    )
    await handleUpdateField('checklist', updatedChecklist)
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    const newEntry = {
      id: Math.random().toString(36).substring(7),
      type: 'nota' as const,
      content: newNote,
      date: new Date().toISOString()
    }
    const updatedHistory = [newEntry, ...(lead.history || [])]
    await handleUpdateField('history', updatedHistory)
    setNewNote('')
  }

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja enviar este lead para a lixeira?')) {
      await moveToTrash(leadId)
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-textSecondary'
    if (score >= 80) return 'text-success'
    if (score >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-surface h-full border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex flex-col gap-4 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-white">{lead.client}</h2>
                {lead.isFavorite && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                {lead.isPinned && <Pin className="w-4 h-4 text-primary fill-primary" />}
              </div>
              {lead.company && <p className="text-textSecondary flex items-center gap-1 mt-1"><Building className="w-4 h-4" /> {lead.company}</p>}
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => handleUpdateField('isFavorite', !lead.isFavorite)} className={`p-2 rounded-md transition-colors ${lead.isFavorite ? 'bg-yellow-400/10 text-yellow-400' : 'text-textSecondary hover:text-white hover:bg-white/5'}`}>
                <Star className="w-4 h-4" />
              </button>
              <button onClick={() => handleUpdateField('isPinned', !lead.isPinned)} className={`p-2 rounded-md transition-colors ${lead.isPinned ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:text-white hover:bg-white/5'}`}>
                <Pin className="w-4 h-4" />
              </button>
              <button onClick={handleDelete} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-colors" title="Enviar para Lixeira">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-2 text-textSecondary hover:text-white transition-colors bg-white/5 rounded-full ml-2">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2">
            <select 
              value={lead.status}
              onChange={(e) => handleUpdateField('status', e.target.value as CRMStatus)}
              className="bg-primary/20 text-primary border border-primary/30 rounded-md px-3 py-1.5 text-sm outline-none font-medium"
            >
              <option value="Novo">Novo Lead</option>
              <option value="Contato">Em Contato</option>
              <option value="Qualificado">Qualificado</option>
              <option value="Proposta">Proposta</option>
              <option value="Negociação">Negociação</option>
              <option value="Fechado">Fechado</option>
              <option value="Perdido">Perdido</option>
            </select>

            <select 
              value={lead.priority || 'baixa'}
              onChange={(e) => handleUpdateField('priority', e.target.value as CRMPriority)}
              className="bg-white/5 text-white border border-white/10 rounded-md px-3 py-1.5 text-sm outline-none"
            >
              <option value="baixa">Prioridade Baixa</option>
              <option value="media">Prioridade Média</option>
              <option value="alta">Prioridade Alta</option>
            </select>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm">
              <Activity className="w-4 h-4 text-textSecondary" />
              <span className="text-textSecondary">Score:</span>
              <input 
                type="number" 
                value={lead.score || 0} 
                onChange={(e) => handleUpdateField('score', Number(e.target.value))}
                className={`w-12 bg-transparent outline-none font-bold ${getScoreColor(lead.score)}`}
                min="0" max="100"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 shrink-0 px-6 overflow-x-auto custom-scrollbar">
          <button 
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-white'}`}
            onClick={() => setActiveTab('info')}
          >
            Detalhes
          </button>
          <button 
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'checklist' ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-white'}`}
            onClick={() => setActiveTab('checklist')}
          >
            Checklist ({lead.checklist?.filter(c => c.completed).length || 0}/{lead.checklist?.length || 0})
          </button>
          <button 
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'tasks' ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-white'}`}
            onClick={() => setActiveTab('tasks')}
          >
            Tarefas ({lead.tasks?.filter(c => !c.completed).length || 0})
          </button>
          <button 
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-white'}`}
            onClick={() => setActiveTab('history')}
          >
            Histórico
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          
          {activeTab === 'info' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-textSecondary font-medium block mb-1">Valor Estimado (R$)</label>
                  <input 
                    type="number"
                    value={lead.amount}
                    onChange={(e) => handleUpdateField('amount', Number(e.target.value))}
                    className="w-full bg-surface border border-white/10 rounded-md px-3 py-2 text-success font-medium focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-textSecondary font-medium block mb-1">Responsável</label>
                  <input 
                    type="text"
                    value={lead.responsible || ''}
                    placeholder="Atribuir..."
                    onChange={(e) => handleUpdateField('responsible', e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-md px-3 py-2 text-white focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-white border-b border-white/5 pb-2">Próxima Ação / Follow-up</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-textSecondary font-medium block mb-1">O que fazer?</label>
                    <input 
                      type="text"
                      value={lead.nextAction || ''}
                      placeholder="Ex: Ligar para confirmar..."
                      onChange={(e) => handleUpdateField('nextAction', e.target.value)}
                      className="w-full bg-surface border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-textSecondary font-medium block mb-1">Data/Hora</label>
                    <input 
                      type="datetime-local"
                      value={lead.nextActionDate || ''}
                      onChange={(e) => handleUpdateField('nextActionDate', e.target.value)}
                      className="w-full bg-surface border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:border-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-white border-b border-white/5 pb-2">Informações de Contato</h3>
                
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-textSecondary" />
                  <input 
                    type="email"
                    value={lead.email || ''}
                    placeholder="Email"
                    onChange={(e) => handleUpdateField('email', e.target.value)}
                    className="flex-1 bg-transparent border-b border-white/10 py-1 text-sm text-white focus:border-primary outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-textSecondary" />
                  <input 
                    type="text"
                    value={lead.phone || ''}
                    placeholder="Telefone/WhatsApp"
                    onChange={(e) => handleUpdateField('phone', e.target.value)}
                    className="flex-1 bg-transparent border-b border-white/10 py-1 text-sm text-white focus:border-primary outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-textSecondary" />
                  <input 
                    type="text"
                    value={lead.role || ''}
                    placeholder="Cargo"
                    onChange={(e) => handleUpdateField('role', e.target.value)}
                    className="flex-1 bg-transparent border-b border-white/10 py-1 text-sm text-white focus:border-primary outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-textSecondary" />
                  <input 
                    type="text"
                    value={lead.city || ''}
                    placeholder="Cidade"
                    onChange={(e) => handleUpdateField('city', e.target.value)}
                    className="flex-1 bg-transparent border-b border-white/10 py-1 text-sm text-white focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newChecklistItem}
                  onChange={e => setNewChecklistItem(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddChecklist()}
                  placeholder="Novo item do checklist..."
                  className="flex-1 bg-surface border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-primary"
                />
                <Button onClick={handleAddChecklist} className="px-3"><Plus className="w-4 h-4" /></Button>
              </div>

              <div className="space-y-2">
                {lead.checklist?.length === 0 || !lead.checklist ? (
                  <p className="text-textSecondary text-sm text-center py-4">Nenhum item no checklist.</p>
                ) : (
                  lead.checklist.map(item => (
                    <div key={item.id} className={`flex items-center gap-3 p-3 rounded-md transition-colors ${item.completed ? 'bg-success/5 border border-success/10' : 'bg-white/5 border border-white/5 hover:bg-white/10'}`}>
                      <button onClick={() => toggleChecklist(item.id)} className={`${item.completed ? 'text-success' : 'text-textSecondary hover:text-primary'}`}>
                        {item.completed ? <CheckCircle className="w-5 h-5" /> : <div className="w-5 h-5 border-2 border-textSecondary rounded-full" />}
                      </button>
                      <span className={`text-sm flex-1 ${item.completed ? 'text-textSecondary line-through' : 'text-white'}`}>
                        {item.title}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                  placeholder="Nova tarefa pendente..."
                  className="flex-1 bg-surface border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-primary"
                />
                <Button onClick={handleAddTask} className="px-3"><Plus className="w-4 h-4" /></Button>
              </div>

              <div className="space-y-2">
                {lead.tasks?.length === 0 || !lead.tasks ? (
                  <p className="text-textSecondary text-sm text-center py-4">Nenhuma tarefa pendente.</p>
                ) : (
                  lead.tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-md hover:bg-white/10 transition-colors">
                      <button onClick={() => toggleTask(task.id)} className="text-textSecondary hover:text-primary">
                        {task.completed ? <CheckSquare className="w-5 h-5 text-primary" /> : <div className="w-5 h-5 border-2 border-textSecondary rounded-[4px]" />}
                      </button>
                      <span className={`text-sm flex-1 ${task.completed ? 'text-textSecondary line-through' : 'text-white'}`}>
                        {task.title}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                  placeholder="Adicionar nota, email, ligação..."
                  className="flex-1 bg-surface border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-primary"
                />
                <Button onClick={handleAddNote} className="px-3"><MessageSquare className="w-4 h-4" /></Button>
              </div>

              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {lead.history?.length === 0 || !lead.history ? (
                  <p className="text-textSecondary text-sm text-center py-4 relative z-10 bg-surface">Nenhum histórico registrado.</p>
                ) : (
                  lead.history.map(item => (
                    <div key={item.id} className="relative z-10 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center shrink-0">
                        {item.type === 'nota' && <MessageSquare className="w-4 h-4 text-blue-400" />}
                        {item.type === 'ligacao' && <Phone className="w-4 h-4 text-green-400" />}
                        {item.type === 'email' && <Mail className="w-4 h-4 text-yellow-400" />}
                        {item.type === 'mudanca_status' && <Tag className="w-4 h-4 text-purple-400" />}
                        {item.type === 'tarefa' && <CheckSquare className="w-4 h-4 text-primary" />}
                        {item.type === 'mesclagem' && <Building className="w-4 h-4 text-orange-400" />}
                      </div>
                      <div className="flex-1 bg-white/5 rounded-lg p-3">
                        <p className="text-sm text-white">{item.content}</p>
                        <span className="text-xs text-textSecondary mt-1 block">
                          {format(new Date(item.date), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

