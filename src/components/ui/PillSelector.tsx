import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'

export const PillSelector = ({ id, options, value, onChange }: { id: string, options: string[], value: string, onChange: (val: string) => void }) => (
  <div className="flex flex-wrap gap-3">
    <AnimatePresence>
      {options.map(opt => {
        const isActive = value === opt;
        return (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-5 py-2.5 rounded-full text-sm font-black transition-all flex items-center gap-2 border-2 relative overflow-hidden group ${
              isActive 
              ? 'border-transparent text-white shadow-[0_0_25px_rgba(139,92,246,0.6)]' 
              : 'bg-panel border-border text-textSecondary hover:border-primary/50 hover:text-white hover:bg-primary/5'
            }`}
          >
            {isActive && (
              <motion.div 
                layoutId={`activePill-${id}`}
                className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-indigo-600 -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
            {isActive && (
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
              >
                <Check className="w-3.5 h-3.5 text-white" />
              </motion.div>
            )}
            <span className="relative z-10">{opt}</span>
          </motion.button>
        )
      })}
    </AnimatePresence>
  </div>
)

export const MultiPillSelector = ({ options, stateObj, onToggle, disabled = false }: { options: any[], stateObj: any, onToggle: (id: string) => void, disabled?: boolean }) => (
  <div className="flex flex-wrap gap-3">
    <AnimatePresence>
      {options.map(opt => {
        const isActive = stateObj[opt.id];
        return (
          <motion.button 
            whileHover={disabled ? {} : { scale: 1.05 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
            key={opt.id}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(opt.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-black transition-all flex items-center gap-2 border-2 relative overflow-hidden group ${disabled ? 'opacity-20 cursor-not-allowed grayscale' : ''} ${
              isActive 
              ? 'border-transparent text-white shadow-[0_0_25px_rgba(139,92,246,0.6)]' 
              : 'bg-panel border-border text-textSecondary hover:border-primary/50 hover:text-white hover:bg-primary/5'
            }`}
          >
            {isActive && (
              <motion.div 
                layoutId={`activeMultiPill-${opt.id}`}
                className="absolute inset-0 bg-gradient-to-r from-primary to-fuchsia-600 -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
            {isActive && (
              <motion.div 
                initial={{ scale: 0, rotate: -90 }} 
                animate={{ scale: 1, rotate: 0 }} 
                className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
              >
                <Check className="w-3.5 h-3.5 text-white" />
              </motion.div>
            )}
            <span className="relative z-10">{opt.label}</span>
          </motion.button>
        )
      })}
    </AnimatePresence>
  </div>
)
