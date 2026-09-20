const fs = require('fs');
let prompt = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

// 1. Add new features to state
const targetState = `features: {
        auth: true,
        database: true,
        payments: false,
        api: true,
        dashboard: true,
        ai: false
      }`;
const newFeatures = `features: {
        auth: true,
        database: true,
        payments: false,
        api: true,
        dashboard: true,
        ai: false,
        catalog: false,
        pix: false,
        delivery: false
      }`;
prompt = prompt.replace(targetState, newFeatures);

// 2. Add label mapping
const targetMapStr = `const isHtmlMode = formData.tech === 'HTML + CSS + JS'`;
const labelMapStr = `const featureLabels: Record<string, string> = {
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
                    const isHtmlMode = formData.tech === 'HTML + CSS + JS'`;
prompt = prompt.replace(targetMapStr, labelMapStr);

// 3. Render map label instead of replace
const renderLabel = `{feature.replace(/([A-Z])/g, ' $1').trim()}`;
const newRenderLabel = `{featureLabels[feature] || feature}`;
prompt = prompt.replace(renderLabel, newRenderLabel);
// Remove capitalize class
prompt = prompt.replace('text-sm capitalize', 'text-sm');

// 4. Update the generated prompt so it mentions the new features
// The prompt uses `activeFeatures` which is just `key, key2`.
// Instead of that, let's map it to labels in `activeFeatures`
const activeFeatTarget = `const activeFeatures = Object.entries(formData.features)
          .filter(([_, isActive]) => isActive)
          .map(([key]) => key)
          .join(', ')`;

const activeFeatNew = `const featureLabels: Record<string, string> = {
          auth: "Autenticação",
          database: "Banco de Dados",
          payments: "Pagamentos (Stripe)",
          api: "API Externa",
          dashboard: "Dashboard Administrativo",
          ai: "Integração IA",
          catalog: "Catálogo de Produtos (Fotos e Preços)",
          pix: "Pagamento via PIX Automático",
          delivery: "Sistema de Delivery e Captação de Endereço"
        };
        const activeFeatures = Object.entries(formData.features)
          .filter(([_, isActive]) => isActive)
          .map(([key]) => featureLabels[key] || key)
          .join(', ')`;
prompt = prompt.replace(activeFeatTarget, activeFeatNew);


fs.writeFileSync('src/pages/PromptBuilder.tsx', prompt, 'utf8');
console.log("Patched PromptBuilder for catalog/pix/delivery features!");
