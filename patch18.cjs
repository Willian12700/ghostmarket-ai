const fs = require('fs');
let sb = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

sb = sb.replace(
  `const generatedHtml = await generateHtmlSite(aiPrompt)`,
  `const generatedHtml = await generateHtmlSite(aiPrompt, rawHtml)`
);

sb = sb.replace(
  `placeholder={isGenerating ? "IA programando o HTML..." : "Ex: Crie uma landing page de alta conversão para meu ebook de emagrecimento..."}`,
  `placeholder={isGenerating ? "IA trabalhando..." : rawHtml.includes('Site Vazio') ? "Ex: Crie uma landing page para minha barbearia..." : "Ex: Mude a cor do botão principal para verde..."}`
);

sb = sb.replace(
  `{isGenerating ? 'Gerando...' : 'Gerar Site Agora'}`,
  `{isGenerating ? 'Gerando...' : rawHtml.includes('Site Vazio') ? 'Gerar Site' : 'Atualizar Site'}`
);

fs.writeFileSync('src/pages/SiteBuilder.tsx', sb);
