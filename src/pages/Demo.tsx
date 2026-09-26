import { AppPreview } from '@/components/ui/AppPreview'
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
