const fs = require('fs');

// 1. Create SalesScripts.tsx
const salesScriptsCode = `import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Copy, CheckCircle2, Zap, Target, ShieldAlert, Clock } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'

export const SalesScripts = () => {
  const { addToast } = useToastStore()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    addToast('Script copiado para a rea de transferncia!', 'success')
  }

  const scripts = [
    {
      category: "1. Abordagem Fria (Quebrar o Gelo)",
      icon: <Target className="w-5 h-5 text-blue-400" />,
      color: "border-blue-500/30 bg-blue-500/5",
      items: [
        {
          title: "Para Donos de Negcio Local",
          text: "Opa, tudo bem? Vi seu Instagram e achei fantstico o seu negcio. Vocs j tm um site prprio ou esto dependendo s do Instagram e Linktree para receber clientes?"
        },
        {
          title: "Para quem quer iniciar no Digital / Afiliados",
          text: "Fala irmo, tranquilo? Vi que voc t no corre do marketing digital. Voc j tem uma estrutura prpria rodando no automtico ou ainda t sofrendo com bloqueios e links de afiliado bloqueados?"
        }
      ]
    },
    {
      category: "2. Apresentao Rpida (O que ?)",
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      color: "border-yellow-500/30 bg-yellow-500/5",
      items: [
        {
          title: "Pitch de 30 segundos",
          text: "Basicamente eu criei uma mquina, o GhostMarket AI. Ela cria pginas de vendas absurdas e profissionais em 20 segundos usando Inteligncia Artificial, hospeda de graa no seu domnio e ainda varre o Google Maps atrs de clientes pra voc vender esses sites por R$500 a R$1000. \n\nD uma olhada na Demo: https://ghostmarket.cyou/demo"
        }
      ]
    },
    {
      category: "3. Quebra de Objeo (T Caro / Vou Pensar)",
      icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
      color: "border-red-500/30 bg-red-500/5",
      items: [
        {
          title: "Objeo: T sem dinheiro / T caro",
          text: "Eu entendo total. Mas pensa comigo: s a economia que voc vai ter cancelando hospedagem e domnio caro j paga o sistema. Alm disso, se voc fechar UM NICO site usando nosso Scanner de Leads cobrando R$ 300 (que  muito barato), voc j tirou o lucro da ferramenta.  um investimento que se paga na primeira semana. Bora fechar e colocar isso pra rodar hoje?"
        },
        {
          title: "Objeo: Vou pensar e te falo",
          text: "Tranquilo! S um aviso ttico: o Plano Vitalcio  uma janela temporria s pra validar essa nova verso do sistema. Na semana que vem, a gente vira a chave para mensalidade. Quem entrou agora, no paga nunca mais. Se quiser segurar sua vaga, a hora  agora."
        }
      ]
    },
    {
      category: "4. Follow-up (Dia Seguinte)",
      icon: <Clock className="w-5 h-5 text-emerald-400" />,
      color: "border-emerald-500/30 bg-emerald-500/5",
      items: [
        {
          title: "Recuperao (O cara sumiu)",
          text: "Opa, bom dia! Passando s pra te avisar que eu liberei mais 2 ferramentas l dentro da rea de membros hoje (Scanner de Leads liberado). Voc conseguiu ver o link que te mandei ontem ou ficou alguma dvida na hora do checkout?"
        }
      ]
    }
  ]

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Scripts X1</h1>
          <p className="text-textSecondary mt-1">Copie e cole mensagens de alta converso para fechar vendas no WhatsApp.</p>
        </div>
      </div>

      <div className="space-y-8">
        {scripts.map((section, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className={\`rounded-2xl border p-6 \${section.color}\`}
          >
            <div className="flex items-center gap-3 mb-6">
              {section.icon}
              <h2 className="text-xl font-bold text-white">{section.category}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.items.map((item, i) => (
                <div key={i} className="bg-[#0b0714] border border-white/5 rounded-xl p-5 flex flex-col group relative">
                  <h3 className="text-sm font-bold text-white/70 mb-3">{item.title}</h3>
                  <div className="bg-[#050505] border border-white/5 p-4 rounded-lg flex-1 font-mono text-sm text-white/90 whitespace-pre-wrap">
                    "{item.text}"
                  </div>
                  <button 
                    onClick={() => copyToClipboard(item.text)}
                    className="absolute top-4 right-4 p-2 bg-primary/20 text-primary rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
`;
fs.writeFileSync('src/pages/SalesScripts.tsx', salesScriptsCode, 'utf8');


// 2. Create Demo.tsx
const demoCode = `import { AppPreview } from '@/components/ui/AppPreview'
import { MessageCircle } from 'lucide-react'

export const Demo = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center py-20 px-4 overflow-hidden relative">
      {/* Glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold tracking-wider w-fit mb-6">
          DEMONSTRAO OFICIAL
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">A Mquina por Dentro</h1>
        <p className="text-xl text-white/60 leading-relaxed">
          Sem falsas promessas. Role a tela e veja exatamente a plataforma que est colocando dinheiro no bolso dos nossos alunos hoje.
        </p>
      </div>

      <div className="w-full relative z-10">
        <AppPreview />
      </div>

      <div className="mt-20 text-center relative z-10 flex flex-col items-center">
        <h3 className="text-2xl font-bold mb-6">Pronto para ter a sua estrutura automtica?</h3>
        <a 
          href="https://wa.me/5511999999999?text=Ol%C3%A1!+Acabei+de+ver+a+demo+do+GhostMarket+e+quero+garantir+minha+vaga+no+plano+vitalcio." 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-lg px-8 py-4 rounded-full transition-all hover:scale-105 shadow-[0_4px_24px_rgba(37,211,102,0.4)]"
        >
          <MessageCircle className="w-6 h-6" /> Falar com Especialista
        </a>
        <p className="mt-4 text-white/40 text-sm">Vagas limitadas para o plano vitalcio.</p>
      </div>
    </div>
  )
}
`;
fs.writeFileSync('src/pages/Demo.tsx', demoCode, 'utf8');


// 3. Update App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace("import { Chatbots } from '@/pages/Chatbots'", "import { Chatbots } from '@/pages/Chatbots'\nimport { SalesScripts } from '@/pages/SalesScripts'\nimport { Demo } from '@/pages/Demo'");
appCode = appCode.replace('<Route path="/s/:siteId" element={<SiteViewer />} />', '<Route path="/s/:siteId" element={<SiteViewer />} />\n            <Route path="/demo" element={<Demo />} />');
appCode = appCode.replace('<Route path="/chatbots" element={<Chatbots />} />', '<Route path="/chatbots" element={<Chatbots />} />\n              <Route path="/scripts" element={<SalesScripts />} />');
fs.writeFileSync('src/App.tsx', appCode, 'utf8');


// 4. Update Sidebar.tsx
let sidebarCode = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
sidebarCode = sidebarCode.replace("import { LayoutDashboard, Globe, Wand2, Search, Settings, FileText, Database, CreditCard, ChevronLeft, Bot } from 'lucide-react'", "import { LayoutDashboard, Globe, Wand2, Search, Settings, FileText, Database, CreditCard, ChevronLeft, Bot, MessageCircle } from 'lucide-react'");
sidebarCode = sidebarCode.replace('<SidebarLink icon={<Database className="w-5 h-5" />} label="Integraes" to="/integrations" active={location.pathname === \'/integrations\'} />', '<SidebarLink icon={<Database className="w-5 h-5" />} label="Integraes" to="/integrations" active={location.pathname === \'/integrations\'} />\n          <SidebarLink icon={<MessageCircle className="w-5 h-5" />} label="Scripts X1" to="/scripts" active={location.pathname === \'/scripts\'} />');
fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebarCode, 'utf8');


// 5. Update Landing.tsx (Add Floating Button)
let landingCode = fs.readFileSync('src/pages/Landing.tsx', 'utf8');
// Import MessageCircle if not there
if (!landingCode.includes('MessageCircle')) {
  landingCode = landingCode.replace(/import {([^}]+)} from 'lucide-react'/, (match, p1) => {
    return `import {${p1}, MessageCircle} from 'lucide-react'`;
  });
}

// Add the button right before the final closing div
const floatingBtnCode = `
      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/5511999999999?text=Ol%C3%A1!+Estava+vendo+o+site+do+GhostMarket+e+quero+saber+como+funciona+o+Plano+Vital%C3%ADcio."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-[0_4px_24px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform flex items-center justify-center group"
      >
        <MessageCircle className="w-8 h-8" />
        <span className="absolute right-full mr-4 bg-white text-black text-sm font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
          Falar no WhatsApp
        </span>
      </a>
    </div>
  )
}`;

landingCode = landingCode.replace(/    <\/div>\s*\)\s*}\s*$/, floatingBtnCode);
fs.writeFileSync('src/pages/Landing.tsx', landingCode, 'utf8');

