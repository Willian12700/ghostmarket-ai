import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Plus, Link2, Trash2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { db } from '@/config/firebase'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'

type Product = {
  id: string;
  name: string;
  price: number;
  type: 'unico' | 'assinatura';
  successUrl: string;
  createdAt: any;
}

export const Products = () => {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [type, setType] = useState<'unico' | 'assinatura'>('unico')
  const [successUrl, setSuccessUrl] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [user])

  const fetchProducts = async () => {
    if (!user?.uid) return
    try {
      const q = query(collection(db, 'products'), where('userId', '==', user.uid))
      const snap = await getDocs(q)
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product))
      setProducts(data)
    } catch (e) {
      console.error(e)
      addToast('Erro ao carregar produtos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price || !successUrl) return
    if (!user?.uid) return

    setIsSaving(true)
    try {
      const newProduct = {
        userId: user.uid,
        name,
        price: parseFloat(price.replace(',', '.')),
        type,
        successUrl,
        createdAt: serverTimestamp()
      }
      await addDoc(collection(db, 'products'), newProduct)
      
      addToast('Produto criado com sucesso!', 'success')
      setIsModalOpen(false)
      setName('')
      setPrice('')
      setSuccessUrl('')
      fetchProducts()
    } catch (e) {
      console.error(e)
      addToast('Erro ao criar produto', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja apagar este produto? Os links de checkout pararão de funcionar.')) return
    try {
      await deleteDoc(doc(db, 'products', id))
      setProducts(products.filter(p => p.id !== id))
      addToast('Produto apagado', 'success')
    } catch (e) {
      console.error(e)
      addToast('Erro ao apagar produto', 'error')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const getCheckoutUrl = (id: string) => {
    return `${window.location.origin}/pay/${id}`
  }

  return (
    <div className="max-w-[1400px] w-full mx-auto space-y-8">
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Meus Produtos</h1>
          <p className="text-textSecondary">Crie produtos, defina preços e gere links de checkout para vender.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] font-bold">
          <Plus className="w-4 h-4 mr-2" /> Criar Produto
        </Button>
      </motion.div>

      {/* PRODUCTS LIST */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-panel border border-border rounded-3xl p-12 text-center flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Nenhum produto cadastrado</h3>
          <p className="text-textSecondary max-w-md mx-auto mb-8">Você ainda não tem produtos. Cadastre o seu primeiro produto para gerar um link de pagamento e começar a faturar.</p>
          <Button onClick={() => setIsModalOpen(true)}>Criar meu primeiro produto</Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {products.map((product) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-panel border border-border rounded-2xl p-6 relative group hover:border-primary/50 transition-colors"
              >
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => handleDelete(product.id)} className="p-2 bg-background border border-border rounded-lg text-textSecondary hover:text-danger hover:border-danger transition-colors" title="Apagar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1 truncate pr-12">{product.name}</h3>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl font-black text-success">{formatCurrency(product.price)}</span>
                  <span className="text-xs font-bold px-2 py-1 bg-background rounded-md text-textSecondary uppercase tracking-widest border border-border">
                    {product.type}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-textSecondary">LINK DE CHECKOUT</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-white truncate font-mono">
                        {getCheckoutUrl(product.id)}
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(getCheckoutUrl(product.id));
                          addToast('Link copiado!', 'success');
                        }}
                        className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors shrink-0"
                        title="Copiar Link"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-panel border border-border rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Tag className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Novo Produto</h2>
              <p className="text-textSecondary mb-8 text-sm">Preencha os dados básicos para gerar seu link de checkout e começar a vender.</p>

              <form onSubmit={handleCreateProduct} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Nome do Produto</label>
                  <Input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Ex: E-book Método Seca Barriga" 
                    required 
                    className="bg-background"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Preço (R$)</label>
                    <Input 
                      value={price} 
                      onChange={e => setPrice(e.target.value)} 
                      placeholder="97,00" 
                      required 
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Cobrança</label>
                    <select 
                      value={type} 
                      onChange={e => setType(e.target.value as 'unico' | 'assinatura')}
                      className="w-full h-12 px-4 rounded-xl bg-background border border-border text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    >
                      <option value="unico">Pagamento Único</option>
                      <option value="assinatura">Assinatura</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">URL de Sucesso (Pós-venda)</label>
                  <p className="text-xs text-textSecondary mb-2">Para onde o cliente vai após o pagamento ser aprovado?</p>
                  <Input 
                    type="url"
                    value={successUrl} 
                    onChange={e => setSuccessUrl(e.target.value)} 
                    placeholder="https://seu-site.com/obrigado" 
                    required 
                    className="bg-background"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSaving} className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold">
                    {isSaving ? 'Salvando...' : 'Criar Produto'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
