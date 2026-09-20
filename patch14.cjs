const fs = require('fs');

const files = [
  'src/pages/tiktok/AdCopy.tsx',
  'src/pages/tiktok/PersonaGenerator.tsx',
  'src/pages/tiktok/ViralScripts.tsx'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  
  // Replace Gemini API logic with Pollinations
  const geminiLogicStart = c.indexOf('const apiKey');
  const geminiLogicEnd = c.indexOf('const text = data.candidates') + 'const text = data.candidates?.[0]?.content?.parts?.[0]?.text'.length;
  
  if (geminiLogicStart !== -1 && geminiLogicEnd !== -1) {
    const toReplace = c.substring(geminiLogicStart, geminiLogicEnd);
    
    const pollinationsLogic = `
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'openai'
        })
      })

      if (!response.ok) throw new Error('API Error')
      const text = await response.text()
`;
    
    c = c.replace(toReplace, pollinationsLogic.trim());
    
    // Fix error message
    c = c.replace(/Ops, a chave da API falhou.*/, 'Ops, o servidor de IA está sobrecarregado no momento. Tente novamente.');
    
    fs.writeFileSync(f, c);
  }
});
