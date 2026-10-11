import { motion } from 'framer-motion'
import { MessageCircle, Users, Sparkles, ShieldCheck, Zap, Lock, ArrowUpRight, Flame, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

const WHATSAPP_VIP_LINK = "https://chat.whatsapp.com/KUhl1XpzbOIIkzAvZPqhKT"

export const VipGroup = () => {
  const { user } = useAuthStore()
  const isAdmin = user?.email === 'willrandrier@gmail.com'
  const isPartner = user?.email === 'souza.abencoado4@gmail.com'
  const hasRealEmail = Boolean(user?.email && user.email.includes('@') && !user.email.startsWith('Teste VIP'))
  const isTrial = Boolean(!isAdmin && !isPartner && !hasRealEmail && (user?.isAnonymous || user?.email?.startsWith('Teste VIP')))

  if (isTrial) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#0e0a1a] border border-purple-500/20 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-6 text-purple-400">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Acesso Exclusivo para Membros</h2>
          <p className="text-textSecondary text-sm mb-6 leading-relaxed">
            O Grupo VIP oficial no WhatsApp é um benefício reservado exclusivamente para clientes com assinatura ativa do GhostMarket AI.
          </p>
          <Button 
            className="w-full bg-primary hover:bg-primaryLight text-white font-bold h-12 shadow-[0_0_25px_rgba(139,92,246,0.4)]"
            onClick={() => window.location.href = '/'}
          >
            Assinar Plano e Liberar Acesso
          </Button>
        </motion.div>
      </div>
    )
  }

  const benefits = [
    {
      icon: Users,
      title: "Networking de Elite",
      description: "Conecte-se com operadores que já fecham contratos de R$ 500 a R$ 3.000 por site todos os meses."
    },
    {
      icon: Zap,
      title: "Estratégias e Scripts Validados",
      description: "Aprenda abordagens X1 que realmente convertem e descubra nichos com baixa concorrência e alta demanda."
    },
    {
      icon: ShieldCheck,
      title: "Suporte e Acompanhamento Direto",
      description: "Tire dúvidas técnicas, receba feedback nas suas propostas e melhore seu fechamento comercial."
    },
    {
      icon: Flame,
      title: "Novidades e Updates em Primeira Mão",
      description: "Seja o primeiro a saber sobre novos agentes de IA, atualizações do sistema e recursos exclusivos."
    }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl p-8 md:p-12 overflow-hidden border border-purple-500/20 bg-gradient-to-br from-[#120a26] via-[#090514] to-[#050508] shadow-[0_10px_50px_rgba(0,0,0,0.6)]"
      >
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-widest uppercase mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Comunidade Ativa no WhatsApp
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Bem-vindo ao <span className="bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">Grupo VIP</span>
          </h1>

          <p className="text-textSecondary text-base sm:text-lg mb-8 leading-relaxed">
            Seu canal direto com outros criadores, suporte em tempo real e as melhores estratégias para acelerar sua agência de sites.
          </p>

          <a 
            href={WHATSAPP_VIP_LINK} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold text-base shadow-[0_0_40px_rgba(16,185,129,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] group"
          >
            <MessageCircle className="w-6 h-6 fill-white" />
            <span>Entrar no Grupo VIP do WhatsApp</span>
            <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>

          <p className="text-xs text-textSecondary/60 mt-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            Acesso liberado e vitalício para membros pagantes.
          </p>
        </div>
      </motion.div>

      {/* Benefits Grid */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          O que você encontra dentro da comunidade
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {benefits.map((b, i) => {
            const Icon = b.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-[#0b0714] border border-white/5 hover:border-purple-500/30 rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{b.title}</h3>
                <p className="text-textSecondary text-sm leading-relaxed">{b.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Rules Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-surface/40 border border-border/50 rounded-2xl p-6 sm:p-8"
      >
        <h3 className="text-base font-bold text-white mb-3">Diretrizes da Comunidade:</h3>
        <ul className="space-y-2 text-sm text-textSecondary">
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold">•</span>
            Ambiente 100% colaborativo focado em negócios, tecnologia e vendas de sites.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold">•</span>
            Proibido envio de spam, correntes ou autopromoção de serviços não autorizados.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold">•</span>
            Respeito mútuo entre todos os membros e foco no crescimento coletivo.
          </li>
        </ul>
      </motion.div>
    </div>
  )
}
