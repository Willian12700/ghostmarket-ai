const fs = require('fs');
let c = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

c = c.replace(
  "import { db } from '@/config/firebase'",
  "import { db } from '@/config/firebase'\nimport { generateSiteBlocks } from '@/lib/gemini'\nimport { Wand2 } from 'lucide-react'"
);

const hookStart = "  const [domainType, setDomainType] = useState<'subdomain' | 'custom'>('subdomain')";
const newHooks = hookStart + `
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateSite = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsGenerating(true)
    addToast('A IA está criando seu site. Isso leva uns segundos...', 'success')
    try {
      const generatedBlocks = await generateSiteBlocks(aiPrompt)
      setBlocks(generatedBlocks)
      addToast('Site gerado com sucesso pela IA!', 'success')
      setAiPrompt('')
    } catch (err: any) {
      if (err.message.includes('VITE_GEMINI_API_KEY')) {
        addToast('Configure a VITE_GEMINI_API_KEY no painel da Vercel ou .env', 'error')
      } else {
        addToast('Erro ao gerar site com IA.', 'error')
      }
    } finally {
      setIsGenerating(false)
    }
  }
`;
c = c.replace(hookStart, newHooks);

const topbarStart = `          <h2 className="font-bold text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Ghost Builder <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20">BETA</span>
          </h2>
        </div>`;
const topbarWithAI = topbarStart + `

        <form onSubmit={handleGenerateSite} className="flex-1 max-w-2xl mx-8 relative hidden md:block">
          <Wand2 className="w-4 h-4 text-primary absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={isGenerating}
            placeholder={isGenerating ? "IA trabalhando..." : "Ex: Crie uma landing page para minha barbearia premium..."} 
            className="w-full bg-background border border-primary/30 rounded-full py-2 pl-11 pr-32 text-sm text-white focus:outline-none focus:border-primary transition-all disabled:opacity-50" 
          />
          <Button type="submit" disabled={isGenerating || !aiPrompt.trim()} size="sm" className="absolute right-1 top-1 h-7 rounded-full text-xs px-4">
            {isGenerating ? 'Gerando...' : 'Gerar com IA'}
          </Button>
        </form>`;
c = c.replace(topbarStart, topbarWithAI);

fs.writeFileSync('src/pages/SiteBuilder.tsx', c, 'utf8');
