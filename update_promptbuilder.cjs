const fs = require('fs');
let code = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

// 1. Add whatsappNumber to formData
code = code.replace(
  "features: { auth: false, database: false, payments: false, pix: false, api: false, dashboard: false, ai: false, whatsapp: true, delivery: false } as Record<string, boolean>",
  "features: { auth: false, database: false, payments: false, pix: false, api: false, dashboard: false, ai: false, whatsapp: true, delivery: false } as Record<string, boolean>,\n        whatsappNumber: ''"
);

// 2. Add the input inside step 4
const inputCode = `
                    <MultiPillSelector options={FEATURE_OPTIONS} stateObj={formData.features} onToggle={toggleFeature} disabled={formData.tech === 'HTML + CSS + JS'} />
                    {formData.features.whatsapp && formData.tech !== 'HTML + CSS + JS' && (
                      <div className="space-y-4 pt-6 mt-6 border-t border-[#261f36] w-full text-left">
                        <label className="text-sm font-bold text-textSecondary uppercase tracking-widest ml-2">Número do WhatsApp (Sem API)</label>
                        <Input 
                          className="bg-panel border-2 border-border h-16 rounded-2xl text-white text-lg px-6 shadow-inner focus:border-primary transition-colors w-full" 
                          placeholder="Somente nmeros (Ex: 11999999999)" 
                          value={formData.whatsappNumber} 
                          onChange={e => setFormData({...formData, whatsappNumber: e.target.value.replace(/\\D/g, '')})} 
                        />
                        <p className="text-xs text-textSecondary ml-2">As IAs tm falhado ao gerar links complexos (api.whatsapp). Coloque s o nmero para gerarmos um link direto wa.me no prompt.</p>
                      </div>
                    )}
`;
code = code.replace(
  "<MultiPillSelector options={FEATURE_OPTIONS} stateObj={formData.features} onToggle={toggleFeature} disabled={formData.tech === 'HTML + CSS + JS'} />",
  inputCode
);

// 3. Modify activeFeatures mapping
const featureMappingCode = `const activeFeatures = formData.tech === 'HTML + CSS + JS' ? '' : FEATURE_OPTIONS.filter(f => formData.features[f.id]).map(f => {
          if (f.id === 'whatsapp' && formData.whatsappNumber) {
            return \`Boto WhatsApp (Link direto: https://wa.me/55\${formData.whatsappNumber})\`
          }
          return f.label
        }).join(', ')`;

code = code.replace(
  "const activeFeatures = formData.tech === 'HTML + CSS + JS' ? '' : FEATURE_OPTIONS.filter(f => formData.features[f.id]).map(f => f.label).join(', ')",
  featureMappingCode
);

fs.writeFileSync('src/pages/PromptBuilder.tsx', code, 'utf8');
