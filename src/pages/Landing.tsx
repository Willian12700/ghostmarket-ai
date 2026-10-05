import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Ghost, Play, CheckCircle2, ChevronDown, DollarSign, Menu, X, Search, Bot , MessageCircle, Sparkles, Zap, ArrowRight } from "lucide-react"
import { Button } from '@/components/ui/Button'
import { AnimatedMockup } from '@/components/ui/AnimatedMockup'
import { AppPreview } from '@/components/ui/AppPreview'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { InteractiveDemo } from '@/components/ui/InteractiveDemo'
import { CHECKOUT_URLS } from '@/config/cakto'
import { trackCheckoutClick } from '@/utils/analytics'
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion'

function AnimatedNumber({ value, suffix = '', prefix = '' }: { value: number, suffix?: string, prefix?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-50px" })
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (inView) {
      let start = 0
      const duration = 2000
      const stepTime = Math.abs(Math.floor(duration / value))
      const timer = setInterval(() => {
        start += Math.ceil(value / 50)
        if (start >= value) {
          setCurrent(value)
          clearInterval(timer)
        } else {
          setCurrent(start)
        }
      }, stepTime)
      return () => clearInterval(timer)
    }
  }, [inView, value])

  return (
    <span ref={ref}>
      {prefix}{current > 999 ? (current/1000).toFixed(0) + 'K' : current}{suffix}
    </span>
  )
}

export const Landing = () => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      
      const sections = ['recursos', 'como-funciona', 'demo', 'planos', 'faq']
      for (const section of sections) {
        const el = document.getElementById(section)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section)
            return
          }
        }
      }
      setActiveSection('')
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      scrollTo(id)
    }
  }, [location])

  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: 'smooth' })
    } else if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] selection:bg-primary/30 relative font-sans overflow-x-hidden">
      {/* Global Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        
        {/* Bordas Neon Ambientais nas Laterais da Tela */}
        <div className="absolute top-0 bottom-0 left-[-150px] w-[300px] bg-[#8b5cf6]/20 blur-[120px]" />
        <div className="absolute top-0 bottom-0 right-[-150px] w-[300px] bg-[#8b5cf6]/20 blur-[120px]" />

        {/* Orbes Animadas de Fundo para dar Profundidade */}
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-[#8b5cf6]/10 rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[60%] right-[10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px]" 
        />
      </div>
      
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#050505]/70 backdrop-blur-md border-b border-white/5 py-3 shadow-lg' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button onClick={() => scrollTo('home')} className="flex items-center gap-2 relative z-50 group">
            <Ghost className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
            <span className="font-bold text-xl tracking-tight text-white">GhostMarket<span className="text-primary">_</span></span>
          </button>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {['recursos', 'como-funciona', 'planos', 'faq'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollTo(item)} 
                className={`transition-colors relative ${activeSection === item ? 'text-white' : 'text-[#8A8A94] hover:text-white'}`}
              >
                {item.charAt(0).toUpperCase() + item.slice(1).replace('-', ' ')}
                {activeSection === item && (
                  <motion.div layoutId="nav-indicator" className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-5">
            <Link to="/login" className="text-sm font-medium text-[#8A8A94] hover:text-white transition-colors">
              Entrar
            </Link>
            <Button onClick={() => scrollTo('planos')} className="shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all">
              Assinar agora
            </Button>
          </div>

          <div className="md:hidden flex items-center relative z-50">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-[#8A8A94] hover:text-white">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 w-full bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 shadow-2xl py-6 px-6 flex flex-col gap-4"
            >
              {['recursos', 'como-funciona', 'planos', 'faq'].map((item) => (
                <button key={item} onClick={() => scrollTo(item)} className="text-left text-[#8A8A94] hover:text-white text-lg font-medium">{item.charAt(0).toUpperCase() + item.slice(1).replace('-', ' ')}</button>
              ))}
              <div className="h-px bg-white/5 my-2" />
              <Link to="/login" className="text-left text-white font-medium text-lg">Entrar</Link>
              <Button onClick={() => scrollTo('planos')} className="w-full mt-2 py-6 text-lg">Assinar agora</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 lg:pt-40 lg:pb-32 px-6 relative">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold tracking-wide mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Vagas Abertas · SaaS Creator AI
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight leading-[1.05]">
              A inteligência artificial para <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-400 to-purple-600">criar e vender</span>.
            </h1>
            
            <p className="text-lg md:text-xl text-[#8A8A94] mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Transforme ideias em produtos digitais, prospecte clientes em massa e gerencie contratos. Tudo em um único ecossistema focado em resultado.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-semibold group relative overflow-hidden" onClick={() => scrollTo('planos')}>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10">Começar agora</span>
              </Button>
              <Button size="lg" variant="secondary" className="w-full sm:w-auto h-14 px-8 text-base font-semibold group bg-white/5 hover:bg-white/10 border-white/10" onClick={() => scrollTo('demo')}>
                <Play className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
                Ver como funciona
              </Button>
            </div>
          </motion.div>

          <AnimatedMockup />
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-12 border-y border-white/5 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
              <AnimatedNumber value={10000} prefix="+" suffix="K" />
            </span>
            <span className="text-[#8A8A94] text-sm font-medium tracking-wide uppercase">Projetos Criados</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
              <AnimatedNumber value={98} suffix="%" />
            </span>
            <span className="text-[#8A8A94] text-sm font-medium tracking-wide uppercase">Satisfação</span>
          </div>
          <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center text-center">
            <span className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">24/7</span>
            <span className="text-[#8A8A94] text-sm font-medium tracking-wide uppercase">Automação</span>
          </div>
        </div>
      </section>

      {/* App Preview Section (Por dentro da máquina) */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Por dentro da máquina</h2>
            <p className="text-xl text-[#8A8A94] max-w-2xl mx-auto font-medium">
              Um ecossistema completo para criar, vender e escalar.
            </p>
          </motion.div>
          
          <div className="w-full relative perspective-[2000px]">
            <motion.div style={{ y }} className="w-full overflow-x-auto pb-8 custom-scrollbar snap-x">
              <div className="min-w-[1000px] md:min-w-full px-4 md:px-0 snap-center">
                <AppPreview />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Visual Flow */}
      <section id="recursos" className="py-24 px-6 relative bg-[#080808] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">CRIE, VENDA E ESCALE</h2>
            <p className="text-[#8A8A94] max-w-2xl mx-auto text-lg">Um fluxo contínuo de ferramentas projetadas para o seu crescimento.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-2 relative">
            {/* Linha horizontal para Desktop */}
            <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent z-0" />
            
            {/* Linha vertical para Mobile */}
            <div className="md:hidden absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-transparent via-primary/50 to-transparent z-0" />

            
            {[
              { title: 'Criar', icon: Sparkles, desc: 'Gere produtos do zero com IA' },
              { title: 'Automatizar', icon: Bot, desc: 'Roteiros e conteúdos diários' },
              { title: 'Prospectar', icon: Search, desc: 'Encontre clientes com o Scanner' },
              { title: 'Vender', icon: DollarSign, desc: 'CRM e fechamento integrados' },
              { title: 'Escalar', icon: Zap, desc: 'Acompanhe as métricas de perto' }
            ].map((step, i) => (
              <motion.div 
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#050505] border border-white/10 flex items-center justify-center mb-6 group-hover:border-primary/50 group-hover:-translate-y-2 transition-all duration-300 shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <step.icon className="w-7 h-7 text-white group-hover:text-primary transition-colors relative z-10" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-[#8A8A94] text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section id="demo" className="py-24 px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Veja o GhostMarket trabalhando</h2>
            <p className="text-[#8A8A94] max-w-2xl mx-auto text-lg">Experimente o poder da nossa IA na prática.</p>
          </motion.div>
          <InteractiveDemo />
        </div>
      </section>

      {/* O Que Você Pode Criar */}
      <section className="py-24 px-6 bg-[#080808] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">O QUE VOCÊ PODE CRIAR</h2>
            <p className="text-[#8A8A94] max-w-2xl mx-auto text-lg">Infinitas possibilidades para diferentes nichos e modelos de negócio.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'SITES & APLICATIVOS', items: ['Landing Pages', 'Sites Institucionais', 'Portfólios', 'Web Apps'] },
              { title: 'E-COMMERCE', items: ['Loja Online', 'Catálogo', 'Pagamentos', 'Gestão de Pedidos'] },
              { title: 'INFOPRODUTOS & E-BOOKS', items: ['Plataformas de Membros', 'Áreas Restritas', 'Checkout', 'Conteúdo Digital'] },
              { title: 'TEMPLATES PERSONALIZADOS', items: ['Dashboards Administrativos', 'CRMs', 'Ferramentas de Nicho', 'Sistemas Personalizados'] },
            ].map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <SpotlightCard className="p-8 h-full">
                  <h3 className="text-lg font-bold text-white mb-6 tracking-wide">{card.title}</h3>
                  <ul className="space-y-4">
                    {card.items.map((item, j) => (
                      <li key={j} className="flex items-center text-[#8A8A94] hover:text-white transition-colors">
                        <CheckCircle2 className="w-5 h-5 text-primary/70 mr-3 shrink-0" />
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-32 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">ESCOLHA SEU PLANO</h2>
            <p className="text-[#8A8A94] max-w-2xl mx-auto text-lg">Acesso completo à plataforma que vai revolucionar sua forma de criar.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
            {/* Mensal */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <SpotlightCard className="p-10 flex flex-col h-full border-white/10 bg-[#0b0714]">
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wider">Mensal</h3>
                <div className="text-4xl font-bold text-white mb-6">R$ 29,99 <span className="text-lg text-[#8A8A94] font-medium">/mês</span></div>
                <ul className="space-y-5 mb-10 flex-1">
                  {['Acesso completo', 'Gerador avançado', 'Prospecção inteligente', 'Scanner de Leads', 'Dashboard analítico', 'CRM integrado'].map((feature, i) => (
                    <li key={i} className="flex items-start text-[#8A8A94] font-medium">
                      <CheckCircle2 className="w-5 h-5 text-primary/60 mr-3 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a href={CHECKOUT_URLS.mensal} className="w-full" onClick={() => { trackCheckoutClick('mensal'); }}>
                  <Button variant="secondary" className="w-full h-14 text-base font-bold bg-white/5 hover:bg-white/10 border-white/10">Começar Agora</Button>
                </a>
              </SpotlightCard>
            </motion.div>

            {/* Vitalício */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative z-10">
              <div className="absolute -inset-0.5 bg-gradient-to-b from-primary via-primary/20 to-transparent rounded-[22px] blur opacity-50" />
              <div className="bg-[#0b0714] border border-primary/40 rounded-[20px] p-10 flex flex-col h-full relative shadow-[0_0_50px_rgba(139,92,246,0.15)] transform md:-translate-y-4">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-5 py-1.5 rounded-full text-xs font-bold tracking-widest shadow-lg uppercase">
                  Mais Vendido
                </div>
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wider">Vitalício</h3>
                <div className="text-4xl font-bold text-white mb-2 tracking-tight">12x R$ 13,41</div>
                <p className="text-sm text-[#8A8A94] mb-8 font-medium">Ou R$ 129,99 à vista</p>
                <ul className="space-y-5 mb-10 flex-1">
                  {['Acesso vitalício ao sistema', 'Todas as atualizações gratuitas', 'Suporte VIP prioritário', 'Sem mensalidades recorrentes', 'Acesso completo para sempre'].map((feature, i) => (
                    <li key={i} className="flex items-center text-white font-medium">
                      <CheckCircle2 className="w-5 h-5 text-primary mr-3 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a href={CHECKOUT_URLS.anual} className="w-full" onClick={() => { trackCheckoutClick('anual'); }}>
                  <Button className="w-full h-14 text-base font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-shadow">
                    Garantir Acesso Vitalício
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-[#080808] border-y border-white/5">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Perguntas Frequentes</h2>
          </motion.div>
          
          <div className="space-y-4">
            {[
              {
                q: 'O que exatamente é um SaaS e como a plataforma facilita a criação?',
                a: 'SaaS (Software as a Service) é um software hospedado na nuvem disponibilizado via assinatura. A nossa plataforma utiliza IA para gerar a estrutura base do seu produto, economizando semanas de desenvolvimento e ajudando a definir arquiteturas, recursos e design.'
              },
              {
                q: 'Quais são os principais diferenciais em relação a outras soluções?',
                a: 'O GhostMarket AI foca especificamente em empreendedores, unindo a criação do SaaS via IA com ferramentas práticas comerciais (Scanner de Leads, Gestão de Contratos, Dashboard Financeiro) no mesmo ecossistema.'
              },
              {
                q: 'Quais recursos estão disponíveis para criar um SaaS completo?',
                a: 'Através do Creator IA, você especifica funcionalidades de Autenticação, Banco de Dados, Pagamentos, Dashboards, Painel Admin, integração de IA externa (como OpenAI/Anthropic), entre outros.'
              },
              {
                q: 'Como funciona o acesso após o pagamento na Cakto?',
                a: 'Após a confirmação do pagamento, você receberá um email com o link seguro. Depois de criar sua conta com o mesmo email da compra, o sistema libera seu acesso na hora automaticamente.'
              },
              {
                q: 'Como funciona o suporte e acompanhamento?',
                a: 'Oferecemos suporte por e-mail e uma comunidade exclusiva dependendo do plano escolhido, além de documentação completa na própria plataforma.'
              }
            ].map((faq, i) => (
              <motion.details 
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                key={i} 
                className="group bg-[#050505] border border-white/5 rounded-xl [&_summary::-webkit-details-marker]:hidden hover:border-white/10 transition-colors"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 p-6 font-semibold text-white">
                  {faq.q}
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-open:bg-primary/10 transition-colors">
                    <ChevronDown className="w-5 h-5 text-[#8A8A94] group-open:text-primary transition-transform group-open:-rotate-180 duration-300" />
                  </div>
                </summary>
                <div className="px-6 pb-6 pt-0 text-[#8A8A94] leading-relaxed font-medium">
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-2 border-t border-white/5 mt-2">
                    {faq.a}
                  </motion.div>
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-primary/10 rounded-[100%] blur-[120px] pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Sua próxima ideia começa aqui.</h2>
          <p className="text-xl text-[#8A8A94] mb-10 font-medium">
            Transforme uma ideia em um produto pronto para crescer.
          </p>
          <Button size="lg" onClick={() => scrollTo('planos')} className="text-lg px-10 h-14 font-bold shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] transition-all group">
            Começar agora
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6 group w-fit">
              <Ghost className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
              <span className="font-bold text-xl tracking-tight text-white">GhostMarket<span className="text-primary">_</span></span>
            </Link>
            <p className="text-[#8A8A94] text-sm max-w-xs font-medium leading-relaxed">
              Transforme ideias em produtos. O ecossistema completo para criar, vender e gerenciar seu SaaS.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Produto</h4>
            <ul className="space-y-4 text-sm font-medium text-[#8A8A94]">
              <li><button onClick={() => scrollTo('recursos')} className="hover:text-white transition-colors">Recursos</button></li>
              <li><button onClick={() => scrollTo('como-funciona')} className="hover:text-white transition-colors">Como funciona</button></li>
              <li><button onClick={() => scrollTo('planos')} className="hover:text-white transition-colors">Planos</button></li>
              <li><button onClick={() => scrollTo('faq')} className="hover:text-white transition-colors">FAQ</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Empresa</h4>
            <ul className="space-y-4 text-sm font-medium text-[#8A8A94]">
              <li><Link to="/sobre" className="hover:text-white transition-colors">Sobre</Link></li>
              <li><Link to="/contato" className="hover:text-white transition-colors">Contato</Link></li>
              <li><Link to="/termos" className="hover:text-white transition-colors">Termos de Uso</Link></li>
              <li><Link to="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm font-medium text-[#8A8A94]">
            © 2026 GhostMarket. Todos os direitos reservados.
          </div>
          <div className="flex gap-4">
            {/* Social Links could go here */}
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://api.whatsapp.com/send?phone=5584996162332&text=Ol%C3%A1!+Estava+vendo+o+site+do+GhostMarket+e+quero+saber+como+funciona+o+Plano+Vital%C3%ADcio."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white w-14 h-14 rounded-full shadow-[0_4px_24px_rgba(37,211,102,0.3)] hover:shadow-[0_4px_30px_rgba(37,211,102,0.5)] hover:scale-105 transition-all flex items-center justify-center group"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute right-full mr-4 bg-[#050505] border border-white/10 text-white text-sm font-bold px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
          Falar no WhatsApp
        </span>
      </a>
    </div>
  )
}
