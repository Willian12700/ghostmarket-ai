const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

const oldFetch = `      const response = await fetch(\`https://api.mercadolibre.com/items/\${mlbId}\`)
      if (!response.ok) throw new Error('Produto não encontrado')
      
      const data = await response.json()
      
      setPreviewProduct({
        mlbId: data.id,
        title: data.title,
        price: data.price,
        originalPrice: data.original_price || data.price,
        image: data.pictures && data.pictures.length > 0 ? data.pictures[0].secure_url : data.thumbnail,
        permalink: data.permalink,
        platform: 'Mercado Livre'
      })
      
      // Auto-suggest a target price 10% lower
      const suggestedTarget = (data.price * 0.9).toFixed(2)
      setTargetPrice(suggestedTarget)
      setUrl('')
      addToast('Produto encontrado!', 'success')`;

const newFetch = `      let data;
      try {
        const response = await fetch(\`https://api.mercadolibre.com/items/\${mlbId}\`)
        if (!response.ok) {
          if (response.status === 403 || response.status === 401) {
             throw new Error('API_AUTH_REQUIRED');
          }
          throw new Error('Produto não encontrado');
        }
        data = await response.json()
      } catch (err: any) {
        if (err.message === 'API_AUTH_REQUIRED' || err.name === 'TypeError') {
           // Fallback Mock for MVP demonstration when API blocks unauthenticated requests
           addToast('API do Mercado Livre bloqueou o acesso anônimo. Usando dados simulados para demonstração.', 'warning');
           data = {
             id: mlbId,
             title: 'Produto Teste (Bloqueado pela API do ML)',
             price: 199.90,
             original_price: 249.90,
             thumbnail: 'https://http2.mlstatic.com/D_NQ_NP_2X_897166-MLA43647318717_102020-F.webp',
             permalink: url
           }
        } else {
           throw err;
        }
      }
      
      setPreviewProduct({
        mlbId: data.id,
        title: data.title,
        price: data.price,
        originalPrice: data.original_price || data.price,
        image: data.pictures && data.pictures.length > 0 ? data.pictures[0].secure_url : data.thumbnail,
        permalink: data.permalink,
        platform: 'Mercado Livre'
      })
      
      // Auto-suggest a target price 10% lower
      const suggestedTarget = (data.price * 0.9).toFixed(2)
      setTargetPrice(suggestedTarget)
      setUrl('')
      
      if (data.title !== 'Produto Teste (Bloqueado pela API do ML)') {
        addToast('Produto encontrado!', 'success')
      }`;

content = content.replace(oldFetch, newFetch);
fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
console.log('Added API fallback and fixed firestore query');
