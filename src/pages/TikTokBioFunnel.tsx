import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageCircle,
  Target,
  Users,
  Rocket,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  Zap,
  ExternalLink,
  AlertCircle,
  Star
} from 'lucide-react'

const WHATSAPP_URL =
  'https://wa.me/558496162332?text=' +
  encodeURIComponent(
    'Oi Jarvis! Vim pelo link da bio do TikTok e quero saber como funciona o GhostMarket AI pra criar e vender sites!'
  )

const LINK_MENSAL = 'https://pay.cakto.com.br/fiqwtse_1119916'
const LINK_VITALICIO = 'https://pay.cakto.com.br/yonkyi5_1119928'

export const TikTokBioFunnel: React.FC = () => {
  const [showPlansModal, setShowPlansModal] = useState(false)

  return (
    <div className="min-h-screen bg-[#06040d] text-white relative overflow-hidden flex flex-col items-center justify-between px-4 py-8 selection:bg-violet-500 selection:text-white">
      {/* Efeitos de Iluminação de Fundo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-violet-600/20 rounded-full blur-[130px]" />
        <div className="absolute top-1/2 -left-32 w-[360px] h-[360px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 right-0 w-[420px] h-[420px] bg-cyan-500/15 rounded-full blur-[130px]" />
      </div>

      <main className="relative z-10 w-full max-w-[460px] mx-auto flex flex-col items-center">
        {/* Badge de Status Online */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide mb-5 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-4" />
          SISTEMA 100% ONLINE • IA GERADORA DE SITES
        </div>

        {/* Avatar / Logo Oficial */}
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-900 p-[2px] shadow-[0_0_40px_rgba(139,92,246,0.45)]">
            <div className="w-full h-full bg-[#0c0818] rounded-[22px] flex items-center justify-center relative overflow-hidden">
              <svg
                className="w-14 h-14 drop-shadow-[0_4px_16px_rgba(167,139,250,0.6)]"
                viewBox="0 0 64 64"
                fill="none"
              >
                <defs>
                  <linearGradient id="ghostGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#c4b5fd" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 56V28C12 15 21 6 32 6s20 9 20 22v28l-7-6-6 6-7-6-7 6-7-6z"
                  fill="url(#ghostGrad)"
                />
                <circle cx="25" cy="28" r="4" fill="#07060b" />
                <circle cx="39" cy="28" r="4" fill="#07060b" />
              </svg>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-[#042f2e] rounded-full p-1.5 border-2 border-[#06040d] shadow-lg">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Título e Subtítulo */}
        <div className="text-center mb-7">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            GhostMarket AI
            <Sparkles className="w-5 h-5 text-violet-400" />
          </h1>
          <p className="text-sm text-zinc-300 mt-2 leading-relaxed max-w-[360px] mx-auto">
            Crie sites completos em <strong className="text-violet-300">60 segundos com IA</strong> e encontre empresas sem site no Google Maps para faturar no PIX.
          </p>

          {/* Prova Social Rápida */}
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9/5 Avaliação
            </span>
            <span>•</span>
            <span className="text-zinc-300 font-medium">+1.200 Sites Gerados</span>
          </div>
        </div>

        {/* AS 4 OPÇÕES DO FUNIL DA BIO */}
        <div className="w-full space-y-3.5">
          {/* OPÇÃO 1: FALAR PELO WHATSAPP */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group block w-full rounded-2xl p-[1.5px] bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500 shadow-[0_0_30px_rgba(16,185,129,0.22)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99]"
          >
            <div className="bg-[#0b1614]/95 rounded-[15px] p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    1 • Atendimento Imediato
                  </span>
                </div>
                <h2 className="text-base font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                  Falar pelo WhatsApp
                </h2>
                <p className="text-xs text-zinc-400 leading-snug mt-0.5">
                  Tire suas dúvidas na hora com nosso consultor e veja como começar hoje.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          </a>

          {/* OPÇÃO 2: RESPONDER O QUIZ */}
          <Link
            to="/quiz?utm_source=tiktok_bio"
            className="group block w-full rounded-2xl p-[1.5px] bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 shadow-[0_0_25px_rgba(139,92,246,0.2)] hover:shadow-[0_0_35px_rgba(139,92,246,0.35)] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99]"
          >
            <div className="bg-[#110c1d]/95 rounded-[15px] p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-400/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Target className="w-6 h-6 text-violet-300" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    2 • Diagnóstico em 1 Minuto
                  </span>
                </div>
                <h2 className="text-base font-extrabold text-white group-hover:text-violet-300 transition-colors">
                  Responder o Quiz das Vendas
                </h2>
                <p className="text-xs text-zinc-400 leading-snug mt-0.5">
                  Descubra o que está atrapalhando as vendas dos seus sites e receba seu plano.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-violet-300 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          </Link>

          {/* OPÇÃO 3: SEJA AFILIADO */}
          <Link
            to="/parceiros?utm_source=tiktok_bio"
            className="group block w-full rounded-2xl p-[1.5px] bg-gradient-to-r from-amber-500/80 via-yellow-500/70 to-orange-500/80 shadow-[0_0_20px_rgba(245,158,11,0.12)] hover:shadow-[0_0_30px_rgba(245,158,11,0.28)] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99]"
          >
            <div className="bg-[#161109]/95 rounded-[15px] p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    3 • Ganhe até 50% de Comissão
                  </span>
                </div>
                <h2 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">
                  Seja Afiliado Oficial
                </h2>
                <p className="text-xs text-zinc-400 leading-snug mt-0.5">
                  Indique o GhostMarket AI e receba comissões automáticas na hora via PIX.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          </Link>

          {/* OPÇÃO 4: LINK DA FERRAMENTA */}
          <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shadow-[0_0_25px_rgba(6,182,212,0.18)]">
            <div className="bg-[#09121e]/95 rounded-[15px] p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
                  <Rocket className="w-6 h-6 text-cyan-300" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      4 • Plataforma Oficial
                    </span>
                  </div>
                  <h2 className="text-base font-extrabold text-white">
                    Link da Ferramenta (GhostMarket AI)
                  </h2>
                  <p className="text-xs text-zinc-400 leading-snug mt-0.5">
                    Acesse o site oficial da ferramenta ou libere seu acesso ilimitado agora.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mt-3.5">
                <Link
                  to="/?utm_source=tiktok_bio"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
                  Ver Site Oficial
                </Link>
                <button
                  type="button"
                  onClick={() => setShowPlansModal(!showPlansModal)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-extrabold text-white shadow-lg transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Liberar Acesso Agora
                </button>
              </div>

              {/* Gaveta Rápida de Planos (com aviso do Gmail da Cakto) */}
              {showPlansModal && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-fadeIn">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-200 leading-relaxed">
                      <strong>IMPORTANTE:</strong> O Gmail que você digitar no checkout da Cakto receberá o link do site. Ao criar sua conta na ferramenta, <strong>use exatamente o mesmo Gmail do pagamento!</strong>
                    </p>
                  </div>

                  <a
                    href={LINK_VITALICIO}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3.5 rounded-xl bg-gradient-to-r from-violet-600/30 to-indigo-600/30 border border-violet-400/50 hover:border-violet-300 transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-violet-300 uppercase">
                        🔥 Plano Vitalício (Mais Vendido)
                      </span>
                      <span className="text-sm font-black text-white">R$ 49,99</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 mt-1">
                      Taxa única pra sempre (ou 12x de R$ 5,15) + <strong>7 dias de garantia incondicional</strong>.
                    </p>
                  </a>

                  <a
                    href={LINK_MENSAL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3.5 rounded-xl bg-white/5 border border-white/15 hover:border-white/30 transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-200">
                        ⚡ Plano Mensal
                      </span>
                      <span className="text-sm font-black text-white">R$ 19,99/mês</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Acesso 100% ilimitado ao Gerador de Sites com IA + Radar de Leads no Google Maps.
                    </p>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Garantias de Rodapé */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Acesso Imediato
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> IA sem Créditos/Travas
          </span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Suporte 24h no WhatsApp
          </span>
        </div>
      </main>

      <footer className="relative z-10 mt-8 text-center text-[11px] text-zinc-500">
        © {new Date().getFullYear()} GhostMarket AI • Todos os direitos reservados
      </footer>
    </div>
  )
}
