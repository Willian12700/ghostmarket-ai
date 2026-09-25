const fs = require('fs');
let content = fs.readFileSync('src/pages/Finance.tsx', 'utf8');

// Replace "Solicitar Saque" button with "Sacar no Mercado Pago"
content = content.replace(
  `<Button className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] font-bold">
            <Building className="w-4 h-4 mr-2" /> Solicitar Saque
          </Button>`,
  `<Button className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] font-bold" onClick={() => window.open('https://www.mercadopago.com.br/', '_blank')}>
            <Building className="w-4 h-4 mr-2" /> Sacar no Mercado Pago
          </Button>`
);

// Add state for MP Connection
if (!content.includes('const [isMpConnected')) {
  content = content.replace(
    'const [isSaving, setIsSaving] = useState(false)', // wait, Finance.tsx doesn't have isSaving. Let's find a hook.
    `const [isSaving, setIsSaving] = useState(false)`
  );
}

fs.writeFileSync('src/pages/Finance.tsx', content, 'utf8');
