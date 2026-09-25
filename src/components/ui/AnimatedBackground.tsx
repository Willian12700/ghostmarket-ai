import { motion } from 'framer-motion'

export const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div 
        animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }} 
        transition={{ repeat: Infinity, duration: 15, ease: "linear" }} 
        className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/20 blur-[150px] rounded-full mix-blend-screen" 
      />
      <motion.div 
        animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.5, 1] }} 
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }} 
        className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-600/10 blur-[150px] rounded-full mix-blend-screen" 
      />
      <motion.div 
        animate={{ x: [0, 100, 0], y: [0, 100, 0], scale: [1, 1.1, 1] }} 
        transition={{ repeat: Infinity, duration: 25, ease: "linear" }} 
        className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen" 
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)]" style={{ backgroundSize: '24px 24px' }}></div>
    </div>
  )
}
