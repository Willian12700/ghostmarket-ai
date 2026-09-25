import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Wand2, Copy, Check, Code, LayoutTemplate, Palette, Settings2, Zap, MonitorSmartphone, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/toastStore'
import { motion, AnimatePresence } from 'framer-motion'

const SYSTEM_TYPES = ['Landing Page', 'SaaS', 'E-commerce', 'Dashboard Administrativo', 'Aplicativo Web', 'Portfólio', 'Sistema Interno']
const TONES = ['Moderno', 'Minimalista', 'Clássico', 'Elegante', 'Rústico', 'Aconchegante', 'Premium', 'Corporativo', 'Divertido']
const DESIGNS = ['Dark Mode', 'Light Clean', 'Cyberpunk', 'Neon Vibrante', 'Monocromático', 'Luxo (Preto/Dourado)', 'Glassmorphism']
const TECHS = ['React / Vite', 'Next.js', 'HTML + CSS + JS', 'Vue.js', 'Angular']
const TARGET_AUDIENCES = ['B2B (Empresas)', 'B2C (Consumidores)', 'Jovens/Geração Z', 'Público A/B (Luxo)', 'Idosos/Terceira Idade', 'Profissionais Liberais']

const SECTION_OPTIONS = [
  { id: 'hero', label: 'Banner Principal (Hero)' },
  { id: 'about', label: 'Sobre Nós' },
  { id: 'benefits', label: 'Vantagens/Benefícios' },
  { id: 'catalog', label: 'Catálogo/Produtos' },
  { id: 'socialProof', label: 'Clientes/Marcas' },
  { id: 'testimonials', label: 'Depoimentos' },
  { id: 'faq', label: 'Perguntas Frequentes' },
  { id: 'pricing', label: 'Tabela de Preços' },
  { id: 'cta', label: 'Chamada para Ação' },
  { id: 'footer', label: 'Rodapé Completo' }
]

const FEATURE_OPTIONS = [
  { id: 'auth', label: 'Login/Cadastro' },
  { id: 'database', label: 'Banco de Dados' },
  { id: 'payments', label: 'Pagamento/Stripe' },
  { id: 'pix', label: 'Pagamento via PIX' },
  { id: 'api', label: 'Integração API' },
  { id: 'dashboard', label: 'Painel Admin' },
  { id: 'ai', label: 'Integração IA' },
  { id: 'whatsapp', label: 'Botão WhatsApp' },
  { id: 'delivery', label: 'Sistema de Delivery' }
]

export const PromptBuilder = () => {
  const { addToast } = useToastStore()
  
  const [step, setStep] = useState(1)
  const totalSteps = 5

  const [availableNiches, setAvailableNiches] = useState<string[]>([
    'SaaS / Tecnologia',
    'E-commerce',
    'Saúde / Clínica',
    'Finanças',
    'Imobiliária',
    'Educação / Cursos',
    'Restaurante / Delivery',
    'Estética / Barbearia',
    'Advocacia'
  ]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'global_settings', 'niches'), (snap) => {
      if (snap.exists() && snap.data().list) {
        setAvailableNiches(snap.data().list);
      }
    });
    return () => unsub();
  }, []);

  const [formData, setFormData] = useState({
      systemType: 'Landing Page',
      projectName: '',
      tone: 'Moderno',
      description: '',
      targetAudience: 'B2B (Empresas)',
      niche: 'SaaS / Tecnologia',
      tech: 'React / Vite',
      design: 'Dark Mode',
      sections: { hero: true, about: false, benefits: true, catalog: false, socialProof: false, testimonials: true, faq: true, pricing: false, cta: true, footer: true } as Record<string, boolean>,
      features: { auth: false, database: false, payments: false, pix: false, api: false, dashboard: false, ai: false, whatsapp: true, delivery: false } as Record<string, boolean>
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [copied, setCopied] = useState(false)

  const toggleSection = (id: string) => setFormData(prev => ({ ...prev, sections: { ...prev.sections, [id]: !prev.sections[id] } }))
  const toggleFeature = (id: string) => {
    if (formData.tech === 'HTML + CSS + JS') return;
    setFormData(prev => ({ ...prev, features: { ...prev.features, [id]: !prev.features[id] } }))
  }

  const generatePrompt = () => {
    setIsGenerating(true)
    
    setTimeout(() => {
      const activeSections = SECTION_OPTIONS.filter(s => formData.sections[s.id]).map(s => s.label).join(', ')
      const activeFeatures = formData.tech === 'HTML + CSS + JS' ? '' : FEATURE_OPTIONS.filter(f => formData.features[f.id]).map(f => f.label).join(', ')
      
      const prompt = `Contexto do Projeto:
Estou desenvolvendo um(a) ${formData.systemType} para o nicho de ${formData.niche}.
Nome do Projeto/Empresa: ${formData.projectName || '[Definir Nome]'}
Público-Alvo: ${formData.targetAudience}
Descrição do Negócio: ${formData.description || '[Adicionar descrição do negócio]'}

Stack Tecnológica:
- Front-end/Framework: ${formData.tech}
- Design System/Estilo Visual: ${formData.design}
- Tom de Voz / Aparência: ${formData.tone}

Estrutura da Interface (Páginas/Seções):
Por favor, inclua as seguintes seções na interface:
${activeSections}

Funcionalidades e Módulos:
O sistema deve conter os seguintes recursos funcionais implementados:
${activeFeatures || 'Nenhuma funcionalidade dinâmica extra (site estático).'}

Instruções para a IA (Antigravity):
1. Gere o código limpo, moderno, totalmente responsivo e utilizando Tailwind CSS para estilização (se compatível com a stack).
2. Utilize ícones modernos (Lucide React ou similar).
3. Respeite o esquema de cores sugerido pelo Design System escolhido (${formData.design}).
4. O código deve ser componentizado (separado em pequenos componentes lógicos) sempre que possível para facilitar a manutenção.
5. Siga rigorosamente o Tom de Voz definido para os textos gerados no layout (${formData.tone}).
`
      setGeneratedPrompt(prompt)
      setIsGenerating(false)
      setStep(5)
    }, 1500)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    addToast('Prompt copiado!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const nextStep = () => setStep(s => Math.min(totalSteps, s + 1))
  const prevStep = () => setStep(s => Math.max(1, s - 1))

  // Componentes de Seleção (Pills)
  const PillSelector = ({ id, options, value, onChange }: { id: string, options: string[], value: string, onChange: (val: string) => void }) => (
    <div className="flex flex-wrap gap-3">
      <AnimatePresence>
        {options.map(opt => {
          const isActive = value === opt;
          return (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`px-5 py-2.5 rounded-full text-sm font-black transition-all flex items-center gap-2 border-2 relative overflow-hidden group ${
                isActive 
                ? 'border-transparent text-white shadow-[0_0_25px_rgba(139,92,246,0.6)]' 
                : 'bg-panel border-border text-textSecondary hover:border-primary/50 hover:text-white hover:bg-primary/5'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId={`activePill-${id}`}
                  className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-indigo-600 -z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              {isActive && (
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                >
                  <Check className="w-3.5 h-3.5 text-white" />
                </motion.div>
              )}
              <span className="relative z-10">{opt}</span>
            </motion.button>
          )
        })}
      </AnimatePresence>
    </div>
  )

  const MultiPillSelector = ({ options, stateObj, onToggle, disabled = false }: { options: any[], stateObj: any, onToggle: (id: string) => void, disabled?: boolean }) => (
    <div className="flex flex-wrap gap-3">
      <AnimatePresence>
        {options.map(opt => {
          const isActive = stateObj[opt.id];
          return (
            <motion.button 
              whileHover={disabled ? {} : { scale: 1.05 }}
              whileTap={disabled ? {} : { scale: 0.95 }}
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(opt.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-black transition-all flex items-center gap-2 border-2 relative overflow-hidden group ${disabled ? 'opacity-20 cursor-not-allowed grayscale' : ''} ${
                isActive 
                ? 'border-transparent text-white shadow-[0_0_25px_rgba(139,92,246,0.6)]' 
                : 'bg-panel border-border text-textSecondary hover:border-primary/50 hover:text-white hover:bg-primary/5'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId={`activeMultiPill-${opt.id}`}
                  className="absolute inset-0 bg-gradient-to-r from-primary to-fuchsia-600 -z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              {isActive && (
                <motion.div 
                  initial={{ scale: 0, rotate: -90 }} 
                  animate={{ scale: 1, rotate: 0 }} 
                  className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                >
                  <Check className="w-3.5 h-3.5 text-white" />
                </motion.div>
              )}
              <span className="relative z-10">{opt.label}</span>
            </motion.button>
          )
        })}
      </AnimatePresence>
    </div>
  )

  // Variantes de Animação para os Steps
  const stepVariants = {
    initial: { opacity: 0, x: 20, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.3 } }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col bg-[#09090b] text-white selection:bg-primary/30">
      
      {/* CABEÇALHO / PROGRESSO */}
      <div className="pt-8 pb-4 px-6 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 justify-center mb-8">
          <Wand2 className="w-8 h-8 text-primary" /> Construtor Inteligente
        </h1>
        
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-panel rounded-full -z-10 overflow-hidden">
            <motion.div 
              className="h-full bg-primary" 
              initial={{ width: '0%' }}
              animate={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
              step === s ? 'bg-primary text-white shadow-[0_0_20px_rgba(139,92,246,0.6)] scale-110' 
              : step > s ? 'bg-primary/80 text-white' : 'bg-panel border-2 border-border text-textSecondary'
            }`}>
              {step > s ? <Check className="w-5 h-5" /> : s}
            </div>
          ))}
        </div>
      </div>

      {/* ÁREA DOS STEPS */}
      <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full px-6 pb-12 overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* PASSO 1: O Básico */}
          {step === 1 && (
            <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-10 py-6">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black mb-2 flex items-center justify-center gap-3"><LayoutTemplate className="w-7 h-7 text-primary" /> Detalhes do Negócio</h2>
                <p className="text-textSecondary text-lg">Vamos começar entendendo o que vamos construir hoje.</p>
              </div>
              
              <div className="space-y-4">
                <label className="text-sm font-bold text-textSecondary uppercase tracking-widest ml-2">Qual o seu Nicho?</label>
                <PillSelector id="niches" options={availableNiches} value={formData.niche} onChange={v => setFormData({...formData, niche: v})} />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-textSecondary uppercase tracking-widest ml-2">O que você quer criar?</label>
                <PillSelector id="systemTypes" options={SYSTEM_TYPES} value={formData.systemType} onChange={v => setFormData({...formData, systemType: v})} />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-textSecondary uppercase tracking-widest ml-2">Público-Alvo Principal</label>
                <PillSelector id="audiences" options={TARGET_AUDIENCES} value={formData.targetAudience} onChange={v => setFormData({...formData, targetAudience: v})} />
              </div>

              <div className="space-y-4 pt-4">
                <label className="text-sm font-bold text-textSecondary uppercase tracking-widest ml-2">Qual o nome da sua empresa/projeto?</label>
                <Input className="bg-panel border-2 border-border h-16 rounded-2xl text-white text-lg px-6 shadow-inner focus:border-primary transition-colors" placeholder="Digite aqui (Ex: Barbearia Vip)" value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} />
              </div>
            </motion.div>
          )}

          {/* PASSO 2: Tecnologia */}
          {step === 2 && (
            <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-10 py-6">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black mb-2 flex items-center justify-center gap-3"><MonitorSmartphone className="w-7 h-7 text-primary" /> Stack de Tecnologia</h2>
                <p className="text-textSecondary text-lg">Defina como a inteligência vai escrever seu código base.</p>
              </div>
              
              <div className="bg-panel border border-border p-8 rounded-3xl text-center">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Code className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-6">Escolha o Framework ou Linguagem</h3>
                <div className="flex justify-center">
                  <PillSelector id="techs" options={TECHS} value={formData.tech} onChange={v => setFormData({...formData, tech: v})} />
                </div>
                
                <AnimatePresence>
                  {formData.tech === 'HTML + CSS + JS' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-xl text-warning text-sm font-medium">
                      Atenção: Ao escolher HTML puro, algumas funcionalidades avançadas (como banco de dados e autenticação) serão desativadas no próximo passo.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* PASSO 3: Identidade Visual */}
          {step === 3 && (
            <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-10 py-6">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black mb-2 flex items-center justify-center gap-3"><Palette className="w-7 h-7 text-primary" /> Identidade Visual</h2>
                <p className="text-textSecondary text-lg">Como o seu sistema deve se parecer e qual será o tom de voz?</p>
              </div>
              
              <div className="space-y-4">
                <label className="text-sm font-bold text-textSecondary uppercase tracking-widest ml-2">Tom de Comunicação (Copywriting)</label>
                <PillSelector id="tones" options={TONES} value={formData.tone} onChange={v => setFormData({...formData, tone: v})} />
              </div>

              <div className="space-y-4 pt-6">
                <label className="text-sm font-bold text-textSecondary uppercase tracking-widest ml-2">Esquema de Cores e Estética</label>
                <PillSelector id="designs" options={DESIGNS} value={formData.design} onChange={v => setFormData({...formData, design: v})} />
              </div>
            </motion.div>
          )}

          {/* PASSO 4: Funcionalidades */}
          {step === 4 && (
            <motion.div key="step4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-10 py-6">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black mb-2 flex items-center justify-center gap-3"><Settings2 className="w-7 h-7 text-primary" /> Estrutura & Recursos</h2>
                <p className="text-textSecondary text-lg">Selecione tudo o que o seu site/sistema deve ter.</p>
              </div>
              
              <div className="space-y-4">
                <label className="text-sm font-bold text-textSecondary uppercase tracking-widest ml-2 flex justify-between">
                  <span>Blocos da Página Inicial</span>
                  <span className="text-primary text-xs normal-case">(Selecione múltiplos)</span>
                </label>
                <div className="p-6 bg-panel border border-border rounded-3xl">
                  <MultiPillSelector options={SECTION_OPTIONS} stateObj={formData.sections} onToggle={toggleSection} />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <label className="text-sm font-bold text-textSecondary uppercase tracking-widest ml-2 flex justify-between">
                  <span>Módulos Dinâmicos</span>
                  <span className="text-primary text-xs normal-case">(Selecione múltiplos)</span>
                </label>
                <div className="p-6 bg-panel border border-border rounded-3xl relative overflow-hidden">
                  {formData.tech === 'HTML + CSS + JS' && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                      <Zap className="w-8 h-8 text-warning mb-2" />
                      <p className="font-bold text-white text-lg">Módulos Desativados</p>
                      <p className="text-sm text-textSecondary max-w-sm text-center mt-1">Sistemas dinâmicos não são compatíveis com HTML/CSS puro. Volte ao passo 2 e escolha React ou Next.js para liberar.</p>
                    </div>
                  )}
                  <MultiPillSelector options={FEATURE_OPTIONS} stateObj={formData.features} onToggle={toggleFeature} disabled={formData.tech === 'HTML + CSS + JS'} />
                </div>
              </div>
            </motion.div>
          )}

          {/* PASSO 5: Resultado / Código */}
          {step === 5 && (
            <motion.div key="step5" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 py-6 h-[600px] flex flex-col">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black mb-2 flex items-center justify-center gap-3"><Code className="w-7 h-7 text-primary" /> Seu Prompt Inteligente</h2>
                <p className="text-textSecondary text-lg">Copiando este código e colando no cursor/claude, seu sistema nasce perfeito.</p>
              </div>
              
              <div className="flex-1 bg-[#0b0416] rounded-3xl border-2 border-border p-6 overflow-hidden flex flex-col relative group">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <Button onClick={copyToClipboard} className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copiado!' : 'Copiar Tudo'}
                  </Button>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar pr-4">
                  <pre className="text-sm md:text-base text-primary/90 whitespace-pre-wrap font-mono leading-relaxed">
                    {generatedPrompt}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* CONTROLES DE NAVEGAÇÃO */}
        <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-6">
          <Button 
            variant="ghost" 
            onClick={prevStep} 
            disabled={step === 1}
            className={`h-14 px-8 text-lg font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-textSecondary hover:text-white'}`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
          </Button>

          {step < 4 && (
            <Button 
              onClick={nextStep} 
              className="h-14 px-10 text-lg font-black bg-white text-black hover:bg-white/90 rounded-2xl shadow-xl hover:scale-105 transition-all"
            >
              Próximo <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}

          {step === 4 && (
            <Button 
              onClick={generatePrompt}
              disabled={isGenerating}
              className="h-14 px-10 text-lg font-black bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-105 transition-all"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2"><div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" /> Mágica acontecendo...</span>
              ) : (
                <><Zap className="w-5 h-5 mr-2" /> Gerar Site Agora</>
              )}
            </Button>
          )}

          {step === 5 && (
            <Button 
              onClick={() => setStep(1)} 
              className="h-14 px-10 text-lg font-black bg-panel border-2 border-border text-white hover:border-primary rounded-2xl transition-all"
            >
              Criar Novo Site
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}
