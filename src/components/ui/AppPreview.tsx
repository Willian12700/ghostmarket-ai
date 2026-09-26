import { motion } from 'framer-motion'
import { LayoutDashboard, Search, Globe, Bot, DollarSign, Users, Sparkles, Ghost } from 'lucide-react'

export const AppPreview = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className="relative mx-auto max-w-5xl rounded-2xl border border-[#261f36] bg-[#0b0714] shadow-2xl overflow-hidden mb-20"
    >
      {/* MacOS Header */}
      <div className="flex items-center px-4 py-3 border-b border-[#261f36] bg-[#130e1d]">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="mx-auto bg-black/40 px-32 py-1.5 rounded-md text-xs text-white/30 font-medium">app.ghostmarket.ai</div>
      </div>
      
      <div className="flex h-[400px]">
        {/* Sidebar */}
        <div className="w-48 border-r border-[#261f36] bg-[#0b0714] p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white font-bold mb-6 px-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.3)]">
              <Ghost className="w-3.5 h-3.5 text-white" />
            </div>
            Ghost AI
          </div>
          <div className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-2 rounded-lg text-sm font-medium border border-primary/20">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </div>
          <div className="flex items-center gap-2 text-textSecondary px-3 py-2 text-sm font-medium hover:text-white transition-colors">
            <Search className="w-4 h-4" /> Scanner
          </div>
          <div className="flex items-center gap-2 text-textSecondary px-3 py-2 text-sm font-medium hover:text-white transition-colors">
            <Globe className="w-4 h-4" /> Meus Sites
          </div>
          <div className="flex items-center gap-2 text-textSecondary px-3 py-2 text-sm font-medium hover:text-white transition-colors">
            <Bot className="w-4 h-4" /> Chatbots
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat relative">
          <div className="absolute inset-0 bg-[#0b0714]/80 z-0" />
          <div className="relative z-10 h-full flex flex-col gap-6">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-bold text-white">VisÃ£o Geral</h3>
               <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                 <Users className="w-4 h-4 text-primary" />
               </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
               {[
                 { title: "Receita Hoje", value: "R$ 4.250", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                 { title: "Leads Capturados", value: "128", icon: Search, color: "text-blue-400", bg: "bg-blue-500/10" },
                 { title: "Sites Hospedados", value: "14", icon: Globe, color: "text-pink-400", bg: "bg-pink-500/10" }
               ].map((stat, i) => (
                 <div key={i} className="bg-[#130e1d] border border-[#261f36] rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">{stat.title}</span>
                       <div className={`w-6 h-6 rounded-md flex items-center justify-center \${stat.bg}`}>
                          <stat.icon className={`w-3.5 h-3.5 \${stat.color}`} />
                       </div>
                    </div>
                    <span className="text-2xl font-bold text-white mt-1">{stat.value}</span>
                 </div>
               ))}
            </div>

            <div className="flex-1 bg-[#130e1d] border border-[#261f36] rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-white text-sm font-bold">
                 <Sparkles className="w-4 h-4 text-primary animate-pulse" /> I.A. Trabalhando
              </div>
              <div className="flex flex-col gap-4 mt-2">
                 {[
                   { action: "Site gerado e publicado (ClÃ­nica Odonto)", time: "Agora" },
                   { action: "Script de Vendas VSL finalizado", time: "HÃ¡ 10 min" },
                   { action: "Scanner encontrou 50 empresas sem site", time: "HÃ¡ 2 horas" }
                 ].map((act, i) => (
                   <div key={i} className="flex items-center justify-between text-sm">
                     <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
                       <span className="text-white/80 font-medium">{act.action}</span>
                     </div>
                     <span className="text-textSecondary text-xs">{act.time}</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Glow Behind Mockup */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent opacity-[0.15] blur-2xl -z-10 rounded-2xl pointer-events-none" />
    </motion.div>
  )
}
