import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Sparkles, ArrowRight, Rocket, Target, Zap } from 'lucide-react'
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden relative"
        >
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-50" />
          
          <div className="relative p-8 text-center flex flex-col items-center">
            {step === 1 && (
              <>
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-6 animate-pulse">
                  <Sparkles className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-textPrimary mb-4">Bem-vindo ao GhostMarket AI!</h2>
                <p className="text-textSecondary text-lg mb-8">
                  Sua assinatura Vitalícia foi ativada com sucesso. Prepare-se para multiplicar suas vendas usando o poder da nossa Inteligência Artificial.
                </p>
                <Button size="lg" className="w-full group" onClick={() => setStep(2)}>
                  Começar Tour <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-6">
                  <Rocket className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-textPrimary mb-4">Explore os Recursos</h2>
                <div className="space-y-4 text-left w-full mb-8">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-background border border-border">
                    <Target className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <h4 className="font-bold text-textPrimary">Scanner de Leads</h4>
                      <p className="text-sm text-textSecondary">Encontre clientes em qualquer lugar do mundo pelo Google Maps integrado.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-background border border-border">
                    <Zap className="w-6 h-6 text-accent shrink-0" />
                    <div>
                      <h4 className="font-bold text-textPrimary">Creator IA</h4>
                      <p className="text-sm text-textSecondary">Gere copies, propostas e roteiros em segundos com a nossa IA treinada.</p>
                    </div>
                  </div>
                </div>
                <Button size="lg" className="w-full" onClick={handleFinish}>
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
