const fs = require('fs');

let prompt = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

const regex = /<CardContent>\s*<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">\s*\{Object\.keys\(formData\.features\)\.map\(\(feature\) => \{/

const newCode = `<CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.keys(formData.features).map((feature) => {
                    const featureLabels: Record<string, string> = {
                      auth: "Autenticação",
                      database: "Banco de Dados",
                      payments: "Pagamentos (Stripe)",
                      api: "API Externa",
                      dashboard: "Dashboard Administrativo",
                      ai: "Integração IA",
                      catalog: "Catálogo de Produtos (Fotos e Preços)",
                      pix: "Pagamento via PIX",
                      delivery: "Sistema de Delivery e Endereços"
                    };`;

if(prompt.includes('<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">')) {
  prompt = prompt.replace(regex, newCode);
  fs.writeFileSync('src/pages/PromptBuilder.tsx', prompt, 'utf8');
  console.log('Fixed featureLabels inside map');
} else {
  console.log('Did not find the grid');
}
