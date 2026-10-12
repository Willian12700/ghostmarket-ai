import { useState, useEffect } from 'react'
import {
  CodeXml,
  History,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProjectSelector } from '@/components/workspace/ProjectSelector'
import { CodeEditorPanel } from '@/components/workspace/CodeEditorPanel'
import { InstructionPanel } from '@/components/workspace/InstructionPanel'
import { ResultPromptPanel } from '@/components/workspace/ResultPromptPanel'
import { WorkspaceHistoryDrawer } from '@/components/workspace/WorkspaceHistoryDrawer'
import { useCodeWorkspaceStore } from '@/store/codeWorkspaceStore'
import { useAuthStore } from '@/store/authStore'

export const AiCodeWorkspace = () => {
  const { user } = useAuthStore()
  const {
    fetchUserSites,
    fetchHistory,
    clearWorkspace,
    history
  } = useCodeWorkspaceStore()

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  useEffect(() => {
    if (user?.uid) {
      fetchUserSites(user.uid)
      fetchHistory(user.uid)
    }
  }, [user?.uid, fetchUserSites, fetchHistory])

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
            <CodeXml className="w-3.5 h-3.5" />
            <span>Engenharia de Prompt & Código</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            AI Code Workspace
          </h1>
          <p className="text-sm text-textSecondary max-w-2xl">
            Forneça código existente, explique a alteração desejada e gere especificações técnicas completas de 10 seções prontas para executar no Antigravity, Google AI Studio e Cursor.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            onClick={() => setIsHistoryOpen(true)}
            className="text-xs font-bold h-11 px-4 rounded-xl border-border/80 flex items-center gap-2 relative"
            title="Ver histórico de prompts e alterações geradas"
          >
            <History className="w-4 h-4 text-purple-400" />
            <span>Histórico</span>
            {history.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-purple-600 text-[10px] text-white font-bold flex items-center justify-center">
                {history.length}
              </span>
            )}
          </Button>

          <Button
            variant="secondary"
            onClick={clearWorkspace}
            className="text-xs font-bold h-11 px-4 rounded-xl border-border/80 flex items-center gap-2"
            title="Limpar editor e recomeçar"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Limpar</span>
          </Button>
        </div>
      </div>

      {/* ÁREA 1: Projeto e Origem */}
      <ProjectSelector />

      {/* ÁREA 2 & ÁREA 3: Código e Instrução (Split Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ÁREA 2: Editor de Código */}
        <div className="space-y-2">
          <CodeEditorPanel />
        </div>

        {/* ÁREA 3: Instrução, Modos e Destino */}
        <div className="space-y-2">
          <InstructionPanel />
        </div>
      </div>

      {/* ÁREA 4: Resultado (Mega Prompt / Código Corrigido / Sincronização) */}
      <ResultPromptPanel />

      {/* Drawer de Histórico */}
      <WorkspaceHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  )
}
