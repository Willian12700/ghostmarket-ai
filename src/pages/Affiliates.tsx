import { Gift, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export const Affiliates = () => {
  const CAKTO_LINK_VITALICIO = "https://app.cakto.com.br/affiliate/invite/89edc200-230b-4857-9d86-1be68991f8e2"
  const CAKTO_LINK_MENSAL = "https://app.cakto.com.br/affiliate/invite/f35c621d-948d-401c-ac06-e452d47a96a8"

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          <Gift className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Programa de Parceiros</h2>
          <p className="text-textSecondary">Indique o GhostMarket AI e receba comissões automáticas direto na sua conta bancária.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-panel border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />
          <CardHeader>
            <CardTitle className="text-lg text-textSecondary">Venda do Plano Mensal</CardTitle>
            <div className="text-4xl font-bold text-white mt-2">R$ 19,00 <span className="text-sm font-normal text-textSecondary">/venda</span></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-textSecondary">13% de comissão sobre o plano de R$ 147,00.</p>
            <a href={CAKTO_LINK_MENSAL} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full">
                Afiliar-se ao Mensal <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </CardContent>
        </Card>

        <Card className="bg-panel border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />
          <CardHeader>
            <CardTitle className="text-lg text-textSecondary">Venda do Plano Vitalício</CardTitle>
            <div className="text-4xl font-bold text-white mt-2">R$ 19,00 <span className="text-sm font-normal text-textSecondary">/venda</span></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-textSecondary">5.28% de comissão sobre o plano de R$ 360,00.</p>
            <a href={CAKTO_LINK_VITALICIO} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]">
                Afiliar-se ao Vitalício <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Como funciona?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-background rounded-xl p-6 border border-border">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold mb-4">1</div>
              <h4 className="font-bold text-white mb-2">Aceite o Convite</h4>
              <p className="text-sm text-textSecondary">Clique nos botões acima. Você será redirecionado para a Cakto. Crie uma conta gratuita (ou faça login) para aceitar a afiliação.</p>
            </div>
            <div className="bg-background rounded-xl p-6 border border-border">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold mb-4">2</div>
              <h4 className="font-bold text-white mb-2">Pegue seu Link</h4>
              <p className="text-sm text-textSecondary">Dentro do seu painel da Cakto, vá em "Meus Produtos Afiliados" e copie o seu Link de Divulgação exclusivo.</p>
            </div>
            <div className="bg-background rounded-xl p-6 border border-border">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold mb-4">3</div>
              <h4 className="font-bold text-white mb-2">Lucro Automático</h4>
              <p className="text-sm text-textSecondary">Quando alguém comprar pelo seu link, a Cakto divide o dinheiro na hora. O valor já cai livre no seu saldo bancário!</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center mt-12">
        <p className="text-sm text-textSecondary">
          * Para que suas vendas apareçam aqui no seu Dashboard do GhostMarket AI, certifique-se de usar o mesmo email cadastrado aqui na sua conta da Cakto.
        </p>
      </div>
    </div>
  )
}
