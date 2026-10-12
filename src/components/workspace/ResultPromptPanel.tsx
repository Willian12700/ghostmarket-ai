import { useState } from 'react'
import {
  Copy,
  Check,
  Download,
  ExternalLink,
  FileCheck2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  Send,
  Wand2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCodeWorkspaceStore } from '@/store/codeWorkspaceStore'
import { useToastStore } from '@/store/toastStore'
import { useAuthStore } from '@/store/authStore'

export const ResultPromptPanel = () => {
  const {
    generatedPrompt,
    patchedCode,
    patchExplanation,
    mode,
    setMode,
    targetTool,
    setCode,
    selectedSiteId,
    projectName,
    applyToProjectSite,
    analysisResult,
    refineCode,
    isAnalyzing,
    runExecution
  } = useCodeWorkspaceStore()

  const { user } = useAuthStore()
  const { addToast } = useToastStore()

  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [activeTab, setActiveTab] = useState<'full' | 'structured'>('full')
  const [isApplying, setIsApplying] = useState(false)
  const [appliedSuccess, setAppliedSuccess] = useState(false)
  const [refineText, setRefineText] = useState('')
  const [isRefining, setIsRefining] = useState(false)

  const handleCopyPrompt = () => {
    if (!generatedPrompt?.fullPromptText) return
    navigator.clipboard.writeText(generatedPrompt.fullPromptText)
    setCopiedPrompt(true)
    addToast('Mega Prompt Técnico copiado para a área de transferência!', 'success')
    setTimeout(() => setCopiedPrompt(false), 2500)
  }

  const handleCopyPatchedCode = () => {
    if (!patchedCode) return
    navigator.clipboard.writeText(patchedCode)
    setCopiedCode(true)
    addToast('Código corrigido copiado!', 'success')
    setTimeout(() => setCopiedCode(false), 2500)
  }

  const handleDownloadMarkdown = () => {
    if (!generatedPrompt?.fullPromptText) return
    const blob = new Blob([generatedPrompt.fullPromptText], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `prompt_${projectName || 'ghost_market'}_${Date.now()}.md`
    link.click()
    URL.revokeObjectURL(url)
    addToast('Arquivo .md baixado com sucesso!', 'success')
  }

  const handleOpenGoogleAIStudio = () => {
    if (!generatedPrompt?.fullPromptText) return
    navigator.clipboard.writeText(generatedPrompt.fullPromptText)
    addToast('Prompt copiado! Cole no Google AI Studio aberto na nova aba.', 'info')
    window.open('https://aistudio.google.com/app/prompts/new_chat', '_blank')
  }

  const handleOpenAntigravity = () => {
    if (!generatedPrompt?.fullPromptText) return
    navigator.clipboard.writeText(generatedPrompt.fullPromptText)
    addToast('Prompt copiado! Cole no chat do Antigravity para iniciar a execução contígua.', 'success')
  }

  const handleApplyChanges = async () => {
    if (!selectedSiteId || !patchedCode) return
    setIsApplying(true)
    try {
      await applyToProjectSite()
      setAppliedSuccess(true)
      addToast(`Alterações aplicadas com sucesso no site "${projectName}"!`, 'success')
      setTimeout(() => setAppliedSuccess(false), 4000)
    } catch (err) {
      addToast('Erro ao aplicar alterações no site.', 'error')
    } finally {
      setIsApplying(false)
    }
  }

  const handleRefine = async () => {
    if (!refineText.trim()) return
    setIsRefining(true)
    try {
      await refineCode(refineText.trim())
      setRefineText('')
      addToast('Código refinado com sucesso pela IA!', 'success')
    } catch (err) {
      addToast('Erro ao refinar código. Verifique sua conexão ou chave de API.', 'error')
    } finally {
      setIsRefining(false)
    }
  }

  const handleReplaceInEditor = () => {
    if (!patchedCode) return
    setCode(patchedCode)
    addToast('Código atualizado no editor principal!', 'success')
  }

  const handleGenerateCodeDirectly = async () => {
    setMode('fix_code')
    try {
      await runExecution({ uid: user?.uid || 'guest_user', email: user?.email })
      addToast('Código corrigido gerado diretamente na tela!', 'success')
    } catch (err) {
      addToast('Erro ao gerar código na tela.', 'error')
    }
  }

  // Estado Vazio (quando ainda não foi executado)
  if (!generatedPrompt && !patchedCode) {
    return (
      <div className="bg-[#0a0714] border border-purple-500/20 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px] shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.2)]">
          <Sparkles className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">
            Nenhuma Análise Executada Ainda
          </h3>
          <p className="text-xs text-textSecondary max-w-md mx-auto leading-relaxed">
            Insira seu código acima, defina a instrução da alteração desejada e clique em{' '}
            <strong className="text-purple-300">"Gerar Mega Prompt Técnico"</strong> para receber a especificação de engenharia pronta.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0a0714] border border-purple-500/20 rounded-2xl shadow-xl overflow-hidden flex flex-col space-y-0">
      {/* Header Bar */}
      <div className="bg-[#06040d] border-b border-purple-500/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{mode === 'generate_prompt' ? 'Mega Prompt Técnico Gerado' : 'Resultado da Proposta de Código'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                {targetTool.toUpperCase()}
              </span>
            </h3>
            <p className="text-[11px] text-textSecondary">
              Pronto para execução e revisão com 10 seções de especificações
            </p>
          </div>
        </div>

        {/* Action Buttons Top Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {mode === 'generate_prompt' ? (
            <>
              <Button
                variant="secondary"
                onClick={handleDownloadMarkdown}
                className="h-8 px-3 text-xs rounded-xl flex items-center gap-1.5"
                title="Baixar como arquivo Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Baixar .md</span>
              </Button>

              <Button
                variant="secondary"
                onClick={handleOpenGoogleAIStudio}
                className="h-8 px-3 text-xs rounded-xl flex items-center gap-1.5 border-purple-500/30 text-purple-300 hover:text-white"
                title="Copiar e abrir no Google AI Studio"
              >
                <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                <span>Google AI Studio</span>
              </Button>

              <Button
                variant="secondary"
                onClick={handleOpenAntigravity}
                className="h-8 px-3 text-xs rounded-xl flex items-center gap-1.5 border-purple-500/30 text-purple-300 hover:text-white"
                title="Copiar prompt para o Antigravity"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Antigravity</span>
              </Button>

              <Button
                onClick={handleCopyPrompt}
                className="bg-primary hover:bg-primaryLight text-white h-8 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPrompt ? 'Copiado!' : 'Copiar Prompt'}</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={handleReplaceInEditor}
                className="h-8 px-3 text-xs rounded-xl flex items-center gap-1.5 border-purple-500/30 hover:border-purple-500/60"
                title="Substituir código atual no editor"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Substituir no Editor</span>
              </Button>

              <Button
                onClick={handleCopyPatchedCode}
                className="bg-primary hover:bg-primaryLight text-white h-8 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copiado!' : 'Copiar Código'}</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Analysis Diagnostic Pill Row */}
      {analysisResult && (
        <div className="bg-[#070510] border-b border-white/5 px-4 py-2.5 flex flex-wrap items-center gap-4 text-[11px] text-textSecondary">
          <span>
            Tecnologia: <strong className="text-white">{analysisResult.framework}</strong>
          </span>
          <span>•</span>
          <span>
            Componentes: <strong className="text-purple-300">{analysisResult.components.length || 1}</strong>
          </span>
          <span>•</span>
          <span>
            Riscos de Regressão: <strong className="text-emerald-400">{analysisResult.potentialRisks.length === 0 ? 'Mínimo' : 'Mapeados'}</strong>
          </span>
        </div>
      )}

      {/* Content Body */}
      <div className="p-5 space-y-6">
        {mode === 'generate_prompt' && generatedPrompt ? (
          <div className="space-y-4">
            {/* Dica de Uso e Ação Rápida */}
            <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-purple-200">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  O prompt gerado inclui uma <strong>diretiva imperativa</strong> que obriga o ChatGPT/Claude a entregar o código completo pronto, sem resumos teóricos.
                </span>
              </div>
              <Button
                variant="secondary"
                onClick={handleGenerateCodeDirectly}
                className="text-xs h-7 px-3 rounded-lg border-purple-500/40 text-purple-300 hover:text-white shrink-0"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                <span>Ver Código Pronto Aqui</span>
              </Button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <button
                onClick={() => setActiveTab('full')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'full'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-textSecondary hover:text-white'
                }`}
              >
                Prompt Completo (Raw Markdown)
              </button>
              <button
                onClick={() => setActiveTab('structured')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'structured'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-textSecondary hover:text-white'
                }`}
              >
                Visualização por Seções (10 Blocos)
              </button>
            </div>

            {activeTab === 'full' ? (
              <div className="relative">
                <pre className="bg-[#05030a] border border-purple-500/20 rounded-2xl p-4 sm:p-6 text-xs text-purple-200 font-mono leading-relaxed overflow-x-auto max-h-[500px] custom-scrollbar whitespace-pre-wrap select-all">
                  {generatedPrompt.fullPromptText}
                </pre>
              </div>
            ) : (
              /* Structured Cards View (10 Sections) */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                <div className="bg-[#05030a] border border-white/5 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">1. Contexto do Projeto</span>
                  <p className="text-xs text-white leading-relaxed">{generatedPrompt.projectContext}</p>
                </div>

                <div className="bg-[#05030a] border border-white/5 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">2. Objetivo Principal</span>
                  <p className="text-xs text-white leading-relaxed font-semibold">{generatedPrompt.mainGoal}</p>
                </div>

                <div className="bg-[#05030a] border border-white/5 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">3. Diagnóstico e Arquitetura</span>
                  <p className="text-xs text-textSecondary leading-relaxed">{generatedPrompt.diagnosis}</p>
                </div>

                <div className="bg-[#05030a] border border-white/5 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">4. Componentes Afetados</span>
                  <ul className="text-xs text-white list-disc list-inside space-y-0.5">
                    {generatedPrompt.affectedComponents.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#05030a] border border-white/5 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">5. Comportamento Esperado</span>
                  <p className="text-xs text-textSecondary leading-relaxed">{generatedPrompt.expectedBehavior}</p>
                </div>

                <div className="bg-[#05030a] border border-white/5 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">6. Restrições e Preservação</span>
                  <ul className="text-xs text-textSecondary list-disc list-inside space-y-0.5">
                    {generatedPrompt.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#05030a] border border-white/5 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">7. Requisitos de Segurança</span>
                  <ul className="text-xs text-textSecondary list-disc list-inside space-y-0.5">
                    {generatedPrompt.securityRequirements.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#05030a] border border-white/5 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">8. Plano de Ação</span>
                  <ul className="text-xs text-textSecondary list-decimal list-inside space-y-0.5">
                    {generatedPrompt.implementationPlan.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#05030a] border border-white/5 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">9. Testes e Validação</span>
                  <ul className="text-xs text-textSecondary list-disc list-inside space-y-0.5">
                    {generatedPrompt.testingSteps.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#05030a] border border-white/5 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">10. Critérios de Aceitação</span>
                  <ul className="text-xs text-textSecondary list-disc list-inside space-y-0.5">
                    {generatedPrompt.acceptanceCriteria.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Code Fix & Implementation View (Modo 2 e 3) */
          <div className="space-y-4">
            {patchExplanation && (
              <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-300">
                <strong>Explicação da Refatoração:</strong> {patchExplanation}
              </div>
            )}

            <div className="relative">
              <pre className="bg-[#05030a] border border-purple-500/20 rounded-2xl p-4 sm:p-6 text-xs text-white font-mono leading-relaxed overflow-x-auto max-h-[480px] custom-scrollbar whitespace-pre-wrap select-all">
                {patchedCode}
              </pre>
            </div>

            {/* Barra de Refinamento Iterativo com IA */}
            <div className="p-4 bg-[#06040e] border border-purple-500/20 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  <span>Refinar ou Solicitar Mais Ajustes neste Código</span>
                </span>
                <span className="text-[10px] text-textMuted">Execução em tempo real</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={refineText}
                  onChange={(e) => setRefineText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleRefine()
                    }
                  }}
                  placeholder="Ex: Mude a cor do botão para verde esmeralda e adicione animação hover..."
                  className="flex-1 bg-[#030208] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
                <Button
                  onClick={handleRefine}
                  disabled={isRefining || isAnalyzing || !refineText.trim()}
                  className="bg-primary hover:bg-primaryLight text-white font-bold text-xs h-10 px-5 rounded-xl flex items-center gap-1.5 shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50"
                >
                  {isRefining || isAnalyzing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isRefining || isAnalyzing ? 'Refinando...' : 'Refinar com IA'}</span>
                </Button>
              </div>
            </div>

            {/* Modo 3: Aplicar Alteração Direta no Site */}
            {mode === 'apply_changes' && selectedSiteId && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aplicar Diretamente no Site "{projectName}"</span>
                  </h4>
                  <p className="text-[11px] text-textSecondary mt-0.5">
                    Isso atualizará o código HTML do seu site no banco de dados e na hospedagem pública.
                  </p>
                </div>

                <Button
                  onClick={handleApplyChanges}
                  disabled={isApplying || appliedSuccess}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs h-10 px-5 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0"
                >
                  {isApplying ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  ) : appliedSuccess ? (
                    <Check className="w-4 h-4 text-black" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-black" />
                  )}
                  <span>{appliedSuccess ? 'Publicado no Site!' : 'Confirmar e Salvar no Site'}</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
