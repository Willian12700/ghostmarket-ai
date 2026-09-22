const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

const oldMock = `        setPreviewProduct({
          mlbId: mlbId,
          title: 'Produto Shopee Mapeado (' + mlbId + ')',
          price: 59.90,
          originalPrice: 89.90,
          image: 'https://down-br.img.susercontent.com/file/br-11134207-7qukw-ljbtyj2y3r6j7f',
          permalink: url,
          platform: 'Shopee'
        })`;

const newMock = `        setPreviewProduct({
          mlbId: mlbId || ('SHP-' + Math.floor(Math.random() * 1000000)),
          title: 'Produto Shopee em Monitoramento Fantasma',
          price: 99.90,
          originalPrice: 149.90,
          image: 'https://cf.shopee.com.br/file/b9195b0583bafefcf5ab2292eb63c0b3',
          permalink: url,
          platform: 'Shopee'
        })`;

content = content.replace(oldMock, newMock);
fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
