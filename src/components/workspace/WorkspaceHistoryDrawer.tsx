import { useState, useMemo } from 'react'
import {
  History,
  X,
  Search,
  Trash2
} from 'lucide-react'
import { useCodeWorkspaceStore } from '@/store/codeWorkspaceStore'
import { WorkspaceTaskHistory } from '@/types/codeWorkspace'
import { useToastStore } from '@/store/toastStore'

interface WorkspaceHistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const WorkspaceHistoryDrawer = ({ isOpen, onClose }: WorkspaceHistoryDrawerProps) => {
  const { history, isLoadingHistory, loadTaskFromHistory, deleteTaskFromHistory } =
    useCodeWorkspaceStore()
  const { addToast } = useToastStore()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredHistory = useMemo(() => {
    return history.filter(
      (h) =>
        h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.instruction.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.projectName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [history, searchTerm])

  const handleSelect = (task: WorkspaceTaskHistory) => {
    loadTaskFromHistory(task)
    addToast(`Tarefa "${task.title}" carregada no workspace!`, 'info')
    onClose()
  }

  const handleDelete = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation()
    try {
      await deleteTaskFromHistory(taskId)
      addToast('Tarefa removida do histórico.', 'info')
    } catch {
      addToast('Erro ao remover tarefa.', 'error')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0a0714] border-l border-purple-500/20 h-full flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.8)] relative">
        {/* Header */}
        <div className="p-5 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Histórico do Workspace</h3>
              <p className="text-[11px] text-textSecondary">{history.length} tarefas registradas</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-textSecondary hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar histórico por título ou instrução..."
              className="w-full bg-[#05030a] border border-white/10 focus:border-purple-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
          {isLoadingHistory ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-20 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-16 text-textMuted text-xs space-y-2">
              <History className="w-8 h-8 mx-auto text-purple-400/40" />
              <p>Nenhuma tarefa encontrada no histórico.</p>
            </div>
          ) : (
            filteredHistory.map((task) => (
              <div
                key={task.id}
                onClick={() => handleSelect(task)}
                className="p-3.5 bg-[#06040e] border border-white/5 hover:border-purple-500/40 rounded-xl transition-all cursor-pointer group hover:bg-[#0c081a] relative"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                    {task.title}
                  </h4>
                  <button
                    onClick={(e) => handleDelete(e, task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all"
                    title="Excluir do histórico"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-textSecondary line-clamp-2 mb-2 leading-relaxed">
                  {task.instruction}
                </p>

                <div className="flex items-center justify-between text-[10px] text-textMuted font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase">
                      {task.targetTool}
                    </span>
                    <span>{task.projectName}</span>
                  </div>
                  <span>{new Date(task.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
