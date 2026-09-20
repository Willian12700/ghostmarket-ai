const fs = require('fs');
let file = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

// Imports
if (!file.includes('getDocs')) {
  file = file.replace("import { doc, setDoc } from 'firebase/firestore'", "import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore'");
}
if (!file.includes('Bot }')) {
  file = file.replace("Shield } from 'lucide-react'", "Shield, Bot } from 'lucide-react'");
}

// State variables
file = file.replace("const [isProtectionEnabled, setIsProtectionEnabled] = useState(false)", 
`const [isProtectionEnabled, setIsProtectionEnabled] = useState(false)
  const [chatbots, setChatbots] = useState<any[]>([])
  const [selectedBotId, setSelectedBotId] = useState('')`);

// Fetch bots effect
const fetchBotsCode = `
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
`;
file = file.replace("useEffect(() => {\n    if (editId) {", fetchBotsCode + "\n  useEffect(() => {\n    if (editId) {");

// Load existing bot
file = file.replace("setIsProtectionEnabled(data.isProtectionEnabled || false);", 
  "setIsProtectionEnabled(data.isProtectionEnabled || false);\n            setSelectedBotId(data.chatbotId || '');");

// Save bot
file = file.replace("isProtectionEnabled,\n        userId: user?.uid || 'anonymous',", 
  "isProtectionEnabled,\n          chatbotId: selectedBotId,\n          userId: user?.uid || 'anonymous',");

// Injecting the chatbot script
const botInjectionCode = `
    let botInjection = '';
    if (selectedBotId) {
      const bot = chatbots.find(b => b.id === selectedBotId);
      if (bot) {
        // Stringify systemPrompt safely for JS injection
        const safeSys = JSON.stringify(bot.systemPrompt);
        const safeGreet = JSON.stringify(bot.greeting);
        const color = bot.primaryColor;
        
        botInjection = \`
<!-- IA CHATBOT WIDGET -->
<style>
  #gm-chat-widget { position: fixed; bottom: 20px; right: 20px; z-index: 999999; font-family: sans-serif; }
  #gm-chat-btn { width: 60px; height: 60px; border-radius: 50%; background: \${color}; color: white; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.2); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
  #gm-chat-btn:hover { transform: scale(1.05); }
  #gm-chat-btn svg { width: 30px; height: 30px; fill: white; }
  #gm-chat-window { display: none; width: 350px; height: 500px; max-height: 80vh; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); flex-direction: column; overflow: hidden; position: absolute; bottom: 80px; right: 0; border: 1px solid #eee; }
  #gm-chat-header { background: \${color}; color: white; padding: 15px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; }
  #gm-chat-header span { display: flex; align-items: center; gap: 8px; }
  #gm-chat-close { background: transparent; border: none; color: white; cursor: pointer; padding: 5px; }
  #gm-chat-messages { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background: #f9f9f9; }
  .gm-msg { max-width: 80%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.4; }
  .gm-msg-bot { background: white; color: #333; align-self: flex-start; border: 1px solid #eee; border-bottom-left-radius: 4px; }
  .gm-msg-user { background: \${color}; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
  #gm-chat-input-container { display: flex; padding: 10px; border-top: 1px solid #eee; background: white; }
  #gm-chat-input { flex: 1; border: 1px solid #ddd; border-radius: 20px; padding: 10px 15px; outline: none; font-size: 14px; }
  #gm-chat-input:focus { border-color: \${color}; }
  #gm-chat-send { background: \${color}; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; margin-left: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
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
        \${bot.name}
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
  
  const sys = \${safeSys};
  const greet = \${safeGreet};
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
\`;
      }
    }
`;

file = file.replace(/let protectInjection = '';[\s\S]*?    \}/, botInjectionCode + "\n    let protectInjection = '';\n    if (isProtectionEnabled) {\n      protectInjection = `\n<style>\n/* Proteção Anti-Cópia GhostMarket */\nbody { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }\n</style>\n<script>\n// Proteção Anti-Cópia GhostMarket\ndocument.addEventListener('contextmenu', e => e.preventDefault());\ndocument.addEventListener('keydown', e => {\n  if (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's' || e.key === 'p' || e.key === 'C' || e.key === 'U' || e.key === 'S' || e.key === 'P')) e.preventDefault();\n  if (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'j' || e.key === 'c' || e.key === 'I' || e.key === 'J' || e.key === 'C')) e.preventDefault();\n  if (e.key === 'F12') e.preventDefault();\n});\n</script>`;\n    }");

// Replace the JS Injection append location:
file = file.replace("finalHtml = finalHtml.replace('<!-- JS_INJECT -->', `<script>${jsContent}</script>`)", "finalHtml = finalHtml.replace('<!-- JS_INJECT -->', `<script>${jsContent}</script>\\n${botInjection}`)");
file = file.replace("finalHtml = finalHtml.replace('<!-- JS_INJECT -->', '')", "finalHtml = finalHtml.replace('<!-- JS_INJECT -->', botInjection)");

// Add the UI selector right before Proteção Anti-Copia UI
const selectUI = `
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

                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-2 mb-4 flex items-center justify-between gap-4">`;
file = file.replace('<div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-2 mb-4 flex items-center justify-between gap-4">', selectUI);

fs.writeFileSync('src/pages/SiteBuilder.tsx', file, 'utf8');
console.log('Added chatbot injection to SiteBuilder');
