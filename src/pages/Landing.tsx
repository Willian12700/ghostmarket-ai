import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Ghost, Play, CheckCircle2, ChevronDown, MonitorPlay, Zap, Palette, BarChart3, Briefcase, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CHECKOUT_URLS } from '@/config/cakto'

export const Landing = () => {
  const location = useLocation()

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
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-background text-textPrimary selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Ghost className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl tracking-tight text-white">GhostMarket_<span className="text-primary">AI</span></span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-textSecondary hover:text-white transition-colors">Início</button>
            <button onClick={() => scrollTo('recursos')} className="text-textSecondary hover:text-white transition-colors">Recursos</button>
            <button onClick={() => scrollTo('como-funciona')} className="text-textSecondary hover:text-white transition-colors">Como Funciona</button>
            <button onClick={() => scrollTo('planos')} className="text-textSecondary hover:text-white transition-colors">Planos</button>
            <button onClick={() => scrollTo('faq')} className="text-textSecondary hover:text-white transition-colors">FAQ</button>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-textSecondary hover:text-white transition-colors hidden sm:block">
              Já sou membro / Entrar
            </Link>
            <Button onClick={() => scrollTo('planos')}>Assinar agora</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
            SURFE NA NOVA ONDA DO <br className="hidden md:block"/> DIGITAL <span className="text-primary">(SAAS)</span>
          </h1>
          <p className="text-lg md:text-xl text-textSecondary mb-10 max-w-2xl mx-auto">
            Crie seu próprio SaaS com Inteligência Artificial. Transforme ideias em aplicativos, sistemas e sites prontos para escalar e vender.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => scrollTo('planos')} className="w-full sm:w-auto text-lg px-8">
              Criar meu projeto
            </Button>
            <Button size="lg" variant="secondary" onClick={() => scrollTo('como-funciona')} className="w-full sm:w-auto text-lg px-8 gap-2">
              <Play className="w-5 h-5" />
              Ver como funciona
            </Button>
          </div>
        </div>

        {/* Mockup Dashboard */}
        <div className="max-w-6xl mx-auto mt-20 relative z-10">
          <div className="rounded-xl border border-border bg-panel p-2 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            <div className="bg-background rounded-lg border border-border overflow-hidden flex h-[600px]">
              {/* Mockup Sidebar */}
              <div className="w-48 bg-panel border-r border-border hidden md:flex flex-col p-4 opacity-50">
                <div className="h-6 w-24 bg-border rounded mb-8" />
                <div className="space-y-4">
                  {[1,2,3,4,5].map(i => <div key={i} className="h-4 w-3/4 bg-border rounded" />)}
                </div>
              </div>
              {/* Mockup Content */}
              <div className="flex-1 p-6 overflow-hidden">
                <div className="h-8 w-48 bg-border rounded mb-6 opacity-50" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {['R$ 12.480,00', '8', '347'].map((val, i) => (
                    <div key={i} className="bg-panel border border-border rounded-xl p-4">
                      <div className="h-4 w-24 bg-border rounded mb-3 opacity-50" />
                      <div className="text-2xl font-bold text-white">{val}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-64">
                  <div className="md:col-span-2 bg-panel border border-border rounded-xl p-4">
                    <div className="h-4 w-32 bg-border rounded mb-4 opacity-50" />
                    <div className="h-full w-full rounded bg-gradient-to-t from-primary/10 to-transparent flex items-end">
                      <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-24 text-primary opacity-50">
                        <path d="M0 20 L0 10 Q 10 5, 20 15 T 40 10 T 60 15 T 80 5 T 100 10 L100 20 Z" fill="currentColor"/>
                      </svg>
                    </div>
                  </div>
                  <div className="bg-panel border border-border rounded-xl p-4 space-y-4">
                    <div className="h-4 w-32 bg-border rounded mb-2 opacity-50" />
                    {[1,2,3].map(i => (
                      <div key={i} className="h-10 bg-background border border-border rounded flex items-center px-3 justify-between">
                        <div className="h-2 w-16 bg-border rounded" />
                        <div className="h-2 w-12 bg-success/50 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-24 px-6 bg-panel/30 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">UM ECOSSISTEMA COMPLETO PARA CRIAR E ESCALAR</h2>
            <p className="text-textSecondary max-w-2xl mx-auto">Tudo que você precisa para dominar o mercado de produtos digitais modernos.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MonitorPlay, title: 'Crie SaaS com IA', desc: 'Gere sistemas completos a partir das suas respostas e transforme ideias em produtos digitais.' },
              { icon: Zap, title: 'Atualize com facilidade', desc: 'Faça melhorias, ajustes e novas versões sem precisar começar tudo novamente.' },
              { icon: Palette, title: 'Personalização total', desc: 'Customize visual, cores, estrutura e identidade para criar soluções únicas.' },
              { icon: BarChart3, title: 'Análises em tempo real', desc: 'Acompanhe métricas, uso e evolução através do painel.' },
              { icon: Briefcase, title: 'Preste serviços', desc: 'Crie soluções para empresas e entregue projetos personalizados com rapidez.' },
              { icon: DollarSign, title: 'Gere receita', desc: 'Venda projetos, contratos, assinaturas e soluções digitais.' },
            ].map((feature, i) => (
              <div key={i} className="bg-background border border-border p-6 rounded-xl hover:border-primary/50 transition-colors group">
                <div className="w-12 h-12 bg-panel rounded-lg border border-border flex items-center justify-center mb-4 group-hover:text-primary transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-textSecondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">COMO FUNCIONA</h2>
            <p className="text-textSecondary max-w-2xl mx-auto">O caminho mais rápido entre a sua ideia e o lançamento.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Escolha sua ideia', desc: 'Defina o produto, sistema ou solução que deseja criar.' },
              { step: '02', title: 'Descreva o projeto', desc: 'Informe recursos, público e características.' },
              { step: '03', title: 'Use a IA', desc: 'Transforme sua ideia em uma especificação estruturada.' },
              { step: '04', title: 'Construa e evolua', desc: 'Desenvolva, personalize e continue melhorando sua solução.' },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="text-5xl font-bold text-panel border-text mb-4 opacity-50">{step.step}</div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-textSecondary">{step.desc}</p>
                {i < 3 && <div className="hidden md:block absolute top-8 -right-4 w-8 h-px bg-border" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you can create */}
      <section className="py-24 px-6 bg-panel/30 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">O QUE VOCÊ PODE CRIAR</h2>
            <p className="text-textSecondary max-w-2xl mx-auto">Infinitas possibilidades para diferentes nichos e modelos de negócio.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'SITES & APLICATIVOS', items: ['Landing Pages', 'Sites Institucionais', 'Portfólios', 'Web Apps'] },
              { title: 'E-COMMERCE', items: ['Loja Online', 'Catálogo', 'Pagamentos', 'Gestão de Pedidos'] },
              { title: 'INFOPRODUTOS & E-BOOKS', items: ['Plataformas de Membros', 'Áreas Restritas', 'Checkout', 'Conteúdo Digital'] },
              { title: 'TEMPLATES PERSONALIZADOS', items: ['Dashboards Administrativos', 'CRMs', 'Ferramentas de Nicho', 'Sistemas Personalizados'] },
            ].map((card, i) => (
              <div key={i} className="bg-background border border-border p-8 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none group-hover:bg-primary/10 transition-colors" />
                <h3 className="text-lg font-bold text-white mb-6 tracking-wide">{card.title}</h3>
                <ul className="space-y-3">
                  {card.items.map((item, j) => (
                    <li key={j} className="flex items-center text-textSecondary">
                      <CheckCircle2 className="w-5 h-5 text-success mr-3 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">ESCOLHA SEU PLANO</h2>
            <p className="text-textSecondary max-w-2xl mx-auto">
              Escolha o acesso ideal para transformar suas ideias em produtos digitais.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
            {/* Mensal */}
            <div className="bg-panel border border-border rounded-2xl p-8 shadow-xl flex flex-col h-full">
              <h3 className="text-xl font-bold text-white mb-2">PLANO MENSAL</h3>
              <div className="text-4xl font-bold text-white mb-6">R$ 197<span className="text-lg text-textSecondary font-normal">/mês</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Acesso à plataforma', 'Creator IA', 'Geração de prompts', 'Scanner básico', 'Dashboard', 'Gestão de contratos'].map((feature, i) => (
                  <li key={i} className="flex items-start text-textSecondary">
                    <CheckCircle2 className="w-5 h-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a href={CHECKOUT_URLS.mensal} className="w-full">
                <Button variant="secondary" className="w-full" size="lg">Assinar Mensal</Button>
              </a>
            </div>

            {/* Trimestral */}
            <div className="bg-background border-2 border-primary rounded-2xl p-8 shadow-2xl shadow-primary/20 relative flex flex-col h-full transform md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider">
                MAIS POPULAR
              </div>
              <h3 className="text-xl font-bold text-white mb-2">PLANO TRIMESTRAL</h3>
              <div className="text-4xl font-bold text-white mb-6">R$ 299 <span className="text-lg text-textSecondary font-normal">/ 3 meses</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Acesso completo', 'Gerador avançado', 'Prospecção inteligente', 'Scanner', 'Dashboard', 'CRM', 'Recursos premium'].map((feature, i) => (
                  <li key={i} className="flex items-start text-white font-medium">
                    <CheckCircle2 className="w-5 h-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a href={CHECKOUT_URLS.trimestral} className="w-full">
                <Button className="w-full" size="lg">Assinar Trimestral</Button>
              </a>
            </div>

            {/* Anual */}
            <div className="bg-panel border border-border rounded-2xl p-8 shadow-xl flex flex-col h-full">
              <h3 className="text-xl font-bold text-white mb-2">PLANO ANUAL</h3>
              <div className="text-4xl font-bold text-white mb-6">R$ 1.367<span className="text-lg text-textSecondary font-normal">/ano</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Acesso por 12 meses', 'Suporte prioritário', 'Recursos premium', 'Bônus exclusivos', 'Acesso completo'].map((feature, i) => (
                  <li key={i} className="flex items-start text-textSecondary">
                    <CheckCircle2 className="w-5 h-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a href={CHECKOUT_URLS.anual} className="w-full">
                <Button variant="secondary" className="w-full" size="lg">Assinar Anual</Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-panel/30 border-y border-border">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">PERGUNTAS FREQUENTES</h2>
          </div>
          
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
                a: 'Após a confirmação do pagamento, você será direcionado para o cadastro. Depois de criar sua conta, poderá acessar a área do GhostMarket AI.'
              },
              {
                q: 'Como funciona o suporte e acompanhamento?',
                a: 'Oferecemos suporte por e-mail e uma comunidade exclusiva dependendo do plano escolhido, além de documentação completa na própria plataforma.'
              }
            ].map((faq, i) => (
              <details key={i} className="group bg-background border border-border rounded-lg [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 font-medium text-white">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-textSecondary transition-transform group-open:-rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-textSecondary leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-primary/20 rounded-[100%] blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">SUA PRÓXIMA IDEIA PODE VIRAR UM SAAS</h2>
          <p className="text-xl text-textSecondary mb-10 max-w-2xl mx-auto">
            Pare de apenas imaginar. Comece a construir, testar e transformar suas ideias digitais em produtos.
          </p>
          <Button size="lg" onClick={() => scrollTo('planos')} className="text-lg px-10 h-14">
            Começar agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-panel border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <Link to="/" className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <Ghost className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl tracking-tight text-white">GhostMarket_<span className="text-primary">AI</span></span>
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
          © 2026 GhostMarket AI. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
