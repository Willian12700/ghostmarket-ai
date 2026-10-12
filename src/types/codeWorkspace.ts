export type TargetTool = 'antigravity' | 'ai_studio' | 'claude_code' | 'cursor' | 'chatgpt'

export type WorkspaceMode = 'generate_prompt' | 'fix_code' | 'apply_changes'

export type SupportedLanguage =
  | 'typescript'
  | 'javascript'
  | 'html'
  | 'css'
  | 'python'
  | 'json'
  | 'sql'
  | 'other'

export interface CodeAnalysisResult {
  detectedLanguage: SupportedLanguage
  framework: string
  components: string[]
  dependencies: string[]
  potentialRisks: string[]
  filesToModify: string[]
  missingInfo: string[]
  securityAlerts: string[]
  totalLines: number
  totalChars: number
}

export interface GeneratedTechnicalPrompt {
  title: string
  targetTool: TargetTool
  projectContext: string
  mainGoal: string
  diagnosis: string
  affectedComponents: string[]
  expectedBehavior: string
  constraints: string[]
  securityRequirements: string[]
  implementationPlan: string[]
  testingSteps: string[]
  acceptanceCriteria: string[]
  fullPromptText: string
  createdAt: string
}

export interface WorkspaceTaskHistory {
  id: string
  userId: string
  title: string
  projectName: string
  siteId?: string
  targetTool: TargetTool
  mode: WorkspaceMode
  language: SupportedLanguage
  instruction: string
  codeSnippet: string
  generatedPrompt?: string
  patchedCode?: string
  patchExplanation?: string
  status: 'draft' | 'prompt_generated' | 'code_fixed' | 'applied_to_project'
  createdAt: string
  updatedAt: string
}

export interface GhostMarketSiteOption {
  id: string
  domain: string
  publishedAt: string
  domainType?: string
  rawHtml?: string
  views?: number
  isActive?: boolean
}
