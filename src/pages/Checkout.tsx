import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { CreditCard, QrCode, ShieldCheck, CheckCircle2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { motion, AnimatePresence } from 'framer-motion'

export const Checkout = () => {
  const { productId } = useParams()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [method, setMethod] = useState<'pix' | 'card'>('pix')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Buyer Info
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return
      try {
        const docRef = doc(db, 'products', productId)
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() })
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [productId])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !cpf) return
    setIsProcessing(true)

    // Simulate payment processing delay (e.g., calling Asaas API)
    setTimeout(async () => {
      try {
        // Save the transaction to the product owner's wallet/transactions
        await addDoc(collection(db, 'transactions'), {
          productId: product.id,
          userId: product.userId, // The SaaS user who owns the product
          buyerName: name,
          buyerEmail: email,
          buyerCpf: cpf,
          amount: product.price,
          method: method,
          status: 'approved',
          createdAt: serverTimestamp()
        })
        
        setIsSuccess(true)
        
        // Redirect to success URL after 3 seconds
        setTimeout(() => {
          if (product.successUrl) {
            window.location.href = product.successUrl
          }
        }, 3000)
      } catch (error) {
        console.error('Payment error', error)
        setIsProcessing(false)
      }
    }, 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <h1 className="text-2xl font-bold mb-2">Produto não encontrado</h1>
        <p className="text-textSecondary">O link de pagamento é inválido ou o produto foi removido.</p>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-panel border border-border p-8 rounded-3xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Pagamento Aprovado!</h2>
          <p className="text-textSecondary mb-6">Sua compra foi confirmada com sucesso. Você será redirecionado para o seu produto em instantes...</p>
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex justify-center p-4 md:p-8 font-sans">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        
        {/* LEFT COLUMN: CHECKOUT FORM */}
        <div className="md:col-span-7 space-y-8">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-6">Finalizar Compra</h2>
            
            {/* Buyer Info Form */}
            <form id="checkout-form" onSubmit={handlePayment} className="space-y-4 bg-panel border border-border p-6 rounded-3xl">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Nome Completo</label>
                <Input value={name} onChange={e => setName(e.target.value)} required placeholder="João da Silva" className="bg-background" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">E-mail</label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="joao@email.com" className="bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">CPF</label>
                  <Input value={cpf} onChange={e => setCpf(e.target.value)} required placeholder="000.000.000-00" className="bg-background" />
                </div>
              </div>
            </form>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4">Forma de Pagamento</h3>
            <div className="flex gap-4 mb-6">
              <button 
                onClick={() => setMethod('pix')}
                className={`flex-1 py-4 px-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'pix' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-panel text-textSecondary hover:border-textSecondary'}`}
              >
                <QrCode className="w-6 h-6" />
                <span className="font-bold text-sm">PIX</span>
              </button>
              <button 
                onClick={() => setMethod('card')}
                className={`flex-1 py-4 px-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'card' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-panel text-textSecondary hover:border-textSecondary'}`}
              >
                <CreditCard className="w-6 h-6" />
                <span className="font-bold text-sm">Cartão de Crédito</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {method === 'pix' ? (
                <motion.div 
                  key="pix"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="bg-panel border border-border p-6 rounded-3xl text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-white">Pagamento via PIX</h4>
                  <p className="text-sm text-textSecondary max-w-sm mx-auto">Aprovação instantânea. Ao clicar em "Pagar Agora", geraremos um QR Code exclusivo para sua compra.</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="card"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="bg-panel border border-border p-6 rounded-3xl space-y-4"
                >
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Número do Cartão</label>
                    <Input placeholder="0000 0000 0000 0000" className="bg-background font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-white mb-2">Validade</label>
                      <Input placeholder="MM/AA" className="bg-background" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-white mb-2">CVC</label>
                      <Input placeholder="123" className="bg-background" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button 
            type="submit" 
            form="checkout-form"
            disabled={isProcessing}
            className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processando...</span>
            ) : (
              `Pagar ${formatCurrency(product.price)} Agora`
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-textSecondary font-medium">
            <Lock className="w-3 h-3" />
            Pagamento 100% seguro e criptografado
          </div>
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY */}
        <div className="md:col-span-5">
          <div className="bg-panel border border-border rounded-3xl p-6 sticky top-8">
            <h3 className="text-lg font-bold text-white mb-6">Resumo do Pedido</h3>
            
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-background rounded-xl border border-border flex items-center justify-center shrink-0">
                <CreditCard className="w-8 h-8 text-primary opacity-50" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg leading-tight mb-1">{product.name}</h4>
                <p className="text-sm text-textSecondary">{product.type === 'assinatura' ? 'Plano de Assinatura' : 'Acesso Vitalício'}</p>
              </div>
            </div>

            <div className="border-t border-border/50 pt-6 space-y-4">
              <div className="flex justify-between text-textSecondary text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(product.price)}</span>
              </div>
              <div className="flex justify-between text-textSecondary text-sm">
                <span>Taxas</span>
                <span className="text-success font-bold">Grátis</span>
              </div>
              <div className="border-t border-border/50 pt-4 flex justify-between items-center">
                <span className="font-bold text-white text-lg">Total</span>
                <span className="font-black text-primary text-2xl">{formatCurrency(product.price)}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50">
              <div className="flex items-center gap-3 text-sm text-textSecondary mb-2">
                <ShieldCheck className="w-5 h-5 text-success" />
                <span>Garantia incondicional de 7 dias</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-textSecondary">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span>Acesso imediato após aprovação</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
