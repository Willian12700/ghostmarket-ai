const fs = require('fs');
let content = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

const newState = `const [formData, setFormData] = useState({
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
          ai: false,
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

content = content.replace(/const \[formData, setFormData\] = useState\(\{[\s\S]*?\}\)/, newState);

fs.writeFileSync('src/pages/PromptBuilder.tsx', content, 'utf8');
