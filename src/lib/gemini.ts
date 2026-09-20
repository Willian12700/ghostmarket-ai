export const generateHtmlSite = async (prompt: string, currentHtml?: string) => {
  const systemPrompt = `
Você é um desenvolvedor Frontend e Web Designer Sênior. 
Crie uma Landing Page COMPLETA e INCRÍVEL em um único arquivo HTML.

INSTRUÇÕES OBRIGATÓRIAS:
1. Retorne APENAS o código HTML puro, começando com <!DOCTYPE html>. Sem markdown, sem explicações.
2. É OBRIGATÓRIO incluir o script do Tailwind no <head>: <script src="https://cdn.tailwindcss.com"></script>
3. É OBRIGATÓRIO adicionar Tailwind Config no <head> para personalizar as cores primárias do nicho. Exemplo: <script>tailwind.config = { theme: { extend: { colors: { primary: '#3b82f6' } } } }</script>
4. Faça o design ABSURDAMENTE lindo, usando Tailwind CSS para TUDO (Sombras grandes, gradientes, bordas arredondadas, hover effects, flexbox/grid).
5. Se precisar de ícones, use FontAwesome (<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">).
6. Adicione Javascript nativo (<script>) no final do <body> para animações de scroll (IntersectionObserver), botões de menu mobile, ou faq expansível. TEM que ter interatividade!
7. A página precisa ter: Header fixo, Hero Banner foda com imagem do Unsplash, Seção de Benefícios, Prova Social/Depoimentos, Tabela de Preços e Footer.
8. As imagens devem ser pegas do Unsplash: https://source.unsplash.com/1200x800/?[niche] (Ex: /?fitness)

Crie um site que pareça uma Landing Page de R$ 5.000,00!
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
          { role: 'user', content: currentHtml && currentHtml.length > 500 && !currentHtml.includes('Site Vazio') ? `Aqui está o código HTML atual do site:\n` + currentHtml + `\n\nBaseado neste HTML, faça a seguinte alteração pedida pelo usuário e retorne o HTML completo atualizado:\n` + prompt : prompt }
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
    text = text.replace(/```html/gi, '').replace(/```/g, '').trim()

    
    if (!text.includes('<base target="_blank"')) {
      text = text.replace('<head>', '<head>\n<base target="_blank">');
    }

    // Forçar a injeção do Tailwind se a IA esquecer
    if (!text.includes('cdn.tailwindcss.com')) {
      text = text.replace('</head>', '\n<script src="https://cdn.tailwindcss.com"></script>\n</head>')
    }
    
    // Se a IA não gerou a tag html (gerou só divs), envelopar tudo
    if (!text.toLowerCase().includes('<html')) {
      text = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Landing Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="bg-gray-50 text-gray-900 font-sans">
    ${text}
</body>
</html>`
    }

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
