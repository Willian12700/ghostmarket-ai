import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Search, TrendingDown, ExternalLink, Trash2, Bell } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'
import { useAuthStore } from '@/store/authStore'
import { db } from '@/config/firebase'
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'

interface TrackedProduct {
  id?: string;
  mlbId: string;
  title: string;
  price: number;
  originalPrice: number | null;
  targetPrice: number;
  image: string;
  permalink: string;
  platform: 'Shopee';
  createdAt: any;
  lastCheckedAt: any;
}

export const OfferIntelligence = () => {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<TrackedProduct[]>([])
  
  // State for previewing a product before adding
  const [previewProduct, setPreviewProduct] = useState<any>(null)
  const [targetPrice, setTargetPrice] = useState<string>('')

  useEffect(() => {
    if (user) {
      loadTrackedProducts()
    }
  }, [user])

  const loadTrackedProducts = async () => {
    if (!user) return
    try {
      const q = query(
        collection(db, 'offer_tracking'),
        where('userId', '==', user.uid)
      )
      const snapshot = await getDocs(q)
      let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TrackedProduct[]
      items.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis())
      setProducts(items)
    } catch (error) {
      console.error('Error loading products', error)
      addToast('Erro ao carregar os produtos monitorados.', 'error')
    }
  }

  const extractMlbId = (link: string) => {
    // Extract Shopee ID (e.g. i.12345.67890)
    const match = link.match(/i\.(\d+\.\d+)/i);
    if (match) return `SHP-${match[1]}`;
    
    // For shortlinks or generic cases, just create a mock hash
    if (link.includes('shopee') || link.includes('shp.ee')) {
      return 'SHP-' + Math.floor(Math.random() * 1000000);
    }
    return null;
  }

  const handleSearch = async () => {
    if (!url) {
      addToast('Cole o link do produto primeiro.', 'error')
      return
    }

    const mlbId = extractMlbId(url)
    if (!mlbId) {
      addToast('Link Inválido: Insira um link válido da Shopee ' + url, 'error')
      return
    }

    // Check if already tracking
    if (products.some(p => p.mlbId === mlbId)) {
      addToast('Você já está monitorando este produto!', 'error')
      return
    }

    setIsLoading(true)
          try {
        // Since Shopee requires Affiliate API tokens, we simulate the extraction for the MVP demonstration
                  // Tenta comunicar com a Extensao
          let title = 'Carregando dados da Shopee...';
          let price = 0;
          let originalPrice = 0;
          let image = 'https://cf.shopee.com.br/file/b9195b0583bafefcf5ab2292eb63c0b3'; // Fallback
          
          try {
            window.dispatchEvent(new CustomEvent('GHOST_SCRAPE_REQUEST', { detail: { url: url } }));
            
            const scrapeData = await new Promise((resolve) => {
              const timeout = setTimeout(() => resolve({ success: false, reason: 'timeout' }), 8000);
              const listener = (event) => {
                clearTimeout(timeout);
                window.removeEventListener('GHOST_SCRAPE_RESPONSE', listener);
                resolve(event.detail);
              };
              window.addEventListener('GHOST_SCRAPE_RESPONSE', listener);
            });
            
            if (scrapeData && scrapeData.success) {
              title = scrapeData.title || title;
              price = scrapeData.price || price;
              originalPrice = price > 0 ? price * 1.3 : 0;
              image = scrapeData.image || image;
            } else {
              title = scrapeData?.reason === 'timeout' ? 'ERRO: Extensão não respondeu (Timeout)' : 'ERRO: Aba abriu mas falhou ao extrair';
              price = 99.90;
              originalPrice = 149.90;
            }
          } catch(e) {
             console.error(e);
             title = 'ERRO GERAL';
             price = 99.90;
          }

          setPreviewProduct({
            mlbId: mlbId || ('SHP-' + Math.floor(Math.random() * 1000000)),
            title: title,
            price: price,
            originalPrice: originalPrice,
            image: image,
            permalink: url,
            platform: 'Shopee'
          })
        
        setTargetPrice('50.00')
        setUrl('')
        addToast('Produto da Shopee mapeado com sucesso!', 'success')
        
      } catch (error: any) {
      console.error(error)
      addToast('ERRO CRÍTICO: ' + (error?.message || String(error)), 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartTracking = async () => {
    if (!user || !previewProduct) return
    const numPrice = parseFloat(targetPrice)
    if (isNaN(numPrice) || numPrice <= 0) {
      addToast('Digite um preço alvo válido.', 'error')
      return
    }
    
    setIsLoading(true)
    try {
      const newDoc = {
        userId: user.uid,
        ...previewProduct,
        targetPrice: numPrice,
        createdAt: serverTimestamp(),
        lastCheckedAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'offer_tracking'), newDoc)
      
      setProducts([{ ...newDoc, id: docRef.id } as TrackedProduct, ...products])
      setPreviewProduct(null)
      setTargetPrice('')
      addToast('Monitoramento ativado com sucesso!', 'success')
    } catch (error) {
      console.error(error)
      addToast('Erro ao salvar no banco de dados.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm('Deseja parar de monitorar este produto?')) return
    try {
      await deleteDoc(doc(db, 'offer_tracking', id))
      setProducts(products.filter(p => p.id !== id))
      addToast('Produto removido.', 'success')
    } catch (error) {
      console.error(error)
      addToast('Erro ao remover produto.', 'error')
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Inteligência de Ofertas
          </h2>
          <p className="text-textSecondary mt-2">
            Adicione produtos do Shopee. Nosso assistente vai monitorar e avisar quando o preço cair.
          </p>
        </div>
      </div>

      {/* Busca de Produto */}
      <Card className="border-border/50 bg-panel/50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 relative z-10">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-textSecondary" />
              </div>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Cole o link do produto aqui (Ex: https://shopee.com.br/...)"
                className="pl-10 h-12 bg-background/50 border-border/50"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              className="h-12 px-8 font-bold" 
              onClick={handleSearch}
              disabled={isLoading || !url}
            >
              {isLoading && !previewProduct ? 'Buscando...' : 'Encontrar Oferta'}
            </Button>
            
          </div>
        </CardContent>
      </Card>

      {/* Preview de Produto Encontrado */}
      {previewProduct && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg text-primary flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Configurar Alerta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-32 h-32 bg-white rounded-lg p-2 flex-shrink-0 flex items-center justify-center">
                <img src={previewProduct.image} alt="Product" className="max-w-full max-h-full object-contain" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <div className="text-xs font-bold text-orange-500 mb-1 tracking-wider uppercase">{previewProduct.platform}</div>
                  <h3 className="text-lg font-medium text-white line-clamp-2">{previewProduct.title}</h3>
                </div>
                
                <div className="flex gap-6 items-center">
                  <div>
                    <span className="text-sm text-textSecondary block">Preço Atual</span>
                    <span className="text-2xl font-bold text-white">{formatPrice(previewProduct.price)}</span>
                  </div>
                  
                  <div className="w-px h-12 bg-border/50 hidden sm:block"></div>
                  
                  <div className="flex-1 max-w-xs">
                    <label className="text-sm font-medium text-primary block mb-1">Avisar quando chegar em:</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary font-medium">R$</span>
                      <Input 
                        type="number"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        className="pl-9 h-11 border-primary/30 bg-background"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={handleStartTracking} disabled={isLoading} className="font-bold shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                    {isLoading ? 'Salvando...' : 'Ativar Monitoramento'}
                  </Button>
                  <Button variant="ghost" onClick={() => setPreviewProduct(null)}>Cancelar</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Monitoramento */}
      <div>
        <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <h4 className="text-orange-500 font-bold mb-1 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Potencialize seu Rastreamento
            </h4>
            <p className="text-sm text-textSecondary">Instale nossa extensão oficial para o Google Chrome e garanta que o robô monitore os preços sem interrupções em tempo real.</p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white border-none shrink-0" onClick={() => addToast('Em breve na Chrome Web Store!', 'info')}>
            Baixar Extensão
          </Button>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Meus Produtos Monitorados</h3>
          
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-16 bg-panel/30 border border-border/30 rounded-2xl">
            <TrendingDown className="w-12 h-12 text-textSecondary mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-medium text-white mb-2">Nenhum produto sendo monitorado</h4>
            <p className="text-textSecondary max-w-md mx-auto">
              Cole o link de um produto do Shopee acima para a inteligência artificial começar a rastrear o preço para você.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => {
              const discount = product.originalPrice && product.originalPrice > product.price 
                ? Math.round((1 - product.price / product.originalPrice) * 100) 
                : 0;

              return (
                <Card key={product.id} className="border-border/50 bg-panel/50 flex flex-col hover:border-border transition-colors">
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex gap-4 mb-4">
                      <div className="w-20 h-20 bg-white rounded-lg p-1.5 flex-shrink-0 flex items-center justify-center">
                        <img src={product.image} alt="" className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">{product.platform}</span>
                          {discount > 0 && (
                            <span className="text-[10px] font-bold bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                              -{discount}% OFF
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-medium text-white line-clamp-2 leading-snug" title={product.title}>
                          {product.title}
                        </h4>
                      </div>
                    </div>

                    <div className="mt-auto space-y-4">
                      <div className="grid grid-cols-2 gap-3 bg-background/50 rounded-lg p-3 border border-border/30">
                        <div>
                          <span className="text-xs text-textSecondary block mb-0.5">Preço Atual</span>
                          <span className="text-lg font-bold text-white leading-none">{formatPrice(product.price)}</span>
                        </div>
                        <div>
                          <span className="text-xs text-textSecondary block mb-0.5">Preço Alvo</span>
                          <span className="text-lg font-bold text-primary leading-none">{formatPrice(product.targetPrice)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/30">
                        <div className="flex items-center gap-1.5 text-xs text-textSecondary">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          Monitorando
                        </div>
                        <div className="flex gap-2">
                          <a href={product.permalink} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver Produto">
                              <ExternalLink className="w-4 h-4 text-textSecondary" />
                            </Button>
                          </a>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-400" onClick={() => product.id && handleRemove(product.id)} title="Remover">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
