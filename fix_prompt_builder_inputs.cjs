const fs = require('fs');
let file = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

// The problematic block:
/*
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textSecondary flex items-center gap-2"><Bot className="w-4 h-4"/> Qual IA você vai usar?</label>
                  <select
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={formData.niche}
                      onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                    >
                      {availableNiches.map(n => <option key={n} value={n}>{n}</option>)}
                      <option value="Outro">Outro</option>
                    </select>
                </div>
*/

const aiSelect = `                <div className="space-y-1.5">
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
                </div>`;

const systemTypeSelect = `                <div className="space-y-1.5">
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
                )}`;

const nicheSelect = `                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textSecondary">Nicho de Mercado</label>
                  <select
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={formData.niche}
                      onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                    >
                      {availableNiches.map(n => <option key={n} value={n}>{n}</option>)}
                      <option value="Outro">Outro</option>
                    </select>
                </div>`;

file = file.replace(/<label className="text-sm font-medium text-textSecondary flex items-center gap-2"><Bot className="w-4 h-4"\/> Qual IA voc vai usar\?<\/label>[\s\S]*?<\/select>/m, aiSelect + "\n\n" + systemTypeSelect + "\n\n" + nicheSelect + "\n");

fs.writeFileSync('src/pages/PromptBuilder.tsx', file, 'utf8');
console.log('Fixed inputs');
