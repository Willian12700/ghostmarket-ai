import { useState } from 'react'
import { Wand2, Copy, Check, Code, Video, Bot, Zap, MonitorSmartphone, Plus, Trash2, Tag } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/toastStore'

export const PromptBuilder = () => {
  const { addToast } = useToastStore()
  
  const [formData, setFormData] = useState({
    aiPlatform: 'Antigravity',
    systemType: 'Landing Page (Site Institucional)',
    customSystemType: '',
    projectName: '',
    description: '',
    targetAudience: 'B2B (Empresas)',
    customAudience: '',
    niche: 'SaaS / Tecnologia',
    customNiche: '',
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
  const [services, setServices] = useState<{name: string, price: string}[]>([])
  const addService = () => setServices([...services, {name: '', price: ''}])
  const removeService = (index: number) => setServices(services.filter((_, i) => i !== index))
  const updateService = (index: number, field: 'name' | 'price', value: string) => {
    const newS = [...services];
    newS[index][field] = value;
    setServices(newS);
  }

  const handleFeatureToggle = (feature: keyof typeof formData.features) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }))
  }

  const generateAutoDescription = () => {
    const finalSystem = formData.systemType === 'Outro' ? formData.customSystemType : formData.systemType;
    const finalNiche = formData.niche === 'Outro' ? formData.customNiche : formData.niche;
    const finalAudience = formData.targetAudience === 'Outro' ? formData.customAudience : formData.targetAudience;
    
    let base = `Desenvolver um(a) ${finalSystem || 'sistema'} completo(a) voltado(a) para ` + (finalNiche || 'o mercado') + '. ';
    
    if (finalNiche.includes('E-commerce') || finalNiche.includes('Lojas')) {
      base += 'A aplicação deve focar em um catálogo de produtos atraente, carrinho de compras fluido e um checkout de alta conversão voltado para o público de ' + finalAudience + '.';
    } else if (finalNiche.includes('SaaS') || finalNiche.includes('Tecnologia')) {
      base += 'A solução será escalável, projetada para ' + finalAudience + ', contando com um dashboard gerencial intuitivo, gestão de assinaturas e automação de processos internos.';
    } else if (finalNiche.includes('Saúde') || finalNiche.includes('Médicos')) {
      base += 'O sistema tem o objetivo de facilitar o agendamento de consultas e acompanhamento de pacientes focando em ' + finalAudience + ', com painel de médicos e interface limpa e confiável.';
    } else if (finalNiche.includes('Finanças')) {
      base += 'Um sistema de gestão financeira e analytics seguro para ' + finalAudience + ', com gráficos em tempo real, controle de fluxo de caixa e relatórios detalhados.';
    } else if (finalNiche.includes('Educação')) {
      base += 'Uma plataforma EAD otimizada para ' + finalAudience + ', com área de membros, visualização de aulas em vídeo, progresso do aluno e emissão de certificados.';
    } else {
      base += 'A aplicação será estruturada para atender perfeitamente Á s necessidades de ' + finalAudience + ', entregando uma experiência de usuário (UX) premium, navegação rápida e painel administrativo completo.';
    }

    setFormData(prev => ({ ...prev, description: base }));
    addToast('Descrição gerada com IA âš¡', 'success');
  }

  const generatePrompt = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const activeFeatures = Object.entries(formData.features)
        .filter(([_, isActive]) => isActive)
        .map(([key]) => key)
        .join(', ')

      const isHtmlMode = formData.tech === 'HTML + CSS + JS'
      
      const finalSystemType = formData.systemType === 'Outro' ? formData.customSystemType : formData.systemType
      const finalNiche = formData.niche === 'Outro' ? formData.customNiche : formData.niche
      const finalAudience = formData.targetAudience === 'Outro' ? formData.customAudience : formData.targetAudience

      const prompt = `# SYSTEM INSTRUCTION - ARQUITETURA E DESENVOLVIMENTO
Você atuará como um Senior Full-Stack Software Engineer.
IA Escolhida: ${formData.aiPlatform}

## 1. VISÁO GERAL DO PROJETO
- **Tipo de Sistema**: ${finalSystemType || 'Não informado'}
- **Nome**: ${formData.projectName.toUpperCase() || 'SISTEMA/SAAS'}
- **Nicho**: ${finalNiche || 'Não informado'}
- **Público-alvo**: ${finalAudience || 'Não informado'}
  - **Objetivo Principal**: ${formData.description || 'Desenvolver um SaaS/Site de alta performance e conversão.'}
  
  ${services.length > 0 && services.some(s => s.name) ? `## 1.5. PRODUTOS / SERVIÇOS E PREÇOS OBRIGATÓRIOS
  O site DEVE listar os seguintes serviços/produtos com seus respectivos preços de forma atrativa:
  ${services.filter(s => s.name).map(s => `- ${s.name}: ${s.price || 'A combinar'}`).join('\n  ')}` : ''}

## 2. STACK TECNOLÓGICA
- **Linguagem/Framework**: ${formData.tech}
- **Estilização**: ${isHtmlMode ? 'CSS Puro' : 'Tailwind CSS'}
- **Ácones**: ${isHtmlMode ? 'FontAwesome' : 'lucide-react'}
${!isHtmlMode ? '- **Gerenciamento de Estado**: Zustand ou Context API' : ''}

## 3. DESIGN E UI/UX
- **Tema Visual**: ${formData.design}
- **Experiência do Usuário (UX)**: A interface deve ser extremamente moderna, responsiva, com foco absoluto em usabilidade. Utilize componentes bem espaçados, efeitos de hover sutis e feedback visual para o usuário.

## 4. FUNCIONALIDADES A IMPLEMENTAR
O sistema deve conter os seguintes módulos/features essenciais:
${activeFeatures || 'Apenas estrutura básica da Landing Page.'}

## 5. REGRAS DE CÓDIGO (CRÁTICO)
1. Escreva o código completo, sem placeholders como "// código aqui".
2. Separe componentes de forma modular.
3. Se houver integração com APIs, crie serviços isolados.
4. O código deve estar pronto para rodar sem erros (Production-ready).
5. Retorne a resposta utilizando a estrutura de artefatos ou blocos de código formatados corretamente.

AGORA, INICIE O DESENVOLVIMENTO DESSA APLICAÁ‡ÁO PASSO A PASSO.`

      setGeneratedPrompt(prompt)
      setIsGenerating(false)
      addToast('Prompt gerado com sucesso!', 'success')
    }, 1000)
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

      {/* SEÁ‡ÁO DE AULA / TUTORIAL */}
      <div className="bg-[#0b0416] border border-primary/20 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center shadow-[0_0_20px_rgba(139,92,246,0.05)]">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="w-full md:w-1/2 flex-shrink-0 z-10">
          <div className="aspect-video bg-black rounded-xl overflow-hidden border border-primary/30 relative group shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/DhDSGnVCYtM"
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
            Assista este vídeo antes de começar! Aprenda a configurar o seu System Prompt perfeitamente para extrair o máximo da Inteligência Artificial. Com os comandos certos, a IA vai gerar o código perfeito de primeira.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Etapa 1 â€” Projeto Base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary flex items-center gap-2"><Bot className="w-4 h-4"/> Qual IA você vai usar?</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.aiPlatform}
                  onChange={(e) => setFormData({ ...formData, aiPlatform: e.target.value })}
                >
                  <option>Antigravity</option>
                  <option>Claude 3.5 Sonnet</option>
                  <option>ChatGPT (OpenAI)</option>
                  <option>Google AI Studio</option>
                  <option>Gemini</option>
                  <option>Lovable</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary flex items-center gap-2"><MonitorSmartphone className="w-4 h-4"/> Tipo de Sistema</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.systemType}
                  onChange={(e) => setFormData({ ...formData, systemType: e.target.value })}
                >
                  <option>Landing Page (Site Institucional / Vendas)</option>
                  <option>Painel Administrativo (Dashboard)</option>
                  <option>SaaS (Software as a Service) Completo</option>
                  <option>E-commerce / Loja Virtual</option>
                  <option>Blog / Portal de Notícias</option>
                  <option>Aplicativo Web (PWA)</option>
                  <option>Outro</option>
                </select>
              </div>
              {formData.systemType === 'Outro' && (
                <Input
                  label="Especifique o Tipo de Sistema"
                  placeholder="Ex: Sistema de Gestão Escolar"
                  value={formData.customSystemType}
                  onChange={(e) => setFormData({ ...formData, customSystemType: e.target.value })}
                />
              )}

              <Input
                label="Nome do projeto"
                placeholder="Ex: GhostMarket AI"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary">Nicho de Mercado</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.niche}
                  onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                >
                  <option>SaaS / Tecnologia</option>
                  <option>E-commerce / Lojas Virtuais</option>
                  <option>Saúde e Bem-estar (Médicos/Estética)</option>
                  <option>Finanças / Investimentos</option>
                  <option>Imobiliária / Corretores</option>
                  <option>Educação / Cursos Online (EAD)</option>
                  <option>Restaurante / Delivery</option>
                  <option>Agência de Marketing / Serviços</option>
                  <option>Advocacia / Jurídico</option>
                  <option>Outro</option>
                </select>
              </div>
              {formData.niche === 'Outro' && (
                <Input
                  label="Digite seu Nicho"
                  placeholder="Ex: Petshop de Luxo"
                  value={formData.customNiche}
                  onChange={(e) => setFormData({ ...formData, customNiche: e.target.value })}
                />
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary">Público-alvo Principal</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                >
                  <option>B2B (Outras Empresas e Negócios)</option>
                  <option>B2C (Consumidor Final)</option>
                  <option>Jovens (18-24 anos)</option>
                  <option>Adultos e Profissionais (25-45 anos)</option>
                  <option>Idosos (60+ anos)</option>
                  <option>Profissionais AutÁ´nomos</option>
                  <option>Outro</option>
                </select>
              </div>
              {formData.targetAudience === 'Outro' && (
                <Input
                  label="Descreva o Público-alvo"
                  placeholder="Ex: Mães de primeira viagem"
                  value={formData.customAudience}
                  onChange={(e) => setFormData({ ...formData, customAudience: e.target.value })}
                />
              )}

              <div className="space-y-1.5 relative">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-textSecondary">Descrição do Projeto</label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={generateAutoDescription}
                    className="text-primary hover:text-primary hover:bg-primary/10 h-7 px-2 text-xs font-bold"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Gerar com IA
                  </Button>
                </div>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-textSecondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Explique o que o sistema/site faz em 2 ou 3 frases..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

                      {/* SEÇÃO DE PRODUTOS E SERVIÇOS */}
            <Card>
              <CardHeader className="pb-3 border-b border-border mb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  Serviços e Preços (Opcional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-textSecondary mb-2">
                  Adicione os produtos ou serviços que você quer que a IA inclua na página com seus respectivos valores. Ex: "Corte de Cabelo" - "R$ 35".
                </p>
                {services.map((svc, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input 
                      placeholder="Nome do Produto/Serviço" 
                      value={svc.name} 
                      onChange={(e) => updateService(idx, 'name', e.target.value)} 
                      className="flex-1"
                    />
                    <Input 
                      placeholder="Preço (ex: R$ 35)" 
                      value={svc.price} 
                      onChange={(e) => updateService(idx, 'price', e.target.value)} 
                      className="w-32"
                    />
                    <Button 
                      variant="ghost" 
                      onClick={() => removeService(idx)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 px-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                <Button 
                  variant="ghost" 
                  onClick={addService} 
                  className="w-full border-dashed border-border hover:border-primary text-textSecondary hover:text-primary mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Produto / Serviço
                </Button>
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
                  <option>Minimalista Claro</option>
                  <option>Premium (Dourado/Preto)</option>
                  <option>Corporativo Clássico</option>
                </select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Etapa 4 â€” Stack</CardTitle>
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
              <><Wand2 className="w-5 h-5 mr-2" /> Gerar System Prompt Inteligente</>
            )}
          </Button>
        </div>

        <div className="h-full">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Resultado do Prompt</CardTitle>
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
