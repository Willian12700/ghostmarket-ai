const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

// 1. Imports
if (!content.includes('Smartphone,')) {
    content = content.replace(/import { (.*?) } from 'lucide-react'/, "import { $1, Smartphone, Shirt, Home, Dumbbell, Package } from 'lucide-react'");
}

// 2. handleSearch
const oldHandleSearch = content.match(/const handleSearch = async \(\) => \{[\s\S]*?setPreviewProduct\(\{[\s\S]*?\}\)[\s\S]*?setIsLoading\(false\)[\s\S]*?\}\n/)[0];

const newHandleSearch = `const handleSearch = async () => {
    if (!url) {
      addToast('Cole o link do produto primeiro.', 'error')
      return
    }

    const mlbId = extractMlbId(url)
    if (!mlbId) {
      addToast('Link Inválido: Insira um link válido da Shopee ' + url, 'error')
      return
    }

    if (products.some(p => p.mlbId === mlbId)) {
      addToast('Você já está monitorando este produto!', 'error')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setPreviewProduct({
        mlbId: mlbId || ('SHP-' + Math.floor(Math.random() * 1000000)),
        title: '',
        price: '',
        originalPrice: 0,
        image: 'tech',
        permalink: url,
        platform: 'Shopee'
      })
      setTargetPrice('')
      setIsLoading(false)
    }, 500)
  }
`;

content = content.replace(oldHandleSearch, newHandleSearch);

// 3. handleStartTracking
const oldHandleStartTracking = content.match(/const handleStartTracking = async \(\) => \{[\s\S]*?if \(!user \|\| !previewProduct\) return[\s\S]*?const numPrice = parseFloat\(targetPrice\)[\s\S]*?setIsLoading\(true\)/)[0];

const newHandleStartTracking = `const handleStartTracking = async () => {
    if (!user || !previewProduct) return
    const numPrice = parseFloat(targetPrice)
    const currentPrice = parseFloat(previewProduct.price)
    
    if (isNaN(numPrice) || numPrice <= 0) {
      addToast('Digite um preço alvo válido.', 'error')
      return
    }
    if (!previewProduct.title || previewProduct.title.trim() === '') {
      addToast('Digite o nome do produto.', 'error')
      return
    }
    if (isNaN(currentPrice) || currentPrice <= 0) {
      addToast('Digite o preço atual válido.', 'error')
      return
    }
    
    setIsLoading(true)`;

content = content.replace(oldHandleStartTracking, newHandleStartTracking);

// Update previewProduct.price -> currentPrice
content = content.replace(/...previewProduct,/, '...previewProduct, price: currentPrice,');

// 4. HTML Preview Card
const oldPreviewCardHtml = content.match(/<div className="w-32 h-32 bg-white rounded-lg p-2 flex-shrink-0 flex items-center justify-center">[\s\S]*?<div className="w-px h-12 bg-border\/50 hidden sm:block"><\/div>/)[0];

const newPreviewCardHtml = `<div className="w-32 h-32 bg-background border border-primary/20 rounded-lg p-2 flex-shrink-0 flex flex-col items-center justify-center gap-2">
                {previewProduct.image === 'tech' && <Smartphone className="w-10 h-10 text-primary" />}
                {previewProduct.image === 'clothes' && <Shirt className="w-10 h-10 text-primary" />}
                {previewProduct.image === 'home' && <Home className="w-10 h-10 text-primary" />}
                {previewProduct.image === 'sports' && <Dumbbell className="w-10 h-10 text-primary" />}
                {previewProduct.image === 'generic' && <Package className="w-10 h-10 text-primary" />}
                <select 
                  value={previewProduct.image}
                  onChange={(e) => setPreviewProduct({...previewProduct, image: e.target.value})}
                  className="w-full text-xs bg-panel border border-border rounded p-1 text-white outline-none"
                >
                  <option value="tech">Tecnologia</option>
                  <option value="clothes">Roupa/Moda</option>
                  <option value="home">Casa</option>
                  <option value="sports">Esportes</option>
                  <option value="generic">Outros</option>
                </select>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <div className="text-xs font-bold text-orange-500 mb-1 tracking-wider uppercase">{previewProduct.platform}</div>
                  <input 
                    type="text"
                    placeholder="Nome do Produto..."
                    value={previewProduct.title}
                    onChange={(e) => setPreviewProduct({...previewProduct, title: e.target.value})}
                    className="w-full bg-background border border-border rounded p-2 text-white font-medium outline-none focus:border-primary"
                  />
                </div>
                
                <div className="flex gap-4 items-end">
                  <div className="w-1/3">
                    <span className="text-sm text-textSecondary block mb-1">Preço Atual</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary font-medium">R$</span>
                      <Input 
                        type="number"
                        placeholder="0.00"
                        value={previewProduct.price}
                        onChange={(e) => setPreviewProduct({...previewProduct, price: e.target.value})}
                        className="pl-9 h-11 border-border bg-background"
                      />
                    </div>
                  </div>
                  
                  <div className="w-px h-12 bg-border/50 hidden sm:block"></div>`;

content = content.replace(oldPreviewCardHtml, newPreviewCardHtml);


// 5. HTML List Card Image
const oldListImg = `<img src={product.image} alt="" className="max-w-full max-h-full object-contain" />`;
const newListImg = `{product.image === 'tech' ? <Smartphone className="w-8 h-8 text-primary" /> : 
                     product.image === 'clothes' ? <Shirt className="w-8 h-8 text-primary" /> : 
                     product.image === 'home' ? <Home className="w-8 h-8 text-primary" /> : 
                     product.image === 'sports' ? <Dumbbell className="w-8 h-8 text-primary" /> : 
                     product.image === 'generic' ? <Package className="w-8 h-8 text-primary" /> : 
                     <img src={product.image} alt="" className="max-w-full max-h-full object-contain" />}`;
content = content.replace(oldListImg, newListImg);

fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
