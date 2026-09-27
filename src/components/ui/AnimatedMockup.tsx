import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion'

function Counter({ from = 0, to, duration = 2, prefix = '', suffix = '' }: { from?: number, to: number, duration?: number, prefix?: string, suffix?: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const inView = useInView(nodeRef, { once: true, margin: "-50px" })
  const count = useMotionValue(from)
  
  const rounded = useTransform(count, (latest) => {
    if (latest >= 1000) {
      const parts = Math.round(latest).toString().split(/(?=(?:...)*$)/)
      return parts.join('.')
    }
    return Math.round(latest).toString()
  })

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, { duration, ease: "easeOut" })
      return controls.stop
    }
  }, [inView, count, to, duration])

  return (
    <span ref={nodeRef} className="whitespace-nowrap">
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}

export function AnimatedMockup() {
  const containerRef = useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef, { once: true, margin: "-100px" })
  
  // Spotlight effect
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, rotateY: -10, rotateX: 5 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0, rotateX: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative lg:ml-auto w-full max-w-2xl perspective-[2000px] z-10"
    >
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setOpacity(1)}
        onMouseLeave={() => setOpacity(0)}
        className="bg-[#0b0714] rounded-xl border border-white/10 overflow-hidden flex h-[500px] md:h-[580px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform hover:scale-[1.02] hover:-translate-y-2 transition-all duration-500 relative"
      >
        {/* Bordas Neon Roxas nas Laterais */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#8b5cf6]/80 shadow-[0_0_20px_4px_rgba(139,92,246,0.8)] z-50 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-[#8b5cf6]/80 shadow-[0_0_20px_4px_rgba(139,92,246,0.8)] z-50 pointer-events-none" />

        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-50"
          style={{
            opacity,
            background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(139, 92, 246, 0.15), transparent 40%)`,
          }}
        />

        {/* Mockup Sidebar */}
        <div className="w-16 md:w-48 bg-[#050505] border-r border-white/5 hidden sm:flex flex-col p-4 relative z-10 shrink-0">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
               <div className="w-3 h-3 bg-primary rounded-sm" />
            </div>
            <div className="h-4 w-20 bg-white/10 rounded hidden md:block" />
          </div>
          <div className="space-y-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-4 h-4 rounded-full bg-white/5 shrink-0" />
                <div className="h-3 w-full bg-white/5 rounded hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mockup Content */}
        <div className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col relative z-10 bg-[#0b0714]">
          <div className="flex justify-between items-center mb-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.3 }}
              className="flex flex-col gap-1"
            >
              <div className="h-6 w-32 md:w-48 bg-white/10 rounded" />
              <div className="h-3 w-24 bg-white/5 rounded" />
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.6 }} className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
            </motion.div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
            <div className="col-span-2 bg-[#050505] border border-white/5 rounded-xl p-5 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full pointer-events-none" />
              <div className="text-xs md:text-sm text-[#8A8A94] mb-1.5 font-medium">Receita Total</div>
              <div className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                <Counter to={12480} prefix="R$ " duration={2.5} />
              </div>
            </div>
            <div className="col-span-1 bg-[#050505] border border-white/5 rounded-xl p-4 md:p-5 flex flex-col justify-center">
              <div className="text-xs md:text-sm text-[#8A8A94] mb-1.5 font-medium">Assinaturas</div>
              <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                <Counter to={347} duration={2} />
              </div>
            </div>
            <div className="col-span-1 bg-[#050505] border border-white/5 rounded-xl p-4 md:p-5 flex flex-col justify-center">
              <div className="text-xs md:text-sm text-[#8A8A94] mb-1.5 font-medium">Conversão</div>
              <div className="text-2xl md:text-3xl font-bold text-white tracking-tight text-emerald-400">
                <Counter to={8} suffix="%" duration={1.5} />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden">
            {/* Chart Area */}
            <div className="md:col-span-2 bg-[#050505] border border-white/5 rounded-xl p-4 flex flex-col relative overflow-hidden group">
              <div className="text-xs text-[#8A8A94] mb-4 font-medium">Crescimento (30 dias)</div>
              
              {/* Animated Line Chart */}
              <div className="absolute inset-0 top-12 left-4 right-4 bottom-4">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    initial={{ d: "M 0 100 L 0 100 L 20 100 L 40 100 L 60 100 L 80 100 L 100 100 L 100 100 Z" }}
                    animate={inView ? { d: "M 0 100 L 0 80 L 20 60 L 40 70 L 60 30 L 80 40 L 100 10 L 100 100 Z" } : {}}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                    fill="url(#chartGrad)"
                  />
                  <motion.path
                    initial={{ d: "M 0 100 L 20 100 L 40 100 L 60 100 L 80 100 L 100 100", pathLength: 0 }}
                    animate={inView ? { d: "M 0 80 L 20 60 L 40 70 L 60 30 L 80 40 L 100 10", pathLength: 1 } : {}}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="3"
                  />
                  {/* Floating dots on chart */}
                  {[
                    { cx: 0, cy: 80 }, { cx: 20, cy: 60 }, { cx: 40, cy: 70 },
                    { cx: 60, cy: 30 }, { cx: 80, cy: 40 }, { cx: 100, cy: 10 }
                  ].map((pt, i) => (
                    <motion.circle
                      key={i}
                      initial={{ opacity: 0, r: 0 }}
                      animate={inView ? { opacity: 1, r: 4 } : {}}
                      transition={{ delay: 1 + i * 0.2 }}
                      cx={pt.cx} cy={pt.cy}
                      fill="#050505" stroke="#8b5cf6" strokeWidth="2"
                    />
                  ))}
                </svg>
              </div>
            </div>

            {/* List Area */}
            <div className="bg-[#050505] border border-white/5 rounded-xl p-4 space-y-3 hidden md:flex flex-col relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-20" />
              <div className="text-xs text-[#8A8A94] mb-1 font-medium">Transações Recentes</div>
              {[1, 2, 3].map((i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 1.5 + i * 0.2 }}
                  className="h-10 bg-[#0b0714] border border-white/5 rounded flex items-center px-3 justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-primary/20 shrink-0" />
                    <div className="h-2 w-12 bg-white/10 rounded" />
                  </div>
                  <div className="h-2 w-10 bg-emerald-400/80 rounded" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
