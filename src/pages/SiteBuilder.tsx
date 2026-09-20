import { useState } from 'react'
import { Plus, GripVertical, Settings2, Trash2, Monitor, Smartphone, Globe, Play, CheckCircle2, Rocket, Eye, Server, LayoutTemplate } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/toastStore'
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { generateSiteBlocks } from '@/lib/gemini'
import { Wand2 } from 'lucide-react'

type BlockContent = any;
type Block = { id: string; type: string; content: BlockContent };

// Mock de Componentes Disponíveis
const BLOCKS_TEMPLATE = [
  { id: 'hero', name: 'Hero Section', type: 'header', icon: Monitor },
  { id: 'features', name: 'Funcionalidades', type: 'grid', icon: Settings2 },
  { id: 'pricing', name: 'Preços', type: 'pricing', icon: Rocket },
  { id: 'cta', name: 'Chamada pra Ação', type: 'action', icon: Play },
]


const BlockItem = ({ block, onRemove, onUpdate }: { block: Block, onRemove: (id: string) => void, onUpdate: (id: string, field: string, value: string) => void }) => {
  const controls = useDragControls()
  return (
    <Reorder.Item
      value={block}
      dragListener={false}
      dragControls={controls}
      className="group relative border-2 border-transparent hover:border-primary/50 transition-colors bg-background"
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-2">
        <button 
          onPointerDown={(e) => controls.start(e)}
          className="p-2 rounded-md bg-panel border border-border text-textSecondary hover:text-white shadow-lg cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button onClick={() => onRemove(block.id)} className="p-2 rounded-md bg-panel border border-border text-error hover:bg-error/10 shadow-lg">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      
      {block.type === 'custom-html' && (
        <div 
          className="w-full text-left"
          dangerouslySetInnerHTML={{ __html: block.content.html }} 
        />
      )}

      {block.type === 'hero' && (
        <div className="py-20 px-6 md:px-12 text-center bg-gradient-to-b from-primary/10 to-transparent relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
          <h1 
            className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, 'title', e.currentTarget.textContent || '')}
          >
            {block.content.title}
          </h1>
          <p 
            className="text-lg text-textSecondary max-w-2xl mx-auto mb-8 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, 'subtitle', e.currentTarget.textContent || '')}
          >
            {block.content.subtitle}
          </p>
          <Button size="lg" className="shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            {block.content.button}
          </Button>
        </div>
      )}

      {block.type === 'features' && (
        <div className="py-20 px-6 md:px-12 bg-panel">
          <h2 
            className="text-3xl font-bold text-center text-white mb-12 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, 'title', e.currentTarget.textContent || '')}
          >
            {block.content.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[block.content.f1, block.content.f2, block.content.f3].map((f: string, i: number) => (
              <div key={i} className="p-6 rounded-xl border border-border bg-background text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 
                  className="text-lg font-bold text-white outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, 'f' + (i + 1), e.currentTarget.textContent || '')}
                >
                  {f}
                </h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {block.type === 'pricing' && (
        <div className="py-20 px-6 md:px-12 bg-background">
          <div className="max-w-sm mx-auto p-8 rounded-2xl border border-primary/50 bg-panel shadow-[0_0_30px_rgba(139,92,246,0.15)] text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-purple-400" />
            <h3 
              className="text-xl font-bold text-white mb-2 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, 'title', e.currentTarget.textContent || '')}
            >
              {block.content.title}
            </h3>
            <div 
              className="text-4xl font-extrabold text-primary mb-4 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, 'price', e.currentTarget.textContent || '')}
            >
              {block.content.price}
            </div>
            <p 
              className="text-textSecondary mb-8 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, 'desc', e.currentTarget.textContent || '')}
            >
              {block.content.desc}
            </p>
            <Button className="w-full">Comprar Agora</Button>
          </div>
        </div>
      )}

      {block.type === 'cta' && (
        <div className="py-24 px-6 md:px-12 text-center bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          <h2 
            className="text-3xl md:text-5xl font-extrabold text-white mb-8 relative z-10 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, 'title', e.currentTarget.textContent || '')}
          >
            {block.content.title}
          </h2>
          <button className="bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl relative z-10">
            {block.content.button}
          </button>
        </div>
      )}
    </Reorder.Item>
  )
}


export const SiteBuilder = () => {
  const { addToast } = useToastStore()
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop')
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [domainName, setDomainName] = useState('')
  const [domainType, setDomainType] = useState<'subdomain' | 'custom'>('subdomain')
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateSite = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsGenerating(true)
    addToast('A IA está criando seu site. Isso leva uns segundos...', 'success')
    try {
      const generatedBlocks = await generateSiteBlocks(aiPrompt)
      setBlocks(generatedBlocks)
      addToast('Site gerado com sucesso pela IA!', 'success')
      setAiPrompt('')
    } catch (err: any) {
      if (err.message.includes('VITE_GEMINI_API_KEY')) {
        addToast('Configure a VITE_GEMINI_API_KEY no painel da Vercel ou .env', 'error')
      } else {
        addToast('Erro ao gerar site com IA.', 'error')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', type: 'hero', content: { title: 'Construa o Futuro do Seu Negócio', subtitle: 'A plataforma definitiva para criar landing pages de alta conversão em minutos, sem escrever uma única linha de código.', button: 'Começar Agora' } },
    { id: '2', type: 'features', content: { title: 'Recursos Exclusivos', f1: 'IA Integrada', f2: 'Design Premium', f3: 'Domínio Próprio' } }
  ])

  const handleAddBlock = (type: string) => {
    const newBlock = { id: Date.now().toString(), type, content: {} }
    if (type === 'hero') newBlock.content = { title: 'Novo Título', subtitle: 'Nova descrição', button: 'Clique Aqui' }
    if (type === 'features') newBlock.content = { title: 'Recursos', f1: 'Item 1', f2: 'Item 2', f3: 'Item 3' }
    if (type === 'pricing') newBlock.content = { title: 'Planos', price: 'R$ 97/mês', desc: 'Acesso completo' }
    if (type === 'cta') newBlock.content = { title: 'Pronto para começar?', button: 'Assinar Agora' }
    
    setBlocks([...blocks, newBlock])
    addToast('Bloco adicionado!', 'success')
  }

  
  const handleUpdateBlock = (id: string, field: string, value: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, [field]: value } } : b))
  }

  const handleRemoveBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id))
    addToast('Bloco removido!', 'success')
  }

  const [isPublishing, setIsPublishing] = useState(false)

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domainName) {
      addToast('Digite um endereço válido', 'error')
      return
    }
    
    const siteId = domainName.toLowerCase().replace(/[^a-z0-9-]/g, '')

    setIsPublishing(true)
    addToast('Publicando site...', 'success')
    
    try {
      await setDoc(doc(db, 'sites', siteId), {
        blocks,
        domainType,
        domainName: siteId,
        createdAt: new Date().toISOString()
      })
      
      setIsPublishModalOpen(false)
      addToast('Site publicado com sucesso!', 'success')
      
      // Open the viewer route
      window.open(`/s/${siteId}`, '_blank')
    } catch (err) {
      console.error(err)
      addToast('Erro ao publicar site', 'error')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -m-4 md:-m-8 bg-background">
      {/* Topbar do Editor */}
      <div className="h-14 border-b border-border bg-panel flex items-center justify-between px-4 shrink-0 shadow-sm z-10 relative">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Ghost Builder <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20">BETA</span>
          </h2>
        </div>

        <form onSubmit={handleGenerateSite} className="flex-1 max-w-2xl mx-8 relative hidden md:block">
          <Wand2 className="w-4 h-4 text-primary absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={isGenerating}
            placeholder={isGenerating ? "IA trabalhando..." : "Ex: Crie uma landing page para minha barbearia premium..."} 
            className="w-full bg-background border border-primary/30 rounded-full py-2 pl-11 pr-32 text-sm text-white focus:outline-none focus:border-primary transition-all disabled:opacity-50" 
          />
          <Button type="submit" disabled={isGenerating || !aiPrompt.trim()} size="sm" className="absolute right-1 top-1 h-7 rounded-full text-xs px-4">
            {isGenerating ? 'Gerando...' : 'Gerar com IA'}
          </Button>
        </form>
        
        <div className="flex items-center gap-1 bg-background border border-border p-1 rounded-lg">
          <button 
            onClick={() => setActiveView('desktop')}
            className={`p-1.5 rounded-md transition-all ${activeView === 'desktop' ? 'bg-panel text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setActiveView('mobile')}
            className={`p-1.5 rounded-md transition-all ${activeView === 'mobile' ? 'bg-panel text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" className="hidden md:flex">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button size="sm" onClick={() => setIsPublishModalOpen(true)} className="shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <Globe className="w-4 h-4 mr-2" />
            Publicar
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Esquerda - Componentes */}
        <div className="w-64 border-r border-border bg-panel/50 p-4 flex flex-col gap-4 overflow-y-auto shrink-0 hidden md:flex custom-scrollbar">
          <div>
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-3">Adicionar Blocos</h3>
            <div className="grid grid-cols-1 gap-2">
              {BLOCKS_TEMPLATE.map(block => (
                <div 
                  key={block.id}
                  onClick={() => handleAddBlock(block.type)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
                >
                  <div className="p-2 rounded-md bg-panel group-hover:bg-primary/20 transition-colors">
                    <block.icon className="w-4 h-4 text-textSecondary group-hover:text-primary" />
                  </div>
                  <div className="flex-1 text-sm font-medium text-textSecondary group-hover:text-white transition-colors">
                    {block.name}
                  </div>
                  <Plus className="w-4 h-4 text-textSecondary/50 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-3">Estilo Global</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-textSecondary mb-1.5 block">Cores Principais</label>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#8B5CF6] border-2 border-white/20 cursor-pointer shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                  <div className="w-8 h-8 rounded-full bg-[#3B82F6] border-2 border-transparent cursor-pointer opacity-50 hover:opacity-100" />
                  <div className="w-8 h-8 rounded-full bg-[#10B981] border-2 border-transparent cursor-pointer opacity-50 hover:opacity-100" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Canvas (Onde a mágica acontece) */}
        <div className="flex-1 bg-background overflow-y-auto flex justify-center p-4 md:p-8 custom-scrollbar">
          <div 
            className={`transition-all duration-500 ease-in-out border border-border rounded-xl bg-panel shadow-2xl overflow-hidden relative ${
              activeView === 'mobile' ? 'w-[375px] min-h-[812px]' : 'w-full max-w-5xl min-h-[800px]'
            }`}
          >
            {/* Fake Browser Header */}
            <div className="h-8 bg-background border-b border-border flex items-center px-4 gap-2 opacity-50">
              <div className="w-2.5 h-2.5 rounded-full bg-error" />
              <div className="w-2.5 h-2.5 rounded-full bg-warning" />
              <div className="w-2.5 h-2.5 rounded-full bg-success" />
            </div>

            {/* Página Renderizada */}
            <div className="w-full h-[calc(100%-2rem)] overflow-y-auto overflow-x-hidden relative">
              
<Reorder.Group axis="y" values={blocks} onReorder={setBlocks} className="w-full h-full min-h-[500px]">
  {blocks.map((block) => (
    <BlockItem key={block.id} block={block} onRemove={handleRemoveBlock} onUpdate={handleUpdateBlock} />
  ))}
</Reorder.Group>

              
              {blocks.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-textSecondary">
                  <LayoutTemplate className="w-16 h-16 mb-4 opacity-20" />
                  <p>Arraste ou clique em blocos na barra lateral para construir a página.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Publicação */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-panel border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Publicar Site
                </h3>
                <button onClick={() => setIsPublishModalOpen(false)} className="text-textSecondary hover:text-white transition-colors">x</button>
              </div>
              <form onSubmit={handlePublish} className="p-6 space-y-6">
                
                <div className="flex p-1 bg-background border border-border rounded-lg">
                  <button 
                    type="button"
                    onClick={() => setDomainType('subdomain')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${domainType === 'subdomain' ? 'bg-panel text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}
                  >
                    Subdomínio Gratuito
                  </button>
                  <button 
                    type="button"
                    onClick={() => setDomainType('custom')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${domainType === 'custom' ? 'bg-panel text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}
                  >
                    Domínio Próprio
                  </button>
                </div>

                {domainType === 'subdomain' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-textSecondary">Escolha seu endereço</label>
                    <div className="flex relative items-center">
                      <Input
                        value={domainName}
                        onChange={(e) => setDomainName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="meu-negocio"
                        className="pr-[140px]"
                      />
                      <span className="absolute right-4 text-textSecondary text-sm font-medium pointer-events-none">
                        .ghostmarket.ai
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-textSecondary">Seu Domínio</label>
                      <Input
                        value={domainName}
                        onChange={(e) => setDomainName(e.target.value.toLowerCase())}
                        placeholder="www.meusite.com.br"
                      />
                    </div>
                    
                    <div className="bg-background border border-border rounded-lg p-4">
                      <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                        <Server className="w-4 h-4 text-warning" />
                        Configuração de DNS Necessária
                      </h4>
                      <p className="text-xs text-textSecondary mb-3">
                        Para usar seu domínio próprio, adicione o seguinte registro no seu provedor (Hostinger, Registro.br, etc):
                      </p>
                      <div className="flex flex-col gap-2 bg-panel p-3 rounded border border-border">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-textSecondary">Tipo</span>
                          <span className="text-white">CNAME</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-textSecondary">Nome</span>
                          <span className="text-white">www</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-textSecondary">Valor</span>
                          <span className="text-primary">cname.vercel-dns.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsPublishModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isPublishing} className="shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                    {isPublishing ? 'Publicando...' : 'Publicar Agora'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
