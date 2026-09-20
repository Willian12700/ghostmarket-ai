const fs = require('fs');
let content = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

// 1. Etapa 1 Replacements
const qualIAIndex = content.indexOf('<label className="text-sm font-medium text-textSecondary flex items-center gap-2"><Bot');
if (qualIAIndex !== -1) {
    const parentDivStart = content.lastIndexOf('<div className="space-y-1.5">', qualIAIndex);
    if (parentDivStart !== -1) {
        const newFields = `
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-textSecondary">Nome do Estabelecimento / Projeto</label>
                    <Input
                      placeholder="Ex: Hot Dog do Max"
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    />
                  </div>
        `;
        content = content.slice(0, parentDivStart) + newFields + content.slice(parentDivStart);
    }
}

// Tom de voz
const targetAudienceIdx = content.indexOf('<label className="text-sm font-medium text-textSecondary">P'); // Público-alvo
if (targetAudienceIdx !== -1) {
    const parentDivStart = content.lastIndexOf('<div className="space-y-1.5">', targetAudienceIdx);
    if (parentDivStart !== -1) {
        const toneField = `
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-textSecondary">Tom de Voz da Marca</label>
                    <select
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={formData.tone}
                      onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                    >
                      <option>Moderno e Profissional</option>
                      <option>Descontraído e Divertido</option>
                      <option>Luxuoso e Exclusivo</option>
                      <option>Agressivo (Focado em Vendas)</option>
                      <option>Acolhedor e Amigável</option>
                    </select>
                  </div>
        `;
        content = content.slice(0, parentDivStart) + toneField + content.slice(parentDivStart);
    }
}

// 2. Etapa 2 Replacements
const featureMapStart = content.indexOf('{Object.keys(formData.features).map((feature) => {');
if (featureMapStart !== -1) {
    const parentDivStart = content.lastIndexOf('<div', featureMapStart);
    if (parentDivStart !== -1) {
        const sectionsUI = `
                  <div>
                    <label className="text-sm font-medium text-textSecondary mb-3 block">Estrutura da Página (Seções)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                      {Object.keys(formData.sections).map((sectionKey) => {
                        const sectionLabels: Record<string, string> = {
                          hero: "Hero Section (Banner Principal)",
                          socialProof: "Social Proof (Marcas/Mídia)",
                          about: "Sobre Nós / Nossa História",
                          benefits: "Vantagens / Diferenciais",
                          catalog: "Catálogo / Cardápio",
                          testimonials: "Depoimentos (Reviews)",
                          faq: "Perguntas Frequentes (FAQ)",
                          cta: "Banner Final de Vendas",
                          footer: "Rodapé Completo"
                        };
                        return (
                          <div key={sectionKey} className="flex items-center space-x-2 bg-background p-2 rounded-lg border border-border/50">
                            <input
                              type="checkbox"
                              checked={formData.sections[sectionKey as keyof typeof formData.sections]}
                              onChange={(e) => setFormData({
                                ...formData,
                                sections: { ...formData.sections, [sectionKey]: e.target.checked }
                              })}
                              className="w-4 h-4 rounded bg-background border-border text-primary focus:ring-primary/50"
                            />
                            <label className="text-sm text-textSecondary">{sectionLabels[sectionKey]}</label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <hr className="border-border/30 mb-6" />
                  <label className="text-sm font-medium text-textSecondary mb-3 block">Módulos de Sistema Mapeados</label>
        `;
        content = content.slice(0, parentDivStart) + sectionsUI + content.slice(parentDivStart);
    }
}

// 3. Prompt Features replacements
const promptFeaturesIdx = content.indexOf('## 4. FUNCIONALIDADES A IMPLEMENTAR');
if (promptFeaturesIdx !== -1) {
    const nextRulesIdx = content.indexOf('## 5. REGRAS DE C', promptFeaturesIdx);
    
    if (nextRulesIdx !== -1) {
        const newPromptFeatures = `  ## 4. ESTRUTURA DA PÁGINA (SEÇÕES)
  A página deve ser construída EXATAMENTE com as seguintes seções na ordem abaixo:
  \${Object.entries(formData.sections).filter(([_, isActive]) => isActive).map(([key]) => {
    const sectionPrompts: Record<string, string> = {
      hero: "- **Hero Section**: Banner épico de primeira dobra com H1 chamativo, subtítulo persuasivo e botões de Call-to-Action.",
      socialProof: "- **Social Proof**: Faixa horizontal com logotipos de parceiros ou 'Visto em'.",
      about: "- **Sobre Nós**: Uma seção conectando a história da marca com o cliente.",
      benefits: "- **Benefícios/Diferenciais**: Grid com ícones destacando as vantagens do negócio.",
      catalog: "- **Catálogo/Menu**: Vitrine visual incrível dos produtos com imagem, título e descrição.",
      testimonials: "- **Depoimentos**: Prova social com cards de clientes, estrelinhas e reviews.",
      faq: "- **FAQ (Perguntas Frequentes)**: Accordion (sanfona) para matar objeções finais.",
      cta: "- **CTA Final**: Um banner grandioso no fim da página para a última tentativa de conversão.",
      footer: "- **Rodapé**: Footer profissional com links, endereço e direitos autorais."
    };
    return sectionPrompts[key];
  }).join('\\n  ')}

  ## 4.5 MÓDULOS DE SISTEMA (FUNCIONAIS)
  O sistema deve conter as seguintes integrações funcionais:
  \${activeFeatures || 'Apenas estrutura básica da Landing Page.'}
  
  `;
        content = content.slice(0, promptFeaturesIdx) + newPromptFeatures + content.slice(nextRulesIdx);
    }
}

// Tom de voz no prompt
if (!content.includes('Tom de Voz')) {
    content = content.replace("- **Nível Visual Exigido**:", "- **Tom de Voz (Copy)**: ${formData.tone}. Escreva todos os textos do site usando esse tom exato.\\n    - **Nível Visual Exigido**:");
}

// Replace Etapa 2 title
content = content.replace('<CardTitle>Etapa 2 — Recursos</CardTitle>', '<CardTitle>Etapa 2 — Arquitetura da Página</CardTitle>');

fs.writeFileSync('src/pages/PromptBuilder.tsx', content, 'utf8');
console.log('Fixed UI effectively');
