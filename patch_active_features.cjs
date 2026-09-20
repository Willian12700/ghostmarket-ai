const fs = require('fs');

let prompt = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

const regex = /const activeFeatures = Object\.entries\(formData\.features\)[\s\S]*?\.join\(\', \'\)/;

const newCode = `const activeFeaturesMap: Record<string, string> = {
          auth: "Autenticação",
          database: "Banco de Dados",
          payments: "Pagamentos (Stripe)",
          api: "API Externa",
          dashboard: "Dashboard Administrativo",
          ai: "Integração IA",
          catalog: "Catálogo de Produtos (Fotos e Preços)",
          pix: "Pagamento via PIX",
          delivery: "Sistema de Delivery e Endereços"
        };
        const activeFeatures = Object.entries(formData.features)
          .filter(([_, isActive]) => isActive)
          .map(([key]) => activeFeaturesMap[key] || key)
          .join(', ')`;

prompt = prompt.replace(regex, newCode);

fs.writeFileSync('src/pages/PromptBuilder.tsx', prompt, 'utf8');
console.log("Fixed activeFeatures");
