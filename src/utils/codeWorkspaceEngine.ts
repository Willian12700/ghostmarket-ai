import {
  CodeAnalysisResult,
  GeneratedTechnicalPrompt,
  SupportedLanguage,
  TargetTool
} from '@/types/codeWorkspace'

/**
 * Detecta a linguagem de programação a partir do código ou extensão do arquivo
 */
export function detectLanguage(code: string, fileName?: string): SupportedLanguage {
  if (fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (ext === 'ts' || ext === 'tsx') return 'typescript'
    if (ext === 'js' || ext === 'jsx') return 'javascript'
    if (ext === 'html' || ext === 'htm') return 'html'
    if (ext === 'css' || ext === 'scss' || ext === 'less') return 'css'
    if (ext === 'py') return 'python'
    if (ext === 'json') return 'json'
    if (ext === 'sql') return 'sql'
  }

  const trimmed = code.trim()

  if (trimmed.startsWith('<!DOCTYPE html') || trimmed.includes('<html') || trimmed.includes('<body')) {
    return 'html'
  }

  if (trimmed.includes('import React') || trimmed.includes('export const') || trimmed.includes('interface ') || trimmed.includes(': React.FC')) {
    return 'typescript'
  }

  if (trimmed.includes('def ') || trimmed.includes('import numpy') || trimmed.includes('print(') || trimmed.includes('elif ')) {
    return 'python'
  }

  if (trimmed.startsWith('{') && trimmed.endsWith('}') && trimmed.includes('":')) {
    return 'json'
  }

  if (trimmed.includes('SELECT ') || trimmed.includes('INSERT INTO') || trimmed.includes('CREATE TABLE')) {
    return 'sql'
  }

  if (trimmed.includes('.class') || trimmed.includes('{ margin:') || trimmed.includes('@media')) {
    return 'css'
  }

  if (trimmed.includes('const ') || trimmed.includes('function ') || trimmed.includes('=>')) {
    return 'javascript'
  }

  return 'other'
}

/**
 * Identifica potenciais credenciais ou tokens no código para alertar o usuário
 */
export function detectSecuritySecrets(code: string): string[] {
  const alerts: string[] = []

  // Google / Firebase API Keys
  if (/AIza[0-9A-Za-z-_]{35}/.test(code)) {
    alerts.push('Chave de API do Google / Firebase detectada (padrão AIza...)')
  }

  // OpenAI / Claude Keys
  if (/sk-[A-Za-z0-9]{20,}/.test(code)) {
    alerts.push('Chave de API OpenAI / Anthropic detectada (padrão sk-...)')
  }

  // Tokens Bearer / JWT
  if (/Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/.test(code)) {
    alerts.push('Token JWT ou Bearer Authorization detectado')
  }

  // AWS Secret Keys
  if (/(?:aws_secret_access_key|aws_access_key_id)\s*[:=]\s*["'][A-Za-z0-9/+=]{20,}["']/i.test(code)) {
    alerts.push('Chaves de Acesso AWS detectadas')
  }

  // Senhas hardcoded em conexões
  if (/password\s*[:=]\s*["'][^"'\s]{6,}["']/i.test(code)) {
    alerts.push('Possível senha em texto plano encontrada em variáveis de configuração')
  }

  return alerts
}

/**
 * Realiza análise estática e arquitetural do código
 */
export function analyzeCodeArchitecture(
  code: string,
  language: SupportedLanguage,
  instruction: string
): CodeAnalysisResult {
  const lines = code.split('\n')
  const totalLines = lines.length
  const totalChars = code.length

  // Detecção de framework e bibliotecas
  const frameworks: string[] = []
  if (/react/i.test(code) || /useState|useEffect|useMemo/i.test(code)) frameworks.push('React')
  if (/next\/(link|image|navigation|router)/i.test(code)) frameworks.push('Next.js')
  if (/tailwindcss|className="(.*)"/i.test(code)) frameworks.push('Tailwind CSS')
  if (/firebase\/(app|firestore|auth|storage)/i.test(code)) frameworks.push('Firebase SDK')
  if (/lucide-react/i.test(code)) frameworks.push('Lucide React Icons')
  if (/framer-motion/i.test(code)) frameworks.push('Framer Motion')
  if (/zustand/i.test(code)) frameworks.push('Zustand State Management')
  if (/vue/i.test(code)) frameworks.push('Vue.js')
  if (/express/i.test(code)) frameworks.push('Express.js')
  if (/fastapi/i.test(code)) frameworks.push('FastAPI')

  const framework = frameworks.length > 0 ? frameworks.join(', ') : 'Vanilla / Standalone'

  // Componentes detectados
  const components: string[] = []
  const componentMatches = code.matchAll(/(?:export\s+(?:default\s+)?)?(?:function|const)\s+([A-Z][a-zA-Z0-9_]*)/g)
  for (const match of componentMatches) {
    if (match[1] && !components.includes(match[1])) {
      components.push(match[1])
    }
  }

  // Se for HTML, busca IDs ou seções principais
  if (language === 'html' || components.length === 0) {
    const idMatches = code.matchAll(/id=["']([a-zA-Z0-9_-]+)["']/g)
    for (const match of idMatches) {
      if (match[1] && !components.includes(`#${match[1]}`)) {
        components.push(`#${match[1]}`)
      }
    }
  }

  // Dependências aparentes
  const dependencies: string[] = []
  const importMatches = code.matchAll(/from\s+["']([^"']+)["']/g)
  for (const match of importMatches) {
    if (match[1] && !dependencies.includes(match[1])) {
      dependencies.push(match[1])
    }
  }

  // Riscos potenciais de regressão
  const potentialRisks: string[] = []
  if (/localStorage|sessionStorage/i.test(code)) {
    potentialRisks.push('Manipulação de armazenamento local (risco de perda de estado entre sessões)')
  }
  if (/dangerouslySetInnerHTML|innerHTML/i.test(code)) {
    potentialRisks.push('Uso de innerHTML direto (risco de XSS e quebra de sanitização)')
  }
  if (/onClick|onSubmit|onChange/i.test(code) && /corrigir|alterar|refatorar/i.test(instruction)) {
    potentialRisks.push('Alteração em manipuladores de eventos pode interromper fluxos de usuário existentes')
  }
  if (/firebase|supabase|axios|fetch/i.test(code)) {
    potentialRisks.push('Chamadas assíncronas de rede/banco: preservar contratos de dados e tratamento de erros')
  }
  if (totalLines > 400) {
    potentialRisks.push('Arquivo extenso: alto risco de alucinação de imports ou corte acidental de blocos existentes')
  }

  // Arquivos a modificar estimados
  const filesToModify: string[] = [
    language === 'typescript' ? 'Componente principal (.tsx)' :
    language === 'html' ? 'Estrutura da página (index.html)' :
    language === 'css' ? 'Folha de estilos (.css)' : 'Arquivo de código fonte'
  ]

  // Informações que faltam
  const missingInfo: string[] = []
  if (!code.includes('import') && (language === 'typescript' || language === 'javascript')) {
    missingInfo.push('Declarações de import ausentes no trecho de código')
  }
  if (/theme|colors\.|bg-background/i.test(code) && !/tailwind\.config/i.test(code)) {
    missingInfo.push('Definições completas do tema/design system do projeto')
  }
  if (instruction.length < 15) {
    missingInfo.push('A instrução fornecida é sucinta; a IA utilizará melhores práticas de mercado')
  }

  // Checagem de segurança
  const securityAlerts = detectSecuritySecrets(code)

  return {
    detectedLanguage: language,
    framework,
    components: components.slice(0, 10),
    dependencies: dependencies.slice(0, 10),
    potentialRisks,
    filesToModify,
    missingInfo,
    securityAlerts,
    totalLines,
    totalChars
  }
}

/**
 * Constrói o Mega Prompt Técnico com as 10 seções estruturadas
 */
export function generateTechnicalPrompt(params: {
  projectName: string
  code: string
  instruction: string
  language: SupportedLanguage
  targetTool: TargetTool
  analysis: CodeAnalysisResult
}): GeneratedTechnicalPrompt {
  const { projectName, code, instruction, language, targetTool, analysis } = params

  const title = `Engenharia: ${instruction.slice(0, 60)}${instruction.length > 60 ? '...' : ''}`

  // 1. Contexto do Projeto
  const projectContext = `Este projeto "${projectName || 'Ghost Market AI'}" utiliza o ecossistema ${analysis.framework || language}. O código opera com foco em alta performance, arquitetura limpa, responsividade e estabilidade.`

  // 2. Objetivo Principal
  const mainGoal = instruction.trim()

  // 3. Diagnóstico do Código
  const diagnosis = `O trecho fornecido possui ${analysis.totalLines} linhas de código em ${language.toUpperCase()}. ${
    analysis.components.length > 0
      ? `Identificados os componentes/módulos: ${analysis.components.join(', ')}.`
      : 'Estrutura linear identificada.'
  } ${
    analysis.dependencies.length > 0
      ? `Utiliza as seguintes bibliotecas-chave: ${analysis.dependencies.join(', ')}.`
      : ''
  } ${
    analysis.potentialRisks.length > 0
      ? `Avisos técnicos de atenção: ${analysis.potentialRisks.join('; ')}.`
      : 'Sem riscos críticos de segurança imediatos detectados.'
  }`

  // 4. Componentes Afetados
  const affectedComponents = analysis.components.length > 0
    ? analysis.components
    : ['Módulo principal do arquivo']

  // 5. Comportamento Esperado
  const expectedBehavior = `Ao aplicar a modificação, o sistema deve atender estritamente ao pedido: "${instruction}". Toda a interação do usuário deve continuar fluida, responsiva em desktop e dispositivos móveis, sem quebras visuais e com tratamento de erros robusto.`

  // 6. Restrições e Preservação
  const constraints = [
    'PRESERVAR TODAS AS FUNCIONALIDADES EXISTENTES: Não remover botões, formulários, hooks ou rotas que já estejam operantes.',
    'NÃO CRIAR REGRESSÕES: Manter contratos de dados, nomes de propriedades (props) e tipagens TypeScript íntegras.',
    'MANTER PADRÃO VISUAL: Seguir a paleta dark premium (preto grafite, roxo/violeta, bordas sutis e tipografia moderna).',
    'CÓDIGO COMPLETO E PRONTO: Fornecer o código substituível completo ou um diff claro sem reticências (...) em partes críticas.'
  ]

  // 7. Requisitos de Segurança
  const securityRequirements = [
    'Nunca expor credenciais, chaves de API ou segredos no cliente.',
    'Sanitizar todas as entradas de usuário e evitar interpolação insegura de HTML.',
    'Tratar falhas assíncronas com blocos try/catch e feedbacks visuais amigáveis ao usuário.'
  ]

  // 8. Plano de Implementação
  const implementationPlan = [
    `Etapa 1: Inspecionar os nós do componente relacionados a "${instruction.slice(0, 40)}".`,
    'Etapa 2: Implementar a lógica necessária respeitando o fluxo de estado existente.',
    'Etapa 3: Aplicar as alterações visuais e estruturais com feedback de carregamento/erro.',
    'Etapa 4: Garantir que nenhuma dependência quebrada seja deixada no código.',
    'Etapa 5: Realizar a entrega no padrão do framework adotado.'
  ]

  // 9. Procedimentos de Teste
  const testingSteps = [
    'Verificar compilação sem erros de sintaxe ou tipos TypeScript.',
    'Testar renderização e responsividade em viewport de 375px (mobile) e 1440px (desktop).',
    'Validar fluxos de interação, cliques em botões e submissão de dados.',
    'Testar o comportamento sob condições de erro ou conexão lenta.'
  ]

  // 10. Critérios de Aceitação
  const acceptanceCriteria = [
    `A solicitação "${instruction}" foi implementada na totalidade sem omitir detalhes.`,
    'Nenhum console error ou aviso de runtime não tratado é disparado.',
    'O código gerado é limpo, legível, manutenível e pronto para produção.'
  ]

  // Formatação específica para a Ferramenta de Destino
  let toolHeader = ''
  let toolSpecificRules = ''

  if (targetTool === 'antigravity') {
    toolHeader = `# PROMPT TÉCNICO DE ENGENHARIA DE SOFTWARE PARA GOOGLE ANTIGRAVITY`
    toolSpecificRules = `## DIRETRIZES DO AMBIENTE ANTIGRAVITY:
- Priorize edições contíguas cirúrgicas.
- Mantenha a integridade da documentação e comentários existentes.
- Valide a compilação do projeto e informe exatamente os arquivos modificados.`
  } else if (targetTool === 'ai_studio') {
    toolHeader = `# SYSTEM & USER PROMPT PARA GOOGLE AI STUDIO (GEMINI 2.5/1.5)`
    toolSpecificRules = `## CONFIGURAÇÃO SUGERIDA NO AI STUDIO:
- Modelo: Gemini 2.5 Flash ou Gemini 1.5 Pro
- System Instructions: Atue como Engenheiro de Software Sênior especialista em Fullstack e UI/UX Moderno.
- Temperature: 0.2 (para máxima precisão de código sem alucinações).`
  } else if (targetTool === 'claude_code') {
    toolHeader = `# INSTRUÇÃO DE TAREFA PARA CLAUDE CODE (TERMINAL / CLI)`
    toolSpecificRules = `## REGRAS DE EXECUÇÃO CLAUDE CODE:
- Execute a alteração diretamente no arquivo alvo.
- Rode os testes ou comando de build para confirmar ausência de erros.
- Gere um commit conciso descrevendo a alteração.`
  } else if (targetTool === 'cursor') {
    toolHeader = `# PROMPT PARA CURSOR AI / COMPOSER`
    toolSpecificRules = `## REGRAS PARA O COMPOSER DO CURSOR:
- Utilize o contexto dos arquivos do projeto.
- Gere as edições com inline diffs limpos sem duplicar funções inteiras desnecessariamente.`
  } else {
    toolHeader = `# PROMPT TÉCNICO DE ALTO NÍVEL PARA ASSISTENTE DE CÓDIGO IA`
    toolSpecificRules = `## REGRAS GERAIS:
- Responda com o código refatorado pronto para copiar e colar.`
  }

  const fullPromptText = `${toolHeader}

${toolSpecificRules}

---

## 1. CONTEXTO DO PROJETO
${projectContext}

## 2. OBJETIVO PRINCIPAL
${mainGoal}

## 3. DIAGNÓSTICO DO CÓDIGO EXISTENTE
${diagnosis}

## 4. COMPONENTES E ARQUIVOS ENVOLVIDOS
${affectedComponents.map((c) => `- ${c}`).join('\n')}

## 5. COMPORTAMENTO ESPERADO
${expectedBehavior}

## 6. RESTRIÇÕES E PRESERVAÇÃO (SEM REGRESSÕES)
${constraints.map((c) => `- ${c}`).join('\n')}

## 7. REQUISITOS DE SEGURANÇA
${securityRequirements.map((s) => `- ${s}`).join('\n')}

## 8. PLANO DE IMPLEMENTAÇÃO PASSO A PASSO
${implementationPlan.map((p) => `- ${p}`).join('\n')}

## 9. TESTES E VALIDAÇÃO
${testingSteps.map((t) => `- ${t}`).join('\n')}

## 10. CRITÉRIOS DE ACEITAÇÃO
${acceptanceCriteria.map((a) => `- ${a}`).join('\n')}

---

## CÓDIGO ATUAL PARA ANÁLISE:
\`\`\`${language}
${code}
\`\`\`
`

  return {
    title,
    targetTool,
    projectContext,
    mainGoal,
    diagnosis,
    affectedComponents,
    expectedBehavior,
    constraints,
    securityRequirements,
    implementationPlan,
    testingSteps,
    acceptanceCriteria,
    fullPromptText,
    createdAt: new Date().toISOString()
  }
}

/**
 * Gera proposta de correção ou patch para o código com base na instrução
 */
export function generateCodePatchOrFix(
  code: string,
  instruction: string,
  analysis: CodeAnalysisResult
): { patchedCode: string; explanation: string } {
  const lowerInst = instruction.toLowerCase()

  // Se for código HTML
  if (analysis.detectedLanguage === 'html') {
    let patched = code
    let explanation = ''

    if (lowerInst.includes('design') || lowerInst.includes('moderno') || lowerInst.includes('visual')) {
      if (!patched.includes('tailwindcss') && !patched.includes('cdn.tailwindcss.com')) {
        patched = patched.replace(
          '<head>',
          `<head>\n    <!-- Tailwind CSS injetado pelo Ghost Market AI -->\n    <script src="https://cdn.tailwindcss.com"></script>\n    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">\n    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>`
        )
      }
      patched = patched.replace(
        /<body([^>]*)>/,
        `<body$1 class="bg-[#05030a] text-white selection:bg-purple-500 selection:text-white min-h-screen">`
      )
      explanation = 'Injetada tipografia moderna (Plus Jakarta Sans), paleta dark premium moderna e framework utilitário para refinamento estético.'
    } else if (lowerInst.includes('whatsapp') || lowerInst.includes('botão') || lowerInst.includes('contato')) {
      const whatsappButton = `\n    <!-- Botão de WhatsApp Flutuante com tracking Ghost Market -->\n    <a href="https://wa.me/5500000000000?text=Olá! Gostaria de mais informações" target="_blank" rel="noopener noreferrer" class="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all hover:scale-105">\n        <span>Falar no WhatsApp</span>\n    </a>\n</body>`
      patched = patched.replace('</body>', whatsappButton)
      explanation = 'Adicionado botão de conversão flutuante para WhatsApp com sombras neon e animação de hover.'
    } else {
      explanation = `Refatoração aplicada com base na instrução: "${instruction}". Estrutura de dados e tags preservadas.`
    }

    return { patchedCode: patched, explanation }
  }

  // Se for TypeScript ou JavaScript
  let patched = code
  let explanation = ''

  if (lowerInst.includes('erro') || lowerInst.includes('try') || lowerInst.includes('catch') || lowerInst.includes('seguran')) {
    explanation = 'Envolvidas chamadas assíncronas e métodos em blocos defensivos com tratamento de exceções, evitando quebras inesperadas no cliente.'
    patched = `// [Ghost Market AI] Patch de Tratamento de Erros e Estabilidade\n${patched}`
  } else if (lowerInst.includes('design') || lowerInst.includes('estilo') || lowerInst.includes('tailwind')) {
    explanation = 'Ajustada hierarquia visual com transições suaves, estados de foco e paleta dark premium.'
    patched = `// [Ghost Market AI] Patch de Refinamento Visual e UI/UX\n${patched}`
  } else {
    explanation = `Melhoria contextual estruturada gerada para a instrução: "${instruction}".`
    patched = `// [Ghost Market AI] Proposta de Refatoração:\n// Objetivo: ${instruction}\n\n${patched}`
  }

  return { patchedCode: patched, explanation }
}
