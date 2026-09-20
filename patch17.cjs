const fs = require('fs');

let gemini = fs.readFileSync('src/lib/gemini.ts', 'utf8');

gemini = gemini.replace(
  `export const generateHtmlSite = async (prompt: string) => {`,
  `export const generateHtmlSite = async (prompt: string, currentHtml?: string) => {`
);

const userMessageLogic = `
          { role: 'system', content: systemPrompt },
          { role: 'user', content: currentHtml && currentHtml.length > 500 && !currentHtml.includes('Site Vazio') ? \`Aqui está o código HTML atual do site:\\n\` + currentHtml + \`\\n\\nBaseado neste HTML, faça a seguinte alteração pedida pelo usuário e retorne o HTML completo atualizado:\\n\` + prompt : prompt }
`;

gemini = gemini.replace(
  `          { role: 'system', content: systemPrompt },\n          { role: 'user', content: prompt }`,
  userMessageLogic.trim()
);

const baseTargetInjection = `
    if (!text.includes('<base target="_blank"')) {
      text = text.replace('<head>', '<head>\\n<base target="_blank">');
    }
`;

gemini = gemini.replace(
  `// Forçar a injeção do Tailwind se a IA esquecer`,
  `${baseTargetInjection}\n    // Forçar a injeção do Tailwind se a IA esquecer`
);

fs.writeFileSync('src/lib/gemini.ts', gemini);
