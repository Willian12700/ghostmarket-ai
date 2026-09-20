import { useState } from 'react'
import { Plus, GripVertical, Settings2, Trash2, Monitor, Smartphone, Globe, Play, CheckCircle2, Rocket, Image as ImageIcon, Link as LinkIcon, Wand2, Eye, Download, Code } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/toastStore'
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { generateSiteBlocks } from '@/lib/gemini'

type BlockContent = any;
type Block = { id: string; type: string; content: BlockContent };

const BLOCKS_TEMPLATE = [
  { id: 'hero', name: 'Hero Section', type: 'hero', icon: Monitor },
  { id: 'features', name: 'Funcionalidades', type: 'features', icon: Settings2 },
  { id: 'pricing', name: 'Preços', type: 'pricing', icon: Rocket },
  { id: 'cta', name: 'Chamada pra Ação', type: 'cta', icon: Play },
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

      {block.type === 'hero' && (
        <div className="py-20 px-6 md:px-12 text-center bg-gradient-to-b from-primary/10 to-transparent relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 outline-none max-w-4xl" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, 'title', e.currentTarget.textContent || '')}>
            {block.content.title}
          </h1>
          <p className="text-lg text-textSecondary max-w-2xl mx-auto mb-8 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, 'subtitle', e.currentTarget.textContent || '')}>
            {block.content.subtitle}
          </p>
          
          <div className="flex flex-col items-center group/btn relative mb-12">
            <Button size="lg" className="shadow-[0_0_20px_rgba(139,92,246,0.4)] pointer-events-none">
              <span contentEditable className="outline-none pointer-events-auto" suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, 'button', e.currentTarget.textContent || '')}>{block.content.button}</span>
            </Button>
            <div className="absolute top-full mt-2 opacity-0 group-hover/btn:opacity-100 transition-opacity z-10 flex items-center gap-2 bg-panel p-2 rounded-lg border border-border shadow-xl">
              <LinkIcon className="w-4 h-4 text-textSecondary" />
              <input type="text" placeholder="Link (ex: https://wa.me/123)" value={block.content.buttonLink || ''} onChange={(e) => onUpdate(block.id, 'buttonLink', e.target.value)} className="bg-background border border-border rounded px-2 py-1 text-xs text-white w-48" />
            </div>
          </div>

          <div className="relative group/img w-full max-w-3xl mx-auto">
            {block.content.imageUrl ? (
              <img src={block.content.imageUrl} alt="Hero" className="w-full h-auto rounded-2xl shadow-2xl object-cover" />
            ) : (
              <div className="w-full h-[300px] bg-panel/50 border-2 border-dashed border-border rounded-2xl flex items-center justify-center text-textSecondary">Sem Imagem</div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
              <div className="bg-panel p-3 rounded-xl border border-border shadow-xl flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-primary" />
                <input type="text" placeholder="Cole a URL da Imagem aqui..." value={block.content.imageUrl || ''} onChange={(e) => onUpdate(block.id, 'imageUrl', e.target.value)} className="bg-background border border-border rounded px-3 py-2 text-sm text-white w-64" />
              </div>
            </div>
          </div>
        </div>
      )}

      {block.type === 'features' && (
        <div className="py-20 px-6 md:px-12 bg-panel">
          <h2 className="text-3xl font-bold text-center text-white mb-12 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, 'title', e.currentTarget.textContent || '')}>
            {block.content.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[block.content.f1, block.content.f2, block.content.f3].map((f: string, i: number) => (
              <div key={i} className="p-6 rounded-xl border border-border bg-background text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, 'f' + (i + 1), e.currentTarget.textContent || '')}>
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
            <h3 className="text-xl font-bold text-white mb-2 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, 'title', e.currentTarget.textContent || '')}>
              {block.content.title}
            </h3>
            <div className="text-4xl font-extrabold text-primary mb-4 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, 'price', e.currentTarget.textContent || '')}>
              {block.content.price}
            </div>
            <p className="text-textSecondary mb-8 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, 'desc', e.currentTarget.textContent || '')}>
              {block.content.desc}
            </p>
            <div className="flex flex-col items-center group/btn relative">
              <Button className="w-full pointer-events-none">
                <span contentEditable className="outline-none pointer-events-auto" suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, 'button', e.currentTarget.textContent || '')}>{block.content.button || 'Comprar Agora'}</span>
              </Button>
              <div className="absolute top-full mt-2 opacity-0 group-hover/btn:opacity-100 transition-opacity z-10 flex items-center gap-2 bg-panel p-2 rounded-lg border border-border shadow-xl">
                <LinkIcon className="w-4 h-4 text-textSecondary" />
                <input type="text" placeholder="Link do Check-out" value={block.content.buttonLink || ''} onChange={(e) => onUpdate(block.id, 'buttonLink', e.target.value)} className="bg-background border border-border rounded px-2 py-1 text-xs text-white w-48" />
              </div>
            </div>
          </div>
        </div>
      )}

      {block.type === 'cta' && (
        <div className="py-24 px-6 md:px-12 bg-primary relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-8 relative z-10 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, 'title', e.currentTarget.textContent || '')}>
            {block.content.title}
          </h2>
          <div className="flex flex-col items-center group/btn relative z-10 w-max mx-auto">
            <Button size="lg" variant="secondary" className="text-primary font-bold shadow-2xl hover:scale-105 pointer-events-none">
              <span contentEditable className="outline-none pointer-events-auto" suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, 'button', e.currentTarget.textContent || '')}>{block.content.button}</span>
            </Button>
            <div className="absolute top-full mt-2 opacity-0 group-hover/btn:opacity-100 transition-opacity flex items-center gap-2 bg-panel p-2 rounded-lg border border-border shadow-xl">
              <LinkIcon className="w-4 h-4 text-textSecondary" />
              <input type="text" placeholder="Link (ex: https://wa.me/)" value={block.content.buttonLink || ''} onChange={(e) => onUpdate(block.id, 'buttonLink', e.target.value)} className="bg-background border border-border rounded px-2 py-1 text-xs text-white w-48" />
            </div>
          </div>
        </div>
      )}
    </Reorder.Item>
  )
}

export const SiteBuilder = () => {
  const { addToast } = useToastStore()
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop')
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  
  const generateExportHtml = () => {
    let html = '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Meu Site Gerado</title>\n<script src="https://cdn.tailwindcss.com"></script>\n<style>\n  :root { --color-primary: #8b5cf6; }\n  body { background-color: #0f172a; color: white; font-family: system-ui, -apple-system, sans-serif; }\n</style>\n</head>\n<body>\n';
    
    blocks.forEach(b => {
      if(b.type === 'hero') {
        html += `
        <div style="padding: 5rem 1.5rem; text-align: center; background: linear-gradient(to bottom, rgba(139,92,246,0.1), transparent);">
          <h1 style="font-size: 3rem; font-weight: 800; margin-bottom: 1.5rem;">${b.content.title}</h1>
          <p style="font-size: 1.125rem; color: #94a3b8; max-width: 42rem; margin: 0 auto 2rem;">${b.content.subtitle}</p>
          <a href="${b.content.buttonLink || '#'}" style="display: inline-block; background: #8b5cf6; color: white; padding: 1rem 2rem; border-radius: 9999px; font-weight: bold; text-decoration: none; margin-bottom: 3rem;">${b.content.button}</a>
          <br/>
          <img src="${b.content.imageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'}" style="width: 100%; max-width: 64rem; border-radius: 1rem; margin: 0 auto; display: block; object-fit: cover;" alt="Hero">
        </div>`;
      }
      if(b.type === 'features') {
        html += `
        <div style="padding: 5rem 1.5rem; background: #1e293b;">
          <h2 style="font-size: 2.25rem; font-weight: bold; text-align: center; margin-bottom: 3rem;">${b.content.title}</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; max-width: 64rem; margin: 0 auto;">
            <div style="padding: 1.5rem; background: #0f172a; border-radius: 0.75rem; text-align: center;"><h3 style="font-size: 1.25rem; font-weight: bold;">${b.content.f1}</h3></div>
            <div style="padding: 1.5rem; background: #0f172a; border-radius: 0.75rem; text-align: center;"><h3 style="font-size: 1.25rem; font-weight: bold;">${b.content.f2}</h3></div>
            <div style="padding: 1.5rem; background: #0f172a; border-radius: 0.75rem; text-align: center;"><h3 style="font-size: 1.25rem; font-weight: bold;">${b.content.f3}</h3></div>
          </div>
        </div>`;
      }
      if(b.type === 'pricing') {
        html += `
        <div style="padding: 5rem 1.5rem; background: #0f172a;">
          <div style="max-width: 24rem; margin: 0 auto; padding: 2rem; background: #1e293b; border-radius: 1rem; text-align: center; border: 1px solid rgba(139,92,246,0.5);">
            <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem;">${b.content.title}</h3>
            <div style="font-size: 2.25rem; font-weight: 800; color: #8b5cf6; margin-bottom: 1rem;">${b.content.price}</div>
            <p style="color: #94a3b8; margin-bottom: 2rem;">${b.content.desc}</p>
            <a href="${b.content.buttonLink || '#'}" style="display: block; width: 100%; background: #8b5cf6; color: white; padding: 1rem; border-radius: 0.5rem; font-weight: bold; text-decoration: none;">${b.content.button}</a>
          </div>
        </div>`;
      }
      if(b.type === 'cta') {
        html += `
        <div style="padding: 5rem 1.5rem; background: #1e293b; text-align: center;">
          <h2 style="font-size: 2.25rem; font-weight: bold; margin-bottom: 2rem;">${b.content.title}</h2>
          <a href="${b.content.buttonLink || '#'}" style="display: inline-block; background: #8b5cf6; color: white; padding: 1rem 3rem; border-radius: 9999px; font-weight: bold; text-decoration: none; font-size: 1.125rem;">${b.content.button}</a>
        </div>`;
      }
    });
    
    html += '\n</body>\n</html>';
    return html;
  }
  
  const handleExport = () => {
    const html = generateExportHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meu-site-ghostmarket.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
  }

  const [domainName, setDomainName] = useState('')
  const [domainType, setDomainType] = useState<'subdomain' | 'custom'>('subdomain')
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', type: 'hero', content: { title: 'Construa o Futuro do Seu Negócio', subtitle: 'A plataforma definitiva para criar landing pages de alta conversão em minutos.', button: 'Começar Agora', buttonLink: '', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80' } },
    { id: '2', type: 'features', content: { title: 'Recursos Exclusivos', f1: 'IA Integrada', f2: 'Design Premium', f3: 'Domínio Próprio' } }
  ])

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

  const handleAddBlock = (type: string) => {
    const newBlock = { id: Date.now().toString(), type, content: {} as any }
    if (type === 'hero') newBlock.content = { title: 'Novo Título', subtitle: 'Nova descrição', button: 'Clique Aqui' }
    if (type === 'features') newBlock.content = { title: 'Recursos', f1: 'Item 1', f2: 'Item 2', f3: 'Item 3' }
    if (type === 'pricing') newBlock.content = { title: 'Planos', price: 'R$ 97/mês', desc: 'Acesso completo', button: 'Comprar' }
    if (type === 'cta') newBlock.content = { title: 'Pronto para começar?', button: 'Assinar Agora' }
    setBlocks([...blocks, newBlock])
  }

  const handleRemoveBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id))
  }

  const handleUpdateBlock = (id: string, field: string, value: string) => {
    setBlocks(blocks.map(b => {
      if (b.id === id) {
        return { ...b, content: { ...b.content, [field]: value } }
      }
      return b
    }))
  }

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domainName) {
      addToast('Digite um nome para o domínio', 'error')
      return
    }

    setIsPublishing(true)
    try {
      const siteId = domainName.toLowerCase().replace(/[^a-z0-9-]/g, '')
      await setDoc(doc(db, 'sites', siteId), {
        blocks,
        domainType,
        domainName: siteId,
        createdAt: new Date().toISOString()
      })
      
      setIsPublishModalOpen(false)
      addToast('Site publicado com sucesso!', 'success')
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

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-background border border-border p-1 rounded-lg hidden sm:flex">
            <button onClick={() => setActiveView('desktop')} className={`p-1.5 rounded-md transition-all ${activeView === 'desktop' ? 'bg-panel text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}><Monitor className="w-4 h-4" /></button>
            <button onClick={() => setActiveView('mobile')} className={`p-1.5 rounded-md transition-all ${activeView === 'mobile' ? 'bg-panel text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}><Smartphone className="w-4 h-4" /></button>
          </div>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <Button variant="ghost" className="hidden sm:flex hover:bg-primary/20 hover:text-primary transition-colors" onClick={() => setIsExportModalOpen(true)}><Download className="w-4 h-4 mr-2" /> Exportar Código</Button>
          <Button variant="ghost" className="hidden sm:flex" onClick={() => window.open('/s/preview', '_blank')}><Eye className="w-4 h-4 mr-2" /> Preview</Button>
          <Button onClick={() => setIsPublishModalOpen(true)} className="shadow-[0_0_15px_rgba(139,92,246,0.3)]"><Globe className="w-4 h-4 mr-2" /> Publicar</Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r border-border bg-panel/50 p-4 flex flex-col gap-4 overflow-y-auto shrink-0 hidden md:flex custom-scrollbar">
          <div>
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-3">Adicionar Blocos</h3>
            <div className="grid grid-cols-1 gap-2">
              {BLOCKS_TEMPLATE.map(block => (
                <div key={block.id} onClick={() => handleAddBlock(block.type)} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group">
                  <div className="p-2 rounded-md bg-panel group-hover:bg-primary/20 transition-colors">
                    <block.icon className="w-4 h-4 text-textSecondary group-hover:text-primary" />
                  </div>
                  <div className="flex-1 text-sm font-medium text-textSecondary group-hover:text-white transition-colors">{block.name}</div>
                  <Plus className="w-4 h-4 text-textSecondary/50 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-background overflow-y-auto flex justify-center p-4 md:p-8 custom-scrollbar">
          <div className={`transition-all duration-500 ease-in-out border border-border rounded-xl bg-panel shadow-2xl overflow-hidden relative ${activeView === 'mobile' ? 'w-[375px] min-h-[812px]' : 'w-full max-w-5xl min-h-[800px]'}`}>
            <div className="h-8 bg-background border-b border-border flex items-center px-4 gap-2 opacity-50">
              <div className="w-2.5 h-2.5 rounded-full bg-error" />
              <div className="w-2.5 h-2.5 rounded-full bg-warning" />
              <div className="w-2.5 h-2.5 rounded-full bg-success" />
            </div>

            <div className="w-full h-[calc(100%-2rem)] overflow-y-auto overflow-x-hidden relative">
              <Reorder.Group axis="y" values={blocks} onReorder={setBlocks} className="w-full h-full min-h-[500px]">
                {blocks.map((block) => (
                  <BlockItem key={block.id} block={block} onRemove={handleRemoveBlock} onUpdate={handleUpdateBlock} />
                ))}
              </Reorder.Group>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-panel border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Publicar Site</h3>
                <button onClick={() => setIsPublishModalOpen(false)} className="text-textSecondary hover:text-white transition-colors">x</button>
              </div>
              <form onSubmit={handlePublish} className="p-6 space-y-6">
                <div className="flex p-1 bg-background border border-border rounded-lg">
                  <button type="button" onClick={() => setDomainType('subdomain')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${domainType === 'subdomain' ? 'bg-panel text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}>Subdomínio Gratuito</button>
                  <button type="button" onClick={() => setDomainType('custom')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${domainType === 'custom' ? 'bg-panel text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}>Domínio Próprio</button>
                </div>
                {domainType === 'subdomain' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-textSecondary">Escolha seu endereço</label>
                    <div className="flex relative items-center">
                      <Input value={domainName} onChange={(e) => setDomainName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="meu-negocio" className="pr-[140px]" />
                      <span className="absolute right-4 text-textSecondary text-sm font-medium pointer-events-none">.ghostmarket.ai</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2"><label className="text-sm font-medium text-textSecondary">Seu Domínio</label><Input value={domainName} onChange={(e) => setDomainName(e.target.value.toLowerCase())} placeholder="www.meusite.com.br" /></div>
                  </div>
                )}
                <div className="pt-2 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsPublishModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={isPublishing} className="shadow-[0_0_15px_rgba(139,92,246,0.3)]">{isPublishing ? 'Publicando...' : 'Publicar Agora'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {isExportModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-panel border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Code className="w-5 h-5 text-primary" /> Exportar Código HTML</h3>
                <button onClick={() => setIsExportModalOpen(false)} className="text-textSecondary hover:text-white transition-colors">x</button>
              </div>
              <div className="p-6 space-y-6">
                <p className="text-textSecondary text-sm">Baixe o código fonte completo do seu site. Você receberá um arquivo .html único com Tailwind CSS embutido, pronto para hospedar em qualquer lugar (Hostinger, Vercel, Netlify, CPanel, etc).</p>
                <div className="p-4 bg-background border border-border rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-white mb-1">100% Seu</p>
                    <p className="text-textSecondary">O código é seu e independente da nossa plataforma.</p>
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsExportModalOpen(false)}>Cancelar</Button>
                  <Button type="button" onClick={handleExport} className="shadow-[0_0_15px_rgba(139,92,246,0.3)]"><Download className="w-4 h-4 mr-2" /> Baixar .HTML</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
