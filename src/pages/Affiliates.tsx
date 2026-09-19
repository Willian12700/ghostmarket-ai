import { Gift, ExternalLink, DollarSign, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const Affiliates = () => {
  const CAKTO_LINK_VITALICIO = "https://app.cakto.com.br/affiliate/invite/89edc200-230b-4857-9d86-1be68991f8e2"
  const CAKTO_LINK_MENSAL = "https://app.cakto.com.br/affiliate/invite/f35c621d-948d-401c-ac06-e452d47a96a8"

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* HEADER PRINCIPAL */}
      <div className="bg-[#0b0416] rounded-2xl p-8 border border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.05)] relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4 tracking-wider">
            <Gift className="w-3 h-3" />
            HUB DE AFILIADOS
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Construa sua Renda Passiva.</h1>
          <p className="text-textSecondary max-w-xl">
            Venda o GhostMarket AI e receba comissões automáticas diretamente na sua conta. Você lucra divulgando a ferramenta que já está revolucionando o mercado.
          </p>
        </div>
      </div>

      {/* PLANOS DE AFILIAÇÃO */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* MENSAL */}
        <div className="bg-[#0b0416] border border-primary/10 hover:border-primary/40 transition-all rounded-2xl p-8 relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-[40px] group-hover:bg-primary/20 transition-all pointer-events-none" />
          
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
              R$ 19,00
            </div>
            <p className="text-sm text-textSecondary mt-2">Por cada venda aprovada (13% de comissão).</p>
          </div>

          <a href={CAKTO_LINK_MENSAL} target="_blank" rel="noopener noreferrer" className="block relative z-10">
            <Button className="w-full bg-[#1a0f2e] hover:bg-primary text-white border border-primary/30 hover:border-primary transition-all py-6 text-md shadow-[0_0_15px_rgba(139,92,246,0.1)] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)]">
              Afiliar-se ao Plano Mensal <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>

        {/* VITALÍCIO */}
        <div className="bg-[#0b0416] border border-primary/30 hover:border-primary transition-all rounded-2xl p-8 relative overflow-hidden group shadow-[0_0_20px_rgba(139,92,246,0.05)]">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-primary to-purple-400" />
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-[40px] group-hover:bg-primary/30 transition-all pointer-events-none" />
          
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
              R$ 19,00
            </div>
            <p className="text-sm text-textSecondary mt-2">Por cada venda aprovada (Comissão Fixa).</p>
          </div>

          <a href={CAKTO_LINK_VITALICIO} target="_blank" rel="noopener noreferrer" className="block relative z-10">
            <Button className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-md shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              Afiliar-se ao Plano Vitalício <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </div>

      {/* COMO FUNCIONA */}
      <div className="bg-[#0b0416] border border-primary/20 rounded-2xl p-8 relative overflow-hidden">
        <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Como funciona a parceria?
        </h3>
        
        <div className="grid md:grid-cols-3 gap-8 relative z-10">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#11081e] border border-primary/20 flex items-center justify-center text-primary font-bold text-xl">1</div>
            <h4 className="font-bold text-white text-md">Aceite o Convite</h4>
            <p className="text-sm text-textSecondary leading-relaxed">
              Clique nos botões acima para ser redirecionado à Cakto. Crie uma conta gratuita (ou faça login) para aceitar a afiliação instantaneamente.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#11081e] border border-primary/20 flex items-center justify-center text-primary font-bold text-xl">2</div>
            <h4 className="font-bold text-white text-md">Pegue seu Link</h4>
            <p className="text-sm text-textSecondary leading-relaxed">
              Dentro do seu painel da Cakto, vá no menu lateral em <strong className="text-white">"Meus Produtos Afiliados"</strong> e copie o seu Link de Checkout exclusivo.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#11081e] border border-primary/20 flex items-center justify-center text-primary font-bold text-xl">3</div>
            <h4 className="font-bold text-white text-md">Lucro Automático</h4>
            <p className="text-sm text-textSecondary leading-relaxed">
              Quando alguém comprar pelo seu link, a Cakto divide o dinheiro na hora. O seu lucro cai direto no seu saldo da Cakto, pronto para saque via PIX!
            </p>
          </div>
        </div>
      </div>
      
      {/* AVISO IMPORTANTE */}
      <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-3">
        <div className="w-2 h-2 rounded-full bg-warning mt-1.5 shrink-0 animate-pulse" />
        <p className="text-sm text-warning/90">
          <strong className="text-warning">Em breve:</strong> Todas as suas vendas de afiliado da Cakto aparecerão diretamente no seu <strong>Dashboard do GhostMarket AI</strong>. Para que a integração funcione perfeitamente no futuro, certifique-se de que o seu e-mail cadastrado na Cakto seja exatamente o mesmo e-mail que você usa aqui no sistema.
        </p>
      </div>
    </div>
  )
}
