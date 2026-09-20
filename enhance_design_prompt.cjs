const fs = require('fs');
let content = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

const oldDesign = `  ## 3. DESIGN E UI/UX
  - **Tema Visual**: \${formData.design}
  - **Experiência do Usuário (UX)**: A interface deve ser extremamente moderna, responsiva, com foco absoluto em usabilidade. Utilize componentes bem espaçados, efeitos de hover sutis e feedback visual para o usuário.`;

const newDesign = `  ## 3. DESIGN E UI/UX (ESTILO AGÊNCIA PREMIUM DE ALTO CONVERSÃO)
  - **Tema Visual Base**: \${formData.design}
  - **Nível Visual Exigido**: O site DEVE ter o nível visual de uma agência de alto padrão (ex: Apple, Stripe, Framer). 
  - **Hero Section Épica**: Crie uma primeira dobra de tirar o fôlego. Use text-gradient, títulos gigantes (text-5xl/text-6xl) com tracking apertado, botões brilhantes ou com glow, e imagens de fundo de altíssima qualidade do Unsplash relacionadas a "\${finalNiche}".
  - **Glassmorphism**: Use \`bg-white/10\`, \`backdrop-blur-lg\`, e \`border-white/20\` em headers e cards para um efeito de vidro moderno.
  - **Animações e Micro-Interações**: Adicione \`hover:scale-105\`, \`hover:-translate-y-1\`, \`transition-all duration-300\` em todos os botões e cards de produto. O site deve parecer "vivo" ao passar o mouse.
  - **Imagens e Mídia**: INJETE MUITAS IMAGENS. Use URLs diretas do Unsplash (ex: \`https://source.unsplash.com/1200x800/?\${encodeURIComponent(finalNiche)}\`) para ilustrar produtos, fundos e seções. Nunca deixe o site parecendo um esqueleto de texto.
  - **Sombras Premium**: Use \`shadow-2xl\` suaves com opacidade baixa, não sombras duras.
  - **Navbar e Footer**: Um header fixo com blur (\`sticky top-0 z-50 backdrop-blur-md\`) e um footer rico e bem organizado.`;

// Note: Unsplash Source API was discontinued, but many AIs still use it, or they use images.unsplash.com with parameters. I'll ask the AI to generate random realistic Unsplash IDs.

const improvedNewDesign = `  ## 3. DESIGN E UI/UX (ESTILO PREMIUM "AWARDS" E ALTA CONVERSÃO)
  - **Tema Visual Base**: \${formData.design}
  - **Nível Visual Exigido**: O site DEVE ter o aspecto visual impressionante, semelhante a sites feitos no Webflow, Framer ou por agências gringas de alto padrão. NADA de design amador.
  - **Hero Section Épica**: Crie uma primeira dobra de tirar o fôlego. Use \`bg-gradient-to-r\`, títulos gigantes (text-5xl a text-7xl font-extrabold) com \`bg-clip-text text-transparent\`, botões grandes e chamativos, e coloque uma imagem incrível de fundo com um overlay escuro (\`bg-black/50\`).
  - **Glassmorphism**: Aplique o efeito de vidro (\`backdrop-blur-md bg-white/10 border border-white/20\`) no Navbar (que deve ser \`sticky top-0 z-50\`) e nos Cards.
  - **Animações e Vida**: O site NÃO PODE ser estático. Adicione classes Tailwind como \`hover:scale-[1.02] transition-all duration-300 ease-in-out hover:shadow-2xl\` em TODOS os botões, cards de produto e imagens.
  - **Injeção de Imagens**: O SITE DEVE SER VISUAL. Use imagens fotorrealistas de alta qualidade do Unsplash usando tags \`<img>\`. Para fotos, use links com seeds diferentes, ex: \`https://images.unsplash.com/photo-X?auto=format&fit=crop&w=800&q=80\` simulando imagens reais do nicho "\${finalNiche}".
  - **Layout de Grade (Grids)**: Apresente serviços/produtos em \`grid-cols-1 md:grid-cols-3\` com espaçamento generoso (\`gap-8\`), cards com bordas arredondadas (\`rounded-2xl\`) e muito respiro (\`p-8\`).`;

// Let's replace the block using string replacement without regex to be safe
content = content.replace(
  "  ## 3. DESIGN E UI/UX\n  - **Tema Visual**: ${formData.design}\n  - **Experiência do Usuário (UX)**: A interface deve ser extremamente moderna, responsiva, com foco absoluto em \nusabilidade. Utilize componentes bem espaçados, efeitos de hover sutis e feedback visual para o usuário.",
  improvedNewDesign
);

// Fallback if the strict replacement fails due to line breaks
if (!content.includes('ESTILO PREMIUM "AWARDS"')) {
    const startIdx = content.indexOf('## 3. DESIGN E UI/UX');
    const endIdx = content.indexOf('## 4. FUNCIONALIDADES');
    if (startIdx !== -1 && endIdx !== -1) {
        content = content.substring(0, startIdx) + improvedNewDesign + '\n  \n  ' + content.substring(endIdx);
    }
}

fs.writeFileSync('src/pages/PromptBuilder.tsx', content, 'utf8');
console.log('Design prompt enhanced.');
