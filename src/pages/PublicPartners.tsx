import { Gift, ExternalLink, DollarSign, Users, AlertTriangle, CheckCircle2, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'

export const PublicPartners = () => {
  const CAKTO_LINK_VITALICIO = "https://app.cakto.com.br/affiliate/invite/89edc200-230b-4857-9d86-1be68991f8e2"
  const CAKTO_LINK_MENSAL = "https://app.cakto.com.br/affiliate/invite/f35c621d-948d-401c-ac06-e452d47a96a8"

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <AnimatedBackground />

      <header className="absolute top-0 w-full p-6 z-20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50">
            <span className="text-primary font-black text-lg">G</span>
          </div>
          <span className="text-white font-bold tracking-tight text-xl">GhostMarket AI</span>
        </div>
        <Link to="/">
          <Button variant="secondary" className="text-sm">
            <ChevronLeft className="w-4 h-4 mr-2" /> Voltar ao Início
          </Button>
        </Link>
      </header>

      <main className="flex-1 relative z-10 container mx-auto px-4 py-24 space-y-10 max-w-5xl">
        {/* HEADER PRINCIPAL */}
        <div className="bg-[#0b0416]/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-primary/20 shadow-[0_0_50px_rgba(139,92,246,0.1)] relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-bold mb-6 tracking-wider shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              <Gift className="w-4 h-4" />
              SÓCIO PARCEIRO - GHOSTMARKET AI
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
              Trabalhe Conosco e <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">Lucre 50%</span>.
            </h1>
            <p className="text-lg text-textSecondary max-w-2xl mb-8">
              Estamos recrutando parceiros sérios para vender o GhostMarket AI. Você prospecta, apresenta a ferramenta e recebe comissão automática na mesma hora direto na sua conta Cakto.
            </p>
          </div>
        </div>

        {/* REQUISITOS */}
        <div className="bg-error/5 border border-error/20 rounded-2xl p-8 relative overflow-hidden">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-error" />
            Requisitos Obrigatórios para a Parceria
          </h3>
          <div className="grid md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-background/80 backdrop-blur p-6 rounded-xl border border-error/10 flex flex-col gap-3">
              <CheckCircle2 className="w-8 h-8 text-success" />
              <div>
                <h4 className="font-bold text-white text-lg mb-2">Conta na Cakto</h4>
                <p className="text-sm text-textSecondary leading-relaxed">É obrigatório ter um cadastro ativo e validado na plataforma Cakto para podermos repassar suas comissões via PIX.</p>
              </div>
            </div>
            <div className="bg-background/80 backdrop-blur p-6 rounded-xl border border-error/10 flex flex-col gap-3">
              <CheckCircle2 className="w-8 h-8 text-success" />
              <div>
                <h4 className="font-bold text-white text-lg mb-2">Disponibilidade</h4>
                <p className="text-sm text-textSecondary leading-relaxed">Você precisa de tempo disponível para prospectar clientes ativamente no WhatsApp, Instagram e TikTok.</p>
              </div>
            </div>
            <div className="bg-background/80 backdrop-blur p-6 rounded-xl border border-error/10 flex flex-col gap-3">
              <CheckCircle2 className="w-8 h-8 text-success" />
              <div>
                <h4 className="font-bold text-white text-lg mb-2">Foco no X1</h4>
                <p className="text-sm text-textSecondary leading-relaxed">Nós vamos fornecer os Scripts. Você só precisa ter a vontade e a consistência de aplicar o processo de vendas todos os dias.</p>
              </div>
            </div>
          </div>
        </div>

        {/* PLANOS DE AFILIAÇÃO */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* MENSAL */}
          <div className="bg-[#0b0416] border border-primary/20 hover:border-primary/50 transition-all duration-300 rounded-3xl p-8 md:p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] group-hover:bg-primary/20 transition-all pointer-events-none" />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <p className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-2">PRODUTO RECORRENTE</p>
                <h3 className="text-2xl font-bold text-white">GhostMarket Mensal</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#11081e] border border-primary/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
            
            <div className="mb-10 relative z-10">
              <p className="text-sm text-textSecondary mb-2 font-medium">Sua Comissão:</p>
              <div className="text-5xl md:text-6xl font-black text-white tracking-tight">
                R$ 14,99
              </div>
              <p className="text-sm text-primary font-medium mt-3 bg-primary/10 inline-block px-3 py-1 rounded-full">Por cada venda deste plano (50%)</p>
            </div>

            <a href={CAKTO_LINK_MENSAL} target="_blank" rel="noopener noreferrer" className="block relative z-10">
              <Button className="w-full bg-[#1a0f2e] hover:bg-primary text-white border border-primary/30 hover:border-primary transition-all py-7 text-lg font-bold shadow-[0_0_20px_rgba(139,92,246,0.1)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]">
                Me afiliar a este plano <ExternalLink className="w-5 h-5 ml-2" />
              </Button>
            </a>
          </div>

          {/* VITALÍCIO */}
          <div className="bg-gradient-to-b from-[#1a0b2e] to-[#0b0416] border border-primary hover:border-primaryLight transition-all duration-300 rounded-3xl p-8 md:p-10 relative overflow-hidden group shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:shadow-[0_0_50px_rgba(139,92,246,0.3)]">
            <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-primary via-indigo-400 to-primary" />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <p className="text-xs font-bold text-primaryLight uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> HIGH TICKET
                </p>
                <h3 className="text-2xl font-bold text-white">GhostMarket Vitalício</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary border border-primaryLight flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="mb-10 relative z-10">
              <p className="text-sm text-textSecondary mb-2 font-medium">Sua Comissão:</p>
              <div className="text-5xl md:text-6xl font-black text-white tracking-tight">
                R$ 64,99
              </div>
              <p className="text-sm text-white font-bold mt-3 bg-primary/40 inline-block px-3 py-1 rounded-full border border-primary/50">Por cada venda deste plano (50%)</p>
            </div>

            <a href={CAKTO_LINK_VITALICIO} target="_blank" rel="noopener noreferrer" className="block relative z-10">
              <Button className="w-full bg-primary hover:bg-primaryLight text-white py-7 text-lg font-bold shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:scale-[1.02]">
                Me afiliar a este plano <ExternalLink className="w-5 h-5 ml-2" />
              </Button>
            </a>
          </div>
        </div>

        {/* COMO FUNCIONA */}
        <div className="bg-[#0b0416]/80 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <h3 className="text-2xl font-bold text-white mb-10 flex items-center justify-center gap-3 text-center">
            <Users className="w-6 h-6 text-primary" />
            O Caminho das Pedras
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black text-2xl shadow-[0_0_15px_rgba(139,92,246,0.2)]">1</div>
              <h4 className="font-bold text-white text-xl">Afilie-se e pegue o Link</h4>
              <p className="text-sm text-textSecondary leading-relaxed">
                Clique nos botões acima, crie sua conta na Cakto e pegue seu <strong>Link de Checkout</strong>. É ele que garante que a comissão vai pra você.
              </p>
            </div>
            
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black text-2xl shadow-[0_0_15px_rgba(139,92,246,0.2)]">2</div>
              <h4 className="font-bold text-white text-xl">Prospecte e Venda</h4>
              <p className="text-sm text-textSecondary leading-relaxed">
                Encontre interessados em ter um negócio digital (SaaS) no TikTok, Insta ou YouTube. Chame no WhatsApp, mostre a ferramenta e feche no X1.
              </p>
            </div>
            
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black text-2xl shadow-[0_0_15px_rgba(139,92,246,0.2)]">3</div>
              <h4 className="font-bold text-white text-xl">Receba via PIX</h4>
              <p className="text-sm text-textSecondary leading-relaxed">
                Quando seu cliente pagar, a Cakto reconhece seu link e envia 50% do valor pra você na mesma hora. Você saca o dinheiro via PIX.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
