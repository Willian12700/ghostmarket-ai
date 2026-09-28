import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Wand2, Copy, Check, Code, LayoutTemplate, Palette, Settings2, Zap, MonitorSmartphone, ArrowRight, ArrowLeft, MapPin, Plus, Trash2, Cpu, FileCode2 } from 'lucide-react'
import { CreationStepper } from '@/components/ui/CreationStepper'
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
  const navigate = useNavigate()
  
  const [promptStyle, setPromptStyle] = useState<'manual' | 'google' | null>(null)
  const [step, setStep] = useState(1)
  const totalSteps = promptStyle === 'google' ? 4 : (promptStyle === 'manual' ? 6 : 1)

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

  const [googleData, setGoogleData] = useState('')
  const [googleComplexity, setGoogleComplexity] = useState<'static' | 'dynamic' | null>(null)
  
  const [products, setProducts] = useState([{ name: '', price: '', image: '' }])

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
      features: { auth: false, database: false, payments: false, pix: false, api: false, dashboard: false, ai: false, whatsapp: true, delivery: false } as Record<string, boolean>,
      whatsappNumber: ''
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [copied, setCopied] = useState(false)

  const toggleSection = (id: string) => setFormData(prev => ({ ...prev, sections: { ...prev.sections, [id]: !prev.sections[id] } }))
  const toggleFeature = (id: string) => {
    if (promptStyle === 'manual' && formData.tech === 'HTML + CSS + JS') return;
    setFormData(prev => ({ ...prev, features: { ...prev.features, [id]: !prev.features[id] } }))
  }

  const generatePrompt = () => {
    setIsGenerating(true)
    
    setTimeout(() => {
      let prompt = '';
      
      if (promptStyle === 'google') {
        const activeSections = SECTION_OPTIONS.filter(s => formData.sections[s.id]).map(s => s.label).join(', ')
        const activeFeatures = FEATURE_OPTIONS.filter(f => formData.features[f.id]).map(f => {
            if (f.id === 'whatsapp' && formData.whatsappNumber) {
              return `Botão WhatsApp (Link direto: https://wa.me/55${formData.whatsappNumber})`
            }
            return f.label
          }).join(', ')

        const stackInfo = googleComplexity === 'static' 
          ? 'HTML, CSS puro e JavaScript vanilla (Sem frameworks, apenas arquivos web nativos).'
          : 'Ferramentas avançadas (React, Lovable, Google AI Studio, Antigravity) para um sistema completo.';

        const structureInfo = googleComplexity === 'static'
          ? `\n\nEstrutura da Interface (Páginas/Seções):\nPor favor, inclua as seguintes seções na interface:\n${activeSections || 'Crie as seções básicas de uma Landing Page.'}`
          : `\n\nFuncionalidades e Módulos:\nO sistema deve conter os seguintes recursos funcionais implementados:\n${activeFeatures || 'Desenvolva as funcionalidades completas de um sistema robusto.'}`;

        prompt = `Atue como um Desenvolvedor Front-end Senior e Especialista em UI/UX.

Contexto:
Preciso que você crie uma página/sistema profissional, moderno e de alta conversão usando:
${stackInfo}

Abaixo estão as informações extraídas do Google Maps sobre o estabelecimento. Use esses dados REAIS para compor os textos, endereço, horários, avaliações, nome da empresa e serviços oferecidos no site:

DADOS DO ESTABELECIMENTO:
${googleData}${structureInfo}

Instruções para a IA (Antigravity/Lovable):
1. Gere o código limpo, moderno e totalmente responsivo.
2. Crie uma paleta de cores baseada no nicho do estabelecimento (seja criativo e premium).
3. O código deve ser componentizado sempre que possível.
4. Adicione uma seção de "Avaliações" usando as reviews fornecidas.
5. Adicione uma seção de "Localização e Horários".
6. Crie um botão flutuante de WhatsApp.`;
      } else {
        const activeSections = SECTION_OPTIONS.filter(s => formData.sections[s.id]).map(s => s.label).join(', ')
        const activeFeatures = formData.tech === 'HTML + CSS + JS' ? '' : FEATURE_OPTIONS.filter(f => formData.features[f.id]).map(f => {
            if (f.id === 'whatsapp' && formData.whatsappNumber) {
              return `Botão WhatsApp (Link direto: https://wa.me/55${formData.whatsappNumber})`
            }
            return f.label
          }).join(', ')
        
        const validProducts = products.filter(p => p.name.trim() !== '');
        const productsText = validProducts.length > 0 
          ? `\n\nProdutos e Serviços (Incluir no catálogo):\n` + validProducts.map(p => `- ${p.name} (${p.price}) | Imagem: ${p.image}`).join('\n')
          : '';

        prompt = `Contexto do Projeto:
Estou desenvolvendo um(a) ${formData.systemType} para o nicho de ${formData.niche}.
Nome do Projeto/Empresa: ${formData.projectName || '[Definir Nome]'}
Público-Alvo: ${formData.targetAudience}
Descrição do Negócio: ${formData.description || '[Adicionar descrição do negócio]'}${productsText}

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
5. Siga rigorosamente o Tom de Voz definido para os textos gerados no layout (${formData.tone}).`
      }
      
      setGeneratedPrompt(prompt)
      setIsGenerating(false)
      setStep(promptStyle === 'google' ? 4 : 6)
    }, 1500)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    addToast('Prompt copiado!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const nextStep = () => {
    if (promptStyle === 'google' && step === 2 && !googleComplexity) {
      addToast('Escolha a complexidade do sistema!', 'error');
      return;
    }
    setStep(s => Math.min(totalSteps, s + 1))
  }
  
  const prevStep = () => {
    if (step === 1 && promptStyle !== null) {
      setPromptStyle(null);
      return;
    }
    setStep(s => Math.max(1, s - 1))
  }

  const addProduct = () => setProducts([...products, { name: '', price: '', image: '' }])
  const removeProduct = (idx: number) => {
    const newP = [...products];
    newP.splice(idx, 1);
    setProducts(newP);
  }
  const updateProduct = (idx: number, field: string, val: string) => {
    const newP = [...products];
    (newP[idx] as any)[field] = val;
    setProducts(newP);
  }

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

  const stepVariants = {
    initial: { opacity: 0, x: 20, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.3 } }
  }

  const isLastStep = (promptStyle === 'google' && step === 4) || (promptStyle === 'manual' && step === 6);
  const isGeneratingStep = (promptStyle === 'google' && step === 3) || (promptStyle === 'manual' && step === 5);

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col bg-[#09090b] text-white selection:bg-primary/30 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 15, ease: "linear" }} className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/20 blur-[150px] rounded-full mix-blend-screen" />
        <motion.div animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <motion.div animate={{ x: [0, 100, 0], y: [0, 100, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 25, ease: "linear" }} className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)]" style={{ backgroundSize: '24px 24px' }}></div>
      </div>
      
      <div className="pt-8 pb-4 px-6 max-w-4xl mx-auto w-full relative z-10">
        <CreationStepper currentStep={2} />
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 justify-center mb-8">
          <Wand2 className="w-8 h-8 text-primary" /> Construtor Inteligente
        </h1>
        
        {promptStyle && (
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-panel rounded-full -z-10 overflow-hidden">
              <motion.div 
                className="h-full bg-primary" 
                initial={{ width: '0%' }}
                animate={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
              <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                step === s ? 'bg-primary text-white shadow-[0_0_20px_rgba(139,92,246,0.6)] scale-110' 
                : step > s ? 'bg-primary/80 text-white' : 'bg-panel border-2 border-border text-textSecondary'
              }`}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 pb-12 overflow-y-auto overflow-x-hidden custom-scrollbar pt-6">
        <AnimatePresence mode="wait">
          
          {promptStyle === null && (
            <motion.div key="step0" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-10 py-6">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black mb-2 flex items-center justify-center gap-3"><Wand2 className="w-7 h-7 text-primary" /> Escolha o Estilo do Prompt</h2>
                <p className="text-textSecondary text-lg">Como você prefere gerar as informações do seu site?</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => { setPromptStyle('manual'); setStep(1); }} className="p-8 bg-panel border-2 border-border hover:border-primary rounded-3xl text-left group transition-all">
                  <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Settings2 className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Prompt Manual</h3>
                  <p className="text-textSecondary">Você responde as perguntas passo a passo, define nicho, módulos e cadastra os produtos manualmente.</p>
                </button>

                <button onClick={() => { setPromptStyle('google'); setStep(1); }} className="p-8 bg-panel border-2 border-border hover:border-green-500 rounded-3xl text-left group transition-all">
                  <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <MapPin className="w-7 h-7 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Via Google Maps</h3>
                  <p className="text-textSecondary">Cole as informações direto do Google Maps. O resultado final fica mais profissional usando dados 100% reais.</p>
                </button>
              </div>
            </motion.div>
          )}

          {/* ================= GOOGLE FLOW ================= */}
          {promptStyle === 'google' && step === 1 && (
            <motion.div key="google1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 py-6">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black mb-2 flex items-center justify-center gap-3"><MapPin className="w-7 h-7 text-green-500" /> Dados do Google Maps</h2>
                <p className="text-textSecondary text-lg">Cole tudo o que copiou da página do estabelecimento no mapa.</p>
              </div>
              <textarea
                className="w-full bg-panel border-2 border-border rounded-2xl p-6 text-white text-lg focus:border-green-500 transition-colors min-h-[300px] shadow-inner custom-scrollbar"
                placeholder="Exemplo: Do Chef Hamburgueria Artesanal, 4.1, Avaliações, Endereço..."
                value={googleData}
                onChange={e => setGoogleData(e.target.value)}
              />
            </motion.div>
          )}

          {promptStyle === 'google' && step === 2 && (
            <motion.div key="google2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-10 py-6">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black mb-2 flex items-center justify-center gap-3"><MonitorSmartphone className="w-7 h-7 text-green-500" /> Complexidade do Sistema</h2>
                <p className="text-textSecondary text-lg">Como você vai construir isso?</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => { setGoogleComplexity('static'); setStep(3); }} className={`p-8 bg-panel border-2 rounded-3xl text-left group transition-all ${googleComplexity === 'static' ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'border-border hover:border-green-500/50'}`}>
                  <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <FileCode2 className="w-7 h-7 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Básico (HTML, CSS, JS)</h3>
                  <p className="text-textSecondary">Site estático, focado apenas em mostrar informações da empresa e catálogo de serviços.</p>
                </button>
                <button onClick={() => { setGoogleComplexity('dynamic'); setStep(3); }} className={`p-8 bg-panel border-2 rounded-3xl text-left group transition-all ${googleComplexity === 'dynamic' ? 'border-primary shadow-[0_0_20px_rgba(139,92,246,0.3)]' : 'border-border hover:border-primary/50'}`}>
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Cpu className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Profundo (Lovable / AI Studio)</h3>
                  <p className="text-textSecondary">Sistema dinâmico avançado. Pode conter painel ADM, integrações com IA, banco de dados, etc.</p>
                </button>
              </div>
            </motion.div>
          )}

          {promptStyle === 'google' && step === 3 && googleComplexity === 'static' && (
            <motion.div key="google3_static" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-10 py-6">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black mb-2 flex items-center justify-center gap-3"><LayoutTemplate className="w-7 h-7 text-green-500" /> Estrutura da Página</h2>
                <p className="text-textSecondary text-lg">Quais seções você deseja incluir no site do estabelecimento?</p>
              </div>
              <div className="p-6 bg-panel border border-border rounded-3xl">
                <MultiPillSelector options={SECTION_OPTIONS} stateObj={formData.sections} onToggle={toggleSection} />
              </div>
            </motion.div>
          )}

          {promptStyle === 'google' && step === 3 && googleComplexity === 'dynamic' && (
            <motion.div key="google3_dynamic" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-10 py-6">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black mb-2 flex items-center justify-center gap-3"><Settings2 className="w-7 h-7 text-primary" /> Módulos Profundos</h2>
                <p className="text-textSecondary text-lg">Quais módulos dinâmicos e avançados o sistema deve ter?</p>
              </div>
              <div className="p-6 bg-panel border border-border rounded-3xl">
                <MultiPillSelector options={FEATURE_OPTIONS} stateObj={formData.features} onToggle={toggleFeature} />
                {formData.features.whatsapp && (
                  <div className="space-y-4 pt-6 mt-6 border-t border-[#261f36] w-full text-left">
                    <label className="text-sm font-bold text-textSecondary uppercase tracking-widest ml-2">Número do WhatsApp (Sem API)</label>
                    <Input 
                      className="bg-panel border-2 border-border h-16 rounded-2xl text-white text-lg px-6 shadow-inner focus:border-primary transition-colors w-full" 
                      placeholder="Somente números (Ex: 11999999999)" 
                      value={formData.whatsappNumber} 
                      onChange={e => setFormData({...formData, whatsappNumber: e.target.value.replace(/\D/g, '')})} 
                    />
                    <p className="text-xs text-textSecondary ml-2">As IAs têm falhado ao gerar links complexos. Coloque só o número para gerarmos um link direto wa.me no prompt.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}


          {/* ================= MANUAL FLOW ================= */}
          {promptStyle === 'manual' && step === 1 && (
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

          {promptStyle === 'manual' && step === 2 && (
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

          {promptStyle === 'manual' && step === 3 && (
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

          {promptStyle === 'manual' && step === 4 && (
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
                    {formData.features.whatsapp && formData.tech !== 'HTML + CSS + JS' && (
                      <div className="space-y-4 pt-6 mt-6 border-t border-[#261f36] w-full text-left">
                        <label className="text-sm font-bold text-textSecondary uppercase tracking-widest ml-2">Número do WhatsApp (Sem API)</label>
                        <Input 
                          className="bg-panel border-2 border-border h-16 rounded-2xl text-white text-lg px-6 shadow-inner focus:border-primary transition-colors w-full" 
                          placeholder="Somente números (Ex: 11999999999)" 
                          value={formData.whatsappNumber} 
                          onChange={e => setFormData({...formData, whatsappNumber: e.target.value.replace(/\D/g, '')})} 
                        />
                        <p className="text-xs text-textSecondary ml-2">As IAs têm falhado ao gerar links complexos (api.whatsapp). Coloque só o número para gerarmos um link direto wa.me no prompt.</p>
                      </div>
                    )}
                </div>
              </div>
            </motion.div>
          )}

          {promptStyle === 'manual' && step === 5 && (
            <motion.div key="step5_products" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-10 py-6">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black mb-2 flex items-center justify-center gap-3"><Plus className="w-7 h-7 text-primary" /> Produtos e Serviços</h2>
                <p className="text-textSecondary text-lg">Adicione os itens que deseja que apareçam no catálogo do site.</p>
              </div>
              <div className="space-y-6">
                {products.map((prod, idx) => (
                  <div key={idx} className="p-6 bg-panel border border-border rounded-3xl relative group">
                    <button onClick={() => removeProduct(idx)} className="absolute top-4 right-4 p-2 bg-danger/10 text-danger hover:bg-danger/20 rounded-xl md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-2">Nome do Produto</label>
                        <Input value={prod.name} onChange={e => updateProduct(idx, 'name', e.target.value)} placeholder="Ex: Hambúrguer Clássico" className="mt-1 bg-background" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-2">Preço</label>
                        <Input value={prod.price} onChange={e => updateProduct(idx, 'price', e.target.value)} placeholder="Ex: R$ 25,00" className="mt-1 bg-background" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-2">Link da Imagem (Opcional)</label>
                        <Input value={prod.image} onChange={e => updateProduct(idx, 'image', e.target.value)} placeholder="https://exemplo.com/imagem.png" className="mt-1 bg-background" />
                      </div>
                    </div>
                  </div>
                ))}
                <Button onClick={addProduct} variant="secondary" className="w-full h-14 border-2 border-dashed border-border hover:border-primary hover:text-primary transition-colors bg-transparent hover:bg-primary/5 rounded-2xl">
                  <Plus className="w-5 h-5 mr-2" /> Adicionar Produto
                </Button>
              </div>
            </motion.div>
          )}

          {isLastStep && (
            <motion.div key="finalStep" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 py-6 flex flex-col relative z-10" style={{ minHeight: "500px", height: "60vh" }}>
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black mb-2 flex items-center justify-center gap-3"><Code className="w-7 h-7 text-primary" /> Seu Prompt Inteligente</h2>
                <p className="text-textSecondary text-lg">Copiando este código e colando na IA, seu sistema nasce perfeito em segundos.</p>
              </div>
              <div className="flex-1 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-fuchsia-600 to-indigo-600 rounded-[2rem] blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <div className="relative h-full bg-[#050505]/90 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col overflow-hidden">
                  <div className="h-14 bg-white/5 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-danger/80"></div>
                      <div className="w-3.5 h-3.5 rounded-full bg-warning/80"></div>
                      <div className="w-3.5 h-3.5 rounded-full bg-success/80"></div>
                      <span className="ml-4 text-xs font-mono text-textSecondary hidden sm:block">ghostmarket@ai: ~/prompt-generator</span>
                    </div>
                    <Button onClick={copyToClipboard} className="h-9 px-4 text-sm font-bold bg-white text-black hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.3)] rounded-lg transition-all hover:scale-105">
                      {copied ? <Check className="w-4 h-4 mr-2 text-success" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? 'Copiado!' : 'Copiar Prompt'}
                    </Button>
                  </div>
                  <div className="flex-1 overflow-auto custom-scrollbar p-6">
                    <pre className="text-sm md:text-base text-emerald-400 whitespace-pre-wrap font-mono leading-relaxed" style={{ textShadow: '0 0 10px rgba(52,211,153,0.3)' }}>
                      {generatedPrompt}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {promptStyle && (
          <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-6">
            <Button 
              variant="ghost" 
              onClick={prevStep} 
              className="h-14 px-8 text-lg font-bold transition-all text-textSecondary hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
            </Button>

            {!isGeneratingStep && !isLastStep && (
              <Button 
                onClick={nextStep} 
                className="h-14 px-10 text-lg font-black bg-white text-black hover:bg-white/90 rounded-2xl shadow-xl hover:scale-105 transition-all"
              >
                Próximo <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}

            {isGeneratingStep && (
              <Button 
                onClick={generatePrompt}
                disabled={isGenerating || (promptStyle === 'google' && !googleData.trim())}
                className="h-14 px-10 text-lg font-black bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-105 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2"><div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" /> Mágica acontecendo...</span>
                ) : (
                  <><Zap className="w-5 h-5 mr-2" /> Gerar Site Agora</>
                )}
              </Button>
            )}

            {isLastStep && (
              <div className="flex flex-col sm:flex-row items-center gap-4 ml-auto">
                <Button 
                  onClick={() => { setStep(1); setPromptStyle(null); setGoogleData(''); setGoogleComplexity(null); }} 
                  className="h-14 px-8 text-lg font-black bg-panel border-2 border-border text-textSecondary hover:text-white hover:border-white/20 rounded-2xl transition-all"
                >
                  Refazer Prompt
                </Button>
                <Button 
                  onClick={() => navigate('/builder')} 
                  className="h-14 px-10 text-lg font-black bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Zap className="w-5 h-5" /> Hospedar Sistema
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
