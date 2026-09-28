import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FolderTree, Search, Settings, FileCode2, FileJson, FileType2, FileImage, 
  TerminalSquare, Play, Square, Rocket, MonitorPlay, Maximize2, X, ChevronRight, ChevronDown, Check
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'

export const CloudIde = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('App.tsx')
  const [terminalOpen, setTerminalOpen] = useState(true)
  const [serverRunning, setServerRunning] = useState(false)
  
  return (
    <div className="h-[calc(100vh-64px)] w-full bg-[#030303] text-white flex flex-col font-sans overflow-hidden">
      
      {/* HEADERBAR */}
      <div className="h-14 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 mr-4">
            <div className="w-3 h-3 rounded-full bg-danger/80"></div>
            <div className="w-3 h-3 rounded-full bg-warning/80"></div>
            <div className="w-3 h-3 rounded-full bg-success/80"></div>
          </div>
          <span className="text-sm font-semibold text-textSecondary bg-white/5 px-3 py-1 rounded-md border border-white/5">meu-saas-premium</span>
        </div>

        <div className="flex items-center gap-2">
          {!serverRunning ? (
            <Button onClick={() => setServerRunning(true)} className="h-8 px-4 bg-success/20 text-success hover:bg-success/30 border border-success/30 text-xs font-bold rounded-md">
              <Play className="w-3.5 h-3.5 mr-2" /> Start Server
            </Button>
          ) : (
            <Button onClick={() => setServerRunning(false)} className="h-8 px-4 bg-danger/20 text-danger hover:bg-danger/30 border border-danger/30 text-xs font-bold rounded-md">
              <Square className="w-3.5 h-3.5 mr-2" /> Stop Server
            </Button>
          )}
          <div className="w-px h-6 bg-white/10 mx-2"></div>
          <Button className="h-8 px-4 bg-primary text-white hover:bg-primary/90 text-xs font-bold rounded-md">
            <Rocket className="w-3.5 h-3.5 mr-2" /> Deploy Vercel
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* ACTIVITY BAR */}
        <div className="w-12 bg-[#050505] border-r border-white/5 flex flex-col items-center py-4 gap-6 shrink-0">
          <button className="text-white hover:text-primary transition-colors"><FolderTree className="w-6 h-6" /></button>
          <button className="text-textSecondary hover:text-white transition-colors"><Search className="w-5 h-5" /></button>
          <button className="text-textSecondary hover:text-white transition-colors"><TerminalSquare className="w-5 h-5" /></button>
          <div className="flex-1"></div>
          <button className="text-textSecondary hover:text-white transition-colors"><Settings className="w-5 h-5" /></button>
        </div>

        {/* EXPLORER (FILE TREE) */}
        <div className="w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col shrink-0">
          <div className="h-10 flex items-center px-4 uppercase text-[10px] font-bold tracking-widest text-textSecondary border-b border-white/5">
            Explorer
          </div>
          <div className="p-2 space-y-0.5 overflow-y-auto custom-scrollbar text-sm">
            
            {/* PASTA SRC */}
            <div className="flex items-center gap-1.5 px-2 py-1 hover:bg-white/5 rounded cursor-pointer text-textSecondary">
              <ChevronDown className="w-4 h-4" />
              <FolderTree className="w-4 h-4 text-primary" />
              <span>src</span>
            </div>
            
            {/* ARQUIVOS */}
            <div className="pl-6 flex items-center gap-2 px-2 py-1.5 bg-primary/10 text-white rounded cursor-pointer border-l-2 border-primary">
              <FileType2 className="w-4 h-4 text-blue-400" />
              <span>App.tsx</span>
            </div>
            <div className="pl-6 flex items-center gap-2 px-2 py-1 hover:bg-white/5 text-textSecondary rounded cursor-pointer">
              <FileCode2 className="w-4 h-4 text-yellow-400" />
              <span>main.tsx</span>
            </div>
            <div className="pl-6 flex items-center gap-2 px-2 py-1 hover:bg-white/5 text-textSecondary rounded cursor-pointer">
              <FileCode2 className="w-4 h-4 text-cyan-400" />
              <span>index.css</span>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-1 mt-2 hover:bg-white/5 rounded cursor-pointer text-textSecondary">
              <ChevronRight className="w-4 h-4" />
              <FolderTree className="w-4 h-4 text-textSecondary" />
              <span>components</span>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-1 mt-2 hover:bg-white/5 rounded cursor-pointer text-textSecondary">
              <ChevronRight className="w-4 h-4" />
              <FolderTree className="w-4 h-4 text-textSecondary" />
              <span>pages</span>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 px-2 py-1 hover:bg-white/5 text-textSecondary rounded cursor-pointer">
                <FileJson className="w-4 h-4 text-green-400" />
                <span>package.json</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 hover:bg-white/5 text-textSecondary rounded cursor-pointer">
                <FileJson className="w-4 h-4 text-yellow-200" />
                <span>tsconfig.json</span>
              </div>
            </div>

          </div>
        </div>

        {/* MAIN EDITOR & TERMINAL AREA */}
        <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden">
          
          {/* EDITOR TABS */}
          <div className="flex bg-[#0a0a0a] border-b border-white/5 overflow-x-auto custom-scrollbar shrink-0">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#050505] border-t-2 border-primary text-white cursor-pointer min-w-[120px]">
              <FileType2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm">App.tsx</span>
              <X className="w-3.5 h-3.5 ml-2 text-textSecondary hover:text-white" />
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/5 text-textSecondary cursor-pointer min-w-[120px]">
              <FileJson className="w-4 h-4 text-green-400" />
              <span className="text-sm">package.json</span>
            </div>
          </div>

          {/* EDITOR CONTENT (MOCK) */}
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            <div className="absolute inset-0 p-4 font-mono text-[13px] md:text-[14px] leading-relaxed flex">
              <div className="w-10 text-right pr-4 text-textSecondary/50 select-none flex flex-col">
                {Array.from({length: 25}).map((_, i) => <span key={i}>{i+1}</span>)}
              </div>
              <div className="flex-1 text-gray-300">
                <span className="text-pink-500">import</span> {'{'} useState {'}'} <span className="text-pink-500">from</span> <span className="text-green-300">'react'</span>;<br/>
                <span className="text-pink-500">import</span> {'{'} motion {'}'} <span className="text-pink-500">from</span> <span className="text-green-300">'framer-motion'</span>;<br/>
                <br/>
                <span className="text-pink-500">export default function</span> <span className="text-blue-400">App</span>() {'{'}<br/>
                {'  '}<span className="text-pink-500">const</span> [count, setCount] = <span className="text-blue-400">useState</span>(<span className="text-orange-400">0</span>);<br/>
                <br/>
                {'  '}<span className="text-pink-500">return</span> (<br/>
                {'    '}&lt;<span className="text-blue-300">div</span> <span className="text-cyan-300">className</span>=<span className="text-green-300">"min-h-screen bg-black text-white flex items-center justify-center"</span>&gt;<br/>
                {'      '}&lt;<span className="text-blue-300">div</span> <span className="text-cyan-300">className</span>=<span className="text-green-300">"text-center space-y-6"</span>&gt;<br/>
                {'        '}&lt;<span className="text-blue-300">h1</span> <span className="text-cyan-300">className</span>=<span className="text-green-300">"text-4xl font-bold"</span>&gt;GhostMarket IDE&lt;/<span className="text-blue-300">h1</span>&gt;<br/>
                {'        '}&lt;<span className="text-blue-300">p</span> <span className="text-cyan-300">className</span>=<span className="text-green-300">"text-gray-400"</span>&gt;Sistema dinâmico rodando no navegador!&lt;/<span className="text-blue-300">p</span>&gt;<br/>
                {'      '}&lt;/<span className="text-blue-300">div</span>&gt;<br/>
                {'    '}&lt;/<span className="text-blue-300">div</span>&gt;<br/>
                {'  '});<br/>
                {'}'}
              </div>
            </div>
          </div>

          {/* TERMINAL */}
          {terminalOpen && (
            <div className="h-48 border-t border-white/5 bg-[#0a0a0a] flex flex-col shrink-0">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                <div className="flex gap-4 uppercase text-[10px] font-bold tracking-widest">
                  <span className="text-textSecondary hover:text-white cursor-pointer">Problems</span>
                  <span className="text-textSecondary hover:text-white cursor-pointer">Output</span>
                  <span className="text-white border-b-2 border-primary pb-1">Terminal</span>
                </div>
                <X className="w-3.5 h-3.5 text-textSecondary cursor-pointer hover:text-white" onClick={() => setTerminalOpen(false)} />
              </div>
              <div className="flex-1 p-3 font-mono text-[12px] text-textSecondary overflow-auto custom-scrollbar">
                <div className="text-green-400">~/ghostmarket-projects/meu-saas $</div>
                <div>npm run dev</div>
                <br/>
                {serverRunning ? (
                  <>
                    <div className="text-cyan-400">VITE v5.0.0  ready in 250 ms</div>
                    <br/>
                    <div className="text-green-400">?  Local:   <a href="#" className="hover:underline text-white">http://localhost:5173/</a></div>
                    <div>?  Network: use --host to expose</div>
                    <div>?  press h to show help</div>
                  </>
                ) : (
                  <div>Waiting for command...</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PREVIEW / BROWSER */}
        <div className="w-[40%] bg-white hidden lg:flex flex-col border-l border-white/20 shrink-0 relative overflow-hidden">
          {/* FAKE BROWSER CHROME */}
          <div className="h-12 bg-gray-100 border-b border-gray-300 flex items-center px-3 gap-3 shrink-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 bg-white border border-gray-200 rounded-md h-7 flex items-center px-3 text-xs text-gray-500 font-medium">
              localhost:5173
            </div>
            <Maximize2 className="w-4 h-4 text-gray-500" />
          </div>

          {/* PREVIEW CONTENT */}
          <div className="flex-1 bg-black text-white relative">
            {serverRunning ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center flex-col bg-[#050505]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15)_0%,transparent_50%)]"></div>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                  <MonitorPlay className="w-20 h-20 text-primary mb-6" />
                </motion.div>
                <h1 className="text-3xl font-bold mb-2">GhostMarket IDE</h1>
                <p className="text-gray-400">Preview ao vivo do seu código.</p>
                <div className="mt-8 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                  Edite <span className="text-primary font-mono">App.tsx</span> para ver as mudanças
                </div>
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center flex-col text-gray-500 bg-gray-50">
                <MonitorPlay className="w-16 h-16 mb-4 opacity-20" />
                <p>O servidor está desligado.</p>
                <p className="text-sm">Clique em "Start Server" para rodar o código.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
