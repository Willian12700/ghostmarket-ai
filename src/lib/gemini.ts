export const generateSiteBlocks = async (prompt: string) => {
  const systemPrompt = `
Voce e um expert em marketing digital, copywriter e designer de Landing Pages.
O usuario vai pedir para criar um site sobre um tema.
Sua missao e retornar um JSON array valido representando os blocos do site.
NAO use markdown, nao adicione explicacoes, retorne APENAS o JSON puro.

Os tipos de bloco disponiveis sao: 'hero', 'features', 'pricing', 'cta'.

Estrutura esperada:
[
  { "id": "1", "type": "hero", "content": { "title": "...", "subtitle": "...", "button": "...", "buttonLink": "...", "imageUrl": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80" } },
  { "id": "2", "type": "features", "content": { "title": "...", "f1": "...", "f2": "...", "f3": "..." } },
  { "id": "3", "type": "pricing", "content": { "title": "...", "price": "R$ XX", "desc": "...", "button": "...", "buttonLink": "..." } },
  { "id": "4", "type": "cta", "content": { "title": "...", "button": "...", "buttonLink": "..." } }
]

Regras:
1. Crie uma landing page completa com 1 hero, 1 features, 1 pricing e 1 cta.
2. Use textos altamente persuasivos (copywriting de alta conversao).
3. Seja criativo nos textos de acordo com o nicho pedido.
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
        model: 'openai',
        jsonMode: true
      })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const text = await response.text()
    
    if (!text) throw new Error('Resposta vazia da IA')

    // Limpar o texto caso venha com blocos de markdown
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()

    const blocks = JSON.parse(cleanText)
    // Garantir IDs unicos
    return blocks.map((b: any, i: number) => ({ ...b, id: Date.now().toString() + i }))
  } catch (error) {
    console.error('Erro ao gerar site:', error)
    
    // Fallback genǸrico de emergǦncia
    return [
      { id: Date.now().toString(), type: 'hero', content: { title: 'Site de ' + prompt, subtitle: 'Conecte-se com seu público usando uma mensagem poderosa. Nós entregamos resultados.', button: 'Saiba Mais', buttonLink: '', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' } },
      { id: (Date.now() + 1).toString(), type: 'features', content: { title: 'Nossos Serviços', f1: 'Qualidade Premium', f2: 'Atendimento Rápido', f3: 'Satisfação Garantida' } }
    ]
  }
}
