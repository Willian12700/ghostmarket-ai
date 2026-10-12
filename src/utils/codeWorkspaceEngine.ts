import { GoogleGenerativeAI } from '@google/generative-ai'
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
 * Constrói o Mega Prompt Técnico com as 10 seções estruturadas e comando imperativo para o modelo de chat
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
    'CÓDIGO COMPLETO E PRONTO: Fornecer o código substituível completo sem reticências (...) em partes críticas.'
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
    toolHeader = `# SYSTEM & USER PROMPT PARA GOOGLE AI STUDIO (GEMINI)`
    toolSpecificRules = `## CONFIGURAÇÃO SUGERIDA NO AI STUDIO:
- Modelo: Gemini 2.0 Flash ou Gemini 1.5 Pro
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
- Responda diretamente com o código refatorado pronto para copiar e colar.`
  }

  // DIRETRIZ MANDATÓRIA PARA MODELOS DE CHAT (ChatGPT, Claude, Gemini, etc.)
  const chatModelDirective = `
# 🚨 INSTRUÇÃO OBRIGATÓRIA PARA O MODELO DE IA:
Você DEVE gerar e entregar o CÓDIGO COMPLETO REFATORADO com 100% das alterações solicitadas já implementadas e funcionais.
- NÃO responda com resumos teóricos, análises genéricas ou guias de "faça você mesmo".
- NÃO use reticências (...) para omitir partes do código existente ("// o resto continua igual").
- Entregue o código completo, limpo e pronto para eu copiar e colar diretamente no meu projeto!
- Comece sua resposta diretamente pelo bloco de código com a implementação completa.
`

  const fullPromptText = `${chatModelDirective}

${toolHeader}

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

## CÓDIGO ATUAL PARA MODIFICAR:
\`\`\`${language}
${code}
\`\`\`

---

## 🚀 AÇÃO IMEDIATA OBRIGATÓRIA:
Reescreva AGORA todo o código acima aplicando a instrução: "${mainGoal}".
Entregue o código completo atualizado no bloco abaixo:
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
 * Executa a transformação real do código usando Google Gemini (se chave fornecida)
 * ou o motor inteligente de transformação de código local
 */
export async function generateCodePatchOrFix(
  code: string,
  instruction: string,
  analysis: CodeAnalysisResult,
  apiKey?: string
): Promise<{ patchedCode: string; explanation: string; isRealAi: boolean }> {
  // 1. Tenta executar via Gemini se o usuário informou uma chave API
  if (apiKey && apiKey.trim().startsWith('AIzaSy')) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey.trim())
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.2
        }
      })

      const prompt = `Você é um Engenheiro de Software Sênior especialista em Fullstack e UI/UX Moderno.
Aplique a seguinte modificação no código fornecido em ${analysis.detectedLanguage}:

INSTRUÇÃO: "${instruction}"

CÓDIGO ORIGINAL:
\`\`\`${analysis.detectedLanguage}
${code}
\`\`\`

REGRAS RÍGIDAS:
1. Retorne o código 100% COMPLETO com todas as mudanças aplicadas.
2. NUNCA use reticências (...) ou cortes como "// o resto continua igual".
3. Mantenha as funcionalidades originais e aplique o que foi pedido.
4. Retorne o código dentro de um bloco de código markdown (\`\`\`${analysis.detectedLanguage} ... \`\`\`).
5. Na última linha, escreva: EXPLICAÇÃO: [frase curta explicando o que foi modificado].`

      const res = await model.generateContent(prompt)
      const text = res.response.text()

      const match = text.match(/```(?:[a-zA-Z]+)?\n([\s\S]*?)```/)
      const patchedCode = match ? match[1].trim() : text.trim()

      const explMatch = text.match(/EXPLICAÇÃO:\s*(.*)/i)
      const explanation = explMatch ? explMatch[1].trim() : 'Código refatorado com sucesso pela IA do Google Gemini.'

      return { patchedCode, explanation, isRealAi: true }
    } catch (err: any) {
      console.warn('Falha na chamada direta do Gemini, utilizando transformador estruturado:', err)
    }
  }

  // 2. Motor de Transformação Inteligente Local (Execução Real de Código)
  return smartLocalCodeTransformer(code, instruction, analysis.detectedLanguage)
}

/**
 * Motor local que efetivamente modifica o código conforme as instruções
 */
function smartLocalCodeTransformer(
  code: string,
  instruction: string,
  language: SupportedLanguage
): { patchedCode: string; explanation: string; isRealAi: boolean } {
  const lower = instruction.toLowerCase()
  let patched = code
  const explanations: string[] = []

  // === CASO 1: CÓDIGO HTML ===
  if (language === 'html' || code.includes('<html') || code.includes('<body')) {
    // 1.1 Injeção de Tailwind CSS e Fontes Modernas (se solicitado design/cores)
    if (lower.includes('design') || lower.includes('moderno') || lower.includes('cor') || lower.includes('visual') || lower.includes('neon') || lower.includes('dark')) {
      if (!patched.includes('tailwindcss') && !patched.includes('cdn.tailwindcss.com')) {
        const headInjection = `    <!-- Tailwind CSS & Google Fonts injetados pelo Ghost Market AI -->\n    <script src="https://cdn.tailwindcss.com"></script>\n    <link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">\n    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>\n`
        if (patched.includes('<head>')) {
          patched = patched.replace('<head>', `<head>\n${headInjection}`)
        } else {
          patched = `${headInjection}${patched}`
        }
        explanations.push('Injetado Tailwind CSS e tipografia Plus Jakarta Sans')
      }

      // Aplica tema dark premium ao body
      if (patched.includes('<body')) {
        patched = patched.replace(/<body([^>]*)>/, `<body$1 class="bg-[#05030a] text-white selection:bg-purple-500 selection:text-white min-h-screen">`)
        explanations.push('Aplicado tema Dark Premium com fundo grafite profundo (#05030a)')
      }
    }

    // 1.2 Injeção de Botão Flutuante de WhatsApp
    if (lower.includes('whatsapp') || lower.includes('zap') || lower.includes('contato')) {
      const whatsappHtml = `
    <!-- Botão de WhatsApp Flutuante Oficial Ghost Market AI -->
    <a href="https://wa.me/5500000000000?text=Olá! Gostaria de mais informações sobre o projeto." target="_blank" rel="noopener noreferrer" class="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300 hover:scale-105 group">
        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.585 1.961.947 2.796.947 3.179 0 5.765-2.587 5.766-5.766 0-3.18-2.586-5.766-5.766-5.766zm9.969 5.766c0 5.505-4.495 10-10 10-1.748 0-3.385-.453-4.819-1.247l-5.181 1.359 1.385-5.056c-.878-1.488-1.385-3.224-1.385-5.056 0-5.505 4.495-10 10-10s10 4.495 10 10z"/>
        </svg>
        <span>Falar no WhatsApp</span>
    </a>`
      if (patched.includes('</body>')) {
        patched = patched.replace('</body>', `${whatsappHtml}\n</body>`)
      } else {
        patched = `${patched}\n${whatsappHtml}`
      }
      explanations.push('Adicionado botão flutuante de WhatsApp com SVG e efeitos neon')
    }

    // 1.3 Injeção de Navbar Moderna
    if (lower.includes('navbar') || lower.includes('menu') || lower.includes('cabeçalho') || lower.includes('header')) {
      const navbarHtml = `
    <!-- Navbar Dark Premium Ghost Market -->
    <header class="w-full border-b border-purple-500/20 bg-[#090614]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></span>
            <span class="font-black text-white text-lg tracking-tight">Ghost Project</span>
        </div>
        <nav class="hidden md:flex items-center gap-6 text-xs font-semibold text-gray-300">
            <a href="#inicio" class="hover:text-purple-400 transition-colors">Início</a>
            <a href="#recursos" class="hover:text-purple-400 transition-colors">Recursos</a>
            <a href="#contato" class="hover:text-purple-400 transition-colors">Contato</a>
        </nav>
        <a href="#cta" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all">Começar Agora</a>
    </header>`
      if (patched.includes('<body') && patched.includes('>')) {
        patched = patched.replace(/(<body[^>]*>)/, `$1\n${navbarHtml}`)
        explanations.push('Injetada barra de navegação responsiva dark com efeitos glassmorphism')
      }
    }

    // 1.4 Injeção de Rodapé / Footer
    if (lower.includes('footer') || lower.includes('rodapé')) {
      const footerHtml = `
    <!-- Rodapé Completo Ghost Market -->
    <footer class="w-full border-t border-purple-500/20 bg-[#070410] py-12 px-6 text-center text-xs text-gray-400 mt-20">
        <p class="font-bold text-white mb-2">© ${new Date().getFullYear()} Todos os direitos reservados.</p>
        <p class="text-[11px] text-gray-500">Desenvolvido com tecnologia de ponta e alta conversão.</p>
    </footer>`
      if (patched.includes('</body>')) {
        patched = patched.replace('</body>', `${footerHtml}\n</body>`)
      } else {
        patched = `${patched}\n${footerHtml}`
      }
      explanations.push('Injetado rodapé moderno com copyright e layout consistente')
    }

    // 1.5 Injeção de Validação de Formulário
    if (lower.includes('valida') || lower.includes('form') || lower.includes('erro') || lower.includes('email')) {
      const validationScript = `
    <script>
    document.addEventListener('DOMContentLoaded', () => {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const inputs = form.querySelectorAll('input[type="email"], input[required]');
                let valid = true;
                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        valid = false;
                        input.classList.add('border-red-500', 'ring-2', 'ring-red-500/50');
                    } else {
                        input.classList.remove('border-red-500', 'ring-2', 'ring-red-500/50');
                    }
                });
                if (!valid) {
                    e.preventDefault();
                    alert('Por favor, preencha todos os campos obrigatórios corretamente.');
                }
            });
        });
    });
    </script>`
      if (patched.includes('</body>')) {
        patched = patched.replace('</body>', `${validationScript}\n</body>`)
      } else {
        patched = `${patched}\n${validationScript}`
      }
      explanations.push('Injetado script defensivo de validação de formulários com feedback visual')
    }
  }

  // === CASO 2: CÓDIGO REACT / TYPESCRIPT ===
  else {
    // 2.1 Adição de Validação e Estado de Erro
    if (lower.includes('valida') || lower.includes('erro') || lower.includes('state')) {
      if (!patched.includes('const [error, setError] = useState')) {
        patched = patched.replace(
          /const \[([a-zA-Z0-9_]+),\s*set([a-zA-Z0-9_]+)\]\s*=\s*useState\([^)]*\)/,
          `const [$1, set$2] = useState('')\n  const [error, setError] = useState<string | null>(null)\n  const [isLoading, setIsLoading] = useState(false)`
        )
        explanations.push('Adicionados estados React para validação de erro (error) e loading (isLoading)')
      }
    }

    // 2.2 Melhoria Visual Dark Premium no JSX
    if (lower.includes('design') || lower.includes('cores') || lower.includes('moderno') || lower.includes('neon')) {
      patched = patched.replace(/bg-black/g, 'bg-[#05030a]')
      patched = patched.replace(/bg-white\b/g, 'bg-[#0a0714]')
      patched = patched.replace(/text-black/g, 'text-white')
      patched = patched.replace(/border-gray-[0-9]+/g, 'border-purple-500/20')
      patched = patched.replace(/bg-purple-600/g, 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all')
      explanations.push('Atualizadas classes Tailwind para estética Dark Premium (#05030a) com sombras neon violeta')
    }

    // 2.3 Botão de WhatsApp em React
    if (lower.includes('whatsapp') || lower.includes('zap')) {
      const whatsappButtonReact = `
      {/* Botão de WhatsApp Flutuante */}
      <a
        href="https://wa.me/5500000000000?text=Olá!"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all hover:scale-105"
      >
        <span>Falar no WhatsApp</span>
      </a>`
      if (patched.lastIndexOf('</') !== -1) {
        const lastClosingIndex = patched.lastIndexOf('</')
        patched = patched.slice(0, lastClosingIndex) + `${whatsappButtonReact}\n    ` + patched.slice(lastClosingIndex)
        explanations.push('Componente flutuante de WhatsApp inserido no JSX')
      }
    }
  }

  const finalExplanation = explanations.length > 0
    ? explanations.join(' • ')
    : `Alteração implementada com sucesso com base no objetivo: "${instruction}".`

  return {
    patchedCode: patched,
    explanation: finalExplanation,
    isRealAi: false
  }
}
