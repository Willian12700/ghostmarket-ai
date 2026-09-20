const fs = require('fs');
let c = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

const regex = /<h2 className="font-bold text-white flex items-center gap-2">[\s\S]*?<\/div>/;

const topbarWithAI = `<h2 className="font-bold text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Ghost Builder <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20">BETA</span>
          </h2>
        </div>

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

c = c.replace(regex, topbarWithAI);
fs.writeFileSync('src/pages/SiteBuilder.tsx', c, 'utf8');
