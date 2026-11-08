import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Ghost,
  Play,
  Check,
  ChevronDown,
  Menu,
  X,
  Search,
  MessageCircle,
  ArrowRight,
  Globe,
  Sliders,
  Sparkles,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Monitor,
  Smartphone,
  FileText,
  Star,
  Zap,
  Layers,
  Lock
} from 'lucide-react'
import { AppPreview } from '@/components/ui/AppPreview'
import { CHECKOUT_URLS } from '@/config/cakto'
import { handleCheckoutRedirect } from '@/utils/analytics'
import { SITE_TEMPLATES, COLOR_PALETTES, compileTemplateToHtml } from '@/data/siteTemplates'
import { motion, AnimatePresence } from 'framer-motion'

const SHOWCASE_TEMPLATE_IDS = [
  'hamburgueria-artesanal',
  'barbearia-vip',
  'clinica-odontologica',
  'escritorio-advocacia',
  'pizzaria-forno-lenha',
  'clinica-estetica-avancada'
]

export const Landing = () => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showStickyCta, setShowStickyCta] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  // Live GhostStudio Showcase State on Landing Page
  const showcaseTemplates = useMemo(() => {
    const found = SHOWCASE_TEMPLATE_IDS.map(id =>
      SITE_TEMPLATES.find(t => t.templateId === id)
    ).filter(Boolean) as typeof SITE_TEMPLATES
    return found.length > 0 ? found : SITE_TEMPLATES.slice(0, 6)
  }, [])

  const [selectedShowcaseIdx, setSelectedShowcaseIdx] = useState(0)
  const [liveBrandName, setLiveBrandName] = useState(showcaseTemplates[0]?.name || 'Brutus Burger House')
  const [livePrimaryColor, setLivePrimaryColor] = useState(showcaseTemplates[0]?.primaryColor || '#EA580C')
  const [liveBgColor, setLiveBgColor] = useState(showcaseTemplates[0]?.backgroundColor || '#0C0A09')
  const [liveSurfaceColor, setLiveSurfaceColor] = useState(showcaseTemplates[0]?.surfaceColor || '#1C1917')
  const [liveTextColor, setLiveTextColor] = useState(showcaseTemplates[0]?.textColor || '#FAFAF9')
  const [liveDevice, setLiveDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [liveViewMode, setLiveViewMode] = useState<'site' | 'admin'>('site')
  const [liveStoreStatus, setLiveStoreStatus] = useState<'open' | 'busy' | 'closed'>('open')
  const [livePromoBanner, setLivePromoBanner] = useState(
    '🔥 PROMOÇÃO DE HOJE: Frete Grátis + Brinde Especial nos pedidos feitos pelo site!'
  )
  const [liveCatalogItems, setLiveCatalogItems] = useState(() =>
    structuredClone(showcaseTemplates[0]?.catalog || SITE_TEMPLATES[0].catalog)
  )

  // Interactive ROI Calculator State
  const [sitesPerMonth, setSitesPerMonth] = useState(5)
  const [pricePerSite, setPricePerSite] = useState(1200)
  const [monthlyMaintenance, setMonthlyMaintenance] = useState(120)

  const handleSelectShowcaseTemplate = (idx: number) => {
    const tpl = showcaseTemplates[idx]
    if (!tpl) return
    setSelectedShowcaseIdx(idx)
    setLiveBrandName(tpl.name)
    setLivePrimaryColor(tpl.primaryColor)
    setLiveBgColor(tpl.backgroundColor)
    setLiveSurfaceColor(tpl.surfaceColor)
    setLiveTextColor(tpl.textColor)
    setLiveCatalogItems(structuredClone(tpl.catalog))
  }

  const liveCompiledHtml = useMemo(() => {
    const base = showcaseTemplates[selectedShowcaseIdx] || SITE_TEMPLATES[0]
    const customized = {
      ...base,
      name: liveBrandName.trim() || base.name,
      primaryColor: livePrimaryColor,
      backgroundColor: liveBgColor,
      surfaceColor: liveSurfaceColor,
      textColor: liveTextColor,
      storeStatus: liveStoreStatus,
      promoBannerText: livePromoBanner,
      catalog: liveCatalogItems
    }
    return compileTemplateToHtml(customized)
  }, [
    showcaseTemplates,
    selectedShowcaseIdx,
    liveBrandName,
    livePrimaryColor,
    liveBgColor,
    liveSurfaceColor,
    liveTextColor,
    liveStoreStatus,
    livePromoBanner,
    liveCatalogItems
  ])

  const roiStats = useMemo(() => {
    const setupRevenue = sitesPerMonth * pricePerSite
    const recurringMonthly = sitesPerMonth * monthlyMaintenance
    const totalFirstYearRecurring = recurringMonthly * 12
    const roiMultiple = Math.round(setupRevenue / 49.99)
    return { setupRevenue, recurringMonthly, totalFirstYearRecurring, roiMultiple }
  }, [sitesPerMonth, pricePerSite, monthlyMaintenance])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24)
      setShowStickyCta(window.scrollY > 680)

      const sections = ['studio-live', 'plataforma', 'calculadora', 'planos', 'faq']
      for (const section of sections) {
        const el = document.getElementById(section)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 160 && rect.bottom >= 160) {
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
      const top = element.getBoundingClientRect().top + window.scrollY - 72
      window.scrollTo({ top, behavior: 'smooth' })
    } else if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const navItems = [
    { id: 'studio-live', label: 'Studio +55 Modelos' },
    { id: 'plataforma', label: 'Ecossistema' },
    { id: 'calculadora', label: 'Simulador de Lucro' },
    { id: 'planos', label: 'Preços' },
    { id: 'faq', label: 'FAQ' }
  ]

  const fmtBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] selection:bg-emerald-500/20 selection:text-emerald-300 relative font-sans overflow-x-hidden">
      {/* Subtle Architectural Grid & Top Light Beam */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 40%, transparent 100%)'
          }}
        />
        <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[900px] h-[380px] bg-emerald-500/[0.045] rounded-full blur-[120px]" />
      </div>

      {/* Top Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-200 ${
          scrolled
            ? 'bg-[#09090B]/85 backdrop-blur-xl border-b border-zinc-800/80'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={() => scrollTo('home')} className="flex items-center gap-2.5 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
                <Ghost className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-semibold text-[15px] tracking-tight text-white">GhostMarket</span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                OS 3.0
              </span>
            </button>

            <div className="hidden md:flex items-center gap-6 text-[13px] font-medium">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`transition-colors cursor-pointer ${
                    activeSection === item.id ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-[13px] font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <button
              onClick={() => scrollTo('planos')}
              className="h-9 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[13px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/15"
            >
              <span>Liberar Acesso</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-zinc-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="md:hidden bg-[#09090B] border-b border-zinc-800 px-6 py-5 flex flex-col gap-3"
            >
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="text-left text-zinc-300 hover:text-white text-sm font-medium py-1.5"
                >
                  {item.label}
                </button>
              ))}
              <div className="h-px bg-zinc-800/80 my-1" />
              <div className="flex items-center gap-3 pt-1">
                <Link
                  to="/login"
                  className="flex-1 h-10 rounded-lg border border-zinc-800 flex items-center justify-center text-sm font-medium text-white"
                >
                  Entrar
                </Link>
                <button
                  onClick={() => scrollTo('planos')}
                  className="flex-1 h-10 rounded-lg bg-emerald-500 text-zinc-950 text-sm font-bold"
                >
                  Começar agora
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO SECTION */}
      <section id="home" className="pt-28 pb-16 lg:pt-36 lg:pb-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-semibold mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Novo GhostStudio 3.0 • +{SITE_TEMPLATES.length} Sites Prontos Editáveis em Tempo Real</span>
            <span className="text-emerald-500/40">|</span>
            <button
              onClick={() => scrollTo('studio-live')}
              className="text-white hover:text-emerald-200 inline-flex items-center gap-1 font-bold cursor-pointer"
            >
              Testar ao vivo <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-[62px] font-bold text-white tracking-[-0.035em] leading-[1.08] mb-6 max-w-4xl mx-auto"
          >
            Encontre empresas sem site, personalize um modelo pronto em 2 minutos e venda todos os dias.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10 font-normal"
          >
            O GhostMarket une <strong className="text-zinc-200">Scanner 3D de Leads no Google Maps</strong>,{' '}
            <strong className="text-zinc-200">+{SITE_TEMPLATES.length} templates prontos por nicho</strong> com troca de cores e cardápio em tempo real, hospedagem 1-clique e gerador de contratos em PDF.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <button
              onClick={() => scrollTo('planos')}
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 cursor-pointer"
            >
              <span>Liberar Acesso Imediato</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollTo('studio-live')}
              className="w-full sm:w-auto h-12 px-7 rounded-xl bg-zinc-900 hover:bg-zinc-800/90 text-zinc-200 border border-zinc-800 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Testar os +{SITE_TEMPLATES.length} Modelos Ao Vivo</span>
            </button>
          </motion.div>

          {/* Technical Trust Bar */}
          <div className="mt-14 pt-8 border-t border-zinc-900 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
            {[
              { value: `+${SITE_TEMPLATES.length} Modelos`, label: 'Prontos para 11 categorias de nichos' },
              { value: 'Tempo Real', label: 'Troque cores, textos, fotos e cardápio' },
              { value: 'Maps + CNPJ', label: 'Scanner 3D de empresas sem site' },
              { value: '100% Seu Lucro', label: 'Cobre de R$ 800 a R$ 2.500 por site' }
            ].map((stat, i) => (
              <div key={i} className="border-l border-zinc-800 pl-4">
                <div className="text-lg sm:text-xl font-bold text-white tracking-tight tabular-nums">
                  {stat.value}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5 leading-snug">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Framed Product Workbench Preview */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2 }}
          className="max-w-6xl mx-auto mt-16"
        >
          <div className="rounded-2xl border border-zinc-800/90 bg-[#0E0E11] p-2 sm:p-3 shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
            <div className="rounded-xl border border-zinc-800/70 bg-[#09090B] overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <div className="min-w-[920px] md:min-w-full">
                  <AppPreview />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* UPGRADE 1: VITRINE INTERATIVA DO GHOSTSTUDIO AO VIVO (#studio-live) */}
      <section id="studio-live" className="py-24 px-6 border-t border-zinc-900 bg-[#0B0B0E] relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-3">
                <Sliders className="w-3.5 h-3.5" /> Experimente Antes de Comprar
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-[-0.025em] leading-tight">
                Teste o GhostStudio em Tempo Real agora mesmo.
              </h2>
              <p className="text-zinc-400 text-base mt-3 leading-relaxed">
                Clique em qualquer nicho abaixo, digite o nome do cliente e troque a paleta de cores. Dentro da plataforma você tem <strong className="text-white">+{SITE_TEMPLATES.length} modelos completos</strong> com sacola de pedidos no WhatsApp e agendamento prontos para publicar em 1 clique.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800 mr-1">
                <button
                  type="button"
                  onClick={() => setLiveViewMode('site')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    liveViewMode === 'site'
                      ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>🌐 Site do Cliente</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLiveViewMode('admin')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    liveViewMode === 'admin'
                      ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>🔐 Painel Admin que o Lojista Recebe</span>
                </button>
              </div>

              {liveViewMode === 'site' && (
                <>
                  <button
                    type="button"
                    onClick={() => setLiveDevice('desktop')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      liveDevice === 'desktop'
                        ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-4 h-4" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setLiveDevice('mobile')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      liveDevice === 'mobile'
                        ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" /> Celular
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Interactive Controls */}
            <div className="lg:col-span-4 bg-[#0E0E11] border border-zinc-800 rounded-2xl p-5 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                  1. Escolha um Nicho (Amostra de 6 dos +{SITE_TEMPLATES.length})
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {showcaseTemplates.map((tpl, idx) => (
                    <button
                      key={tpl.templateId}
                      type="button"
                      onClick={() => handleSelectShowcaseTemplate(idx)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedShowcaseIdx === idx
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                          : 'bg-zinc-900/70 border-zinc-800/80 text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={tpl.heroImage}
                          alt={tpl.templateTitle}
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-zinc-700"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{tpl.templateTitle}</div>
                          <div className="text-[11px] text-zinc-500 truncate">{tpl.category}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400 shrink-0 ml-2">
                        {selectedShowcaseIdx === idx ? 'Ativo' : 'Testar'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  2. Digite o Nome do Seu Cliente (Tempo Real)
                </label>
                <input
                  type="text"
                  value={liveBrandName}
                  onChange={e => setLiveBrandName(e.target.value)}
                  placeholder="Digite o nome da empresa..."
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                  3. Troque as Cores com 1 Clique
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_PALETTES.slice(0, 6).map(pal => (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => {
                        setLivePrimaryColor(pal.primary)
                        setLiveBgColor(pal.background)
                        setLiveSurfaceColor(pal.surface)
                        setLiveTextColor(pal.text)
                      }}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center gap-2 text-left cursor-pointer"
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 border border-white/20"
                        style={{ backgroundColor: pal.primary }}
                      />
                      <span className="text-[11px] font-semibold text-zinc-200 truncate">{pal.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => scrollTo('planos')}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Desbloquear Todos os +{SITE_TEMPLATES.length} Modelos Agora
              </button>
            </div>

            {/* Right Live Site OR Establishment Admin Panel Preview */}
            <div className="lg:col-span-8 bg-[#0E0E11] border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-[640px] shadow-2xl">
              <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/70 shrink-0" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 shrink-0" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 shrink-0" />
                  <span className="ml-2 text-xs font-mono text-zinc-400 truncate">
                    {liveViewMode === 'site'
                      ? `https://ghostmarket.cloud/s/${liveBrandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
                      : `https://ghostmarket.cloud/painel/${liveBrandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setLiveViewMode(liveViewMode === 'site' ? 'admin' : 'site')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 cursor-pointer"
                  >
                    {liveViewMode === 'site' ? '🔐 Testar Painel do Lojista →' : '🌐 Ver Site Atualizado →'}
                  </button>
                </div>
              </div>

              {liveViewMode === 'site' ? (
                <div className="flex-1 bg-zinc-950 flex items-center justify-center p-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 bg-white overflow-hidden shadow-2xl ${
                      liveDevice === 'mobile'
                        ? 'w-[375px] rounded-[30px] border-[6px] border-zinc-800'
                        : 'w-full rounded-xl'
                    }`}
                  >
                    <iframe
                      srcDoc={liveCompiledHtml}
                      title="GhostStudio Live Preview"
                      className="w-full h-full border-0"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-modals"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-[#09090B] p-5 overflow-y-auto space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-400 mb-0.5">
                        <ShieldCheck className="w-3.5 h-3.5" /> Painel Exclusivo do Estabelecimento (SHA-256)
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        Gestor Ao Vivo — {liveBrandName}
                      </h4>
                      <p className="text-xs text-zinc-300">
                        Você entrega este painel com Login e Senha para o seu cliente gerenciar preços, itens esgotados e promoções sozinho!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLiveViewMode('site')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Ver Mudanças no Site →
                    </button>
                  </div>

                  {/* Store Status & Promo Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#0E0E11] border border-zinc-800 space-y-2.5">
                      <label className="block text-xs font-bold text-zinc-300">
                        Status do Estabelecimento Ao Vivo
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'open', label: '🟢 Aberto' },
                          { id: 'busy', label: '⚡ Pico' },
                          { id: 'closed', label: '🔴 Fechado' }
                        ].map(st => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setLiveStoreStatus(st.id as any)}
                            className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              liveStoreStatus === st.id
                                ? 'bg-emerald-500/15 border-emerald-500 text-white'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0E0E11] border border-zinc-800 space-y-2">
                      <label className="block text-xs font-bold text-zinc-300">
                        Barra de Promoção do Dia no Topo
                      </label>
                      <input
                        type="text"
                        value={livePromoBanner}
                        onChange={e => setLivePromoBanner(e.target.value)}
                        placeholder="Digite uma promoção relâmpago..."
                        className="w-full h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Interactive Catalog Items in Demo Admin */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Itens do Cardápio / Catálogo (Teste alterar o preço ou pausar item):
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {liveCatalogItems.slice(0, 4).map((item, i) => {
                        const isAvail = item.available !== false
                        return (
                          <div
                            key={item.id || i}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                              isAvail
                                ? 'bg-[#0E0E11] border-zinc-800'
                                : 'bg-red-950/10 border-red-500/30 opacity-75'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-11 h-11 rounded-lg object-cover border border-zinc-800 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-white truncate">{item.name}</div>
                                <input
                                  type="text"
                                  value={item.price}
                                  onChange={e => {
                                    const val = e.target.value
                                    setLiveCatalogItems(prev => {
                                      const next = [...prev]
                                      next[i] = { ...next[i], price: val }
                                      return next
                                    })
                                  }}
                                  className="mt-1 w-24 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-xs font-bold text-emerald-400"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setLiveCatalogItems(prev => {
                                  const next = [...prev]
                                  next[i] = { ...next[i], available: !isAvail }
                                  return next
                                })
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border shrink-0 cursor-pointer ${
                                isAvail
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                  : 'bg-red-500/15 border-red-500/30 text-red-400'
                              }`}
                            >
                              {isAvail ? '🟢 Disponível' : '⛔ Esgotado'}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* UPGRADE 2: ANTES VS DEPOIS (O FLUXO DE R$ 1.500 EM 5 MINUTOS) */}
      <section className="py-24 px-6 border-t border-zinc-900 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">
              Velocidade Injusta de Execução
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-[-0.025em]">
              Por que nossos membros fecham clientes no mesmo dia?
            </h2>
            <p className="text-zinc-400 text-base mt-3">
              Enquanto um freelancer comum demora semanas tentando programar do zero, você apresenta o site já pronto com o nome do cliente em 5 minutos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Jeito Tradicional */}
            <div className="rounded-2xl border border-red-500/20 bg-[#0E0E11] p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">
                    Método Antigo & Lento
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">Freelancer / Agência Comum</h3>
                </div>
                <XCircle className="w-7 h-7 text-red-400/80 shrink-0" />
              </div>
              <ul className="space-y-3.5 text-sm text-zinc-400">
                <li className="flex items-start gap-3">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-1" />
                  <span>Gasta horas caçando clientes manualmente no Google e Instagram sem filtro.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-1" />
                  <span>Leva de 7 a 15 dias montando páginas pesadas no WordPress/Elementor.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-1" />
                  <span>Paga caro todo mês em hospedagem, domínio de teste e plugins.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-1" />
                  <span>Tenta vender apenas "promessas" no WhatsApp e leva vácuo do empresário.</span>
                </li>
              </ul>
            </div>

            {/* Jeito GhostMarket OS */}
            <div className="rounded-2xl border-2 border-emerald-500/40 bg-[#111513] p-7 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Método GhostMarket OS 3.0
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">Do Lead ao Site Pronto em 5 Min</h3>
                </div>
                <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
              </div>
              <ul className="space-y-3.5 text-sm text-zinc-200">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                  <span><strong>Minuto 1:</strong> O Scanner 3D localiza 50 empresas da sua cidade que ainda não têm site.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                  <span><strong>Minuto 3:</strong> Clica em "Studio Site" no lead e o sistema já monta o modelo do nicho com nome e WhatsApp dele.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                  <span><strong>Minuto 4:</strong> Publica na nuvem em 1 clique e gera a Proposta + Contrato Jurídico em PDF.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                  <span><strong>Minuto 5:</strong> Envia o link do site já funcionando para o dono da empresa e fecha de R$ 800 a R$ 2.500.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* UPGRADE 3: CALCULADORA INTERATIVA DE LUCRO & ROI (#calculadora) */}
      <section id="calculadora" className="py-24 px-6 border-t border-zinc-900 bg-[#0B0B0E] relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-3">
              <Calculator className="w-3.5 h-3.5" /> Simulador Real de Ganhos
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-[-0.025em]">
              Quanto você pode faturar por mês com o GhostMarket?
            </h2>
            <p className="text-zinc-400 text-base mt-2">
              Arraste os controles abaixo e simule seu ganho mensal vendendo páginas prontas e cobrando mensalidade de manutenção.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0E0E11] border border-zinc-800 rounded-3xl p-6 md:p-10">
            <div className="lg:col-span-7 space-y-7">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-zinc-200">
                    Quantos sites você quer fechar por mês?
                  </label>
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-black text-sm">
                    {sitesPerMonth} {sitesPerMonth === 1 ? 'site / mês' : 'sites / mês'}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={sitesPerMonth}
                  onChange={e => setSitesPerMonth(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                  <span>1 site (Iniciante)</span>
                  <span>10 sites (Consistente)</span>
                  <span>20 sites (Escala)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-zinc-200">
                    Valor médio cobrado por site entregue:
                  </label>
                  <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-black text-sm">
                    {fmtBRL(pricePerSite)}
                  </span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={3000}
                  step={100}
                  value={pricePerSite}
                  onChange={e => setPricePerSite(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                  <span>R$ 500 (Venda Rápida)</span>
                  <span>R$ 1.200 (Média do Mercado)</span>
                  <span>R$ 3.000 (Completo + IA)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-zinc-200">
                    Mensalidade de hospedagem & suporte por cliente:
                  </label>
                  <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-black text-sm">
                    {fmtBRL(monthlyMaintenance)}/mês
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={300}
                  step={10}
                  value={monthlyMaintenance}
                  onChange={e => setMonthlyMaintenance(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="lg:col-span-5 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Seu Faturamento Mensal Estimado
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight mt-1 tabular-nums">
                    {fmtBRL(roiStats.setupRevenue + roiStats.recurringMonthly)}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Sendo <strong>{fmtBRL(roiStats.setupRevenue)}</strong> de criação +{' '}
                    <strong>{fmtBRL(roiStats.recurringMonthly)}/mês</strong> recorrente.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-300">
                    <span>Receita Anual Projetada:</span>
                    <strong className="text-white">{fmtBRL(roiStats.setupRevenue * 12)}</strong>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>Custo da Licença Vitalícia Hoje:</span>
                    <strong className="text-emerald-400">R$ 49,99 (Único)</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => scrollTo('planos')}
                className="w-full py-3.5 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Começar Agora por R$ 49,99</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO GRID: PLATAFORMA E MÓDULOS (#plataforma) */}
      <section id="plataforma" className="py-24 px-6 border-t border-zinc-900 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14">
            <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">
              Ecossistema Completo
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-[-0.025em] leading-tight">
              Tudo o que você precisa para prospectar, criar, hospedar e fechar contratos.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Scanner 3D + CNPJ */}
            <div className="md:col-span-2 rounded-2xl border border-zinc-800 bg-[#0E0E11] p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-semibold text-emerald-400">
                    <Search className="w-3.5 h-3.5" />
                    <span>Scanner Orbital 3D & Dossiê CNPJ</span>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">Google Maps + Receita Federal</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                  Encontre clientes reais sem site em qualquer cidade do Brasil
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                  Filtre estabelecimentos por nicho e cidade, identifique na hora quem não possui site ou tem presença digital fraca e consulte o quadro de sócios, capital social e WhatsApp decisor.
                </p>
              </div>

              <div className="mt-7 pt-5 border-t border-zinc-800/70 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#09090B] border border-zinc-800/60">
                  <div className="text-emerald-400 font-mono text-[10px] font-bold">FILTRO INTELIGENTE</div>
                  <div className="text-zinc-200 font-medium mt-1">Destaca Empresas Sem Site</div>
                </div>
                <div className="p-3 rounded-lg bg-[#09090B] border border-zinc-800/60">
                  <div className="text-emerald-400 font-mono text-[10px] font-bold">1-CLICK STUDIO</div>
                  <div className="text-zinc-200 font-medium mt-1">Abre o Site Pronto com Dados do Lead</div>
                </div>
                <div className="p-3 rounded-lg bg-[#09090B] border border-zinc-800/60">
                  <div className="text-emerald-400 font-mono text-[10px] font-bold">DOSSIÊ RAIO-X</div>
                  <div className="text-zinc-200 font-medium mt-1">Diagnóstico + Argumentos de Venda</div>
                </div>
              </div>
            </div>

            {/* Card 2: GhostStudio +55 Templates */}
            <div className="rounded-2xl border border-zinc-800 bg-[#0E0E11] p-7 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-semibold text-emerald-400 mb-5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>GhostStudio em Tempo Real</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                  +{SITE_TEMPLATES.length} Modelos Prontos por Nicho
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Escolha o nicho, troque cores, fontes, fotos, preços e cardápio em tempo real. Inclui sacola de pedidos para delivery e agendamento no WhatsApp.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800/70 flex items-center justify-between text-xs text-zinc-300">
                <span>Preview Instantâneo 0ms</span>
                <span className="text-emerald-400 font-bold">+ Editor HTML/CSS</span>
              </div>
            </div>

            {/* Card 3: Proposta Comercial & Contrato Jurídico PDF */}
            <div className="rounded-2xl border border-zinc-800 bg-[#0E0E11] p-7 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-semibold text-emerald-400 mb-5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Fechamento Profissional</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                  Gerador 2-em-1: Proposta & Contrato PDF
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Gere propostas comerciais executivas e contratos jurídicos de prestação de serviços com sua chave PIX, escopo e assinatura prontos em PDF.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800/70 flex items-center justify-between text-xs text-zinc-400">
                <span>Importa dados do CRM</span>
                <span className="text-zinc-200 font-mono">PDF A4 & WhatsApp</span>
              </div>
            </div>

            {/* Card 4: Creator IA, Scripts X1 & Chatbots */}
            <div className="rounded-2xl border border-zinc-800 bg-[#0E0E11] p-7 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-semibold text-emerald-400 mb-5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Abordagem & IA 24/7</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                  Creator IA, Scripts X1 & Chatbots
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Gere 3 variações de abordagem por cliente, quebre objeções no WhatsApp com 1 clique e instale Chatbots de IA treinados nos sites dos seus clientes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800/70 flex items-center justify-between text-xs text-zinc-400">
                <span>Simulador de Bot ao Vivo</span>
                <span className="text-emerald-400 font-bold">1-Click WhatsApp</span>
              </div>
            </div>

            {/* Card 5: Hospedagem Cloud + Relatório White-Label */}
            <div className="rounded-2xl border border-zinc-800 bg-[#0E0E11] p-7 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-semibold text-emerald-400 mb-5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Cloud Hosting & Relatórios</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                  Hospedagem Expressa & QR Code Report
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Publique os sites na nuvem com proteção Anti-Clone e envie relatórios White-Label com QR Code, PageSpeed 99/100 e cliques para justificar sua mensalidade.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800/70 flex items-center justify-between text-xs text-zinc-400">
                <span>CRM Kanban + Financeiro</span>
                <span className="font-mono text-zinc-200">White-Label</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UPGRADE 4: PROVA SOCIAL & CASES DE RESULTADOS */}
      <section className="py-24 px-6 border-t border-zinc-900 bg-[#0B0B0E] relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">
              Resultados na Prática
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-[-0.025em]">
              Como membros estão fechando contratos toda semana
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Gabriel Nogueira',
                role: 'Membro Vitalício • Belo Horizonte, MG',
                deal: 'Fechou R$ 1.400 + R$ 120/mês (Hamburgueria)',
                text: 'Achei uma hamburgueria pelo Scanner que só tinha link de iFood. Abri o modelo de Hamburgueria no Studio, coloquei a logo deles e mandei o link pronto no WhatsApp. O dono pirou na sacola de pedidos e fechou na hora no PIX.'
              },
              {
                name: 'Lucas Albuquerque',
                role: 'Membro Vitalício • Curitiba, PR',
                deal: 'Fechou R$ 1.850 (Clínica Odontológica)',
                text: 'Antes eu perdia 1 semana no WordPress. Agora eu já mando a prévia pronta para o dentista ver no celular dele junto com a Proposta em PDF gerada na plataforma. No primeiro cliente já paguei o vitalício 35 vezes.'
              },
              {
                name: 'Matheus Fontes',
                role: 'Membro Vitalício • Fortaleza, CE',
                deal: '4 Sites Vendidos no 1º Mês (R$ 4.200)',
                text: 'Os modelos de Barbearia VIP, Estética e Oficina Mecânica vendem sozinhos. Você troca a cor em 10 segundos, publica o link e usa os Scripts X1 para abordar. É literalmente impossível não recuperar os R$ 49,99.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-800 bg-[#0E0E11] p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <Star className="w-4 h-4 fill-amber-400" />
                      <Star className="w-4 h-4 fill-amber-400" />
                      <Star className="w-4 h-4 fill-amber-400" />
                      <Star className="w-4 h-4 fill-amber-400" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {item.deal}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">"{item.text}"</p>
                </div>

                <div className="pt-4 border-t border-zinc-800/80 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{item.name}</div>
                    <div className="text-[11px] text-zinc-500">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UPGRADE 5: TABELA DE ANCORAGEM + PRICING SECTION (#planos) */}
      <section id="planos" className="py-28 px-6 border-t border-zinc-900 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">
              Licenciamento Oficial
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-[-0.025em] mb-4">
              Substitua R$ 538/mês em ferramentas por um único acesso.
            </h2>
            <p className="text-zinc-400 text-base">
              Um único site vendido já multiplica em mais de 20x o valor investido. Liberação automática via Webhook imediatamente após a confirmação.
            </p>
          </div>

          {/* Value Stack Anchor Box */}
          <div className="max-w-4xl mx-auto mb-12 rounded-2xl border border-zinc-800 bg-[#0E0E11] p-6">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
              Quanto você pagaria assinando cada ferramenta separadamente:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { name: 'Extrator de Leads Google Maps + Consulta CNPJ', cost: 'R$ 197/mês' },
                { name: `Construtor de Sites + ${SITE_TEMPLATES.length} Templates + Hospedagem Cloud`, cost: 'R$ 147/mês' },
                { name: 'Criador de Chatbots IA + Gerador de Copy WhatsApp', cost: 'R$ 97/mês' },
                { name: 'CRM Kanban + Gerador de Propostas & Contratos PDF', cost: 'R$ 97/mês' }
              ].map((row, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between"
                >
                  <span className="text-zinc-300 font-medium">{row.name}</span>
                  <span className="text-zinc-500 line-through font-mono shrink-0 ml-2">{row.cost}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <span className="text-zinc-400">
                Custo tradicional fora do GhostMarket: <strong className="line-through text-red-400">R$ 538,00/mês</strong>
              </span>
              <span className="text-emerald-400 font-bold">
                ✓ Tudo incluso hoje a partir de R$ 19,99 ou R$ 49,99 Vitalício
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
            {/* Plano Mensal */}
            <div className="rounded-2xl border border-zinc-800 bg-[#0E0E11] p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white">Assinatura Mensal</h3>
                  <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded">
                    Sem Fidelidade
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-4xl font-bold text-white tracking-tight tabular-nums">R$ 19,99</span>
                  <span className="text-sm text-zinc-500">/mês</span>
                </div>
                <p className="text-xs text-zinc-500 mb-8 pb-6 border-b border-zinc-800/80">
                  Ideal para testar toda a estrutura com investimento mínimo.
                </p>

                <ul className="space-y-3.5 mb-8">
                  {[
                    `GhostStudio em Tempo Real com +${SITE_TEMPLATES.length} modelos por nicho`,
                    'Scanner Orbital 3D de Leads (Google Maps) e Dossiê CNPJ',
                    'Hospedagem expressa de sites com Sacola/Agendamento WhatsApp',
                    'CRM Kanban comercial e Gerador 2-em-1 (Proposta & Contrato PDF)',
                    'Creator IA, Scripts X1 personalizáveis e Chatbots de IA',
                    'Dashboard financeiro integrado ao CRM'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={CHECKOUT_URLS.mensal}
                onClick={e => handleCheckoutRedirect(e, 'mensal', CHECKOUT_URLS.mensal)}
                className="w-full h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700/80 text-sm font-bold flex items-center justify-center transition-colors"
              >
                Assinar Plano Mensal
              </a>
            </div>

            {/* Plano Vitalício (Featured) */}
            <div className="rounded-2xl border-2 border-emerald-500/60 bg-[#111513] p-8 flex flex-col justify-between relative shadow-[0_20px_70px_rgba(16,185,129,0.15)]">
              <div className="absolute -top-3.5 right-6 bg-emerald-500 text-zinc-950 px-3.5 py-1 rounded-full text-[11px] font-black tracking-wide uppercase">
                🔥 92% Escolhem Este
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white">Licença Vitalícia Definitiva</h3>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded">
                    Pagamento Único
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-black text-white tracking-tight tabular-nums">12x R$ 5,17</span>
                </div>
                <p className="text-xs text-zinc-300 mb-8 pb-6 border-b border-zinc-800">
                  Ou <strong className="text-emerald-400">R$ 49,99 à vista no PIX/Cartão</strong> — nunca mais pague mensalidades.
                </p>

                <ul className="space-y-3.5 mb-8">
                  {[
                    'Acesso Vitalício Definitivo sem nenhuma cobrança mensal futura',
                    `Todos os +${SITE_TEMPLATES.length} modelos prontos liberados no GhostStudio`,
                    'Até 35 sites hospedados simultaneamente na nuvem GhostMarket',
                    'Gerador ilimitado de Propostas Comerciais & Contratos Jurídicos PDF',
                    'Relatórios Executivos White-Label com QR Code e sua marca',
                    'Acesso à Comunidade VIP no WhatsApp + Aulas Passo a Passo'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={CHECKOUT_URLS.anual}
                onClick={e => handleCheckoutRedirect(e, 'anual', CHECKOUT_URLS.anual)}
                className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
              >
                <span>Garantir Licença Vitalícia Agora</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 7-Day Guarantee Badge */}
          <div className="max-w-3xl mx-auto mt-12 rounded-2xl border border-zinc-800 bg-[#0E0E11] p-6 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Garantia Blindada de 7 Dias — Risco Zero
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                Entre na plataforma, teste o Scanner 3D, personalize os +{SITE_TEMPLATES.length} modelos prontos no GhostStudio e dispare suas abordagens. Se por qualquer motivo você não ficar 100% satisfeito nos primeiros 7 dias, devolvemos 100% do seu dinheiro com 1 clique.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ (#faq) */}
      <section id="faq" className="py-24 px-6 border-t border-zinc-900 bg-[#0B0B0E] relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">
              Dúvidas Técnicas e Comerciais
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-[-0.025em]">
              Perguntas frequentes
            </h2>
          </div>

          <div className="divide-y divide-zinc-800/80 border-y border-zinc-800/80">
            {[
              {
                q: 'Como funciona a liberação do acesso após o pagamento?',
                a: 'O processo é 100% automatizado via Webhook. Assim que o pagamento é confirmado na Cakto (PIX ou cartão), seu e-mail é autorizado instantaneamente. Basta acessar a tela de Criar Conta / Login com o mesmo e-mail utilizado na compra.'
              },
              {
                q: 'Preciso saber programar para usar os +55 modelos prontos?',
                a: 'Não! No novo GhostStudio você escolhe o modelo pronto de acordo com o nicho do cliente (ex: Hamburgueria, Dentista, Barbearia, Advocacia) e altera nome, cores, fotos, preços e WhatsApp visualmente em tempo real. Depois é só clicar em "Publicar e Gerar Link".'
              },
              {
                q: 'Como o Scanner de Leads encontra clientes reais?',
                a: 'Você digita o segmento e a cidade desejada. O Scanner busca os estabelecimentos no Google Maps e destaca automaticamente quais empresas não possuem site cadastrado, já liberando o botão para abrir o site daquele cliente pronto no Studio.'
              },
              {
                q: 'Qual a diferença entre a Assinatura Mensal e a Licença Vitalícia?',
                a: 'Ambos liberam todas as ferramentas da plataforma. Na Assinatura Mensal há cobrança recorrente de R$ 19,99/mês, enquanto na Licença Vitalícia você realiza um único pagamento de R$ 49,99 (ou 12x de R$ 5,17) e tem acesso para sempre sem mensalidades.'
              },
              {
                q: 'Posso emitir contratos e relatórios com o meu próprio nome/agência?',
                a: 'Sim! O Gerador 2-em-1 cria Propostas Comerciais e Contratos Jurídicos em PDF com os seus dados e sua chave PIX, e o Relatório de Performance gera um link executivo com QR Code para o seu cliente.'
              }
            ].map((faq, i) => (
              <details key={i} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm sm:text-base font-medium text-zinc-100 hover:text-white transition-colors">
                  <span>{faq.q}</span>
                  <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform shrink-0" />
                </summary>
                <p className="pt-3 text-sm text-zinc-400 leading-relaxed pr-8">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 border-t border-zinc-900 relative z-10">
        <div className="max-w-4xl mx-auto rounded-3xl border border-emerald-500/30 bg-[#0E0E11] p-10 sm:p-14 text-center shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-[-0.025em] mb-4">
            Comece a fechar sites e contratos hoje mesmo.
          </h2>
          <p className="text-zinc-400 text-base max-w-xl mx-auto mb-8">
            Libere seu acesso imediato ao Scanner 3D, aos +{SITE_TEMPLATES.length} modelos em tempo real no GhostStudio e ao gerador de contratos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => scrollTo('planos')}
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <span>Liberar Minha Licença Agora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/login"
              className="w-full sm:w-auto h-12 px-7 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-sm font-medium transition-colors flex items-center justify-center"
            >
              Já sou membro
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 bg-[#09090B] py-14 pb-28 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Ghost className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="font-semibold text-sm text-white">GhostMarket</span>
            </div>
            <p className="text-xs text-zinc-500">
              © 2026 GhostMarket AI. Infraestrutura de software e vendas B2B.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-400">
            <button onClick={() => scrollTo('studio-live')} className="hover:text-white transition-colors cursor-pointer">
              Studio +55 Modelos
            </button>
            <button onClick={() => scrollTo('calculadora')} className="hover:text-white transition-colors cursor-pointer">
              Calculadora de Lucro
            </button>
            <button onClick={() => scrollTo('planos')} className="hover:text-white transition-colors cursor-pointer">
              Preços
            </button>
            <button onClick={() => scrollTo('faq')} className="hover:text-white transition-colors cursor-pointer">
              FAQ
            </button>
            <Link to="/login" className="hover:text-white transition-colors">
              Acessar Conta
            </Link>
          </div>
        </div>
      </footer>

      {/* UPGRADE 6: STICKY CONVERSION BAR ON SCROLL */}
      <AnimatePresence>
        {showStickyCta && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-3xl z-40 bg-[#121216]/95 backdrop-blur-xl border border-zinc-700/80 rounded-2xl p-3 sm:px-5 flex items-center justify-between gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  Licença Vitalícia • +{SITE_TEMPLATES.length} Modelos Prontos & Scanner 3D
                </div>
                <div className="text-[11px] text-zinc-400 truncate">
                  Pagamento único de <strong className="text-emerald-400">R$ 49,99</strong> (ou 12x R$ 5,17)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={CHECKOUT_URLS.anual}
                onClick={e => handleCheckoutRedirect(e, 'anual', CHECKOUT_URLS.anual)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <span>Garantir Vitalício</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discreet Executive WhatsApp Support Button */}
      <a
        href="https://api.whatsapp.com/send?phone=5584996162332&text=Ol%C3%A1!+Estava+vendo+o+site+do+GhostMarket+e+quero+tirar+uma+d%C3%BAvida."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-5 right-5 z-50 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700/80 h-11 px-4 rounded-full shadow-2xl transition-all flex items-center gap-2.5 text-xs font-medium group"
      >
        <span className="w-2 h-2 rounded-full bg-[#25D366]" />
        <MessageCircle className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors" />
        <span className="hidden sm:inline">Dúvidas no WhatsApp</span>
      </a>
    </div>
  )
}
