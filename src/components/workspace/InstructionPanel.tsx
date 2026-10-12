import { useState } from 'react'
import {
  Wand2,
  Cpu,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Key,
  ExternalLink,
  Check,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCodeWorkspaceStore } from '@/store/codeWorkspaceStore'
import { TargetTool, WorkspaceMode } from '@/types/codeWorkspace'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'

const QUICK_SUGGESTIONS = [
  'Melhore o design dessa página com estética Dark Premium e Tailwind CSS.',
  'Corrija qualquer bug ou erro de tipagem sem quebrar funcionalidades existentes.',
  'Adicione validação defensiva de formulário e tratamento robusto de erros.',
  'Otimize a performance e remova renderizações desnecessárias.',
  'Transforme esse componente em algo modular, reutilizável e desacoplado.',
  'Adicione persistência de dados e integração completa com Firebase/Supabase.'
]

const TARGET_TOOLS: { id: TargetTool; name: string; tag: string }[] = [
  { id: 'antigravity', name: 'Google Antigravity', tag: 'Engenharia Direta' },
  { id: 'ai_studio', name: 'Google AI Studio', tag: 'Gemini 2.5 / 1.5' },
  { id: 'claude_code', name: 'Claude Code', tag: 'Terminal CLI' },
  { id: 'cursor', name: 'Cursor / Composer', tag: 'IDE AI' },
  { id: 'chatgpt', name: 'ChatGPT / Web AI', tag: 'Conversacional' }
]

const WORKSPACE_MODES: {
  id: WorkspaceMode
  name: string
  desc: string
  badge: string
}[] = [
  {
    id: 'generate_prompt',
    name: 'Modo 1: Gerar Mega Prompt',
    desc: 'Cria um prompt técnico de 10 seções pronto para colar na ferramenta externa.',
    badge: 'Recomendado'
  },
  {
    id: 'fix_code',
    name: 'Modo 2: Corrigir / Patch',
    desc: 'Gera proposta de correção com código refatorado e explicação detalhada.',
    badge: 'IA Direta'
  },
  {
    id: 'apply_changes',
    name: 'Modo 3: Implementar no Site',
    desc: 'Aplica a alteração diretamente ao site selecionado do Ghost Market.',
    badge: 'Ghost Sync'
  }
]

export const InstructionPanel = () => {
  const {
    instruction,
    setInstruction,
    mode,
    setMode,
    targetTool,
    setTargetTool,
    isAnalyzing,
    runExecution,
    code,
    selectedSiteId,
    geminiApiKey,
    setGeminiApiKey
  } = useCodeWorkspaceStore()

  const { user } = useAuthStore()
  const { addToast } = useToastStore()

  const [showKeyConfig, setShowKeyConfig] = useState(false)
  const [tempKey, setTempKey] = useState(geminiApiKey)

  const handleSaveKey = () => {
    setGeminiApiKey(tempKey.trim())
    setShowKeyConfig(false)
    if (tempKey.trim().startsWith('AIzaSy')) {
      addToast('Chave Gemini salva! As alterações agora serão geradas ao vivo pelo modelo Gemini 1.5 Flash.', 'success')
    } else if (!tempKey.trim()) {
      addToast('Chave removida. Usando motor inteligente estruturado.', 'info')
    } else {
      addToast('Chave salva. Verifique se o formato está correto (deve iniciar com AIzaSy).', 'info')
    }
  }

  const handleExecute = async () => {
    if (!code.trim()) {
      addToast('Por favor, insira ou envie algum código para análise.', 'error')
      return
    }

    if (!instruction.trim()) {
      addToast('Descreva a alteração desejada que a IA deve implementar.', 'error')
      return
    }

    if (mode === 'apply_changes' && !selectedSiteId) {
      addToast('Para usar o Modo 3 (Implementar), selecione primeiro um dos seus sites no menu superior.', 'info')
      return
    }

    try {
      await runExecution({ uid: user?.uid || 'guest_user', email: user?.email })
      addToast(
        mode === 'generate_prompt'
          ? 'Mega Prompt Técnico gerado com sucesso!'
          : mode === 'fix_code'
          ? 'Código corrigido e pronto para revisão!'
          : 'Alterações processadas para o projeto!',
        'success'
      )
    } catch (err) {
      addToast('Erro ao processar análise do código. Tente novamente.', 'error')
    }
  }

  return (
    <div className="bg-[#0a0714] border border-purple-500/20 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Barra de Status da IA (Gemini ao Vivo vs Motor Local) */}
      <div className="p-3 bg-[#06040e] border border-purple-500/20 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {geminiApiKey ? (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-purple-400" />
            )}
            <span className="font-bold text-white">
              {geminiApiKey ? 'IA Generativa Gemini 1.5 Flash Conectada' : 'Motor Estruturado Ativo'}
            </span>
          </div>

          <button
            onClick={() => setShowKeyConfig(!showKeyConfig)}
            className="text-[11px] font-bold text-purple-400 hover:text-purple-300 underline flex items-center gap-1"
          >
            <Key className="w-3 h-3" />
            <span>{geminiApiKey ? 'Gerenciar Chave' : 'Conectar Chave Grátis'}</span>
          </button>
        </div>

        {showKeyConfig && (
          <div className="pt-2 border-t border-white/5 space-y-2 animate-fade-in">
            <p className="text-[11px] text-textSecondary leading-relaxed">
              Obtenha sua chave gratuita do Gemini (100% grátis sem cartão de crédito) no{' '}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 hover:underline inline-flex items-center gap-0.5"
              >
                Google AI Studio <ExternalLink className="w-2.5 h-2.5" />
              </a>
              :
            </p>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="Cole sua chave AIzaSy..."
                className="flex-1 bg-[#030208] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
              <Button
                onClick={handleSaveKey}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs h-8 px-3 rounded-lg"
              >
                <Check className="w-3 h-3 mr-1" /> Salvar
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* 1. Escolha do Modo de Operação */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Modo de Operação</span>
          </label>
          <span className="text-[11px] text-textMuted">Escolha como deseja o resultado</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {WORKSPACE_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`p-3 rounded-xl text-left border transition-all duration-200 relative overflow-hidden ${
                mode === m.id
                  ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                  : 'bg-[#05030a] border-white/5 text-textSecondary hover:border-purple-500/40 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">{m.name}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                    mode === m.id ? 'bg-purple-500 text-white' : 'bg-white/5 text-textMuted'
                  }`}
                >
                  {m.badge}
                </span>
              </div>
              <p className="text-[10px] text-textMuted leading-relaxed">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Ferramenta de Destino */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>Ferramenta de Destino</span>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {TARGET_TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setTargetTool(tool.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                targetTool === tool.id
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-[#05030a] border-white/5 text-textSecondary hover:text-white hover:border-white/20'
              }`}
            >
              <span>{tool.name}</span>
              <span className="text-[9px] text-textMuted opacity-70">({tool.tag})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Campo de Instrução */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Wand2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Instrução da Mudança</span>
          </label>
          <span className="text-[11px] text-textMuted">Explique em bom português</span>
        </div>

        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Ex: Corrija o formulário para enviar dados no Firebase e coloque um botão de WhatsApp flutuante no canto direito..."
          rows={3}
          className="w-full bg-[#05030a] border border-purple-500/30 focus:border-purple-500 rounded-xl p-3 text-xs text-white focus:outline-none transition-colors resize-none leading-relaxed"
        />

        {/* Sugestões Rápidas */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider">
            Sugestões Prontas:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SUGGESTIONS.map((sugg, i) => (
              <button
                key={i}
                onClick={() => setInstruction(sugg)}
                className="text-[10px] bg-white/[0.03] hover:bg-purple-500/15 text-textSecondary hover:text-purple-300 border border-white/5 hover:border-purple-500/30 px-2.5 py-1 rounded-lg transition-colors text-left"
              >
                + {sugg.slice(0, 42)}...
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Botão de Execução */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5">
        <div className="text-[11px] text-textMuted flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Análise estática local + Validação de segredos ativa</span>
        </div>

        <Button
          onClick={handleExecute}
          disabled={isAnalyzing || !code.trim() || !instruction.trim()}
          className="w-full sm:w-auto bg-primary hover:bg-primaryLight text-white font-bold text-xs h-11 px-8 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(139,92,246,0.4)] disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analisando e Gerando...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>
                {mode === 'generate_prompt'
                  ? 'Gerar Mega Prompt Técnico'
                  : mode === 'fix_code'
                  ? 'Gerar Código Corrigido'
                  : 'Processar e Implementar'}
              </span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
