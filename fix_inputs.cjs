const fs = require('fs');
let file = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

// We will replace the entire block inside <CardContent className="space-y-4"> for Etapa 1
const searchBlock = `<CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary flex items-center gap-2"><Bot className="w-4 h-4"/> Qual IA voc vai usar?</label>
                <select`;

// Let's just find the start and end indices
const startIdx = file.indexOf('<CardContent className="space-y-4">');
const endIdx = file.indexOf('<div className="space-y-1.5">', startIdx + 100);

if (startIdx !== -1) {
  const aiSelect = `              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textSecondary flex items-center gap-2"><Bot className="w-4 h-4"/> Qual IA você vai usar?</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.aiPlatform}
                    onChange={(e) => setFormData({ ...formData, aiPlatform: e.target.value })}
                  >
                    <option>Antigravity</option>
                    <option>Claude 3.5 Sonnet</option>
                    <option>ChatGPT (GPT-4o)</option>
                    <option>Cursor</option>
                    <option>Windsurf</option>
                    <option>Bolt.new</option>
                    <option>v0.dev</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textSecondary">Qual o tipo de Sistema?</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.systemType}
                    onChange={(e) => setFormData({ ...formData, systemType: e.target.value })}
                  >
                    <option>Landing Page (Site Institucional)</option>
                    <option>SaaS Completo</option>
                    <option>Dashboard / CRM Administrativo</option>
                    <option>E-commerce / Loja Virtual</option>
                    <option>App Mobile (PWA)</option>
                    <option>Outro</option>
                  </select>
                </div>
                {formData.systemType === 'Outro' && (
                  <Input
                    label="Digite o tipo de sistema"
                    placeholder="Ex: Portal de Notícias"
                    value={formData.customSystemType}
                    onChange={(e) => setFormData({ ...formData, customSystemType: e.target.value })}
                  />
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textSecondary">Nicho de Mercado</label>
                  <select
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={formData.niche}
                      onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                    >
                      {availableNiches.map(n => <option key={n} value={n}>{n}</option>)}
                      <option value="Outro">Outro</option>
                    </select>
                </div>
                {formData.niche === 'Outro' && (
                  <Input
                    label="Digite seu Nicho"
                    placeholder="Ex: Petshop de Luxo"
                    value={formData.customNiche}
                    onChange={(e) => setFormData({ ...formData, customNiche: e.target.value })}
                  />
                )}

`;
  
  // Actually, I can just replace by finding the substring up to the next targetAudience div
  const targetAudienceIdx = file.indexOf('<div className="space-y-1.5">', file.indexOf('value={formData.customNiche}'));
  
  if (targetAudienceIdx !== -1) {
      const newFile = file.substring(0, startIdx) + aiSelect + file.substring(targetAudienceIdx);
      fs.writeFileSync('src/pages/PromptBuilder.tsx', newFile, 'utf8');
      console.log('Fixed exactly!');
  }
}
