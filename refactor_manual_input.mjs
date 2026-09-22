import fs from 'fs';

let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

// 1. Adicionar import dos icones
if (!content.includes('Smartphone,')) {
    content = content.replace(/import { (.*?) } from 'lucide-react'/, "import { $1, Smartphone, Shirt, Home, Dumbbell, Package } from 'lucide-react'");
}

// 2. Refazer o handleSimulate pra ser burro e rapido
const oldHandleSimulate = content.match(/const handleSimulate = async \(\) => \{[\s\S]*?setPreviewProduct\(\{[\s\S]*?\}\)[\s\S]*?\}\n/)[0];

const newHandleSimulate = `const handleSimulate = async () => {
    if (!url) return
    setIsLoading(true)
    try {
      const isShopee = url.includes('shopee')
      if (!isShopee) {
        addToast('Por favor, insira um link válido da Shopee.', 'error')
        setIsLoading(false)
        return
      }

      let mlbId = ''
      const shopeeMatch = url.match(/i\\.(\\d+\\.\\d+)/)
      if (shopeeMatch) {
        mlbId = 'SHP' + shopeeMatch[1].replace('.', '')
      }

      setPreviewProduct({
        mlbId: mlbId || ('SHP-' + Math.floor(Math.random() * 1000000)),
        title: '',
        price: '',
        originalPrice: 0,
        image: 'tech',
        permalink: url,
        platform: 'Shopee'
      })
    } catch(e) {
      console.error(e)
    }
    setIsLoading(false)
  }\n`;

content = content.replace(oldHandleSimulate, newHandleSimulate);

// 3. Modificar o HTML do Preview Card
const oldPreviewHtml = content.match(/<div className="w-32 h-32 bg-white rounded-xl overflow-hidden shrink-0 border-2 border-primary\/20 p-2">[\s\S]*?<div className="flex items-end gap-2">/)[0];

const newPreviewHtml = `<div className="w-32 h-32 bg-background border-2 border-primary/20 rounded-xl overflow-hidden shrink-0 flex flex-col items-center justify-center p-2">
                  {previewProduct.image === 'tech' && <Smartphone className="w-12 h-12 text-primary mb-2" />}
                  {previewProduct.image === 'clothes' && <Shirt className="w-12 h-12 text-primary mb-2" />}
                  {previewProduct.image === 'home' && <Home className="w-12 h-12 text-primary mb-2" />}
                  {previewProduct.image === 'sports' && <Dumbbell className="w-12 h-12 text-primary mb-2" />}
                  {previewProduct.image === 'generic' && <Package className="w-12 h-12 text-primary mb-2" />}
                  <select 
                    value={previewProduct.image}
                    onChange={(e) => setPreviewProduct({...previewProduct, image: e.target.value})}
                    className="w-full text-xs bg-background/50 border border-primary/20 rounded p-1 text-white outline-none"
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
                    <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">{previewProduct.platform}</span>
                    <input 
                      type="text"
                      placeholder="Qual o nome deste produto?"
                      value={previewProduct.title}
                      onChange={(e) => setPreviewProduct({...previewProduct, title: e.target.value})}
                      className="w-full mt-2 bg-background/50 border border-primary/20 rounded-lg p-3 text-white text-lg font-bold placeholder:text-textSecondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-6">
                    <div className="flex-1 min-w-[150px]">
                      <p className="text-sm text-textSecondary mb-1">Preço Atual (R$)</p>
                      <input 
                        type="number"
                        placeholder="Ex: 99.90"
                        value={previewProduct.price}
                        onChange={(e) => setPreviewProduct({...previewProduct, price: e.target.value})}
                        className="w-full bg-background/50 border border-primary/20 rounded-lg p-3 text-white text-xl font-bold placeholder:text-textSecondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                    <div className="flex items-end gap-2">`;

content = content.replace(oldPreviewHtml, newPreviewHtml);

// 4. Update the handleStartTracking to convert price to number
content = content.replace(/price: previewProduct\.price,/, 'price: Number(previewProduct.price),');


// 5. Update Product List rendering for Icons
const oldListImg = `<img src={product.image} alt={product.title} className="w-full h-full object-contain" />`;
const newListImg = `{product.image === 'tech' ? <Smartphone className="w-8 h-8 text-primary" /> : 
                     product.image === 'clothes' ? <Shirt className="w-8 h-8 text-primary" /> : 
                     product.image === 'home' ? <Home className="w-8 h-8 text-primary" /> : 
                     product.image === 'sports' ? <Dumbbell className="w-8 h-8 text-primary" /> : 
                     product.image === 'generic' ? <Package className="w-8 h-8 text-primary" /> : 
                     <img src={product.image} alt={product.title} className="w-full h-full object-contain" />}`;
content = content.replace(oldListImg, newListImg);
content = content.replace(oldListImg, newListImg); // Replaces twice if there are multiple

fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
