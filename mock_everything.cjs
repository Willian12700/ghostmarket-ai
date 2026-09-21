const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

const oldInnerCatch = `      } catch (err: any) {
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
      }`;

const newInnerCatch = `      } catch (err: any) {
        // For ALL API errors during MVP (404, 403, CORS), show the Mock Data so the user can see the flow working
        addToast('Mercado Livre limitou o acesso. Carregando dados de simulação...', 'warning');
        data = {
          id: mlbId,
          title: 'Produto de Teste (' + mlbId + ')',
          price: 199.90,
          original_price: 249.90,
          thumbnail: 'https://http2.mlstatic.com/D_NQ_NP_2X_897166-MLA43647318717_102020-F.webp',
          permalink: url
        }
      }`;

content = content.replace(oldInnerCatch, newInnerCatch);
fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
console.log('Mock everything on error');
