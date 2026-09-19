import { useState } from 'react'
import { Wand2, Copy, Check, Code, Video } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/toastStore'

export const PromptBuilder = () => {
  const { addToast } = useToastStore()
  
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    targetAudience: '',
    niche: '',
    tech: 'React',
    design: 'Dark SaaS',
    features: {
      auth: true,
      database: true,
      payments: false,
      api: true,
      dashboard: true,
      ai: false
    }
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [copied, setCopied] = useState(false)

  const handleFeatureToggle = (feature: keyof typeof formData.features) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }))
  }

  const generatePrompt = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const activeFeatures = Object.entries(formData.features)
        .filter(([_, isActive]) => isActive)
        .map(([key]) => key)
        .join(', ')

      const isHtmlMode = formData.tech === 'HTML + CSS + JS'
      
      const prompt = `# SYSTEM PROMPT - PROJETO ${formData.projectName.toUpperCase() || 'SAAS'}

VocÃª Ã© um Senior Software Engineer especializado em aplicaÃ§Ãµes SaaS.
Sua missÃ£o Ã© desenvolver a aplicaÃ§Ã£o descrita abaixo.

## 1. OBJETIVO
${formData.description || '[DescriÃ§Ã£o nÃ£o informada]'}

## 2. PÃšBLICO-ALVO
${formData.targetAudience || '[PÃºblico nÃ£o informado]'}
Nicho: ${formData.niche || '[NÃ£o informado]'}

## 3. STACK
Frontend: ${formData.tech}
Styling: ${isHtmlMode ? 'CSS Puro' : 'Tailwind CSS'}
Estado: ${isHtmlMode ? 'Nenhum / Vanilla JS' : 'Zustand ou Context API'}
Ãcones: ${isHtmlMode ? 'FontAwesome ou SVG' : 'Lucide React'}

## 4. DESIGN SYSTEM
Tema principal: ${formData.design}
UI deve ser moderna, limpa e responsiva, com foco em usabilidade e conversÃ£o.
Incluir estados de loading, estados vazios e tratamento de erros visuais (Error Boundaries).

## 5. FUNCIONALIDADES SOLICITADAS
${activeFeatures.length > 0 ? activeFeatures : 'Nenhuma especÃ­fica selecionada.'}

## 6. REGRAS DE IMPLEMENTAÃ‡ÃƒO
- Criar componentes reutilizÃ¡veis.
- O cÃ³digo deve ser modular e tipado (TypeScript).
- Prever fluxos de tratamento de erro para APIs.
- Evitar prop-drilling excessivo.
- Todas as pÃ¡ginas devem ter responsividade para Mobile, Tablet e Desktop.

## 7. CRITÃ‰RIOS DE CONCLUSÃƒO
- A aplicaÃ§Ã£o deve renderizar sem telas pretas.
- NavegaÃ§Ã£o fluida entre rotas.
- FormulÃ¡rios devem possuir validaÃ§Ã£o mÃ­nima.
- Design alinhado com o tema ${formData.design}.
`
      setGeneratedPrompt(prompt)
      setIsGenerating(false)
      addToast('Prompt gerado com sucesso!', 'success')
    }, 1500)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    addToast('Prompt copiado!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Prompt Builder</h2>
        <p className="text-textSecondary">Gere prompts avançados de arquitetura para criar sites e SaaS do zero.</p>
      </div>

      {/* SEÇÃO DE AULA / TUTORIAL */}
      <div className="bg-[#0b0416] border border-primary/20 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center shadow-[0_0_20px_rgba(139,92,246,0.05)]">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="w-full md:w-1/2 flex-shrink-0 z-10">
          <div className="aspect-VÍDEO bg-black rounded-xl overflow-hidden border border-primary/30 relative group shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" /* âš ï¸ COLOQUE O LINK DO SEU VÍDEO AQUI âš ï¸ */
              title="Tutorial Prompt Builder"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        <div className="z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase">
            <Video className="w-3 h-3" /> Tutorial Completo
          </div>
          <h3 className="text-2xl font-bold text-white">Como criar seu Site/SaaS do Zero</h3>
          <p className="text-textSecondary text-sm leading-relaxed">
            Assista este VÍDEO antes de começar! Aprenda a configurar o seu System Prompt perfeitamente para extrair o máximo da Inteligência Artificial. Com os comandos certos, a IA vai gerar o código perfeito de primeira.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Etapa 1 â€” Projeto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nome do projeto"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              />
              <Input
                label="Nicho"
                value={formData.niche}
                onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary">DescriÃ§Ã£o</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-textSecondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <Input
                label="PÃºblico-alvo"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Etapa 2 â€” Recursos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(formData.features).map((feature) => {
                  const isHtmlMode = formData.tech === 'HTML + CSS + JS'
                  return (
                    <label key={feature} className={`flex items-center space-x-2 ${isHtmlMode ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        className="rounded border-border bg-background text-primary focus:ring-primary disabled:opacity-50"
                        checked={isHtmlMode ? false : formData.features[feature as keyof typeof formData.features]}
                        disabled={isHtmlMode}
                        onChange={() => handleFeatureToggle(feature as keyof typeof formData.features)}
                      />
                      <span className={`text-sm capitalize ${isHtmlMode ? 'text-textSecondary/50 line-through' : 'text-textPrimary'}`}>
                        {feature.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Etapa 3 â€” Design</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.design}
                  onChange={(e) => setFormData({ ...formData, design: e.target.value })}
                >
                  <option>Dark SaaS</option>
                  <option>Cyberpunk</option>
                  <option>Minimalista</option>
                  <option>Premium</option>
                  <option>Corporativo</option>
                </select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Etapa 4 â€” Tecnologia</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.tech}
                  onChange={(e) => setFormData({ ...formData, tech: e.target.value })}
                >
                  <option>React</option>
                  <option>Next.js</option>
                  <option>Vite</option>
                  <option>HTML + CSS + JS</option>
                </select>
              </CardContent>
            </Card>
          </div>

          <Button 
            className="w-full" 
            size="lg" 
            onClick={generatePrompt}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><Wand2 className="w-5 h-5 mr-2" /> Gerar System Prompt</>
            )}
          </Button>
        </div>

        <div className="h-full">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Resultado</CardTitle>
              {generatedPrompt && (
                <Button variant="secondary" size="sm" onClick={copyToClipboard}>
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1">
              {generatedPrompt ? (
                <div className="bg-panelHover rounded-lg border border-border p-4 h-full min-h-[400px] overflow-auto">
                  <pre className="text-sm text-textSecondary whitespace-pre-wrap font-mono">
                    {generatedPrompt}
                  </pre>
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-textSecondary border-2 border-dashed border-border rounded-lg bg-background/50">
                  <Code className="w-12 h-12 mb-4 text-borderHover" />
                  <p>Preencha os dados e clique em gerar.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
