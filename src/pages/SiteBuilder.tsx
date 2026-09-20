import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getDoc } from 'firebase/firestore'
import { useAuthStore } from '@/store/authStore'
import { Globe, UploadCloud, ChevronRight, ChevronLeft, CheckCircle2, FileCode2, Monitor, Smartphone, Shield, Bot } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/toastStore'
import { motion, AnimatePresence } from 'framer-motion'
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore'
import { db } from '@/config/firebase'

export const SiteBuilder = () => {
  const { addToast } = useToastStore()
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  
  const [step, setStep] = useState(1)
  const [htmlContent, setHtmlContent] = useState('')
  const [cssContent, setCssContent] = useState('')
  const [jsContent, setJsContent] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop')
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [domainType, setDomainType] = useState<'subdomain' | 'custom'>('subdomain')
  const [domainName, setDomainName] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadType, setUploadType] = useState<'html'|'css'|'js'>('html')
  const [isProtectionEnabled, setIsProtectionEnabled] = useState(false)
  const [chatbots, setChatbots] = useState<any[]>([])
  const [selectedBotId, setSelectedBotId] = useState('')

  
  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'chatbots'), where('userId', '==', user.uid))
      getDocs(q).then(snap => {
        const bots: any[] = []
        snap.forEach(d => bots.push({ id: d.id, ...d.data() }))
        setChatbots(bots)
      })
    }
  }, [user])
  
  useEffect(() => {
      if (editId) {
      const fetchSite = async () => {
        try {
          const docSnap = await getDoc(doc(db, 'sites', editId));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setHtmlContent(data.htmlContent || data.rawHtml || '');
            setCssContent(data.cssContent || '');
            setJsContent(data.jsContent || '');
            setWhatsappNumber(data.whatsappNumber || '');
            setIsProtectionEnabled(data.isProtectionEnabled || false);
            setSelectedBotId(data.chatbotId || '');
            setDomainName(data.id);
            if (data.domainType) setDomainType(data.domainType);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchSite();
    }
  }, [editId]);


  const getCombinedHtml = () => {
    let finalHtml = htmlContent || ''

    
    let botInjection = '';
    if (selectedBotId) {
      const bot = chatbots.find(b => b.id === selectedBotId);
      if (bot) {
        // Stringify systemPrompt safely for JS injection
        const safeSys = JSON.stringify(bot.systemPrompt);
        const safeGreet = JSON.stringify(bot.greeting);
        const color = bot.primaryColor;
        
        botInjection = `
<!-- IA CHATBOT WIDGET -->
<style>
  #gm-chat-widget { position: fixed; bottom: 20px; right: 20px; z-index: 999999; font-family: sans-serif; }
  #gm-chat-btn { width: 60px; height: 60px; border-radius: 50%; background: ${color}; color: white; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.2); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
  #gm-chat-btn:hover { transform: scale(1.05); }
  #gm-chat-btn svg { width: 30px; height: 30px; fill: white; }
  #gm-chat-window { display: none; width: 350px; height: 500px; max-height: 80vh; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); flex-direction: column; overflow: hidden; position: absolute; bottom: 80px; right: 0; border: 1px solid #eee; }
  #gm-chat-header { background: ${color}; color: white; padding: 15px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; }
  #gm-chat-header span { display: flex; align-items: center; gap: 8px; }
  #gm-chat-close { background: transparent; border: none; color: white; cursor: pointer; padding: 5px; }
  #gm-chat-messages { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background: #f9f9f9; }
  .gm-msg { max-width: 80%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.4; }
  .gm-msg-bot { background: white; color: #333; align-self: flex-start; border: 1px solid #eee; border-bottom-left-radius: 4px; }
  .gm-msg-user { background: ${color}; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
  #gm-chat-input-container { display: flex; padding: 10px; border-top: 1px solid #eee; background: white; }
  #gm-chat-input { flex: 1; border: 1px solid #ddd; border-radius: 20px; padding: 10px 15px; outline: none; font-size: 14px; }
  #gm-chat-input:focus { border-color: ${color}; }
  #gm-chat-send { background: ${color}; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; margin-left: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .gm-typing { display: inline-block; width: 6px; height: 6px; background: #bbb; border-radius: 50%; animation: gm-typing 1.4s infinite ease-in-out both; margin: 0 2px; }
  .gm-typing:nth-child(1) { animation-delay: -0.32s; }
  .gm-typing:nth-child(2) { animation-delay: -0.16s; }
  @keyframes gm-typing { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
  @media (max-width: 480px) {
    #gm-chat-window { position: fixed; bottom: 0; right: 0; width: 100%; height: 100%; max-height: 100%; border-radius: 0; z-index: 9999999; }
  }
</style>
<div id="gm-chat-widget">
  <div id="gm-chat-window">
    <div id="gm-chat-header">
      <span>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
        ${bot.name}
      </span>
      <button id="gm-chat-close">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
      </button>
    </div>
    <div id="gm-chat-messages"></div>
    <div id="gm-chat-input-container">
      <input type="text" id="gm-chat-input" placeholder="Digite sua mensagem..." autocomplete="off">
      <button id="gm-chat-send">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
  </div>
  <button id="gm-chat-btn">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  </button>
</div>

<script>
(function(){
  const btn = document.getElementById('gm-chat-btn');
  const win = document.getElementById('gm-chat-window');
  const close = document.getElementById('gm-chat-close');
  const msgs = document.getElementById('gm-chat-messages');
  const input = document.getElementById('gm-chat-input');
  const send = document.getElementById('gm-chat-send');
  
  const sys = ${safeSys};
  const greet = ${safeGreet};
  let history = [
    { role: 'system', content: sys }
  ];

  function addMsg(text, isBot, isTyping = false) {
    const d = document.createElement('div');
    d.className = 'gm-msg ' + (isBot ? 'gm-msg-bot' : 'gm-msg-user');
    if (isTyping) {
      d.id = 'gm-typing-indicator';
      d.innerHTML = '<span class="gm-typing"></span><span class="gm-typing"></span><span class="gm-typing"></span>';
    } else {
      d.innerText = text;
    }
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  // Initial
  let opened = false;
  btn.onclick = () => {
    win.style.display = 'flex';
    btn.style.display = 'none';
    if (!opened) {
      addMsg(greet, true);
      history.push({ role: 'assistant', content: greet });
      opened = true;
    }
  };
  close.onclick = () => {
    win.style.display = 'none';
    btn.style.display = 'flex';
  };

  async function handleSend() {
    const text = input.value.trim();
    if(!text) return;
    input.value = '';
    input.disabled = true;
    send.disabled = true;
    
    addMsg(text, false);
    history.push({ role: 'user', content: text });
    
    addMsg('', true, true); // typing

    try {
      // Using Pollinations Text Proxy to avoid leaking keys!
      const res = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          model: 'openai'
        })
      });
      const data = await res.text();
      
      // Remove typing
      const typingEl = document.getElementById('gm-typing-indicator');
      if(typingEl) typingEl.remove();

      if(data) {
        addMsg(data, true);
        history.push({ role: 'assistant', content: data });
      } else {
        addMsg('Desculpe, estou com problemas técnicos agora.', true);
      }
    } catch(e) {
      const typingEl = document.getElementById('gm-typing-indicator');
      if(typingEl) typingEl.remove();
      addMsg('Erro de conexão.', true);
    }
    input.disabled = false;
    send.disabled = false;
    input.focus();
  }

  send.onclick = handleSend;
  input.onkeypress = (e) => { if(e.key === 'Enter') handleSend(); };
})();
</script>
`;
      }
    }

    let protectInjection = '';
    if (isProtectionEnabled) {
      protectInjection = `
<style>
/* Proteção Anti-Cópia GhostMarket */
body { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
</style>
<script>
// Proteção Anti-Cópia GhostMarket
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's' || e.key === 'p' || e.key === 'C' || e.key === 'U' || e.key === 'S' || e.key === 'P')) e.preventDefault();
  if (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'j' || e.key === 'c' || e.key === 'I' || e.key === 'J' || e.key === 'C')) e.preventDefault();
  if (e.key === 'F12') e.preventDefault();
});
</script>`;
    }
    
    if (!finalHtml.toLowerCase().includes('<html')) {
      finalHtml = `<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <!-- CSS_INJECT -->\n</head>\n<body>\n  ${finalHtml}\n  <!-- JS_INJECT -->\n</body>\n</html>`
    } else {
       if (finalHtml.toLowerCase().includes('</head>')) {
           finalHtml = finalHtml.replace(/<\/head>/i, '<!-- CSS_INJECT --></head>')
       } else {
           finalHtml = finalHtml.replace('<html', '<html\n<!-- CSS_INJECT -->')
       }
       
       if (finalHtml.toLowerCase().includes('</body>')) {
           finalHtml = finalHtml.replace(/<\/body>/i, '<!-- JS_INJECT --></body>')
       } else {
           finalHtml += '<!-- JS_INJECT -->'
       }
    }

    if (cssContent.trim()) {
      finalHtml = finalHtml.replace('<!-- CSS_INJECT -->', `<style>${cssContent}</style>\n${protectInjection}`)
    } else {
      finalHtml = finalHtml.replace('<!-- CSS_INJECT -->', protectInjection)
    }

    if (jsContent.trim()) {
      finalHtml = finalHtml.replace('<!-- JS_INJECT -->', `<script>${jsContent}</script>\n${botInjection}`)
    } else {
      finalHtml = finalHtml.replace('<!-- JS_INJECT -->', botInjection)
    }

    
  // FIX: Force all links to open in top window to prevent iframe navigation issues
    if (/<head>/i.test(finalHtml)) {
      finalHtml = finalHtml.replace(/<head>/i, '<head>\n<base target="_top">');
    } else if (/<html.*?>/i.test(finalHtml)) {
      finalHtml = finalHtml.replace(/(<html.*?>)/i, '$1\n<head>\n<base target="_top">\n</head>');
    } else {
      finalHtml = '<head>\n<base target="_top">\n</head>\n' + finalHtml;
    }
    
    if (whatsappNumber.trim()) {
    const waClean = whatsappNumber.replace(/\D/g, '');
    const waBtn = `<a href="https://wa.me/${waClean}?text=Ol%C3%A1!" target="_blank" style="position:fixed;bottom:20px;right:20px;background-color:#25d366;color:white;border-radius:50px;width:60px;height:60px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,0.3);z-index:2147483647;text-decoration:none;"><svg viewBox="0 0 24 24" width="35" height="35" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133-.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a>`;
    
    if (/<\/body>/i.test(finalHtml)) {
      finalHtml = finalHtml.replace(/<\/body>/i, waBtn + '\n</body>');
    } else if (/<\/html>/i.test(finalHtml)) {
      finalHtml = finalHtml.replace(/<\/html>/i, waBtn + '\n</html>');
    } else {
      finalHtml += waBtn;
    }
  }

    return finalHtml
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (uploadType === 'html') setHtmlContent(content)
      if (uploadType === 'css') setCssContent(content)
      if (uploadType === 'js') setJsContent(content)
      addToast('Arquivo carregado com sucesso!', 'success')
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const triggerUpload = (type: 'html'|'css'|'js') => {
    setUploadType(type)
    fileInputRef.current?.click()
  }

  const handlePublish = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!domainName.trim()) {
      addToast('Defina um domínio', 'error')
      return
    }

    setIsPublishing(true)
    try {
      const siteId = domainName.toLowerCase().replace(/[^a-z0-9-]/g, '')
      
      // Check for domain collision
      const docRef = doc(db, 'sites', siteId)
      const snap = await getDoc(docRef)
      if (snap.exists() && snap.data().userId !== (user?.uid || 'anonymous')) {
        addToast('Este nome já está sendo usado por outra conta! Escolha outro.', 'error')
        setIsPublishing(false)
        return
      }

      const fullDomain = domainType === 'subdomain' ? `${window.location.origin}/s/${siteId}` : `https://${siteId}`
      const rawHtml = getCombinedHtml()

      await setDoc(docRef, {
        id: siteId,
        rawHtml,
        htmlContent: steps[0].value,
        cssContent: steps[1].value,
        jsContent: steps[2].value,
        whatsappNumber,
        domain: fullDomain,
        domainType,
        isProtectionEnabled,
          chatbotId: selectedBotId,
          userId: user?.uid || 'anonymous',
        publishedAt: new Date().toISOString()
      })

      addToast('Site hospedado com sucesso!', 'success')
      if (!editId) {
        setPublishedUrl(fullDomain)
      }
    } catch (error) {
      console.error(error)
      addToast('Erro ao publicar', 'error')
    } finally {
      setIsPublishing(false)
    }
  }

  const steps = [
    { id: 1, name: 'HTML', desc: 'Estrutura', value: htmlContent, setter: setHtmlContent, accept: '.html' },
    { id: 2, name: 'CSS', desc: 'Estilos', value: cssContent, setter: setCssContent, accept: '.css' },
    { id: 3, name: 'JS', desc: 'Scripts', value: jsContent, setter: setJsContent, accept: '.js' },
    { id: 4, name: 'WhatsApp', desc: 'Botão Mágico', value: whatsappNumber, setter: setWhatsappNumber, accept: '' },
    { id: 5, name: 'Preview', desc: 'Publicar', value: '', setter: () => {}, accept: '' }
  ]

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#0b0416]">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept={steps.find(s => s.id === step)?.accept} className="hidden" />
      
      {/* HEADER WIZARD */}
      <div className="h-20 border-b border-border bg-panel flex items-center justify-between px-8 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <UploadCloud className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Hospedagem Expressa</h2>
            <p className="text-xs text-textSecondary">Faça o upload do seu funil</p>
          </div>
        </div>

        <div className="flex items-center gap-8 hidden md:flex">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex flex-col items-center gap-2 ${step === s.id ? 'opacity-100' : step > s.id ? 'opacity-70' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step === s.id ? 'bg-primary text-white ring-4 ring-primary/20' : step > s.id ? 'bg-primary text-white' : 'bg-background border border-border text-textSecondary'}`}>
                  {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                </div>
                <span className="text-xs font-bold text-white">{s.name}</span>
              </div>
              {i < steps.length - 1 && <div className={`w-12 h-[2px] mx-4 mt-[-20px] ${step > s.id ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>
        
        <div className="w-[200px] flex justify-end">
          {step === 5 && (
            <Button onClick={() => setIsPublishModalOpen(true)} className="shadow-[0_0_15px_rgba(139,92,246,0.3)] bg-green-500 hover:bg-green-600 text-white">
              <Globe className="w-4 h-4 mr-2" /> Hospedar Site
            </Button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-hidden relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat flex flex-col items-center">
        <div className="absolute inset-0 bg-[#0b0416]/95 z-0" />
        
        <div className="z-10 w-full h-full max-w-5xl p-6 md:p-8 flex flex-col">
          
          <AnimatePresence mode="wait">
            {step < 5 ? (
              <motion.div key="editor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col bg-panel rounded-2xl border border-border overflow-hidden shadow-2xl">
                <div className="h-14 bg-background border-b border-border flex items-center justify-between px-6">
                  <div className="flex items-center gap-3">
                    <FileCode2 className="w-5 h-5 text-primary" />
                    <span className="font-bold text-white">Insira seu código {steps[step-1].name}</span>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => triggerUpload(steps[step-1].name.toLowerCase() as any)} className="bg-primary/10 text-primary hover:bg-primary/20">
                    <UploadCloud className="w-4 h-4 mr-2" /> Upload do Arquivo .{steps[step-1].name.toLowerCase()}
                  </Button>
                </div>
                <textarea 
                  value={steps[step-1].value}
                  onChange={(e) => steps[step-1].setter(e.target.value)}
                  placeholder={`Cole o seu código ${steps[step-1].name} aqui...`}
                  className="flex-1 w-full bg-[#0d1117] text-gray-300 font-mono text-sm p-6 focus:outline-none resize-none custom-scrollbar"
                  spellCheck={false}
                />
              </motion.div>
            ) : (
              <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center w-full">
                <div className="w-full flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Preview Final</h3>
                  <div className="flex items-center gap-1 bg-panel border border-border p-1 rounded-lg">
                    <button onClick={() => setActiveView('desktop')} className={`p-2 rounded-md transition-all ${activeView === 'desktop' ? 'bg-background text-primary shadow-sm' : 'text-textSecondary hover:text-white'}`}><Monitor className="w-4 h-4" /></button>
                    <button onClick={() => setActiveView('mobile')} className={`p-2 rounded-md transition-all ${activeView === 'mobile' ? 'bg-background text-primary shadow-sm' : 'text-textSecondary hover:text-white'}`}><Smartphone className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className={`transition-all duration-500 ease-in-out border border-border rounded-xl bg-white shadow-2xl overflow-hidden relative flex-shrink-0 ${activeView === 'mobile' ? 'w-[375px] min-h-[812px] ring-[12px] ring-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] mt-4 mb-12' : 'w-full flex-1'}`}>
                  {activeView === 'mobile' && (
                    <div className="absolute top-0 inset-x-0 h-7 bg-zinc-900 z-50 flex justify-center rounded-b-3xl w-[150px] mx-auto pointer-events-none">
                      <div className="w-16 h-4 bg-black rounded-full mt-1.5 opacity-50"></div>
                    </div>
                  )}
                  <iframe 
                    srcDoc={getCombinedHtml()} 
                    className="w-full h-full bg-white" 
                    frameBorder="0"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-top-navigation allow-top-navigation-by-user-activation"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex justify-between items-center">
            <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="text-textSecondary hover:text-white">
              <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
            {step < 5 ? (
              <Button onClick={() => setStep(step + 1)} className="shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                Próximo Passo <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : null}
          </div>

        </div>
      </div>

      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-panel border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Publicar e Hospedar</h3>
                <button onClick={() => { setIsPublishModalOpen(false); setPublishedUrl(''); }} className="text-textSecondary hover:text-white transition-colors">x</button>
              </div>
              {publishedUrl ? (
                <div className="p-6 space-y-6 text-center">
                  <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Seu site está no ar!</h3>
                  <p className="text-textSecondary">Acesse agora mesmo através do link abaixo:</p>
                  
                  <div className="bg-background border border-border p-3 rounded-lg flex items-center justify-between gap-4">
                    <span className="text-primary font-mono text-sm truncate">{publishedUrl}</span>
                    <Button size="sm" onClick={() => { navigator.clipboard.writeText(publishedUrl); addToast('Link copiado!', 'success') }}>Copiar</Button>
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                    <Button variant="ghost" className="flex-1" onClick={() => { setIsPublishModalOpen(false); setPublishedUrl(''); }}>Fechar</Button>
                    <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button className="w-full bg-green-500 hover:bg-green-600 text-white">Acessar Site</Button>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePublish} className="p-6 space-y-6">
                  <div className="flex p-1 bg-background border border-border rounded-lg">
                    <button type="button" onClick={() => setDomainType('subdomain')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${domainType === 'subdomain' ? 'bg-panel text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}>Link Gratuito</button>
                    <button type="button" onClick={() => setDomainType('custom')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${domainType === 'custom' ? 'bg-panel text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}>Domínio Próprio</button>
                  </div>
                  {domainType === 'subdomain' ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-textSecondary">Escolha a URL da sua Landing Page</label>
                      <div className="flex relative items-center">
                        <span className="absolute left-4 text-textSecondary text-sm font-medium pointer-events-none">{window.location.host}/s/</span>
                        <Input value={domainName} onChange={(e) => setDomainName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="meu-negocio" className="pl-[200px]" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2"><label className="text-sm font-medium text-textSecondary">Seu Domínio</label><Input value={domainName} onChange={(e) => setDomainName(e.target.value.toLowerCase())} placeholder="www.meusite.com.br" /></div>
                    </div>
                  )}
                  
                  
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                    <label className="text-sm font-medium text-white flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4 text-primary" /> Atendente Virtual Inteligente
                    </label>
                    <select 
                      value={selectedBotId} 
                      onChange={e => setSelectedBotId(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-2.5 text-sm text-white focus:ring-primary focus:border-primary"
                    >
                      <option value="">Nenhum (Desativado)</option>
                      {chatbots.map(bot => (
                        <option key={bot.id} value={bot.id}>{bot.name}</option>
                      ))}
                    </select>
                    {chatbots.length === 0 && <p className="text-xs text-textSecondary mt-2">Você ainda não criou nenhum chatbot. Vá em "Chatbots de IA" no menu.</p>}
                  </div>

                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-2 mb-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/20 p-2 rounded-full"><Shield className="w-5 h-5 text-primary" /></div>
                      <div>
                        <h4 className="text-white font-medium text-sm">Proteção Anti-Cópia</h4>
                        <p className="text-xs text-textSecondary mt-0.5">Bloqueia botão direito, seleção e F12.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" className="sr-only peer" checked={isProtectionEnabled} onChange={(e) => setIsProtectionEnabled(e.target.checked)} />
                      <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="pt-2 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => setIsPublishModalOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={isPublishing} className="shadow-[0_0_15px_rgba(139,92,246,0.3)] bg-primary text-white">{isPublishing ? 'Hospedando...' : 'Colocar no Ar Agora'}</Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
