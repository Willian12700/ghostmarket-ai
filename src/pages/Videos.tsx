import { useState } from 'react'
import {
  Film,
  Sparkles,
  Clock,
  Lock,
  Globe,
  Share2,
  Play,
  Bell,
  CheckCircle2,
  Zap,
  HardDrive,
  ShieldCheck
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToastStore } from '@/store/toastStore'

export const Videos = () => {
  const { addToast } = useToastStore()
  const [isNotified, setIsNotified] = useState(false)

  const handleNotifyMe = () => {
    if (isNotified) return
    setIsNotified(true)
    addToast('Notificação ativada! Você será avisado assim que os servidores forem liberados.', 'success')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16 animate-fade-in">
      {/* Top Banner / Coming Soon Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c0818] via-[#090614] to-[#05030a] border border-purple-500/25 p-8 sm:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        {/* Glow ambient effects */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Funcionalidade em Desenvolvimento • Em Breve</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Central de Vídeos <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-emerald-400">
                & Links Ultrarrápidos
              </span>
            </h1>
            <p className="text-sm sm:text-base text-textSecondary leading-relaxed max-w-2xl">
              Hospede seus vídeos de vendas, demonstrações de sites e propostas na nuvem com streaming de alta velocidade, miniatura automática e links públicos prontos para compartilhar no WhatsApp.
            </p>
          </div>

          {/* Status Pill */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-textSecondary">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Status: <strong className="text-white">Homologação de Servidores Cloud</strong></span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-textSecondary">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Disponibilidade: <strong className="text-emerald-400">Próxima Atualização</strong></span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Button
              onClick={handleNotifyMe}
              className={`h-12 px-6 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                isNotified
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                  : 'bg-primary hover:bg-primaryLight text-white shadow-[0_0_25px_rgba(139,92,246,0.4)]'
              }`}
            >
              {isNotified ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Notificação Ativada!</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Quero ser Avisado Quando Liberar</span>
                </>
              )}
            </Button>

            <span className="text-xs text-textMuted flex items-center gap-1.5 self-center">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Incluso sem custo adicional nos planos ativos
            </span>
          </div>
        </div>
      </div>

      {/* Feature Preview Cards */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">
            O que você poderá fazer nesta área
          </h2>
          <p className="text-xs text-textSecondary">
            Recursos projetados especificamente para acelerar suas vendas e apresentações de projetos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-[#090614] border border-purple-500/20 rounded-2xl p-5 hover:border-purple-500/40 transition-all duration-300 relative group overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Upload Direto na Nuvem</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Envie arquivos de vídeo de até 500 MB com barra de progresso em tempo real e armazenamento seguro.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#090614] border border-purple-500/20 rounded-2xl p-5 hover:border-purple-500/40 transition-all duration-300 relative group overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Links Públicos Rápidos</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Gere links curtos e profissionais (<code className="text-purple-300 text-[10px]">/v/:id</code>) para mandar no WhatsApp ou e-mail de clientes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#090614] border border-purple-500/20 rounded-2xl p-5 hover:border-purple-500/40 transition-all duration-300 relative group overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
              <Play className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Player White-Label</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Player moderno sem propagandas, sem marca d'água de concorrentes e com controle de velocidade.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#090614] border border-purple-500/20 rounded-2xl p-5 hover:border-purple-500/40 transition-all duration-300 relative group overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Controle de Acesso</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Alterne facilmente entre vídeos públicos para prospectos ou privados para uso interno.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Mockup Preview */}
      <div className="bg-[#080512] border border-purple-500/20 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-purple-400 font-bold mb-1">
              <Film className="w-4 h-4" />
              <span>PREVIEW DO PLAYER DE VÍDEO</span>
            </div>
            <h3 className="text-lg font-black text-white">Experiência de Reprodução do Cliente</h3>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Globe className="w-3.5 h-3.5" />
            <span>Link de Exemplo: ghostmarket.cyou/v/demo</span>
          </div>
        </div>

        {/* Mock Player Screen */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video max-h-[380px] w-full flex items-center justify-center group shadow-2xl">
          {/* Background Gradient / Video Simulation */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#160b2e] via-[#090614] to-[#04020a]" />

          {/* Center Play Button Graphic */}
          <div className="relative z-10 w-20 h-20 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-white backdrop-blur-md shadow-[0_0_40px_rgba(139,92,246,0.6)] group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 fill-white ml-1 text-white" />
          </div>

          {/* Top Video HUD */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between text-xs pointer-events-none">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-bold text-white">Demonstração de Proposta de Site.mp4</span>
            </div>
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-lg font-mono font-bold text-[11px]">
              HD 1080p
            </span>
          </div>

          {/* Bottom Video HUD */}
          <div className="absolute bottom-4 left-4 right-4 z-10 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center justify-between gap-4 pointer-events-none">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <Play className="w-3.5 h-3.5 fill-white" />
              </div>
              <span className="text-xs font-mono text-textSecondary">01:42 / 04:15</span>
            </div>

            <div className="flex-1 max-w-md h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-2/5 bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full" />
            </div>

            <div className="flex items-center gap-2 text-xs text-textSecondary">
              <span className="px-2 py-0.5 rounded bg-white/5 font-mono">1.0x</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">Ghost Player</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
