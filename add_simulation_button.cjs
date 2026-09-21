const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

const oldButton = `<Button 
              className="h-12 px-8 font-bold" 
              onClick={handleSearch}
              disabled={isLoading || !url}
            >
              {isLoading && !previewProduct ? 'Buscando...' : 'Encontrar Oferta'}
            </Button>`;

const newButton = `<Button 
              className="h-12 px-8 font-bold" 
              onClick={handleSearch}
              disabled={isLoading || !url}
            >
              {isLoading && !previewProduct ? 'Buscando...' : 'Encontrar Oferta'}
            </Button>
            <Button 
              variant="outline"
              className="h-12 px-6 font-bold border-dashed border-primary/50 text-primary hover:bg-primary/10" 
              onClick={() => {
                const randomId = Math.floor(Math.random() * 1000000000);
                setPreviewProduct({
                  mlbId: 'MLB' + randomId,
                  title: 'Apple AirPods Pro (2ª Geração) - Simulação',
                  price: 1899.00,
                  originalPrice: 2599.00,
                  image: 'https://http2.mlstatic.com/D_NQ_NP_2X_910793-MLA51475711656_092022-F.webp',
                  permalink: 'https://www.mercadolivre.com.br/p/MLB19941168',
                  platform: 'Mercado Livre'
                });
                setTargetPrice('1700.00');
                setUrl('');
                addToast('Produto de teste gerado com sucesso!', 'success');
              }}
            >
              Simular Produto
            </Button>`;

content = content.replace(oldButton, newButton);
fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
console.log('Added simulation button');
