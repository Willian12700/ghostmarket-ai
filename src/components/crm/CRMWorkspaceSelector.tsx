import { useDigitalizaStore } from '@/store/digitalizaStore'
import { ChevronDown, PlusCircle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export function CRMWorkspaceSelector() {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useDigitalizaStore()
  const [isOpen, setIsOpen] = useState(false)

  if (!activeWorkspace) return null

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-surface border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/5 transition-colors"
      >
        <span className="text-white font-medium text-sm">{activeWorkspace.name}</span>
        <ChevronDown className="w-4 h-4 text-textSecondary" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-surface border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3 pb-2 mb-2 border-b border-white/5">
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Seus Workspaces</p>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {workspaces.map(ws => (
              <button
                key={ws.id}
                onClick={() => {
                  setActiveWorkspace(ws)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${activeWorkspace.id === ws.id ? 'bg-primary/10 text-primary font-medium' : 'text-white hover:bg-white/5'}`}
              >
                {ws.name}
              </button>
            ))}
          </div>

          <div className="px-2 pt-2 mt-2 border-t border-white/5">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 text-textSecondary hover:text-white"
              onClick={() => {
                // Here we could trigger a modal to create a new workspace
                setIsOpen(false)
                window.location.reload() // Quick hack to show onboarding again if we clear active
              }}
            >
              <PlusCircle className="w-4 h-4" />
              Recarregar (Criar Novo)
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
