const fs = require('fs');

let file = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

// 1. Add Firebase Storage imports if needed
if (!file.includes("firebase/storage")) {
  file = file.replace(
    "import { db } from '@/config/firebase'",
    "import { db, storage } from '@/config/firebase'\nimport { ref, uploadBytes, getDownloadURL } from 'firebase/storage'"
  );
}

// 2. Update services state
file = file.replace(
  "const [services, setServices] = useState<{name: string, price: string}[]>([])",
  "const [services, setServices] = useState<{name: string, price: string, imageUrl?: string, uploading?: boolean}[]>([])"
);
file = file.replace(
  "const addService = () => setServices([...services, {name: '', price: ''}])",
  "const addService = () => setServices([...services, {name: '', price: '', imageUrl: '', uploading: false}])"
);
file = file.replace(
  "const updateService = (index: number, field: 'name' | 'price', value: string) => {",
  "const updateService = (index: number, field: 'name' | 'price' | 'imageUrl' | 'uploading', value: any) => {"
);

// 3. Add handleImageUpload
const imageUploadFn = `
  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      updateService(index, 'uploading', true);
      const storageRef = ref(storage, \`products/\${Date.now()}_\${file.name}\`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      updateService(index, 'imageUrl', url);
    } catch (error) {
      console.error('Erro no upload da imagem', error);
      alert('Erro ao fazer upload da imagem.');
    } finally {
      updateService(index, 'uploading', false);
    }
  };
`;

// Insert the function after updateService
file = file.replace(
  "setServices(newS);\n    }",
  `setServices(newS);\n    }\n${imageUploadFn}`
);

// 4. Update the Prompt generation
const oldPromptStr = `\${services.filter(s => s.name).map(s => \`- \${s.name}: \${s.price || 'A combinar'}\`).join('\\n  ')}`;
const newPromptStr = `\${services.filter(s => s.name).map(s => \`- Produto: \${s.name} | Preço: \${s.price || 'A combinar'} \${s.imageUrl ? \`| [USAR ESSA URL EXATA NA TAG <img>: \${s.imageUrl}]\` : ''}\`).join('\\n  ')}`;
file = file.replace(oldPromptStr, newPromptStr);

// 5. Update the UI for rendering services
const oldServiceMapRegex = /\{services\.map\(\(svc, idx\) => \([\s\S]*?className="w-4 h-4" \/>\s*<\/Button>\s*<\/div>\s*\)\)\}/;
const newServiceMap = `{services.map((svc, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 mb-2 p-3 bg-background border border-border/50 rounded-xl relative">
                      <Input 
                        placeholder="Ex: Hambúrguer Artesanal..." 
                        value={svc.name} 
                        onChange={(e) => updateService(idx, 'name', e.target.value)} 
                        className="flex-1 w-full"
                      />
                      <div className="flex w-full sm:w-auto items-center gap-2">
                        <Input 
                          placeholder="R$ 35,00" 
                          value={svc.price} 
                          onChange={(e) => updateService(idx, 'price', e.target.value)} 
                          className="w-full sm:w-32"
                        />
                        
                        <label className="cursor-pointer bg-panel hover:bg-panelHover border border-border rounded-lg h-10 px-3 flex items-center justify-center shrink-0" title="Anexar foto">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(idx, e)}
                            disabled={svc.uploading}
                          />
                          {svc.uploading ? (
                            <span className="animate-spin text-primary">⌛</span>
                          ) : svc.imageUrl ? (
                            <img src={svc.imageUrl} alt="preview" className="w-6 h-6 object-cover rounded-md border border-border" />
                          ) : (
                            <span className="text-xl">📸</span>
                          )}
                        </label>

                        <Button 
                          variant="ghost" 
                          onClick={() => removeService(idx)}
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10 px-3 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}`;

file = file.replace(oldServiceMapRegex, newServiceMap);

fs.writeFileSync('src/pages/PromptBuilder.tsx', file, 'utf8');
console.log('Added product images logic');
