import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Wand2, Copy, Check, Code, LayoutTemplate, Palette, Settings2, Zap, MonitorSmartphone } from 'lucide-react'
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

  // Handlers
  const toggleSection = (id: string) => {
    setFormData(prev => ({ ...prev, sections: { ...prev.sections, [id]: !prev.sections[id] } }))
  }

  const toggleFeature = (id: string) => {
    if (formData.tech === 'HTML + CSS + JS') return; // Bloquear funcionalidades dinâmicas se for HTML puro
    setFormData(prev => ({ ...prev, features: { ...prev.features, [id]: !prev.features[id] } }))
  }

  const generatePrompt = () => {
    setIsGenerating(true)
    
    setTimeout(() => {
      const activeSections = SECTION_OPTIONS.filter(s => formData.sections[s.id]).map(s => s.label).join(', ')
      const activeFeatures = FEATURE_OPTIONS.filter(f => formData.features[f.id]).map(f => f.label).join(', ')
      
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
    }, 1500)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    addToast('Prompt copiado!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  // Generic Pill Selector Component
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
              className={`px-5 py-2.5 rounded-full text-sm font-black transition-all flex items-center gap-2 border-2 relative overflow-hidden group ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : ''} ${
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

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Wand2 className="w-8 h-8 text-primary" /> Criador de Sites IA
        </h1>
        <p className="text-textSecondary mt-2 text-lg">Selecione as opções desejadas. Nosso robô fará o resto.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* ESQUERDA: FORMULÁRIO */}
        <div className="xl:col-span-7 space-y-6">
          
          <div className="bg-panel border border-border p-6 rounded-3xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-border/50 pb-4">
              <LayoutTemplate className="w-5 h-5 text-primary" /> Tipo de Negócio
            </h2>
            
            <div className="space-y-3">
              <label className="text-sm font-bold text-textSecondary uppercase tracking-widest">Qual o seu Nicho?</label>
              <PillSelector id="niches" options={availableNiches} value={formData.niche} onChange={v => setFormData({...formData, niche: v})} />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-textSecondary uppercase tracking-widest">O que você quer criar?</label>
              <PillSelector id="systemTypes" options={SYSTEM_TYPES} value={formData.systemType} onChange={v => setFormData({...formData, systemType: v})} />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-textSecondary uppercase tracking-widest">Público-Alvo principal</label>
              <PillSelector id="audiences" options={TARGET_AUDIENCES} value={formData.targetAudience} onChange={v => setFormData({...formData, targetAudience: v})} />
            </div>
            
            <div className="space-y-3 pt-4">
              <label className="text-sm font-bold text-textSecondary uppercase tracking-widest">Nome da Empresa (Opcional)</label>
              <Input className="bg-background border-2 border-border h-12 rounded-xl text-white" placeholder="Ex: Barbearia do Zé..." value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} />
            </div>
          </div>

          <div className="bg-panel border border-border p-6 rounded-3xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-border/50 pb-4">
              <Palette className="w-5 h-5 text-primary" /> Identidade Visual
            </h2>
            
            <div className="space-y-3">
              <label className="text-sm font-bold text-textSecondary uppercase tracking-widest">Estilo Visual</label>
              <PillSelector id="tones" options={TONES} value={formData.tone} onChange={v => setFormData({...formData, tone: v})} />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-textSecondary uppercase tracking-widest">Cores / Aparência</label>
              <PillSelector id="designs" options={DESIGNS} value={formData.design} onChange={v => setFormData({...formData, design: v})} />
            </div>
          </div>

          <div className="bg-panel border border-border p-6 rounded-3xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-border/50 pb-4">
              <Settings2 className="w-5 h-5 text-primary" /> Estrutura & Funcionalidades
            </h2>
            
            <div className="space-y-3">
              <label className="text-sm font-bold text-textSecondary uppercase tracking-widest">Seções da Página</label>
              <MultiPillSelector options={SECTION_OPTIONS} stateObj={formData.sections} onToggle={toggleSection} />
            </div>

            <div className="space-y-3 pt-4">
              <label className="text-sm font-bold text-textSecondary uppercase tracking-widest">Funcionalidades Extras</label>
              {formData.tech === 'HTML + CSS + JS' && <p className="text-xs text-warning mb-2">Funcionalidades avançadas estão desativadas porque você selecionou HTML puro.</p>}
              <MultiPillSelector options={FEATURE_OPTIONS} stateObj={formData.features} onToggle={toggleFeature} disabled={formData.tech === 'HTML + CSS + JS'} />
            </div>
          </div>

          <div className="bg-panel border border-border p-6 rounded-3xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-border/50 pb-4">
              <MonitorSmartphone className="w-5 h-5 text-primary" /> Tecnologia
            </h2>
            <PillSelector id="techs" options={TECHS} value={formData.tech} onChange={v => setFormData({...formData, tech: v})} />
          </div>

          <Button 
            className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all hover:scale-[1.02]" 
            onClick={generatePrompt}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2"><div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> Gerando Sistema...</span>
            ) : (
              <><Zap className="w-6 h-6 mr-2" /> Gerar Site Completo</>
            )}
          </Button>

        </div>

        {/* DIREITA: RESULTADO */}
        <div className="xl:col-span-5 h-full">
          <div className="bg-panel border border-border p-6 rounded-3xl h-full flex flex-col sticky top-8 min-h-[600px]">
            <div className="flex flex-row items-center justify-between border-b border-border/50 pb-4 mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Code className="w-5 h-5 text-primary" /> Código / Prompt IA</h2>
              {generatedPrompt && (
                <Button variant="secondary" size="sm" onClick={copyToClipboard} className="bg-background text-white border border-border hover:border-primary">
                  {copied ? <Check className="w-4 h-4 mr-2 text-success" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              )}
            </div>
            
            <div className="flex-1 flex flex-col">
              {generatedPrompt ? (
                <div className="bg-[#0b0416] rounded-2xl border border-border p-6 flex-1 overflow-auto custom-scrollbar">
                  <pre className="text-sm text-primary/80 whitespace-pre-wrap font-mono leading-relaxed">
                    {generatedPrompt}
                  </pre>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-textSecondary border-2 border-dashed border-border/50 rounded-2xl bg-background/30 p-10 text-center">
                  <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-6 shadow-xl">
                    <Zap className="w-10 h-10 text-borderHover" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Pronto para a Mágica?</h3>
                  <p className="text-lg">Selecione as opções ao lado com um clique e aperte em "Gerar Site Completo" para a IA criar o código perfeito para você.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
