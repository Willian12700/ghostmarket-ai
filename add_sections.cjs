const fs = require('fs');
let content = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

// 1. Update initial state
const oldState = `    const [formData, setFormData] = useState({
      aiPlatform: 'Antigravity',
      systemType: 'Landing Page (Site Institucional)',
      customSystemType: '',
      projectName: '',
      description: '',
      targetAudience: 'B2B (Empresas)',
      customAudience: '',
      niche: 'SaaS / Tecnologia',
      customNiche: '',
      tech: 'React',
      design: 'Dark SaaS',
      features: {
          auth: true,
          database: true,
          payments: false,
          api: false,
          dashboard: false,
          ai: true,
          catalog: false,
          pix: false,
          delivery: false
      }
    })`;

const newState = `    const [formData, setFormData] = useState({
      aiPlatform: 'Antigravity',
      systemType: 'Landing Page (Site Institucional)',
      customSystemType: '',
      projectName: '',
      tone: 'Moderno e Profissional',
      description: '',
      targetAudience: 'B2B (Empresas)',
      customAudience: '',
      niche: 'SaaS / Tecnologia',
      customNiche: '',
      tech: 'React',
      design: 'Dark SaaS',
      features: {
          auth: true,
          database: true,
          payments: false,
          api: false,
          dashboard: false,
          ai: true,
          catalog: false,
          pix: false,
          delivery: false
      },
      sections: {
        hero: true,
        socialProof: true,
        about: false,
        benefits: true,
        catalog: true,
        testimonials: true,
        faq: true,
        cta: true,
        footer: true
      }
    })`;

content = content.replace(oldState, newState);

// 2. Add ProjectName and Tone to Step 1
const oldEtapa1Start = `<CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textSecondary flex items-center gap-2"><Bot className="w-4 h-4"/> Qual IA você vai usar?</label>`;

const newEtapa1Start = `<CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textSecondary">Nome do Estabelecimento / Projeto</label>
                  <Input
                    placeholder="Ex: Hot Dog do Max"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textSecondary flex items-center gap-2"><Bot className="w-4 h-4"/> Qual IA você vai usar?</label>`;

content = content.replace(oldEtapa1Start, newEtapa1Start);

// Add Tone to Step 1 (after customNiche)
const oldNicheEnd = `onChange={(e) => setFormData({ ...formData, customNiche: e.target.value })}
                  />
                )}`;

const newNicheEnd = `onChange={(e) => setFormData({ ...formData, customNiche: e.target.value })}
                  />
                )}
                
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
                </div>`;

content = content.replace(oldNicheEnd, newNicheEnd);

// 3. Add Sections block to Step 2
const oldEtapa2 = `<CardTitle>Etapa 2 — Recursos</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">`;

const newEtapa2 = `<CardTitle>Etapa 2 — Seções & Recursos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-textSecondary mb-3 block">Estrutura da Página (Seções)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.keys(formData.sections).map((sectionKey) => {
                        const sectionLabels: Record<string, string> = {
                          hero: "Hero Section (Banner Principal)",
                          socialProof: "Social Proof (Logos/Visto em)",
                          about: "Sobre Nós / História",
                          benefits: "Vantagens / Benefícios",
                          catalog: "Menu / Catálogo de Produtos",
                          testimonials: "Depoimentos (Reviews)",
                          faq: "Perguntas Frequentes (FAQ)",
                          cta: "Banner Final de Chamada",
                          footer: "Rodapé (Links e Contatos)"
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
                  <hr className="border-border/30" />
                  <div>
                    <label className="text-sm font-medium text-textSecondary mb-3 block">Recursos do Sistema</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">`;

content = content.replace(oldEtapa2, newEtapa2);

// Finally, make sure the div for Features closes properly by closing the wrapper div
const oldEtapa2End = `</div>
              </CardContent>
            </Card>`;
const newEtapa2End = `</div>
                  </div>
              </CardContent>
            </Card>`;
content = content.replace(oldEtapa2End, newEtapa2End);

// 4. Update the generated Prompt

const oldPromptFeatures = `  ## 4. FUNCIONALIDADES A IMPLEMENTAR
  O sistema deve conter os seguintes módulos/features essenciais:
  \${activeFeatures || 'Apenas estrutura básica da Landing Page.'}`;

const newPromptFeatures = `  ## 4. ESTRUTURA DA PÁGINA (SEÇÕES)
  A página deve ser construída EXATAMENTE com as seguintes seções na ordem abaixo:
  \${Object.entries(formData.sections).filter(([_, isActive]) => isActive).map(([key]) => {
    const sectionPrompts: Record<string, string> = {
      hero: "- **Hero Section**: Banner épico de primeira dobra com H1 chamativo, subtítulo persuasivo e botões de Call-to-Action primário e secundário.",
      socialProof: "- **Social Proof**: Faixa horizontal com logotipos de clientes/parceiros ou menções na mídia.",
      about: "- **Sobre Nós**: Uma seção conectando a história da marca com o cliente de forma emocional.",
      benefits: "- **Benefícios/Diferenciais**: Grid de 3 a 4 colunas com ícones destacando as vantagens do produto/serviço.",
      catalog: "- **Catálogo/Menu**: Vitrine visual incrível dos produtos com imagem, título, preço e botão de compra.",
      testimonials: "- **Depoimentos**: Prova social com fotos de clientes, estrelinhas e reviews.",
      faq: "- **FAQ (Perguntas Frequentes)**: Accordion (sanfona) para matar objeções finais.",
      cta: "- **CTA Final**: Um banner grandioso no fim da página para a última tentativa de conversão.",
      footer: "- **Rodapé**: Footer profissional com links, redes sociais, endereço e direitos autorais."
    };
    return sectionPrompts[key];
  }).join('\\n  ')}

  ## 4.5 FUNCIONALIDADES A IMPLEMENTAR
  O sistema deve conter os seguintes módulos sistêmicos essenciais:
  \${activeFeatures || 'Apenas estrutura básica da Landing Page.'}`;

content = content.replace(oldPromptFeatures, newPromptFeatures);

// Add Tom de Voz
content = content.replace("- **Nível Visual Exigido**:", "- **Tom de Voz (Copy)**: " + "${formData.tone}. Escreva os textos do site (Títulos, parágrafos, CTAs) usando esse tom exato.\n    - **Nível Visual Exigido**:");

fs.writeFileSync('src/pages/PromptBuilder.tsx', content, 'utf8');
console.log('Done mapping sections');
