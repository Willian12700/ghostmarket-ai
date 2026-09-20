export const generateHtmlSite = async (prompt: string) => {
  const systemPrompt = `
Você é um desenvolvedor Frontend Sênior e Web Designer Expert.
Sua missão é criar uma Landing Page COMPLETA, LINDA e MODERNA em HTML único (Single File).
O usuário vai pedir para criar um site sobre um tema.

Regras OBRIGATÓRIAS:
1. Retorne APENAS o código HTML puro. SEM NENHUM MARKDOWN, SEM \`\`\`html. Comece direto com <!DOCTYPE html>.
2. Use Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>).
3. Inclua Font Awesome para ícones se precisar (<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">).
4. Crie uma página responsiva, com visual profissional, animações sutis, cores modernas e bom contraste.
5. Inclua as seguintes seções (minímo): Header/Nav, Hero com Imagem (use Unsplash), Benefícios/Features, Depoimentos, Preços (se aplicável ao nicho) e Footer.
6. Capriche no Copywriting e nos textos persuasivos. Use português do Brasil.
7. O design deve parecer premium e altamente conversivo.
`

  try {
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        model: 'openai'
      })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    let text = await response.text()
    
    if (!text) throw new Error('Resposta vazia da IA')

    // Limpar o texto caso venha com blocos de markdown
    text = text.replace(/```html/g, '').replace(/```/g, '').trim()

    return text
  } catch (error) {
    console.error('Erro ao gerar site html:', error)
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site Gerado</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white min-h-screen flex items-center justify-center">
    <div class="text-center p-8 bg-gray-800 rounded-2xl shadow-2xl max-w-lg border border-purple-500/30">
        <h1 class="text-4xl font-bold mb-4 text-purple-400">Servidor Ocupado</h1>
        <p class="text-gray-300 mb-6">A IA está processando muitos sites agora. Por favor, tente novamente em alguns segundos.</p>
        <button onclick="window.location.reload()" class="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-full font-bold transition-colors">Tentar Novamente</button>
    </div>
</body>
</html>`
  }
}
