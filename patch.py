import re

with open('src/pages/PromptBuilder.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
content = content.replace('ArrowLeft } from \'lucide-react\'', 'ArrowLeft, MapPin, Plus, Trash2 } from \'lucide-react\'')

# 2. Add state variables
state_injection = '''  const [step, setStep] = useState(1)
  const [promptStyle, setPromptStyle] = useState<'manual' | 'google' | null>(null)
  const [googleData, setGoogleData] = useState('')
  const [products, setProducts] = useState([{ name: '', price: '', image: '' }])'''
content = content.replace('  const [step, setStep] = useState(1)', state_injection)

# 3. Modify generatePrompt
old_generate = '''  const generatePrompt = () => {
    setIsGenerating(true)
    
    setTimeout(() => {
      const activeSections = SECTION_OPTIONS.filter(s => formData.sections[s.id]).map(s => s.label).join(', ')
      const activeFeatures = formData.tech === 'HTML + CSS + JS' ? '' : FEATURE_OPTIONS.filter(f => formData.features[f.id]).map(f => {
          if (f.id === 'whatsapp' && formData.whatsappNumber) {
            return \Botão WhatsApp (Link direto: https://wa.me/55\)\
          }
          return f.label
        }).join(', ')
      
      const prompt = \Contexto do Projeto:
Estou desenvolvendo um(a) \ para o nicho de \.
Nome do Projeto/Empresa: \
Público-Alvo: \
Descrição do Negócio: \

Stack Tecnológica:
- Front-end/Framework: \
- Design System/Estilo Visual: \
- Tom de Voz / Aparência: \

Estrutura da Interface (Páginas/Seções):
Por favor, inclua as seguintes seções na interface:
\

Funcionalidades e Módulos:
O sistema deve conter os seguintes recursos funcionais implementados:
\

Instruções para a IA (Antigravity):
1. Gere o código limpo, moderno, totalmente responsivo e utilizando Tailwind CSS para estilização (se compatível com a stack).
2. Utilize ícones modernos (Lucide React ou similar).
3. Respeite o esquema de cores sugerido pelo Design System escolhido (\).
4. O código deve ser componentizado (separado em pequenos componentes lógicos) sempre que possível para facilitar a manutenção.
5. Siga rigorosamente o Tom de Voz definido para os textos gerados no layout (\).
\
      setGeneratedPrompt(prompt)
      setIsGenerating(false)
      setStep(5)
    }, 1500)
  }'''

new_generate = '''  const generatePrompt = () => {
    setIsGenerating(true)
    
    setTimeout(() => {
      let prompt = '';
      
      if (promptStyle === 'google') {
        prompt = \Atue como um Desenvolvedor Front-end Senior e Especialista em UI/UX.

Contexto:
Preciso que você crie uma Landing Page profissional, moderna e de alta conversão usando React (com Vite), Tailwind CSS e lucide-react para os ícones.

Abaixo estão as informações extraídas do Google Maps sobre o estabelecimento. Use esses dados REAIS para compor os textos, endereço, horários, avaliações, nome da empresa e serviços oferecidos no site:

DADOS DO ESTABELECIMENTO:
\

Instruções para a IA:
1. Gere o código limpo, moderno, totalmente responsivo.
2. Crie uma paleta de cores baseada no nicho do estabelecimento (seja criativo e premium).
3. O código deve ser componentizado sempre que possível.
4. Adicione uma seção de "Avaliações" usando as reviews fornecidas.
5. Adicione uma seção de "Localização e Horários".
6. Crie um botão flutuante de WhatsApp.\;
      } else {
        const activeSections = SECTION_OPTIONS.filter(s => formData.sections[s.id]).map(s => s.label).join(', ')
        const activeFeatures = formData.tech === 'HTML + CSS + JS' ? '' : FEATURE_OPTIONS.filter(f => formData.features[f.id]).map(f => {
            if (f.id === 'whatsapp' && formData.whatsappNumber) {
              return \Botão WhatsApp (Link direto: https://wa.me/55\)\
            }
            return f.label
          }).join(', ')
        
        const validProducts = products.filter(p => p.name.trim() !== '');
        const productsText = validProducts.length > 0 
          ? \\\nLista de Produtos/Serviços para incluir no layout:\\n\ + validProducts.map(p => \- \ (\) | Imagem: \\).join('\\n')
          : '';

        prompt = \Contexto do Projeto:
Estou desenvolvendo um(a) \ para o nicho de \.
Nome do Projeto/Empresa: \
Público-Alvo: \
Descrição do Negócio: \\

Stack Tecnológica:
- Front-end/Framework: \
- Design System/Estilo Visual: \
- Tom de Voz / Aparência: \

Estrutura da Interface (Páginas/Seções):
Por favor, inclua as seguintes seções na interface:
\

Funcionalidades e Módulos:
O sistema deve conter os seguintes recursos funcionais implementados:
\

Instruções para a IA (Antigravity):
1. Gere o código limpo, moderno, totalmente responsivo e utilizando Tailwind CSS para estilização (se compatível com a stack).
2. Utilize ícones modernos (Lucide React ou similar).
3. Respeite o esquema de cores sugerido pelo Design System escolhido (\).
4. O código deve ser componentizado (separado em pequenos componentes lógicos) sempre que possível para facilitar a manutenção.
5. Siga rigorosamente o Tom de Voz definido para os textos gerados no layout (\).\
      }
      
      setGeneratedPrompt(prompt)
      setIsGenerating(false)
      setStep(promptStyle === 'google' ? 2 : 6)
    }, 1500)
  }'''

# Replace spaces logic because indentation might differ
import re
content = re.sub(r'  const generatePrompt = \(\) => \{.*?(?=  return \()', new_generate + '\n\n', content, flags=re.DOTALL)

with open('src/pages/PromptBuilder.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

