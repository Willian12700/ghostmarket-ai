import { useState, useEffect, useRef } from 'react'
import { Monitor, Smartphone, Globe, UploadCloud, Eye, Download, Code, FileCode2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/toastStore'
import { motion, AnimatePresence } from 'framer-motion'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'

export const SiteBuilder = () => {
  const { addToast } = useToastStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop')
  const [editorMode, setEditorMode] = useState<'code' | 'visual'>('code')
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [domainType, setDomainType] = useState<'subdomain' | 'custom'>('subdomain')
  const [domainName, setDomainName] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  
  const [rawHtml, setRawHtml] = useState(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minha Landing Page</title>
    <!-- Cole seu código HTML, CSS e JS aqui! -->
</head>
<body>
    <h1>Site Hospedado no GhostMarket</h1>
</body>
</html>`)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.html')) {
      addToast('Por favor, faça upload de um arquivo .html', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setRawHtml(content)
      setEditorMode('visual')
      addToast('Arquivo carregado com sucesso!', 'success')
    }
    reader.readAsText(file)
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

      addToast('Site hospedado e publicado com sucesso!', 'success')
      setIsPublishModalOpen(false)
    } catch (error) {
      console.error(error)
      addToast('Erro ao publicar', 'error')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#0b0416]">
      {/* BUILDER HEADER */}
      <div className="h-16 border-b border-border bg-panel flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-primary" />
            Hospedagem Expressa
          </h2>
        </div>
        
        <div className="flex items-center gap-4 ml-auto">
          <input 
            type="file" 
            accept=".html" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <Button variant="outline" className="hidden md:flex bg-background border-primary/30 text-white hover:bg-primary/20" onClick={() => fileInputRef.current?.click()}>
            <FileCode2 className="w-4 h-4 mr-2 text-primary" /> Fazer Upload de .HTML
          </Button>

          <div className="h-6 w-px bg-border hidden sm:block" />

          {/* Editor Mode Toggle */}
          <div className="flex items-center gap-1 bg-background border border-border p-1 rounded-lg hidden sm:flex">
            <button onClick={() => setEditorMode('code')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${editorMode === 'code' ? 'bg-primary text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}><Code className="w-3.5 h-3.5" /> Código HTML</button>
            <button onClick={() => setEditorMode('visual')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${editorMode === 'visual' ? 'bg-primary text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}><Eye className="w-3.5 h-3.5" /> Preview Visual</button>
          </div>

          <div className="flex items-center gap-1 bg-background border border-border p-1 rounded-lg hidden sm:flex">
            <button onClick={() => setActiveView('desktop')} className={`p-1.5 rounded-md transition-all ${activeView === 'desktop' ? 'bg-panel text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}><Monitor className="w-4 h-4" /></button>
            <button onClick={() => setActiveView('mobile')} className={`p-1.5 rounded-md transition-all ${activeView === 'mobile' ? 'bg-panel text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}><Smartphone className="w-4 h-4" /></button>
          </div>

          <Button onClick={() => setIsPublishModalOpen(true)} className="shadow-[0_0_15px_rgba(139,92,246,0.3)]"><Globe className="w-4 h-4 mr-2" /> Hospedar e Publicar</Button>
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
              <iframe 
                srcDoc={rawHtml} 
                className={`w-full bg-white ${activeView === 'mobile' ? 'h-[812px]' : 'flex-1 min-h-[800px]'}`} 
                frameBorder="0"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
              />
            </div>
          ) : (
            <div className="w-full max-w-5xl h-full flex flex-col rounded-xl border border-border shadow-2xl overflow-hidden bg-panel">
              <div className="bg-background border-b border-border p-3 flex items-center justify-between">
                <span className="text-sm font-medium text-textSecondary font-mono">index.html</span>
                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded font-bold">Cole o código do seu site aqui</span>
              </div>
              <textarea 
                value={rawHtml}
                onChange={(e) => setRawHtml(e.target.value)}
                className="flex-1 w-full p-6 bg-[#0d1117] text-gray-300 font-mono text-sm focus:outline-none resize-none custom-scrollbar leading-relaxed"
                spellCheck={false}
                placeholder="Cole o código HTML da sua Landing Page aqui..."
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
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Publicar e Hospedar</h3>
                <button onClick={() => setIsPublishModalOpen(false)} className="text-textSecondary hover:text-white transition-colors">x</button>
              </div>
              <form onSubmit={handlePublish} className="p-6 space-y-6">
                <div className="flex p-1 bg-background border border-border rounded-lg">
                  <button type="button" onClick={() => setDomainType('subdomain')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${domainType === 'subdomain' ? 'bg-panel text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}>Subdomínio Gratuito</button>
                  <button type="button" onClick={() => setDomainType('custom')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${domainType === 'custom' ? 'bg-panel text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}>Domínio Próprio</button>
                </div>
                {domainType === 'subdomain' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-textSecondary">Escolha a URL da sua Landing Page</label>
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
                  <Button type="submit" disabled={isPublishing} className="shadow-[0_0_15px_rgba(139,92,246,0.3)]">{isPublishing ? 'Hospedando...' : 'Colocar no Ar Agora'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
