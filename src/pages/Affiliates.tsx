import { Gift, ExternalLink, DollarSign, Users, AlertTriangle, CheckCircle2, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'

export const Affiliates = () => {
  const navigate = useNavigate()
  const CAKTO_LINK_VITALICIO = "https://app.cakto.com.br/affiliate/invite/89edc200-230b-4857-9d86-1be68991f8e2"
  const CAKTO_LINK_MENSAL = "https://app.cakto.com.br/affiliate/invite/f35c621d-948d-401c-ac06-e452d47a96a8"

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      
      {/* HEADER PRINCIPAL */}
      <div className="bg-[#0b0416] rounded-2xl p-8 border border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.05)] relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4 tracking-wider">
            <Gift className="w-3 h-3" />
            SÓCIO PARCEIRO - GHOSTMARKET AI
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Trabalhe Conosco e Lucre.</h1>
          <p className="text-textSecondary max-w-xl">
            Seja um afiliado parceiro do GhostMarket AI. Venda no X1, use nossos scripts e receba 50% de comissão automática direto na sua conta Cakto.
          </p>
        </div>
      </div>

      {/* REQUISITOS */}
      <div className="bg-error/5 border border-error/20 rounded-2xl p-8 relative overflow-hidden">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-error" />
          Requisitos para a Parceria
        </h3>
        <div className="grid md:grid-cols-3 gap-6 relative z-10">
          <div className="bg-background/50 p-5 rounded-xl border border-error/10 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Conta na Cakto</h4>
              <p className="text-xs text-textSecondary">É obrigatório ter um cadastro ativo na plataforma Cakto para receber suas comissões.</p>
            </div>
          </div>
          <div className="bg-background/50 p-5 rounded-xl border border-error/10 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Disponibilidade</h4>
              <p className="text-xs text-textSecondary">Tempo disponível para prospecção ativa de clientes e atendimento 1 a 1 no WhatsApp.</p>
            </div>
          </div>
          <div className="bg-background/50 p-5 rounded-xl border border-error/10 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Aplicação dos Scripts</h4>
              <p className="text-xs text-textSecondary">Comprometimento em estudar e usar os scripts de vendas validados pelo sistema.</p>
            </div>
          </div>
        </div>
      </div>

      {/* PLANOS DE AFILIAÇÃO */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* MENSAL */}
        <div className="bg-[#0b0416] border border-primary/10 hover:border-primary/40 transition-all rounded-2xl p-8 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <p className="text-[11px] font-bold text-textSecondary uppercase tracking-widest mb-1">PLANO RECORRENTE</p>
              <h3 className="text-xl font-bold text-white">GhostMarket Mensal</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#11081e] border border-primary/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
          </div>
          
          <div className="mb-8 relative z-10">
            <div className="text-5xl font-extrabold text-white tracking-tight">
              R$ 45,15
            </div>
            <p className="text-sm text-textSecondary mt-2">Sua comissão (35%) a cada venda do Plano Vitalício.</p>
          </div>

          <a href={CAKTO_LINK_MENSAL} target="_blank" rel="noopener noreferrer" className="block relative z-10">
            <Button className="w-full bg-[#1a0f2e] hover:bg-primary text-white border border-primary/30 hover:border-primary transition-all py-6 text-md shadow-[0_0_15px_rgba(139,92,246,0.1)] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)]">
              Pegar meu Link (Mensal) <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>

        {/* VITALÍCIO */}
        <div className="bg-[#0b0416] border border-primary/30 hover:border-primary transition-all rounded-2xl p-8 relative overflow-hidden group shadow-[0_0_20px_rgba(139,92,246,0.05)]">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-primary to-purple-400" />
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">PLANO HIGH TICKET</p>
              <h3 className="text-xl font-bold text-white">GhostMarket Vitalício</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="mb-8 relative z-10">
            <div className="text-5xl font-extrabold text-white tracking-tight">
              R$ 14,99
            </div>
            <p className="text-sm text-textSecondary mt-2">Sua comissão (50%) a cada venda do Plano Mensal.</p>
          </div>

          <a href={CAKTO_LINK_VITALICIO} target="_blank" rel="noopener noreferrer" className="block relative z-10">
            <Button className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-md shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              Pegar meu Link (Vitalício) <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </div>

      {/* FERRAMENTAS DO AFILIADO */}
      <div className="bg-gradient-to-r from-[#0b0416] to-[#130826] border border-primary/20 rounded-2xl p-8 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Material de Vendas (Scripts)
          </h3>
          <p className="text-sm text-textSecondary max-w-lg">
            Nós preparamos o texto exato que você precisa copiar e colar para vender no X1 pelo WhatsApp e fechar parcerias rapidamente.
          </p>
        </div>
        <Button onClick={() => navigate('/scripts')} className="shrink-0 bg-white text-black hover:bg-gray-200 font-bold px-8 py-6">
          Acessar Scripts X1
        </Button>
      </div>

      {/* COMO FUNCIONA */}
      <div className="bg-[#0b0416] border border-primary/20 rounded-2xl p-8 relative overflow-hidden">
        <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Passo a Passo
        </h3>
        
        <div className="grid md:grid-cols-3 gap-8 relative z-10">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#11081e] border border-primary/20 flex items-center justify-center text-primary font-bold text-xl">1</div>
            <h4 className="font-bold text-white text-md">Afilie-se e pegue o Link</h4>
            <p className="text-sm text-textSecondary leading-relaxed">
              Clique nos botões acima, faça login na Cakto e copie seu Link de Checkout na aba "Meus Produtos Afiliados".
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#11081e] border border-primary/20 flex items-center justify-center text-primary font-bold text-xl">2</div>
            <h4 className="font-bold text-white text-md">Prospecte no X1</h4>
            <p className="text-sm text-textSecondary leading-relaxed">
              Use os scripts de abordagem no Instagram, TikTok ou WhatsApp para atrair os clientes e apresentar a ferramenta.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#11081e] border border-primary/20 flex items-center justify-center text-primary font-bold text-xl">3</div>
            <h4 className="font-bold text-white text-md">Receba Automático</h4>
            <p className="text-sm text-textSecondary leading-relaxed">
              O cliente comprou? A comissão de 50% cai na mesma hora na sua conta Cakto, e você saca via PIX.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  )
}
