import { useState } from 'react'
import { Webhook, Copy, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'

export const Integrations = () => {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  const [copied, setCopied] = useState(false)

  const webhookUrl = `https://ghostmarket-ai.vercel.app/api/client-webhook?user=${encodeURIComponent(user?.email || 'email')}`

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    addToast('URL do Webhook copiada para a área de transferência!', 'success')
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex gap-4 items-start">
        <AlertTriangle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-primary mb-1">Por que integrar seu gateway?</h3>
          <p className="text-textSecondary text-sm">
            Para que o GhostMarket AI consiga montar o seu Painel de Controle com gráficos precisos e as últimas transações em tempo real, precisamos que a sua plataforma de vendas (Cakto, Kiwify, PerfectPay, etc.) nos avise sempre que uma venda acontecer.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5 text-primary" />
              Sua URL de Webhook Personalizada
            </CardTitle>
            <p className="text-textSecondary text-sm mt-1">
              Esta é a sua URL única. Copie-a e cole na configuração de Webhooks do seu gateway de pagamento.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 bg-background border border-border rounded-lg p-2 pl-4">
              <code className="flex-1 text-sm text-primary font-mono truncate">
                {webhookUrl}
              </code>
              <Button onClick={handleCopy} variant="secondary" className="gap-2 flex-shrink-0">
                {copied ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar URL'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Como integrar na Cakto</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 text-sm text-textSecondary list-decimal list-inside">
              <li>Acesse o seu painel da <strong className="text-white">Cakto</strong>.</li>
              <li>Vá no menu lateral e clique em <strong className="text-white">Webhooks</strong>.</li>
              <li>Clique no botão para criar uma nova configuração.</li>
              <li>No campo de URL, <strong className="text-primary">cole a URL copiada acima</strong>.</li>
              <li>Em eventos, selecione apenas <strong className="text-white">"Venda Aprovada" (purchase_approved)</strong>.</li>
              <li>Salve as configurações. Suas vendas começarão a cair no Dashboard!</li>
            </ol>
            <Button variant="secondary" className="w-full mt-6 gap-2">
              Ver documentação da Cakto <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Como integrar na Kiwify</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 text-sm text-textSecondary list-decimal list-inside">
              <li>Acesse o seu painel da <strong className="text-white">Kiwify</strong>.</li>
              <li>Vá no menu lateral e clique em <strong className="text-white">Apps e Integrações</strong>.</li>
              <li>Selecione a opção <strong className="text-white">Webhooks</strong> e crie um novo.</li>
              <li>Selecione o produto que você quer monitorar.</li>
              <li>Na URL, <strong className="text-primary">cole a URL copiada acima</strong>.</li>
              <li>Marque a caixinha de evento <strong className="text-white">"Venda Aprovada"</strong> e salve.</li>
            </ol>
            <Button variant="secondary" className="w-full mt-6 gap-2">
              Ver documentação da Kiwify <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
