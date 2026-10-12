import { create } from 'zustand'
import {
  CodeAnalysisResult,
  GeneratedTechnicalPrompt,
  GhostMarketSiteOption,
  SupportedLanguage,
  TargetTool,
  WorkspaceMode,
  WorkspaceTaskHistory
} from '@/types/codeWorkspace'
import {
  analyzeCodeArchitecture,
  detectLanguage,
  generateCodePatchOrFix,
  generateTechnicalPrompt
} from '@/utils/codeWorkspaceEngine'
import { db } from '@/config/firebase'
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  updateDoc
} from 'firebase/firestore'

interface CodeWorkspaceState {
  code: string
  fileName: string
  language: SupportedLanguage
  instruction: string
  targetTool: TargetTool
  mode: WorkspaceMode
  projectName: string
  selectedSiteId: string | null

  // Dados carregados
  userSites: GhostMarketSiteOption[]
  isLoadingSites: boolean
  history: WorkspaceTaskHistory[]
  isLoadingHistory: boolean

  // Estados de análise e geração
  isAnalyzing: boolean
  analysisResult: CodeAnalysisResult | null
  generatedPrompt: GeneratedTechnicalPrompt | null
  patchedCode: string | null
  patchExplanation: string | null
  activeTaskId: string | null

  // Chave opcional da API Gemini para chamadas diretas
  geminiApiKey: string

  // Ações do Workspace
  setCode: (code: string) => void
  setFileName: (fileName: string) => void
  setLanguage: (language: SupportedLanguage) => void
  setInstruction: (instruction: string) => void
  setTargetTool: (tool: TargetTool) => void
  setMode: (mode: WorkspaceMode) => void
  setProjectName: (name: string) => void
  setGeminiApiKey: (key: string) => void

  fetchUserSites: (userId: string) => Promise<void>
  selectSite: (site: GhostMarketSiteOption) => void
  fetchHistory: (userId: string) => Promise<void>
  runExecution: (user: { uid: string; email?: string }) => Promise<void>
  applyToProjectSite: () => Promise<void>
  refineCode: (refineInstruction: string) => Promise<void>
  loadTaskFromHistory: (task: WorkspaceTaskHistory) => void
  deleteTaskFromHistory: (taskId: string) => Promise<void>
  clearWorkspace: () => void
}

const DEFAULT_SAMPLE_CODE = `import React, { useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export const HeroSection = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <section className="py-20 px-4 text-center bg-black text-white">
      <h1 className="text-4xl font-black mb-4">Crie Sites de Alta Conversão</h1>
      <p className="text-gray-400 mb-8 max-w-xl mx-auto">
        Automatize sua esteira comercial e gere clientes todos os dias.
      </p>
      
      {submitted ? (
        <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
          <CheckCircle2 className="w-5 h-5" />
          <span>Acesso liberado com sucesso!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex max-w-md mx-auto gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu melhor e-mail..."
            className="flex-1 bg-white/10 px-4 py-3 rounded-xl border border-white/20"
          />
          <button className="bg-purple-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2">
            Começar <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </section>
  )
}`

export const useCodeWorkspaceStore = create<CodeWorkspaceState>((set, get) => ({
  code: DEFAULT_SAMPLE_CODE,
  fileName: 'HeroSection.tsx',
  language: 'typescript',
  instruction: 'Melhore o design com efeitos neon dark premium, validação no e-mail e botão de WhatsApp flutuante.',
  targetTool: 'antigravity',
  mode: 'generate_prompt',
  projectName: 'Ghost Market SaaS',
  selectedSiteId: null,

  userSites: [],
  isLoadingSites: false,
  history: [],
  isLoadingHistory: false,

  isAnalyzing: false,
  analysisResult: null,
  generatedPrompt: null,
  patchedCode: null,
  patchExplanation: null,
  activeTaskId: null,

  geminiApiKey: localStorage.getItem('ghost_gemini_api_key') || '',

  setCode: (code: string) => {
    const detected = detectLanguage(code, get().fileName)
    set({ code, language: detected })
  },

  setFileName: (fileName: string) => {
    const detected = detectLanguage(get().code, fileName)
    set({ fileName, language: detected })
  },

  setLanguage: (language: SupportedLanguage) => set({ language }),
  setInstruction: (instruction: string) => set({ instruction }),
  setTargetTool: (targetTool: TargetTool) => set({ targetTool }),
  setMode: (mode: WorkspaceMode) => set({ mode }),
  setProjectName: (projectName: string) => set({ projectName }),

  setGeminiApiKey: (geminiApiKey: string) => {
    localStorage.setItem('ghost_gemini_api_key', geminiApiKey)
    set({ geminiApiKey })
  },

  fetchUserSites: async (userId: string) => {
    try {
      set({ isLoadingSites: true })
      const q = query(collection(db, 'sites'), where('userId', '==', userId))
      const snap = await getDocs(q)
      const sites: GhostMarketSiteOption[] = []
      snap.forEach((d) => {
        const data = d.data()
        sites.push({
          id: d.id,
          domain: data.domain || 'site-sem-dominio',
          publishedAt: data.publishedAt || '',
          domainType: data.domainType || 'subdomain',
          rawHtml: data.rawHtml || '',
          views: data.views || 0,
          isActive: data.isActive ?? true
        })
      })
      set({ userSites: sites, isLoadingSites: false })
    } catch (err) {
      console.warn('Erro ao carregar sites do usuário:', err)
      set({ isLoadingSites: false })
    }
  },

  selectSite: (site: GhostMarketSiteOption) => {
    const code = site.rawHtml || '<!-- Site vazio ou sem HTML importado -->'
    set({
      selectedSiteId: site.id,
      projectName: site.domain,
      fileName: 'index.html',
      language: 'html',
      code
    })
  },

  fetchHistory: async (userId: string) => {
    try {
      set({ isLoadingHistory: true })
      const q = query(
        collection(db, 'code_workspace_history'),
        where('userId', '==', userId)
      )
      const snap = await getDocs(q)
      const list: WorkspaceTaskHistory[] = []
      snap.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as WorkspaceTaskHistory)
      })

      // Ordena por data decrescente
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      set({ history: list, isLoadingHistory: false })
    } catch (err) {
      console.warn('Erro ao carregar histórico do workspace:', err)
      set({ isLoadingHistory: false })
    }
  },

  runExecution: async (user: { uid: string; email?: string }) => {
    const { code, instruction, language, targetTool, mode, projectName, selectedSiteId, geminiApiKey } = get()
    if (!code.trim() || !instruction.trim()) return

    set({ isAnalyzing: true })

    try {
      // 1. Análise arquitetural e estática
      const analysis = analyzeCodeArchitecture(code, language, instruction)

      // 2. Geração do Prompt Técnico estruturado com diretivas imperativas
      const promptResult = generateTechnicalPrompt({
        projectName: projectName || 'Projeto Web',
        code,
        instruction,
        language,
        targetTool,
        analysis
      })

      // 3. Proposta de correção ou patch (executa IA Gemini ou motor inteligente)
      const patchResult = await generateCodePatchOrFix(code, instruction, analysis, geminiApiKey)

      // 4. Salvar registro no Firestore
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      const nowIso = new Date().toISOString()

      const taskRecord: WorkspaceTaskHistory = {
        id: taskId,
        userId: user.uid,
        title: promptResult.title,
        projectName: projectName || 'Ghost Market',
        siteId: selectedSiteId || undefined,
        targetTool,
        mode,
        language,
        instruction,
        codeSnippet: code.slice(0, 5000), // Armazena trecho representativo
        generatedPrompt: promptResult.fullPromptText,
        patchedCode: patchResult ? patchResult.patchedCode : undefined,
        patchExplanation: patchResult ? patchResult.explanation : undefined,
        status: mode === 'apply_changes' ? 'draft' : mode === 'fix_code' ? 'code_fixed' : 'prompt_generated',
        createdAt: nowIso,
        updatedAt: nowIso
      }

      try {
        await setDoc(doc(db, 'code_workspace_history', taskId), taskRecord)
      } catch (storeErr) {
        console.warn('Aviso: Não foi possível persistir no Firestore, mantendo em memória:', storeErr)
      }

      set((state) => ({
        isAnalyzing: false,
        analysisResult: analysis,
        generatedPrompt: promptResult,
        patchedCode: patchResult ? patchResult.patchedCode : null,
        patchExplanation: patchResult ? patchResult.explanation : null,
        activeTaskId: taskId,
        history: [taskRecord, ...state.history]
      }))
    } catch (err) {
      console.error('Erro na execução do workspace:', err)
      set({ isAnalyzing: false })
      throw err
    }
  },

  applyToProjectSite: async () => {
    const { selectedSiteId, patchedCode, activeTaskId } = get()
    if (!selectedSiteId || !patchedCode) {
      throw new Error('Nenhum site selecionado ou código corrigido ausente para aplicar.')
    }

    try {
      const siteRef = doc(db, 'sites', selectedSiteId)
      const nowIso = new Date().toISOString()

      await updateDoc(siteRef, {
        rawHtml: patchedCode,
        updatedAt: nowIso
      })

      if (activeTaskId) {
        const taskRef = doc(db, 'code_workspace_history', activeTaskId)
        await updateDoc(taskRef, {
          status: 'applied_to_project',
          updatedAt: nowIso
        })
      }

      set((state) => ({
        code: patchedCode,
        history: state.history.map((h) =>
          h.id === activeTaskId ? { ...h, status: 'applied_to_project', updatedAt: nowIso } : h
        )
      }))
    } catch (err) {
      console.error('Erro ao aplicar código ao site:', err)
      throw err
    }
  },

  refineCode: async (refineInstruction: string) => {
    const { code, patchedCode, language, geminiApiKey } = get()
    const baseCode = patchedCode || code
    if (!baseCode.trim() || !refineInstruction.trim()) return

    set({ isAnalyzing: true })
    try {
      const analysis = analyzeCodeArchitecture(baseCode, language, refineInstruction)
      const result = await generateCodePatchOrFix(baseCode, refineInstruction, analysis, geminiApiKey)
      set({
        isAnalyzing: false,
        patchedCode: result.patchedCode,
        patchExplanation: result.explanation
      })
    } catch (err) {
      set({ isAnalyzing: false })
      throw err
    }
  },

  loadTaskFromHistory: (task: WorkspaceTaskHistory) => {
    set({
      code: task.codeSnippet,
      instruction: task.instruction,
      language: task.language,
      targetTool: task.targetTool,
      mode: task.mode,
      projectName: task.projectName,
      selectedSiteId: task.siteId || null,
      activeTaskId: task.id,
      generatedPrompt: task.generatedPrompt
        ? {
            title: task.title,
            targetTool: task.targetTool,
            projectContext: '',
            mainGoal: task.instruction,
            diagnosis: '',
            affectedComponents: [],
            expectedBehavior: '',
            constraints: [],
            securityRequirements: [],
            implementationPlan: [],
            testingSteps: [],
            acceptanceCriteria: [],
            fullPromptText: task.generatedPrompt,
            createdAt: task.createdAt
          }
        : null,
      patchedCode: task.patchedCode || null,
      patchExplanation: task.patchExplanation || null
    })
  },

  deleteTaskFromHistory: async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'code_workspace_history', taskId))
      set((state) => ({
        history: state.history.filter((h) => h.id !== taskId)
      }))
    } catch (err) {
      console.error('Erro ao excluir histórico:', err)
      throw err
    }
  },

  clearWorkspace: () => {
    set({
      code: '',
      fileName: 'script.tsx',
      instruction: '',
      selectedSiteId: null,
      analysisResult: null,
      generatedPrompt: null,
      patchedCode: null,
      patchExplanation: null,
      activeTaskId: null
    })
  }
}))
