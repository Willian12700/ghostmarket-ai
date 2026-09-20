const fs = require('fs');
let content = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

// Add state
const stateTarget = "const [copied, setCopied] = useState(false)";
if (!content.includes('const [services')) {
  const newStates = `const [copied, setCopied] = useState(false)
  const [services, setServices] = useState<{name: string, price: string}[]>([])
  const addService = () => setServices([...services, {name: '', price: ''}])
  const removeService = (index: number) => setServices(services.filter((_, i) => i !== index))
  const updateService = (index: number, field: 'name' | 'price', value: string) => {
    const newS = [...services];
    newS[index][field] = value;
    setServices(newS);
  }`;
  content = content.replace(stateTarget, newStates);
}

// Add imports
if (!content.includes('Trash2')) {
  content = content.replace(
    "import { Copy, Sparkles, Terminal, Code2, Rocket, Settings2, ShieldCheck, Zap } from 'lucide-react'",
    "import { Copy, Sparkles, Terminal, Code2, Rocket, Settings2, ShieldCheck, Zap, Plus, Trash2, Tag } from 'lucide-react'"
  );
}

// Add Prompt Inject
const promptTargetMatch = content.match(/.*Objetivo Principal.*formData\.description.*/);
if (promptTargetMatch && !content.includes('## 1.5. PRODUTOS')) {
  const replacement = `  - **Objetivo Principal**: \${formData.description || 'Desenvolver um SaaS/Site de alta performance e conversão.'}
  
  \${services.length > 0 && services.some(s => s.name) ? \`## 1.5. PRODUTOS / SERVIÇOS E PREÇOS OBRIGATÓRIOS
  O site DEVE listar os seguintes serviços/produtos com seus respectivos preços de forma atrativa:
  \${services.filter(s => s.name).map(s => \`- \${s.name}: \${s.price || 'A combinar'}\`).join('\\n  ')}\` : ''}`;
  content = content.replace(promptTargetMatch[0], replacement);
}

// Fix Button outline type to ghost
content = content.replace('variant="outline"', 'variant="ghost"');

fs.writeFileSync('src/pages/PromptBuilder.tsx', content);
