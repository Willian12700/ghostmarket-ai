const fs = require('fs');

let prompt = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

const regex = /const generatePrompt = \(\) => \{[\s\S]*?const finalSystemType = /;

const cleanCode = `const generatePrompt = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const activeFeaturesMap: Record<string, string> = {
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
        .join('\\n  ')

      const isHtmlMode = formData.tech === 'HTML + CSS + JS'
      
      const finalSystemType = `;

prompt = prompt.replace(regex, cleanCode);

// Also remove the extra featureLabels that was injected near the bottom inside the map render
// It looks like: const featureLabels: Record<string, string> = { ... }
// Let's find it where it is right above `return (` inside `Object.keys(formData.features).map((feature) => {`

const renderRegex = /\{Object\.keys\(formData\.features\)\.map\(\(feature\) => \{[\s\S]*?const featureLabels: Record<string, string> = \{[\s\S]*?\};\s*const isHtmlMode = formData\.tech === 'HTML \+ CSS \+ JS'/;

const cleanRender = `{Object.keys(formData.features).map((feature) => {
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
                  };
                  const isHtmlMode = formData.tech === 'HTML + CSS + JS'`;

prompt = prompt.replace(renderRegex, cleanRender);

// Another fix for encodings again just in case
prompt = prompt.replace(/Autentica[^\x00-\x7F]+o/g, 'Autenticação');
prompt = prompt.replace(/Gera[^\x00-\x7F]+o/g, 'Geração');
prompt = prompt.replace(/aprova[^\x00-\x7F]+o/g, 'aprovação');
prompt = prompt.replace(/Formul[^\x00-\x7F]+rio/g, 'Formulário');
prompt = prompt.replace(/avan[^\x00-\x7F]+ado/g, 'avançado');
prompt = prompt.replace(/capta[^\x00-\x7F]+o/g, 'captação');

fs.writeFileSync('src/pages/PromptBuilder.tsx', prompt, 'utf8');
console.log('Fixed generatePrompt mess');
