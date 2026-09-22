const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

const oldHeader = `<div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Meus Produtos Monitorados</h3>`;

const newHeader = `<div className="bg-gradient-to-r from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
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
          <h3 className="text-xl font-bold text-white">Meus Produtos Monitorados</h3>`;

content = content.replace(oldHeader, newHeader);
fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
