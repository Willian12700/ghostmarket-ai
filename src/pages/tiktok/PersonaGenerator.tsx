import { useState, useRef } from 'react'
import { Wand2, Copy, Check, Code, Users, Image as ImageIcon, Upload } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/toastStore'
import { useAuthStore } from '@/store/authStore'
import { db, storage } from '@/config/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export const PersonaGenerator = () => {
  const { addToast } = useToastStore()
  const { user } = useAuthStore()
  
  const [formData, setFormData] = useState({
    productName: '',
    productImageUrl: '',
    niche: 'Maquiagem / Beleza',
    customNiche: '',
    gender: 'Mulher',
    ageGroup: '18-24 anos',
    ethnicity: 'Indiferente (Deixe a IA escolher)',
    style: 'Casual / Dia a dia',
    hair: 'Indiferente',
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [generatedImagePrompt, setGeneratedImagePrompt] = useState('')
  const [generatedChatPrompt, setGeneratedChatPrompt] = useState('')
  const [copiedImage, setCopiedImage] = useState(false)
  const [copiedChat, setCopiedChat] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      setFormData(prev => ({ ...prev, productImageUrl: url }))
      addToast('Imagem carregada com sucesso!', 'success')
    } catch (error) {
      addToast('Erro ao fazer upload da imagem', 'error')
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const generatePrompt = async () => {
    setIsGenerating(true)
    try {
      const finalNiche = formData.niche === 'Outro' ? formData.customNiche : formData.niche

      // PROMPT DE IMAGEM
      const genderEN = formData.gender === 'Homem' ? 'man' : formData.gender === 'Mulher' ? 'woman' : 'person'
      const ageEN = formData.ageGroup.replace(' anos', '') + ' years old'
      const ethEN = formData.ethnicity === 'Branco' ? 'caucasian' : formData.ethnicity === 'Negro' ? 'black' : formData.ethnicity === 'Asiático' ? 'asian' : formData.ethnicity === 'Pardo' ? 'latino' : ''
      const hairEN = formData.hair !== 'Indiferente' ? `${formData.hair === 'Loiro' ? 'blonde' : formData.hair === 'Castanho' ? 'brown' : formData.hair === 'Preto' ? 'black' : formData.hair === 'Ruivo' ? 'red' : 'bald'} hair, ` : ''
      
      const imagePrefix = formData.productImageUrl ? `${formData.productImageUrl} ` : ''
      const imagePrompt = `${imagePrefix}Selfie video frame of a highly realistic ${ethEN} ${genderEN}, ${ageEN}, ${hairEN}wearing ${formData.style} clothes. Holding or presenting ${formData.productName || 'a product'} to the camera. TikTok UGC style aesthetic, natural room lighting, looking directly at the camera, highly detailed, photorealistic, 8k, --ar 9:16 --v 6.0`

      // PROMPT DE CHAT
      const chatPrompt = `# SYSTEM INSTRUCTION: TIKTOK SHOP PERSONA
Você vai atuar como um criador de conteúdo UGC focado em vender no TikTok Shop.

## 1. SUA IDENTIDADE
- Você é: ${formData.gender}, ${formData.ageGroup}.
- Seu estilo e vibe: ${formData.style}, autêntico, dinâmico e natural.
- Seu nicho de atuação: ${finalNiche}.

## 2. SEU PRODUTO ATUAL
Você está vendendo: ${formData.productName || '[Nome do Produto]'}.

## 3. SEU ESTILO DE COMUNICAÇÁO
- Fale rápido, direto ao ponto e use muita energia.
- Comece SEMPRE com um Hook (gancho) extremamente forte nos primeiros 3 segundos para reter a atenção.
- Não pareça um vendedor de TV. Pareça um amigo recomendando um segredo que descobriu.
- Use gatilhos mentais: urgência, prova social e exclusividade.
- O Call to Action (CTA) no final deve mandar clicar no carrinho amarelo do TikTok Shop.

Sua primeira tarefa: Crie 3 ganchos (Hooks) virais para um vídeo de 30 segundos vendendo este produto.`

      setGeneratedImagePrompt(imagePrompt)
      setGeneratedChatPrompt(chatPrompt)
      
      // Save to History
      if (user?.email) {
        await addDoc(collection(db, 'persona_history'), {
          userEmail: user.email,
          createdAt: serverTimestamp(),
          productName: formData.productName,
          productImageUrl: formData.productImageUrl,
          niche: finalNiche,
          gender: formData.gender,
          ageGroup: formData.ageGroup,
          ethnicity: formData.ethnicity,
          style: formData.style,
          hair: formData.hair,
          imagePrompt,
          chatPrompt
        })
      }

      addToast('Prompts gerados e salvos no histórico!', 'success')
    } catch (error) {
      console.error(error)
      addToast('Erro ao gerar', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string, type: 'image' | 'chat') => {
    navigator.clipboard.writeText(text)
    if (type === 'image') {
      setCopiedImage(true)
      setTimeout(() => setCopiedImage(false), 2000)
    } else {
      setCopiedChat(true)
      setTimeout(() => setCopiedChat(false), 2000)
    }
    addToast('Prompt copiado!', 'success')
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Gerador de Persona (TikTok)
        </h2>
        <p className="text-textSecondary">Crie a persona perfeita para vender seus produtos. Gere prompts de imagem (Midjourney) e prompts de roteiro (ChatGPT) automaticamente.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary">Imagem do Produto (Opcional - Para Midjourney)</label>
                <div className="flex gap-2 items-center">
                  <div 
                    className="flex-1 border-2 border-dashed border-border rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-background/50 relative overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-xs text-textSecondary">Enviando...</span>
                      </div>
                    ) : formData.productImageUrl ? (
                      <img src={formData.productImageUrl} alt="Product" className="w-full h-full object-cover opacity-50" />
                    ) : (
                      <div className="flex flex-col items-center text-textSecondary">
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-xs">Clique para fazer upload</span>
                      </div>
                    )}
                    {formData.productImageUrl && !isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-xs text-white">Trocar Imagem</span>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                </div>
                <p className="text-[10px] text-textSecondary text-center mt-1">A imagem será injetada no prompt para a IA usar como base.</p>
              </div>

              <Input
                label="Qual o nome do produto?"
                placeholder="Ex: Escova Secadora Revlon"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary">Nicho</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.niche}
                  onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                >
                  <option>Maquiagem / Beleza</option>
                  <option>Casa / Cozinha</option>
                  <option>Eletrônicos / Gadgets</option>
                  <option>Moda / Roupas</option>
                  <option>Fitness / Academia</option>
                  <option>Petshop</option>
                  <option>Outro</option>
                </select>
              </div>
              {formData.niche === 'Outro' && (
                <Input
                  label="Digite o seu Nicho"
                  placeholder="Ex: Produtos Esotéricos"
                  value={formData.customNiche}
                  onChange={(e) => setFormData({ ...formData, customNiche: e.target.value })}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Características da Persona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textSecondary">Gênero</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option>Mulher</option>
                    <option>Homem</option>
                    <option>Qualquer</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textSecondary">Idade</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.ageGroup}
                    onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                  >
                    <option>18-24 anos</option>
                    <option>25-34 anos</option>
                    <option>35-44 anos</option>
                    <option>45+ anos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textSecondary">Etnia</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.ethnicity}
                    onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
                  >
                    <option>Indiferente (Deixe a IA escolher)</option>
                    <option>Branco</option>
                    <option>Negro</option>
                    <option>Pardo</option>
                    <option>Asiático</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textSecondary">Cabelo</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.hair}
                    onChange={(e) => setFormData({ ...formData, hair: e.target.value })}
                  >
                    <option>Indiferente</option>
                    <option>Loiro</option>
                    <option>Castanho</option>
                    <option>Preto</option>
                    <option>Ruivo</option>
                    <option>Careca</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary">Estilo de Roupa</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.style}
                  onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                >
                  <option>Casual / Dia a dia</option>
                  <option>Streetwear / Jovem</option>
                  <option>Gym / Roupa de Academia</option>
                  <option>Pijama / Home Office</option>
                  <option>Elegante / Social</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Button 
            className="w-full shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]" 
            size="lg" 
            onClick={generatePrompt}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><Wand2 className="w-5 h-5 mr-2" /> Gerar e Salvar no Histórico</>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2"><ImageIcon className="w-4 h-4 text-primary" /> Prompt de Imagem (Midjourney/Leonardo.ai)</CardTitle>
              {generatedImagePrompt && (
                <Button variant="secondary" size="sm" onClick={() => copyToClipboard(generatedImagePrompt, 'image')} className="h-7 text-xs">
                  {copiedImage ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  Copiar
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {generatedImagePrompt ? (
                <div className="bg-panelHover rounded-lg border border-border p-3 overflow-auto max-h-40">
                  <pre className="text-xs text-textSecondary whitespace-pre-wrap font-mono">
                    {generatedImagePrompt}
                  </pre>
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center text-textSecondary text-sm border border-dashed border-border rounded-lg bg-background/50">
                  Aguardando geração...
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex flex-col flex-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Code className="w-4 h-4 text-primary" /> Prompt de Roteiro (ChatGPT/Claude)</CardTitle>
              {generatedChatPrompt && (
                <Button variant="secondary" size="sm" onClick={() => copyToClipboard(generatedChatPrompt, 'chat')} className="h-7 text-xs">
                  {copiedChat ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  Copiar
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {generatedChatPrompt ? (
                <div className="bg-panelHover rounded-lg border border-border p-3 overflow-auto h-[400px]">
                  <pre className="text-xs text-textSecondary whitespace-pre-wrap font-mono">
                    {generatedChatPrompt}
                  </pre>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-textSecondary text-sm border border-dashed border-border rounded-lg bg-background/50">
                  Aguardando geração...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
