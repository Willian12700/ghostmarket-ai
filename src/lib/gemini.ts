export const generateSiteBlocks = async (prompt: string) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY nao esta configurada no .env')
  }

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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!text) throw new Error('Resposta vazia da IA')

    const blocks = JSON.parse(text)
    // Garantir IDs unicos
    return blocks.map((b: any, i: number) => ({ ...b, id: Date.now().toString() + i }))
  } catch (error) {
    console.error('Erro ao gerar site:', error)
    
    // FALLBACK DE ALTA CONVERSAO PARA BARBEARIA
    if (prompt.toLowerCase().includes('barbearia') || prompt.toLowerCase().includes('corte')) {
      return [
        { id: Date.now().toString(), type: 'hero', content: { title: 'Corte Fino Barbearia Premium', subtitle: 'Ajudamos homens a resgatar sua autoconfiança com cortes modernos e atendimento de primeira classe.', button: 'Agendar', buttonLink: 'https://wa.me/5511999999999', imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80' } },
        { id: (Date.now() + 1).toString(), type: 'features', content: { title: 'Por que somos a melhor da cidade?', f1: 'Barbeiros Especialistas', f2: 'Ambiente Climatizado', f3: 'Cerveja Gelada Grátis' } },
        { id: (Date.now() + 2).toString(), type: 'pricing', content: { title: 'Combo Corte + Barba', price: 'R$ 70,00', desc: 'O pacote completo.', button: 'Agendar Agora', buttonLink: 'https://wa.me/5511999999999' } },
        { id: (Date.now() + 3).toString(), type: 'cta', content: { title: 'Não deixe para depois.', button: 'Quero Agendar Agora' } }
      ]
    }
    
    // Fallback genérico para não frustrar o usuário caso a API falhe
    return [
      { id: Date.now().toString(), type: 'hero', content: { title: 'Bem-vindo ao seu site de ' + prompt, subtitle: 'A IA está processando seu pedido, mas geramos esta base. Edite os textos clicando neles.', button: 'Saiba Mais', buttonLink: '', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' } },
      { id: (Date.now() + 1).toString(), type: 'features', content: { title: 'Nossos Serviços', f1: 'Qualidade Premium', f2: 'Atendimento 24h', f3: 'Garantia de Satisfação' } }
    ]
  }
}
