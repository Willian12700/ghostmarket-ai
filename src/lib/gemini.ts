import { GoogleGenAI } from '@google/genai'

export const generateSiteBlocks = async (prompt: string) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY não está configurada no .env')
  }

  const ai = new GoogleGenAI({ apiKey })

  const systemPrompt = `
Você é um expert em marketing digital, copywriter e designer de Landing Pages.
O usuário vai pedir para criar um site sobre um tema.
Sua missão é retornar um JSON array válido representando os blocos do site.
NÃO use markdown, não adicione explicações, retorne APENAS o JSON puro.

Os tipos de bloco disponíveis são: 'hero', 'features', 'pricing', 'cta'.

Estrutura esperada para cada tipo:
{ "id": "unico", "type": "hero", "content": { "title": "...", "subtitle": "...", "button": "..." } }
{ "id": "unico", "type": "features", "content": { "title": "...", "f1": "...", "f2": "...", "f3": "..." } }
{ "id": "unico", "type": "pricing", "content": { "title": "...", "price": "R$ XX", "desc": "...", "button": "..." } }
{ "id": "unico", "type": "cta", "content": { "title": "...", "button": "..." } }

Regras:
1. Crie uma landing page completa com pelo menos 1 hero, 1 features, 1 pricing e 1 cta.
2. Use textos altamente persuasivos (copywriting de alta conversão).
3. Seja criativo nos textos de acordo com o nicho pedido.
`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        responseMimeType: 'application/json'
      }
    })

    const text = response.text
    if (!text) throw new Error('Resposta vazia da IA')

    const blocks = JSON.parse(text)
    return blocks
  } catch (error) {
    console.error('Erro ao gerar site:', error)
    throw error
  }
}
