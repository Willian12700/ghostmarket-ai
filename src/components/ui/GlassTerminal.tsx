import { Check, Copy, Code } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'

interface GlassTerminalProps {
  content: string;
  title?: string;
  
}

export const GlassTerminal = ({ content, title = "ghostmarket@ai: ~/resultado" }: GlassTerminalProps) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex-1 relative group w-full h-full flex flex-col min-h-[400px]">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-fuchsia-600 to-indigo-600 rounded-[2rem] blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
      
      <div className="relative h-full flex-1 bg-[#050505]/90 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col overflow-hidden">
        
        <div className="h-14 bg-white/5 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-danger/80"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-warning/80"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-success/80"></div>
            <span className="ml-4 text-xs font-mono text-textSecondary hidden sm:flex items-center gap-2">
              <Code className="w-3.5 h-3.5 text-primary" /> {title}
            </span>
          </div>
          
          <Button onClick={copyToClipboard} className="h-9 px-4 text-sm font-bold bg-white text-black hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.3)] rounded-lg transition-all hover:scale-105">
            {copied ? <Check className="w-4 h-4 mr-2 text-success" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto custom-scrollbar p-6">
          <pre className="text-sm md:text-base text-emerald-400 whitespace-pre-wrap font-mono leading-relaxed" style={{ textShadow: '0 0 10px rgba(52,211,153,0.3)' }}>
            {content || "Aguardando geração..."}
          </pre>
        </div>
      </div>
    </div>
  )
}
