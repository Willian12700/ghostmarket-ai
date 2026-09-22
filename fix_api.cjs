const fs = require('fs');
let content = fs.readFileSync('src/pages/marketing/VslGenerator.tsx', 'utf8');

// Replace the POST fetch with a GET fetch
content = content.replace(
  `const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Você é um especialista em Neuromarketing e Copywriting de resposta direta.' },
            { role: 'user', content: prompt }
          ],
          model: 'openai'
        })
      })`,
  `const sysPrompt = 'Você é um especialista em Neuromarketing e Copywriting de resposta direta.';
      // Usando GET ao invés de POST para evitar erro "ENOSPC" no servidor da API free deles
      const url = \`https://text.pollinations.ai/\${encodeURIComponent(prompt)}?system=\${encodeURIComponent(sysPrompt)}&model=openai\`;
      const response = await fetch(url)`
);

fs.writeFileSync('src/pages/marketing/VslGenerator.tsx', content, 'utf8');
