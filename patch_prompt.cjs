const fs = require('fs');
let content = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

// 1. Add services state
content = content.replace(
  "const [copied, setCopied] = useState(false)",
  "const [copied, setCopied] = useState(false)\n  const [services, setServices] = useState<{name: string, price: string}[]>([])\n  const addService = () => setServices([...services, {name: '', price: ''}])\n  const removeService = (index: number) => setServices(services.filter((_, i) => i !== index))\n  const updateService = (index: number, field: 'name' | 'price', value: string) => {\n    const newS = [...services];\n    newS[index][field] = value;\n    setServices(newS);\n  }"
);

// 2. Add icons to import
content = content.replace(
  "import { Copy, Sparkles, Terminal, Code2, Rocket, Settings2, ShieldCheck, Zap } from 'lucide-react'",
  "import { Copy, Sparkles, Terminal, Code2, Rocket, Settings2, ShieldCheck, Zap, Plus, Trash2, Tag } from 'lucide-react'"
);

// 3. Inject into prompt
const pTarget = "- **Objetivo Principal**: ${formData.description || 'Desenvolver um SaaS/Site de alta performance e converso.'}";
// Dealing with encoding issues, we use a regex matching start of line
content = content.replace(
  /.*Objetivo Principal.*formData\.description.*/,
  `  - **Objetivo Principal**: \${formData.description || 'Desenvolver um SaaS/Site de alta performance e conversão.'}
  
  \${services.length > 0 && services.some(s => s.name) ? \`## 1.5. PRODUTOS / SERVIÇOS E PREÇOS OBRIGATÓRIOS
  O site DEVE listar os seguintes serviços/produtos com seus respectivos preços de forma atrativa:
  \${services.filter(s => s.name).map(s => \`- \${s.name}: \${s.price || 'A combinar'}\`).join('\\n  ')}\` : ''}`
);

// 4. Inject UI
// We need to insert a new Card right after the "Descrição do Projeto" div.
// Let's find: `</CardContent>\n            </Card>` that follows textarea
const targetJSX = `                  />
                </div>
              </CardContent>
            </Card>`;

const newUI = `                  />
                </div>
              </CardContent>
            </Card>

            {/* SEÇÃO DE PRODUTOS E SERVIÇOS */}
            <Card>
              <CardHeader className="pb-3 border-b border-border mb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  Serviços e Preços (Opcional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-textSecondary mb-2">
                  Adicione os produtos ou serviços que você quer que a IA inclua na página com seus respectivos valores. Ex: "Corte de Cabelo" - "R$ 35".
                </p>
                {services.map((svc, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input 
                      placeholder="Nome do Produto/Serviço" 
                      value={svc.name} 
                      onChange={(e) => updateService(idx, 'name', e.target.value)} 
                      className="flex-1"
                    />
                    <Input 
                      placeholder="Preço (ex: R$ 35)" 
                      value={svc.price} 
                      onChange={(e) => updateService(idx, 'price', e.target.value)} 
                      className="w-32"
                    />
                    <Button 
                      variant="ghost" 
                      onClick={() => removeService(idx)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 px-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  onClick={addService} 
                  className="w-full border-dashed border-border hover:border-primary text-textSecondary hover:text-primary mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Produto / Serviço
                </Button>
              </CardContent>
            </Card>`;

content = content.replace(targetJSX, newUI);

fs.writeFileSync('src/pages/PromptBuilder.tsx', content);
