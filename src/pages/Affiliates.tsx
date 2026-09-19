import { Gift, Copy, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToastStore } from '@/store/toastStore'

export const Affiliates = () => {
  const { addToast } = useToastStore()
  
  // Link de convite do produtor na Cakto
  const CAKTO_AFFILIATE_LINK = "https://cakto.com.br/afiliar/YOUR_PRODUCT_ID_HERE" // O user vai trocar depois

  const handleCopy = () => {
    navigator.clipboard.writeText(CAKTO_AFFILIATE_LINK)
    addToast('Link de afiliação copiado!', 'success')
  }

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
          <CardContent>
            <p className="text-sm text-textSecondary">13% de comissão sobre o plano de R$ 147,00.</p>
          </CardContent>
        </Card>

        <Card className="bg-panel border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />
          <CardHeader>
            <CardTitle className="text-lg text-textSecondary">Venda do Plano Vitalício</CardTitle>
            <div className="text-4xl font-bold text-white mt-2">R$ 19,00 <span className="text-sm font-normal text-textSecondary">/venda</span></div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-textSecondary">5.28% de comissão sobre o plano de R$ 360,00.</p>
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
              <h4 className="font-bold text-white mb-2">Crie sua conta</h4>
              <p className="text-sm text-textSecondary">Você precisará de uma conta gratuita na Cakto para receber seus pagamentos via PIX.</p>
            </div>
            <div className="bg-background rounded-xl p-6 border border-border">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold mb-4">2</div>
              <h4 className="font-bold text-white mb-2">Pegue seu Link</h4>
              <p className="text-sm text-textSecondary">Acesse nosso link de recrutamento e clique em "Tornar-se Afiliado".</p>
            </div>
            <div className="bg-background rounded-xl p-6 border border-border">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold mb-4">3</div>
              <h4 className="font-bold text-white mb-2">Lucro Automático</h4>
              <p className="text-sm text-textSecondary">A Cakto divide o pagamento automaticamente. O dinheiro cai direto no seu saldo!</p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-lg font-bold text-white mb-1">Pronto para começar a faturar?</h4>
              <p className="text-sm text-textSecondary">Junte-se ao nosso exército de parceiros comerciais e faça renda extra.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button variant="secondary" onClick={handleCopy} className="w-full md:w-auto">
                <Copy className="w-4 h-4 mr-2" />
                Copiar Link
              </Button>
              <a href={CAKTO_AFFILIATE_LINK} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                <Button className="w-full">
                  Tornar-se Afiliado <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center mt-12">
        <p className="text-sm text-textSecondary">
          * As comissões são processadas e pagas automaticamente pela plataforma Cakto.
        </p>
      </div>
    </div>
  )
}
