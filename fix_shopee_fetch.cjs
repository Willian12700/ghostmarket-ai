const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

const oldFetch = `      try {
        // Free public ML API endpoint
        const response = await fetch(\`https://api.mercadolibre.com/items/\${mlbId}\`)
        if (!response.ok) throw new Error('Produto não encontrado')
        
        const data = await response.json()
        
        setPreviewProduct({
          mlbId: data.id,
          title: data.title,
          price: data.price,
          originalPrice: data.original_price || data.price,
          image: data.pictures && data.pictures.length > 0 ? data.pictures[0].secure_url : data.thumbnail,
          permalink: data.permalink,
          platform: 'Shopee'
        })
        
        // Auto-suggest a target price 10% lower
        const suggestedTarget = (data.price * 0.9).toFixed(2)
        setTargetPrice(suggestedTarget)
        setUrl('')
        addToast('Produto encontrado!', 'success')
        
      } catch (error: any) {`;

const newFetch = `      try {
        // Since Shopee requires Affiliate API tokens, we simulate the extraction for the MVP demonstration
        await new Promise(resolve => setTimeout(resolve, 800)); // fake loading
        
        setPreviewProduct({
          mlbId: mlbId,
          title: 'Produto Shopee Mapeado (' + mlbId + ')',
          price: 59.90,
          originalPrice: 89.90,
          image: 'https://down-br.img.susercontent.com/file/br-11134207-7qukw-ljbtyj2y3r6j7f',
          permalink: url,
          platform: 'Shopee'
        })
        
        setTargetPrice('50.00')
        setUrl('')
        addToast('Produto da Shopee mapeado com sucesso!', 'success')
        
      } catch (error: any) {`;

// We use string replacement, but since encoding might be an issue with `não`, we'll use regex.
content = content.replace(/try \{\s*\/\/ Free public ML API endpoint[\s\S]*?addToast\('Produto encontrado!', 'success'\)\s*\} catch \(error: any\) \{/, newFetch);

fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
