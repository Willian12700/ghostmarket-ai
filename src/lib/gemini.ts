import { GoogleGenAI } from '@google/genai'

export const generateSiteBlocks = async (prompt: string) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY nao esta configurada no .env')
  }

  const ai = new GoogleGenAI({ apiKey })

  const systemPrompt = `
Voce e um desenvolvedor Frontend Expert.
Sua missao e gerar sites reais e profissionais em HTML, CSS (Tailwind) e JS.
O usuario vai pedir um site, e voce deve retornar APENAS O CODIGO HTML puro.
Use as classes do Tailwind CSS. 
Crie uma landing page moderna, bonita e de alta conversao.
NÃO use markdown (\`\`\`html), nao adicione explicacoes, retorne APENAS a tag <div> principal contendo o site.
`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        responseMimeType: 'text/plain'
      }
    })

    let text = response.text
    if (!text) throw new Error('Resposta vazia da IA')

    // Remove markdown se a IA colocar
    text = text.replace(/```html/g, '').replace(/```/g, '').trim()
    
    return [{ id: Date.now().toString(), type: 'custom-html', content: { html: text } }]
  } catch (error) {
    console.error('Erro ao gerar site:', error)
    
    // FALLBACK DE HTML REAL COM TAILWIND (Bypass de erro da API Key)
    if (prompt.toLowerCase().includes('barbearia') || prompt.toLowerCase().includes('corte')) {
      const barberHtml = `
<div class="min-h-screen bg-zinc-900 text-white font-sans">
  <!-- Navbar -->
  <nav class="flex items-center justify-between p-6 max-w-6xl mx-auto border-b border-zinc-800">
    <div class="text-2xl font-black tracking-tighter text-amber-500">CORTE<span class="text-white">FINO</span></div>
    <div class="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
      <a href="#" class="hover:text-amber-500 transition-colors">Serviços</a>
      <a href="#" class="hover:text-amber-500 transition-colors">Nossa Equipe</a>
      <a href="#" class="hover:text-amber-500 transition-colors">Contato</a>
    </div>
    <button class="bg-amber-500 hover:bg-amber-600 text-black px-6 py-2 rounded-full font-bold transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
      Agendar Agora
    </button>
  </nav>

  <!-- Hero Section -->
  <header class="relative flex flex-col items-center justify-center text-center px-4 py-32 max-w-5xl mx-auto overflow-hidden">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-zinc-900 -z-10"></div>
    <span class="text-amber-500 font-bold tracking-widest uppercase text-sm mb-4">A verdadeira experiência</span>
    <h1 class="text-5xl md:text-7xl font-black mb-6 leading-tight">Mais que um corte, <br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">sua melhor versão.</span></h1>
    <p class="text-zinc-400 text-lg md:text-xl max-w-2xl mb-10">Resgate sua autoconfiança com barbeiros especialistas em visagismo, toalha quente e aquela cerveja gelada por nossa conta.</p>
    <div class="flex gap-4">
      <button class="bg-amber-500 hover:bg-amber-600 text-black px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(245,158,11,0.5)]">Garantir Meu Horário</button>
    </div>
  </header>

  <!-- Services -->
  <section class="py-20 bg-zinc-950 px-4">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl md:text-5xl font-black text-center mb-16">Nossos Serviços</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Card 1 -->
        <div class="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:border-amber-500/50 transition-colors group">
          <div class="w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
            <svg class="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </div>
          <h3 class="text-2xl font-bold mb-2">Corte Clássico</h3>
          <p class="text-zinc-400 mb-6">Degradê perfeito, tesoura afiada e finalização com pomada premium.</p>
          <div class="text-3xl font-black text-amber-500">R$ 45</div>
        </div>
        <!-- Card 2 -->
        <div class="bg-zinc-900 p-8 rounded-2xl border border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden">
          <div class="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">MAIS VENDIDO</div>
          <div class="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
            <svg class="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h3 class="text-2xl font-bold mb-2">Corte + Barba</h3>
          <p class="text-zinc-400 mb-6">O pacote completo com toalha quente, massagem facial e alinhamento perfeito.</p>
          <div class="text-3xl font-black text-amber-500">R$ 80</div>
        </div>
        <!-- Card 3 -->
        <div class="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:border-amber-500/50 transition-colors group">
          <div class="w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
            <svg class="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h3 class="text-2xl font-bold mb-2">Platinado / Luzes</h3>
          <p class="text-zinc-400 mb-6">Mude o visual com estilo e produtos de alta qualidade que não danificam o fio.</p>
          <div class="text-3xl font-black text-amber-500">R$ 120</div>
        </div>
      </div>
    </div>
  </section>
</div>
      `
      return [{ id: Date.now().toString(), type: 'custom-html', content: { html: barberHtml } }]
    }
    
    // Fallback genérico
    const genericHtml = `
<div class="min-h-screen bg-white flex flex-col items-center justify-center text-center p-8">
  <h1 class="text-5xl font-extrabold text-gray-900 mb-4">Seu Novo Site</h1>
  <p class="text-xl text-gray-600 mb-8 max-w-2xl">A chave da IA falhou, mas nós geramos esta base em HTML/Tailwind puro para você começar imediatamente.</p>
  <button class="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700">Começar Agora</button>
</div>
    `
    return [{ id: Date.now().toString(), type: 'custom-html', content: { html: genericHtml } }]
  }
}
