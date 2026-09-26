const fs = require('fs');

const code = `import { motion } from 'framer-motion'
import { 
  Ghost, Bell, Plus, Zap, LayoutDashboard, Crown, Sparkles, 
  ChevronLeft, ChevronRight, Settings, LogOut, DollarSign, 
  Calendar, TrendingUp, User, ArrowUpRight, MessageSquare,
  Globe, Code, Image as ImageIcon, Search
} from 'lucide-react'

export const AppPreview = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className="relative mx-auto max-w-[1200px] w-full rounded-2xl border border-white/10 bg-[#000000] shadow-[0_0_80px_rgba(139,92,246,0.15)] overflow-hidden mb-20 text-white font-sans flex flex-col"
    >
      {/* MacOS Header */}
      <div className="flex items-center px-4 py-3 border-b border-white/5 bg-[#050505] shrink-0">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="mx-auto bg-white/5 px-32 py-1 rounded-md text-xs text-white/30 font-medium">
          app.ghostmarket.ai
        </div>
      </div>
      
      {/* App Layout */}
      <div className="flex h-[600px] bg-[#050505]">
        {/* Sidebar */}
        <div className="w-[240px] shrink-0 border-r border-white/5 flex flex-col p-4 overflow-y-hidden relative bg-[#050505]">
          <div className="flex items-center gap-3 font-bold text-lg mb-8 px-2 tracking-wide">
            <div className="w-8 h-8 rounded-xl bg-[#0b0714] border border-white/10 flex items-center justify-center">
              <Ghost className="w-4 h-4 text-primary" />
            </div>
            GhostMarket
          </div>

          <div className="flex-1 overflow-y-hidden flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-white/40 px-2 tracking-wider">PAINEL</span>
              <div className="flex items-center gap-3 bg-[#130e1d] border border-primary/20 text-white px-3 py-2 rounded-xl text-sm font-medium">
                <LayoutDashboard className="w-4 h-4 text-primary" /> Resumo Global
              </div>
              <div className="flex items-center gap-3 text-white/50 px-3 py-2 rounded-xl text-sm font-medium">
                <Crown className="w-4 h-4" /> Top Global
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-white/40 px-2 tracking-wider">PROMPT, SITES E LEADS</span>
              <div className="flex items-center gap-3 text-white/50 px-3 py-2 rounded-xl text-sm font-medium">
                <Sparkles className="w-4 h-4" /> Creator IA
              </div>
              <div className="flex items-center gap-3 text-white/50 px-3 py-2 rounded-xl text-sm font-medium">
                <Code className="w-4 h-4" /> Prompt Builder
              </div>
              <div className="flex items-center gap-3 text-white/50 px-3 py-2 rounded-xl text-sm font-medium">
                <Globe className="w-4 h-4" /> Hospedar Novo Site
              </div>
              <div className="flex items-center gap-3 text-white/50 px-3 py-2 rounded-xl text-sm font-medium">
                <Search className="w-4 h-4" /> Scanner de Leads
              </div>
            </div>
          </div>

          {/* Sidebar Bottom */}
          <div className="mt-auto pt-4 flex flex-col gap-3 border-t border-white/5">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-white/10 text-sm font-medium text-white hover:bg-white/5 transition-colors">
              <MessageSquare className="w-4 h-4" /> Suporte Exclusivo
            </button>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-white/10 text-xs font-medium text-white hover:bg-white/5 transition-colors">
                <Settings className="w-3.5 h-3.5" /> Config
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-white/10 text-xs font-medium text-white hover:bg-white/5 transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Sair
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-[#0b0714] mt-1">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold">WL</span>
                <span className="text-[10px] text-white/40 font-medium tracking-wider">ADMINISTRADOR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[#050505] overflow-y-auto overflow-x-hidden relative">
          {/* Subtle noise and glow overlay */}
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

          {/* Topbar */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 shrink-0 relative z-10">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Painel de Controle</h2>
              <p className="text-sm text-white/50 mt-1">Acompanhe suas vendas, projetos e leads em um único lugar.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold tracking-wide">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SISTEMA ONLINE
              </div>
              <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                <Bell className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-8 flex flex-col gap-6 relative z-10">
            {/* Header Area */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold tracking-wider w-fit">
                  <Zap className="w-3.5 h-3.5" /> MODO ELITE ATIVADO
                </div>
                <div>
                  <h1 className="text-5xl font-black tracking-tight mb-2">Olá, WL.</h1>
                  <p className="text-lg text-white/60">Visão geral do seu império digital.</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-[#0b0714] text-white font-medium hover:bg-white/5 transition-colors">
                <Plus className="w-4 h-4" /> Registrar Venda
              </button>
            </div>

            {/* Auto-Cálculo de Meta */}
            <div className="w-full bg-[#0b0714] border border-white/5 rounded-2xl p-6 mt-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="flex items-center gap-2 text-white font-bold mb-8">
                <Zap className="w-5 h-5 text-primary" /> Auto-Cálculo de Meta
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-white/60">Meta Mensal</label>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-[#050505] border border-white/10 rounded-lg text-white font-medium min-w-[150px]">
                      10000
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between text-sm font-bold mb-3">
                    <span>Progresso (23.5%)</span>
                    <span className="text-primary">R$ 2.349,86 / R$ 10.000,00</span>
                  </div>
                  <div className="w-full h-3 bg-[#050505] rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '23.5%' }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between mt-8">
                <p className="text-sm text-white/50">Faltam <strong className="text-white">R$ 7.650,14</strong> para atingir a meta.</p>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/20 bg-primary/5 text-primary text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5" /> Sugestão da IA: Aumente o orçamento da oferta principal em 20% hoje.
                </div>
              </div>
            </div>

            {/* Grid Inferior */}
            <div className="grid grid-cols-12 gap-6 mt-2">
              
              {/* Col 1: Hoje / Esta Semana */}
              <div className="col-span-3 flex flex-col gap-6">
                <div className="bg-[#0b0714] border border-white/5 rounded-2xl p-6 relative overflow-hidden h-[180px] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/50 tracking-wider">HOJE</span>
                    <div className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black mb-2">R$ 0,00</h3>
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                      <ArrowUpRight className="w-3.5 h-3.5" /> Faturamento diário
                    </div>
                  </div>
                </div>

                <div className="bg-[#0b0714] border border-white/5 rounded-2xl p-6 relative overflow-hidden h-[180px] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/50 tracking-wider">ESTA SEMANA</span>
                    <div className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black mb-2">R$ 839,96</h3>
                    <div className="flex items-center gap-1 text-white/50 text-xs font-medium">
                      Acumulado nos últimos 7 dias
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 2: Visão de Crescimento (Chart) */}
              <div className="col-span-5 bg-[#0b0714] border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold">Visão de Crescimento</h3>
                    <p className="text-xs text-white/50 mt-1">Acompanhe a escalabilidade do seu negócio</p>
                  </div>
                  <div className="flex bg-[#050505] rounded-lg p-1 border border-white/5">
                    {['7 Dias', '30 Dias', '12 Meses'].map((tab, i) => (
                      <button key={tab} className={\`px-3 py-1 text-xs font-medium rounded-md \${i === 0 ? 'bg-white/10 text-white' : 'text-white/50'}\`}>
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Simulated Chart Area */}
                <div className="flex-1 relative mt-8 flex flex-col justify-end">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pb-8">
                    {[360, 270, ''].map((v, i) => (
                      <div key={i} className="flex items-end border-b border-white/5 w-full h-full relative">
                         <span className="absolute -left-1 -bottom-2 text-[10px] text-white/30">{v}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Animated SVG Chart matching the screenshot */}
                  <div className="absolute inset-0 top-4 left-6 right-0 bottom-8">
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <motion.path
                        initial={{ d: "M 0 100 L 0 100 L 20 100 C 25 100, 28 100, 32 100 C 36 100, 39 100, 45 100 C 50 100, 52 100, 58 100 C 62 100, 65 100, 72 100 C 76 100, 78 100, 85 100 C 89 100, 95 100, 100 100 L 100 100 Z" }}
                        whileInView={{ d: "M 0 100 L 0 100 L 20 100 C 25 100, 28 10, 32 10 C 36 10, 39 100, 45 100 C 50 100, 52 40, 58 40 C 62 40, 65 100, 72 100 C 76 100, 78 80, 85 80 C 89 80, 95 100, 100 100 L 100 100 Z" }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        fill="url(#chartGrad)"
                      />
                      <motion.path
                        initial={{ d: "M 0 100 L 20 100 C 25 100, 28 100, 32 100 C 36 100, 39 100, 45 100 C 50 100, 52 100, 58 100 C 62 100, 65 100, 72 100 C 76 100, 78 100, 85 100 C 89 100, 95 100, 100 100" }}
                        whileInView={{ d: "M 0 100 L 20 100 C 25 100, 28 10, 32 10 C 36 10, 39 100, 45 100 C 50 100, 52 40, 58 40 C 62 40, 65 100, 72 100 C 76 100, 78 80, 85 80 C 89 80, 95 100, 100 100" }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="2.5"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Col 3: Notificações */}
              <div className="col-span-4 bg-[#0b0714] border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Notificações</h3>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    { name: "Nicollas Clean ...", tag: "SAAS", val: "+R$ 29,99" },
                    { name: "Davi dos Santo...", tag: "SAAS", val: "+R$ 29,99" },
                    { name: "Pedro Elias Ferr...", tag: "SAAS", val: "+R$ 29,99" },
                    { name: "MS Barbearia", tag: "SAAS", val: "+R$ 200,00", blur: true }
                  ].map((notif, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.15 }}
                      className={\`flex items-center justify-between p-3 rounded-xl border border-white/5 bg-[#050505] \${notif.blur ? 'opacity-40 translate-y-2' : ''}\`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <DollarSign className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white/90">{notif.name}</span>
                          <span className="text-[10px] text-white/40 tracking-wider">{notif.tag}</span>
                        </div>
                      </div>
                      <span className="text-emerald-400 font-bold text-sm tracking-wide">{notif.val}</span>
                    </motion.div>
                  ))}
                  
                  {/* Floating Bot button bottom right corner of this card */}
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-[#0b0714] border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors z-20">
                    <Bot className="w-5 h-5 text-white/70" />
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
      
    </motion.div>
  )
}
`;

fs.writeFileSync('src/components/ui/AppPreview.tsx', code, 'utf8');
