
import { motion } from 'framer-motion'
import { MessageCircle, Copy, Zap, Target, ShieldAlert, Clock } from 'lucide-react'
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
          text: `Basicamente eu criei uma mquina, o GhostMarket AI. Ela cria pginas de vendas absurdas e profissionais em 20 segundos usando Inteligncia Artificial, hospeda de graa no seu domnio e ainda varre o Google Maps atrs de clientes pra voc vender esses sites por R$500 a R$1000. \n\nD uma olhada na Demo: https://ghostmarket.cyou/demo`
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
            className={`rounded-2xl border p-6 ${section.color}`}
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
