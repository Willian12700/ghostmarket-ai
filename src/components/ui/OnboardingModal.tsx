import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { db } from '@/config/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { useAuthStore } from '@/store/authStore'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

export const OnboardingModal = ({ isOpen, onClose }: OnboardingModalProps) => {
  const { user } = useAuthStore()
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (isOpen) {
      const duration = 3 * 1000
      const end = Date.now() + duration
      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#7C3AED', '#A855F7', '#171717']
        })
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#7C3AED', '#A855F7', '#171717']
        })
        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()
    }
  }, [isOpen])

  const handleFinish = async () => {
    if (user?.email) {
      try {
        await updateDoc(doc(db, 'allowed_users', user.email), {
          used: true
        })
      } catch (error) {
        console.error('Error updating onboarding status:', error)
      }
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl bg-panel border-2 border-primary/20 rounded-3xl shadow-[0_0_50px_rgba(139,92,246,0.3)] overflow-hidden relative"
        >
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-50 pointer-events-none" />
          
          <div className="relative p-8 text-center flex flex-col items-center">
            {step === 1 && (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4 animate-pulse">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo Á  Máquina! ðŸš€</h2>
                <p className="text-textSecondary text-base mb-6">
                  Sua assinatura está ativa. Assista este vídeo rápido do Will para descobrir como recuperar seu investimento hoje mesmo.
                </p>

                {/* YOUTUBE VIDEO */}
                <div className="w-full aspect-video rounded-xl overflow-hidden border-2 border-border mb-6 shadow-xl relative group bg-black">
                  {/* Substitua o embed pelo vídeo oficial do Will depois */}
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/DhDSGnVCYtM?rel=0&autoplay=0" 
                    title="Vídeo de Boas Vindas" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="w-full h-full object-cover"
                  ></iframe>
                </div>

                <Button size="lg" className="w-full group font-bold text-lg h-14 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]" onClick={() => setStep(2)}>
                  Já assisti, quero lucrar <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center text-success mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Tudo pronto!</h2>
                <p className="text-textSecondary text-base mb-6">
                  O painel está 100% liberado para você. Aqui estão os atalhos para o sucesso rápido:
                </p>
                
                <div className="space-y-3 text-left w-full mb-8">
                  <div className="p-4 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors cursor-default">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">1</span>
                      Scanner de Leads
                    </h4>
                    <p className="text-sm text-textSecondary mt-1 ml-8">Encontre clientes de alto padrão, gere a copy fria com a IA e mande pro WhatsApp.</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors cursor-default">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">2</span>
                      TikTok Shop Viral
                    </h4>
                    <p className="text-sm text-textSecondary mt-1 ml-8">Crie personas absurdas e copie nossos roteiros virais pra vender como água.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors cursor-default">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">3</span>
                      Construtor de Prompts
                    </h4>
                    <p className="text-sm text-textSecondary mt-1 ml-8">Desenvolva sites e sistemas pra vender para os clientes que você captou no Radar.</p>
                  </div>
                </div>
                
                <Button size="lg" className="w-full font-bold h-14" onClick={handleFinish}>
                  Acessar meu Dashboard
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
