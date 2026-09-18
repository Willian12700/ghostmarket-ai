import { useState } from 'react'
import { Copy, Wand2, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/toastStore'

export const Creator = () => {
  const { addToast } = useToastStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [copied, setCopied] = useState(false)
  
  const [formData, setFormData] = useState({
    projectName: '',
    niche: '',
    description: '',
    targetAudience: '',
    features: {
      auth: false,
      dashboard: false,
      crm: false,
      payments: false,
      leads: false,
      analytics: false,
      notifications: false,
      adminPanel: false,
      aiIntegration: false,
      api: false,
    },
    design: 'Dark SaaS',
    tech: 'React'
  })

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

      const prompt = `# SYSTEM PROMPT - PROJETO ${formData.projectName.toUpperCase() || 'SAAS'}

Você é um Senior Software Engineer especializado em aplicações SaaS.
Sua missão é desenvolver a aplicação descrita abaixo.

## 1. OBJETIVO
${formData.description || '[Descrição não informada]'}

## 2. PÚBLICO-ALVO
${formData.targetAudience || '[Público não informado]'}
Nicho: ${formData.niche || '[Não informado]'}

## 3. STACK
Frontend: ${formData.tech}
Styling: Tailwind CSS
Estado: Zustand ou Context API
Ícones: Lucide React

## 4. DESIGN SYSTEM
Tema principal: ${formData.design}
UI deve ser moderna, limpa e responsiva, com foco em usabilidade e conversão.
Incluir estados de loading, estados vazios e tratamento de erros visuais (Error Boundaries).

## 5. FUNCIONALIDADES SOLICITADAS
${activeFeatures.length > 0 ? activeFeatures : 'Nenhuma específica selecionada.'}

## 6. REGRAS DE IMPLEMENTAÇÃO
- Criar componentes reutilizáveis.
- O código deve ser modular e tipado (TypeScript).
- Prever fluxos de tratamento de erro para APIs.
- Evitar prop-drilling excessivo.
- Todas as páginas devem ter responsividade para Mobile, Tablet e Desktop.

## 7. CRITÉRIOS DE CONCLUSÃO
- A aplicação deve renderizar sem telas pretas.
- Navegação fluida entre rotas.
- Formulários devem possuir validação mínima.
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
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Etapa 1 — Projeto</CardTitle>
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
                <label className="text-sm font-medium text-textSecondary">Descrição</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-textSecondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <Input
                label="Público-alvo"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Etapa 2 — Recursos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(formData.features).map((feature) => (
                  <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-border bg-background text-primary focus:ring-primary"
                      checked={formData.features[feature as keyof typeof formData.features]}
                      onChange={() => handleFeatureToggle(feature as keyof typeof formData.features)}
                    />
                    <span className="text-sm text-textPrimary capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Etapa 3 — Design</CardTitle>
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
                <CardTitle className="text-base">Etapa 4 — Tecnologia</CardTitle>
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
                </select>
              </CardContent>
            </Card>
          </div>

          <Button 
            className="w-full" 
            size="lg" 
            onClick={generatePrompt}
            isLoading={isGenerating}
          >
            <Wand2 className="w-5 h-5 mr-2" />
            Gerar System Prompt
          </Button>
        </div>

        <div className="h-full">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Resultado</CardTitle>
              {generatedPrompt && (
                <Button variant="secondary" size="sm" onClick={copyToClipboard}>
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copiado!' : 'Copiar prompt'}
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1">
              {generatedPrompt ? (
                <div className="bg-background rounded-lg border border-border p-4 h-full min-h-[400px] overflow-auto">
                  <pre className="text-sm text-textSecondary whitespace-pre-wrap font-mono">
                    {generatedPrompt}
                  </pre>
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-textSecondary border-2 border-dashed border-border rounded-lg bg-background/50">
                  <Wand2 className="w-12 h-12 mb-4 text-borderHover" />
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
