import { useState, useEffect } from 'react';
import { useAdminNotesStore, AdminNote } from '@/store/adminNotesStore';
import { Plus, Trash2, Search, X, Circle, CheckCircle2, Clock, Zap, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

const PRIORITIES = {
  low: { label: 'Baixa', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' },
  medium: { label: 'Média', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  high: { label: 'Alta', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  urgent: { label: 'Urgente', color: 'text-red-400 bg-red-500/10 border-red-500/20' }
};

const STATUSES = {
  idea: { label: 'Ideia', icon: Zap, color: 'text-yellow-400' },
  todo: { label: 'A Fazer', icon: Circle, color: 'text-gray-400' },
  doing: { label: 'Fazendo', icon: Clock, color: 'text-blue-400' },
  done: { label: 'Concluído', icon: CheckCircle2, color: 'text-green-400' }
};

export const AdminNotes = () => {
  const { notes, syncNotes, addNote, updateNote, deleteNote, isLoading } = useAdminNotesStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<AdminNote | null>(null);
  const [search, setSearch] = useState('');
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<AdminNote['status']>('idea');
  const [priority, setPriority] = useState<AdminNote['priority']>('medium');

  useEffect(() => {
    const unsubscribe = syncNotes();
    return () => unsubscribe();
  }, [syncNotes]);

  const handleOpenModal = (note?: AdminNote) => {
    if (note) {
      setEditingNote(note);
      setTitle(note.title);
      setContent(note.content);
      setStatus(note.status);
      setPriority(note.priority);
    } else {
      setEditingNote(null);
      setTitle('');
      setContent('');
      setStatus('idea');
      setPriority('medium');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
  };

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;
    
    const noteData = {
      title: title.trim() || 'Sem Título',
      content: content.trim(),
      status,
      priority,
      tags: []
    };

    if (editingNote) {
      await updateNote(editingNote.id, noteData);
    } else {
      await addNote(noteData);
    }
    handleCloseModal();
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const columns: AdminNote['status'][] = ['idea', 'todo', 'doing', 'done'];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] bg-background">
      {/* Header */}
      <div className="flex-none p-6 border-b border-border bg-surface-elevated/30 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-textPrimary flex items-center gap-2">
              <FileText className="text-accent w-6 h-6" />
              Backlog & Notas do Admin
            </h1>
            <p className="text-textMuted text-sm mt-1">
              Seu espaço secreto para anotar ideias, bugs e tarefas futuras.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
              <input 
                type="text" 
                placeholder="Buscar notas..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-textPrimary focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-accent/20"
            >
              <Plus className="w-4 h-4" /> Nova Nota
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar">
        <div className="flex gap-6 h-full min-w-max">
          {columns.map((colStatus) => (
            <div key={colStatus} className="w-[320px] flex flex-col h-full bg-surface-elevated/20 rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between bg-surface-elevated/40">
                <div className="flex items-center gap-2">
                  {(() => {
                    const S = STATUSES[colStatus];
                    const Icon = S.icon;
                    return <Icon className={cn("w-4 h-4", S.color)} />;
                  })()}
                  <h3 className="font-bold text-textPrimary">{STATUSES[colStatus].label}</h3>
                </div>
                <span className="text-xs font-bold text-textMuted bg-surface px-2 py-1 rounded-md border border-border">
                  {filteredNotes.filter(n => n.status === colStatus).length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {isLoading ? (
                  <div className="text-center text-textMuted text-sm py-4">Carregando...</div>
                ) : (
                  <AnimatePresence>
                    {filteredNotes.filter(n => n.status === colStatus).map((note) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={note.id} 
                        className="bg-surface border border-border rounded-xl p-4 hover:border-accent/50 transition-colors group relative cursor-pointer shadow-sm"
                        onClick={() => handleOpenModal(note)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-textPrimary text-sm line-clamp-2 pr-6">{note.title}</h4>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                            className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-textMuted hover:text-error transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-textSecondary text-xs line-clamp-3 mb-4 whitespace-pre-wrap">{note.content}</p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md border", PRIORITIES[note.priority].color)}>
                            {PRIORITIES[note.priority].label}
                          </span>
                          <span className="text-[10px] text-textMuted">
                            {new Date(note.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                {filteredNotes.filter(n => n.status === colStatus).length === 0 && !isLoading && (
                  <div className="text-center text-textMuted text-xs py-8 border border-dashed border-border rounded-lg bg-surface/30">
                    Nenhuma nota aqui
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
                <h2 className="text-lg font-bold text-textPrimary">{editingNote ? 'Editar Nota' : 'Nova Nota do Admin'}</h2>
                <button onClick={handleCloseModal} className="text-textMuted hover:text-textPrimary p-1 rounded-md hover:bg-surface-elevated">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                <div>
                  <input 
                    type="text" 
                    placeholder="Título da nota (Ex: Nova funcionalidade de CRM)" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-transparent text-xl font-bold text-textPrimary placeholder:text-textMuted focus:outline-none border-b border-transparent focus:border-accent pb-2 transition-colors"
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-bold text-textMuted uppercase">Status</label>
                    <select 
                      value={status} 
                      onChange={e => setStatus(e.target.value as any)}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-accent"
                    >
                      <option value="idea">Ideia (Caixa de Entrada)</option>
                      <option value="todo">A Fazer</option>
                      <option value="doing">Fazendo</option>
                      <option value="done">Concluído</option>
                    </select>
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-bold text-textMuted uppercase">Prioridade</label>
                    <select 
                      value={priority} 
                      onChange={e => setPriority(e.target.value as any)}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-accent"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex-1 flex flex-col">
                  <textarea 
                    placeholder="Descreva a ideia, bug ou tarefa... O que não pode ser esquecido?" 
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full flex-1 min-h-[200px] bg-surface border border-border rounded-xl p-4 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-accent resize-none transition-colors"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-border bg-surface flex justify-end gap-3">
                <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-bold text-textSecondary hover:text-textPrimary transition-colors">
                  Cancelar
                </button>
                <button onClick={handleSave} className="bg-accent hover:bg-accent/90 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-accent/20 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {editingNote ? 'Atualizar Nota' : 'Salvar Nota'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
