import { useState } from 'react'
import { Monitor, Smartphone, Globe, Rocket, Eye, Download, Code, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/toastStore'
import { motion, AnimatePresence } from 'framer-motion'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { generateHtmlSite } from '@/lib/gemini'

export const SiteBuilder = () => {
  const { addToast } = useToastStore()
  
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop')
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual')
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [domainType, setDomainType] = useState<'subdomain' | 'custom'>('subdomain')
  const [domainName, setDomainName] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  const [rawHtml, setRawHtml] = useState(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GhostMarket AI</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white min-h-screen flex items-center justify-center">
    <div class="text-center p-8 bg-gray-800 rounded-2xl shadow-2xl max-w-lg border border-purple-500/30">
        <h1 class="text-4xl font-bold mb-4 text-purple-400">Site Vazio</h1>
        <p class="text-gray-300 mb-6">Use o campo de texto acima para pedir para a IA gerar um site profissional do zero em 10 segundos!</p>
    </div>
</body>
</html>`)

  const handleGenerateSite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiPrompt.trim()) return

    setIsGenerating(true)
    addToast('A IA está codificando seu site do zero...', 'success')

    try {
      const generatedHtml = await generateHtmlSite(aiPrompt)
      setRawHtml(generatedHtml)
      addToast('Site gerado com sucesso!', 'success')
      setEditorMode('visual') // Switch to visual to see the magic
    } catch (error) {
      console.error(error)
      addToast('Erro ao gerar site. Tente novamente.', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domainName.trim()) {
      addToast('Defina um domínio', 'error')
      return
    }

    setIsPublishing(true)
    try {
      const siteId = domainName.toLowerCase().replace(/[^a-z0-9-]/g, '')
      const fullDomain = domainType === 'subdomain' ? `${siteId}.ghostmarket.ai` : siteId
      
      await setDoc(doc(db, 'sites', siteId), {
        id: siteId,
        rawHtml,
        domain: fullDomain,
        domainType,
        publishedAt: new Date().toISOString()
      })

      addToast('Site publicado com sucesso!', 'success')
      setIsPublishModalOpen(false)
    } catch (error) {
      console.error(error)
      addToast('Erro ao publicar', 'error')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleExport = () => {
    const blob = new Blob([rawHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meu-site-ghostmarket.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Download iniciado!', 'success');
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#0b0416]">
      {/* BUILDER HEADER */}
      <div className="h-16 border-b border-border bg-panel flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            AI Website Generator <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20">PRO</span>
          </h2>
        </div>
        
        <form onSubmit={handleGenerateSite} className="flex-1 max-w-2xl mx-8 relative hidden md:block">
          <Wand2 className="w-4 h-4 text-primary absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={isGenerating}
            placeholder={isGenerating ? "IA programando o HTML..." : "Ex: Crie uma landing page de alta conversão para meu ebook de emagrecimento..."} 
            className="w-full bg-background border border-primary/30 rounded-full py-2 pl-11 pr-32 text-sm text-white focus:outline-none focus:border-primary transition-all disabled:opacity-50" 
          />
          <Button type="submit" disabled={isGenerating || !aiPrompt.trim()} size="sm" className="absolute right-1 top-1 h-7 rounded-full text-xs px-4">
            {isGenerating ? 'Gerando...' : 'Gerar Site Agora'}
          </Button>
        </form>

        <div className="flex items-center gap-4">
          {/* Editor Mode Toggle */}
          <div className="flex items-center gap-1 bg-background border border-border p-1 rounded-lg hidden sm:flex mr-2">
            <button onClick={() => setEditorMode('visual')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${editorMode === 'visual' ? 'bg-primary text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}><Eye className="w-3.5 h-3.5" /> Visual</button>
            <button onClick={() => setEditorMode('code')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${editorMode === 'code' ? 'bg-primary text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}><Code className="w-3.5 h-3.5" /> HTML</button>
          </div>

          <div className="flex items-center gap-1 bg-background border border-border p-1 rounded-lg hidden sm:flex">
            <button onClick={() => setActiveView('desktop')} className={`p-1.5 rounded-md transition-all ${activeView === 'desktop' ? 'bg-panel text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}><Monitor className="w-4 h-4" /></button>
            <button onClick={() => setActiveView('mobile')} className={`p-1.5 rounded-md transition-all ${activeView === 'mobile' ? 'bg-panel text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}><Smartphone className="w-4 h-4" /></button>
          </div>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <Button variant="ghost" className="hidden sm:flex hover:bg-primary/20 hover:text-primary transition-colors" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Baixar HTML</Button>
          <Button onClick={() => setIsPublishModalOpen(true)} className="shadow-[0_0_15px_rgba(139,92,246,0.3)]"><Globe className="w-4 h-4 mr-2" /> Publicar</Button>
        </div>
      </div>

      {/* CANVAS AREA */}
      <div className="flex-1 overflow-hidden relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat flex flex-col items-center">
        <div className="absolute inset-0 bg-[#0b0416]/95 z-0" />
        
        {/* Render Mode */}
        <div className="z-10 w-full h-full flex flex-col items-center p-4 md:p-8 overflow-y-auto custom-scrollbar">
          
          {editorMode === 'visual' ? (
            <div className={`transition-all duration-500 ease-in-out border border-border rounded-xl bg-white shadow-2xl overflow-hidden relative flex-shrink-0 ${activeView === 'mobile' ? 'w-[375px] min-h-[812px] ring-[12px] ring-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] mt-4 mb-8' : 'w-full max-w-5xl min-h-[800px] h-full flex flex-col'}`}>
              {activeView === 'mobile' && (
                <div className="absolute top-0 inset-x-0 h-7 bg-zinc-900 z-50 flex justify-center rounded-b-3xl w-[150px] mx-auto pointer-events-none">
                  <div className="w-16 h-4 bg-black rounded-full mt-1.5 opacity-50"></div>
                </div>
              )}
              {isGenerating ? (
                <div className="w-full h-full min-h-[800px] flex flex-col items-center justify-center bg-gray-900 text-white">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-medium animate-pulse text-primary">A Inteligência Artificial está escrevendo o HTML e CSS do seu site...</p>
                </div>
              ) : (
                <iframe 
                  srcDoc={rawHtml} 
                  className={`w-full bg-white ${activeView === 'mobile' ? 'h-[812px]' : 'flex-1 min-h-[800px]'}`} 
                  frameBorder="0"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
                />
              )}
            </div>
          ) : (
            <div className="w-full max-w-5xl h-full flex flex-col rounded-xl border border-border shadow-2xl overflow-hidden bg-panel">
              <div className="bg-background border-b border-border p-3 flex items-center justify-between">
                <span className="text-sm font-medium text-textSecondary font-mono">index.html</span>
                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded font-bold">Modo Desenvolvedor</span>
              </div>
              <textarea 
                value={rawHtml}
                onChange={(e) => setRawHtml(e.target.value)}
                className="flex-1 w-full p-6 bg-[#0d1117] text-gray-300 font-mono text-sm focus:outline-none resize-none custom-scrollbar leading-relaxed"
                spellCheck={false}
              />
            </div>
          )}

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
      </AnimatePresence>
    </div>
  )
}
