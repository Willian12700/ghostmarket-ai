import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Ghost, Play, CheckCircle2, ChevronDown, Palette, Briefcase, DollarSign, Menu, X, Video, Search, Bot , MessageCircle} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AnimatedMockup } from '@/components/ui/AnimatedMockup'
import { AppPreview } from '@/components/ui/AppPreview'
import { CHECKOUT_URLS } from '@/config/cakto'
import { motion, AnimatePresence, Variants } from 'framer-motion'

export const Landing = () => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Smooth scroll handler
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [location])

  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Animation variants
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
  }

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  return (
    <div className="min-h-screen bg-background text-textPrimary selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 relative z-50 group">
            <Ghost className="w-6 h-6 text-secondary group-hover:text-accent transition-colors" />
            <span className="font-bold text-xl tracking-tight text-white">GhostMarket_<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">AI</span></span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-textSecondary hover:text-white transition-colors">Início</button>
            <button onClick={() => scrollTo('recursos')} className="text-textSecondary hover:text-white transition-colors">Recursos</button>
            <button onClick={() => scrollTo('como-funciona')} className="text-textSecondary hover:text-white transition-colors">Como Funciona</button>
            <button onClick={() => scrollTo('planos')} className="text-textSecondary hover:text-white transition-colors">Planos</button>
            <button onClick={() => scrollTo('faq')} className="text-textSecondary hover:text-white transition-colors">FAQ</button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-textSecondary hover:text-white transition-colors">
              Já sou membro / Entrar
            </Link>
            <Button onClick={() => scrollTo('planos')}>Assinar agora</Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4 relative z-50">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-textSecondary hover:text-white">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-panel border-b border-border overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4">
                <button onClick={() => scrollTo('recursos')} className="text-left text-textSecondary hover:text-white text-lg font-medium">Recursos</button>
                <button onClick={() => scrollTo('como-funciona')} className="text-left text-textSecondary hover:text-white text-lg font-medium">Como Funciona</button>
                <button onClick={() => scrollTo('planos')} className="text-left text-textSecondary hover:text-white text-lg font-medium">Planos</button>
                <button onClick={() => scrollTo('faq')} className="text-left text-textSecondary hover:text-white text-lg font-medium">FAQ</button>
                <div className="h-px bg-border my-2" />
                <Link to="/login" className="text-left text-primary font-medium text-lg">
                  Já sou membro / Entrar
                </Link>
                <Button onClick={() => scrollTo('planos')} className="w-full mt-2">Assinar agora</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="text-center lg:text-left">
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Vagas Abertas - SaaS Creator AI
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
              A inteligência artificial para criar e vender <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">SaaS</span>.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-textSecondary mb-10 max-w-2xl mx-auto lg:mx-0">
              Transforme ideias em produtos digitais, prospecte clientes em massa e gerencie contratos. Tudo em um único ecossistema focado em resultado.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg" onClick={() => scrollTo('planos')}>
                Começar agora
              </Button>
              <Button size="lg" variant="secondary" className="w-full sm:w-auto h-14 px-8 text-lg group" onClick={() => scrollTo('como-funciona')}>
                <Play className="w-5 h-5 mr-2 group-hover:text-primary transition-colors" />
                Ver como funciona
              </Button>
            </motion.div>
          </motion.div>

          {/* Hero Mockup Animado */}
          <AnimatedMockup />
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-24 px-6 bg-panel/30 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">UM ECOSSISTEMA COMPLETO PARA CRIAR E ESCALAR</h2>
            <p className="text-textSecondary max-w-2xl mx-auto">Tudo que você precisa para dominar o mercado de produtos digitais modernos.</p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: Video, title: 'TikTok Shop Viral', desc: 'Gerador de Personas com upload de produtos, roteiros virais e copy para anúncios focados em conversão extrema.' },
              { icon: Search, title: 'Radar de Clientes (Leads)', desc: 'Scanner com IA integrado ao Google Places. Encontre empresas, chame no WhatsApp com copy fria e envie pro CRM em 1 clique.' },
              { icon: Bot, title: 'Construtor de Prompts', desc: 'Engenharia de Prompt visual. Crie comandos de IA perfeitos para sites, painéis de admin e sistemas completos sem saber programar.' },
              { icon: Briefcase, title: 'CRM Kanban Integrado', desc: 'Organize suas vendas e prospecções arrastando cards. Estoure confetes a cada venda fechada!' },
              { icon: Palette, title: 'White Label 100% Seu', desc: 'Remova nossa marca. Coloque sua Logo, nome da sua agência e as cores da sua empresa.' },
              { icon: DollarSign, title: 'Programa de Afiliados', desc: 'Indique a plataforma usando seu link de afiliado, receba comissões recorrentes e acompanhe seus ganhos.' },
            ].map((feature, i) => (
              <motion.div variants={fadeInUp} key={i} className="bg-background border border-border p-6 rounded-xl hover:border-primary/50 transition-colors group">
                <div className="w-12 h-12 bg-panel rounded-lg border border-border flex items-center justify-center mb-4 group-hover:text-primary group-hover:scale-110 transition-all">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-textSecondary leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">COMO FUNCIONA</h2>
            <p className="text-textSecondary max-w-2xl mx-auto">O caminho mais rápido entre a sua ideia e o lançamento.</p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid md:grid-cols-4 gap-8"
          >
            {[
              { step: '01', title: 'Escolha sua ideia', desc: 'Defina o produto, sistema ou solução que deseja criar.' },
              { step: '02', title: 'Descreva o projeto', desc: 'Informe recursos, público e características.' },
              { step: '03', title: 'Use a IA', desc: 'Transforme sua ideia em uma especificação estruturada.' },
              { step: '04', title: 'Construa e evolua', desc: 'Desenvolva, personalize e continue melhorando sua solução.' },
            ].map((step, i) => (
              <motion.div variants={fadeInUp} key={i} className="relative group">
                <div className="text-5xl font-bold text-panel border-text mb-4 opacity-50 group-hover:text-primary/50 transition-colors">{step.step}</div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-textSecondary">{step.desc}</p>
                {i < 3 && <div className="hidden md:block absolute top-8 -right-4 w-8 h-px bg-border group-hover:bg-primary transition-colors" />}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* What you can create */}
      <section className="py-24 px-6 bg-panel/30 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">O QUE VOCÁŠ PODE CRIAR</h2>
            <p className="text-textSecondary max-w-2xl mx-auto">Infinitas possibilidades para diferentes nichos e modelos de negócio.</p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid md:grid-cols-2 gap-6"
          >
            {[
              { title: 'SITES & APLICATIVOS', items: ['Landing Pages', 'Sites Institucionais', 'Portfólios', 'Web Apps'] },
              { title: 'E-COMMERCE', items: ['Loja Online', 'Catálogo', 'Pagamentos', 'Gestão de Pedidos'] },
              { title: 'INFOPRODUTOS & E-BOOKS', items: ['Plataformas de Membros', 'Áreas Restritas', 'Checkout', 'Conteúdo Digital'] },
              { title: 'TEMPLATES PERSONALIZADOS', items: ['Dashboards Administrativos', 'CRMs', 'Ferramentas de Nicho', 'Sistemas Personalizados'] },
            ].map((card, i) => (
              <motion.div variants={fadeInUp} key={i} className="bg-background border border-border p-8 rounded-xl shadow-lg relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none group-hover:bg-primary/20 transition-colors duration-500" />
                <h3 className="text-lg font-bold text-white mb-6 tracking-wide">{card.title}</h3>
                <ul className="space-y-3">
                  {card.items.map((item, j) => (
                    <li key={j} className="flex items-center text-textSecondary group-hover:text-white transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-primary mr-3 opacity-70 group-hover:opacity-100" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      
        {/* App Preview Section */}
        <section className="pt-24 pb-12 px-6 relative border-t border-border bg-background">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">POR DENTRO DA MÁQUINA</h2>
              <p className="text-textSecondary max-w-2xl mx-auto mb-12">Um ecossistema com design premium, focado em velocidade e conversão. Desenvolvido para você gerenciar clientes, criar sites e faturar no mesmo dia.</p>
              <AppPreview />
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
      <section id="planos" className="py-24 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">ESCOLHA SEU PLANO</h2>
            <p className="text-textSecondary max-w-2xl mx-auto">Acesso completo Á  plataforma que vai revolucionar sua forma de criar.</p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center"
          >
            {/* Mensal */}
            <motion.div variants={fadeInUp} className="bg-panel border border-border rounded-2xl p-8 shadow-xl flex flex-col h-full hover:border-primary/50 transition-colors">
              <h3 className="text-xl font-bold text-white mb-2">PLANO MENSAL</h3>
              <div className="text-4xl font-bold text-white mb-6">R$ 29,99 <span className="text-lg text-textSecondary font-normal">/mês</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Acesso completo', 'Gerador avançado', 'Prospecção inteligente', 'Scanner', 'Dashboard', 'CRM'].map((feature, i) => (
                  <li key={i} className="flex items-start text-textSecondary">
                    <CheckCircle2 className="w-5 h-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a href={CHECKOUT_URLS.mensal} className="w-full">
                <Button variant="secondary" className="w-full h-12 text-lg font-bold" size="lg">Começar Agora</Button>
              </a>
            </motion.div>

            {/* Vitalício */}
            <motion.div variants={fadeInUp} className="bg-primary/5 border border-primary/50 rounded-2xl p-8 shadow-2xl flex flex-col h-full relative transform md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide shadow-lg">
                MAIS VENDIDO
              </div>
              <h3 className="text-xl font-bold text-white mb-2">PLANO VITALÍCIO</h3>
              <div className="text-4xl font-bold text-white mb-2">12x R$ 13,41</div>
              <p className="text-sm text-textSecondary mb-6">Ou R$ 129,99 à vista</p>
              <ul className="space-y-4 mb-8 flex-1">
                {['Acesso vitalício', 'Atualizações gratuitas', 'Suporte VIP prioritário', 'Sem mensalidades', 'Acesso completo para sempre'].map((feature, i) => (
                  <li key={i} className="flex items-center text-white">
                    <CheckCircle2 className="w-5 h-5 text-primary mr-3 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a href={CHECKOUT_URLS.anual} className="w-full">
                <Button className="w-full h-12 text-lg font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]" size="lg">Garantir Acesso Vitalício</Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-panel/30 border-y border-border">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">PERGUNTAS FREQUENTES</h2>
          </motion.div>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-4">
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
              <motion.details variants={fadeInUp} key={i} className="group bg-background border border-border rounded-lg [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 font-medium text-white">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-textSecondary transition-transform group-open:-rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-textSecondary leading-relaxed">
                  {faq.a}
                </div>
              </motion.details>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[100%] blur-[120px] pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">SUA PRÓXIMA IDEIA PODE VIRAR UM SAAS</h2>
          <p className="text-xl text-textSecondary mb-10 max-w-2xl mx-auto">
            Pare de apenas imaginar. Comece a construir, testar e transformar suas ideias digitais em produtos.
          </p>
          <Button size="lg" onClick={() => scrollTo('planos')} className="text-lg px-10 h-14 hover:scale-105 transition-transform">
            Começar agora
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-panel border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <Link to="/" className="flex items-center justify-center md:justify-start gap-2 mb-4 group">
              <Ghost className="w-6 h-6 text-secondary group-hover:text-accent transition-colors" />
              <span className="font-bold text-xl tracking-tight text-white">GhostMarket_<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">AI</span></span>
            </Link>
            <p className="text-textSecondary text-sm max-w-xs">
              Uma plataforma para transformar ideias digitais em produtos, sistemas e SaaS.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-textSecondary">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Início</button>
            <button onClick={() => scrollTo('recursos')} className="hover:text-white transition-colors">Recursos</button>
            <button onClick={() => scrollTo('como-funciona')} className="hover:text-white transition-colors">Como funciona</button>
            <button onClick={() => scrollTo('planos')} className="hover:text-white transition-colors">Planos</button>
            <button onClick={() => scrollTo('faq')} className="hover:text-white transition-colors">FAQ</button>
            <Link to="/login" className="hover:text-white transition-colors">Entrar</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border/50 text-center text-xs text-textSecondary">
          Â© 2026 GhostMarket AI. Todos os direitos reservados.
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/5511999999999?text=Ol%C3%A1!+Estava+vendo+o+site+do+GhostMarket+e+quero+saber+como+funciona+o+Plano+Vital%C3%ADcio."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-[0_4px_24px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform flex items-center justify-center group"
      >
        <MessageCircle className="w-8 h-8" />
        <span className="absolute right-full mr-4 bg-white text-black text-sm font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
          Falar no WhatsApp
        </span>
      </a>
    </div>
  )
}