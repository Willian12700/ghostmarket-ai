import { useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion'
import { useRef } from 'react'

function Counter({ from = 0, to, duration = 2, prefix = '', suffix = '' }: { from?: number, to: number, duration?: number, prefix?: string, suffix?: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const inView = useInView(nodeRef, { once: true, margin: "-50px" })
  const count = useMotionValue(from)
  
  const rounded = useTransform(count, (latest) => {
    // Format to PT-BR style with dots for thousands if > 1000
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
  const containerRef = useRef(null)
  const inView = useInView(containerRef, { once: true, margin: "-100px" })

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.9, rotateY: -15, rotateX: 5 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0, rotateX: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative lg:ml-auto w-full max-w-2xl perspective-1000"
    >
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      <div className="bg-background rounded-xl border border-border overflow-hidden flex h-[400px] md:h-[480px] shadow-[0_0_50px_rgba(139,92,246,0.15)] transform hover:scale-[1.02] transition-transform duration-500">
        
        {/* Mockup Sidebar */}
        <div className="w-16 md:w-48 bg-panel border-r border-border hidden sm:flex flex-col p-4">
          <div className="h-6 w-full max-w-[6rem] bg-border rounded mb-8 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="h-4 w-3/4 bg-border rounded" 
              />
            ))}
          </div>
        </div>

        {/* Mockup Content */}
        <div className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col relative">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={inView ? { opacity: 1 } : {}} 
            transition={{ delay: 0.3 }}
            className="h-8 w-32 md:w-48 bg-border rounded mb-6 animate-pulse" 
          />
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
            <div className="bg-panel border border-border rounded-xl p-4 md:p-5 flex flex-col justify-center">
              <div className="text-xs md:text-sm text-textSecondary mb-1.5 font-medium">Receita Total</div>
              <div className="text-xl md:text-3xl font-bold text-white tracking-tight">
                <Counter to={12480} prefix="R$ " suffix=",00" duration={2.5} />
              </div>
            </div>
            <div className="bg-panel border border-border rounded-xl p-4 md:p-5 flex flex-col justify-center">
              <div className="text-xs md:text-sm text-textSecondary mb-1.5 font-medium">Assinaturas</div>
              <div className="text-xl md:text-3xl font-bold text-white tracking-tight">
                <Counter to={347} duration={2} />
              </div>
            </div>
            <div className="bg-panel border border-border rounded-xl p-4 md:p-5 hidden md:flex flex-col justify-center">
              <div className="text-xs md:text-sm text-textSecondary mb-1.5 font-medium">Conversão</div>
              <div className="text-xl md:text-3xl font-bold text-white tracking-tight">
                <Counter to={8} suffix="%" duration={1.5} />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            {/* Chart Area */}
            <div className="md:col-span-2 bg-panel border border-border rounded-xl p-4 flex flex-col relative overflow-hidden group">
              <div className="text-xs text-textSecondary mb-4">Crescimento (30 dias)</div>
              
              {/* Animated Bars */}
              <div className="flex-1 flex items-end gap-1.5 md:gap-2">
                {[40, 25, 60, 35, 75, 45, 90, 65, 100].map((height, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0, opacity: 0 }}
                    animate={inView ? { height: `${height}%`, opacity: 1 } : {}}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.8, type: "spring" }}
                    className="flex-1 bg-gradient-to-t from-primary/80 to-secondary/80 rounded-t-sm"
                  />
                ))}
              </div>
            </div>

            {/* List Area */}
            <div className="bg-panel border border-border rounded-xl p-4 space-y-4 hidden md:flex flex-col">
              <div className="text-xs text-textSecondary mb-2">Transações Recentes</div>
              {[1, 2, 3].map((i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 1 + i * 0.2 }}
                  className="h-10 bg-background border border-border rounded flex items-center px-3 justify-between"
                >
                  <div className="h-2 w-16 bg-border rounded" />
                  <div className="h-2 w-12 bg-success/80 rounded" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
