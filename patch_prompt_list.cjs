const fs = require('fs');

let prompt = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

const regex = /const activeFeatures = Object\.entries\(formData\.features\)[\s\S]*?\.join\(\', \'\)/;

const newCode = `const activeFeaturesMap: Record<string, string> = {
          auth: "Autenticação de Usuários (Login/Registro)",
          database: "Banco de Dados (CRUD e Armazenamento)",
          payments: "Integração de Pagamentos (Stripe/Cartão)",
          api: "Consumo de API Externa",
          dashboard: "Dashboard Administrativo/Gerencial",
          ai: "Integração com Inteligência Artificial",
          catalog: "Catálogo de Produtos (A interface deve permitir exibir Fotos, Nomes e Preços dinamicamente)",
          pix: "Checkout via PIX (Geração de QR Code ou chave copia e cola com aprovação)",
          delivery: "Sistema de Delivery (Formulário avançado para captação de Endereço de entrega)"
        };
        const activeFeatures = Object.entries(formData.features)
          .filter(([_, isActive]) => isActive)
          .map(([key]) => '- ' + (activeFeaturesMap[key] || key))
          .join('\\n  ')`;

prompt = prompt.replace(regex, newCode);

fs.writeFileSync('src/pages/PromptBuilder.tsx', prompt, 'utf8');
console.log("Fixed activeFeatures list formatting");
