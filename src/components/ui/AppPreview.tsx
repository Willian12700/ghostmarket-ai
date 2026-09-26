import { motion } from 'framer-motion'

export const AppPreview = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className="relative mx-auto max-w-6xl rounded-xl border border-[#261f36] bg-[#0b0714] shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-hidden mb-20 group"
    >
      {/* MacOS Header */}
      <div className="flex items-center px-4 py-3 border-b border-[#261f36] bg-[#130e1d]">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="mx-auto bg-black/40 px-32 py-1.5 rounded-md text-xs text-white/30 font-medium">
          app.ghostmarket.ai
        </div>
      </div>
      
      {/* Image Preview */}
      <div className="relative w-full overflow-hidden bg-black">
        <img 
          src="/dashboard-preview.png" 
          alt="GhostMarket AI Dashboard Preview" 
          className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0714] via-transparent to-transparent opacity-30 pointer-events-none" />
      </div>
      
      {/* Decorative Glow Behind Mockup */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent opacity-[0.15] blur-2xl -z-10 rounded-2xl pointer-events-none transition-opacity duration-500 group-hover:opacity-[0.25]" />
    </motion.div>
  )
}
