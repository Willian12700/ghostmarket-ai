const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

// We need to import Topbar requirements or just use db.
// We already have addDoc, collection, serverTimestamp in this file.

const oldHeader = `<h3 className="text-xl font-bold text-white mb-6">Meus Produtos Monitorados</h3>`;

const newHeader = `<div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Meus Produtos Monitorados</h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-primary/50 text-primary hover:bg-primary/10"
            onClick={async () => {
              if (products.length === 0) {
                addToast('Adicione pelo menos um produto primeiro!', 'error');
                return;
              }
              const p = products[0];
              const newPrice = Number(p.targetPrice) - 5.00; // Force it to hit the target
              
              // Create notification in DB
              await addDoc(collection(db, 'notifications'), {
                userId: user?.uid,
                title: '🤑 Alerta de Preço Atingido!',
                text: \`O produto "\${p.title}" caiu para R$ \${newPrice.toFixed(2)} e atingiu sua meta!\`,
                unread: true,
                createdAt: serverTimestamp(),
                link: p.permalink
              });
              
              addToast('Motor de varredura executado! Verifique suas notificações (Sininho)', 'success');
              
              // Simulate Email
              console.log('--- ENVIANDO E-MAIL ---');
              console.log(\`Para: \${user?.email}\`);
              console.log('Assunto: Preço Caiu! ' + p.title);
              console.log(\`O preço caiu para \${newPrice.toFixed(2)}!\`);
            }}
          >
            <Bell className="w-4 h-4 mr-2" />
            Simular Robô (Cron Job)
          </Button>
        </div>`;

content = content.replace(oldHeader, newHeader);

fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
console.log('Added Engine Simulation Button');
