import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Sparkles, ArrowRight, CheckCircle2, Search, LayoutTemplate, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { db } from '@/config/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

export const OnboardingModal = ({ isOpen, onClose }: OnboardingModalProps) => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (isOpen) {
      const duration = 2.5 * 1000
      const end = Date.now() + duration
      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10B981', '#34D399', '#09090B']
        })
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#10B981', '#34D399', '#09090B']
        })
        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()
    }
  }, [isOpen])

  const handleFinish = async (targetRoute?: string) => {
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
    if (targetRoute) {
      navigate(targetRoute)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.04, y: -16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl bg-[#0E0E11] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden relative"
        >
          <div className="relative p-7 sm:p-8 text-center flex flex-col items-center">
            {step === 1 && (
              <>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Bem-vindo à Operação GhostAI! 🚀
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base mb-6 max-w-lg">
                  Sua conta foi ativada com sucesso. Assista a esta introdução rápida para ver como fechar seu primeiro contrato ainda hoje.
                </p>

                <div className="w-full aspect-video rounded-2xl overflow-hidden border border-zinc-800 mb-6 shadow-xl bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/DhDSGnVCYtM?rel=0&autoplay=0"
                    title="Vídeo de Boas Vindas"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full object-cover"
                  />
                </div>

                <Button
                  size="lg"
                  className="w-full group font-bold text-base h-12"
                  onClick={() => setStep(2)}
                >
                  Já assisti, ver o Plano de 3 Passos{' '}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Seu Plano de Execução Rápida
                </h2>
                <p className="text-zinc-400 text-sm mb-6">
                  Siga estes 3 passos simples para encontrar uma empresa e entregar um site + painel administrativo hoje:
                </p>

                <div className="space-y-3 text-left w-full mb-7">
                  <div
                    onClick={() => handleFinish('/scanner')}
                    className="p-4 rounded-2xl bg-[#09090B] border border-zinc-800 hover:border-emerald-500/40 transition-colors cursor-pointer group"
                  >
                    <h4 className="font-bold text-sm text-white flex items-center gap-2.5 group-hover:text-emerald-400">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs">
                        1
                      </span>
                      <Search className="w-4 h-4 text-emerald-400" />
                      <span>Scanner de Leads no Google Maps</span>
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1.5 ml-8">
                      Busque por Hamburguerias, Barbearias ou Clínicas na sua cidade, filtre por <strong>Sem Site</strong> e clique em <strong>Studio Site</strong>.
                    </p>
                  </div>

                  <div
                    onClick={() => handleFinish('/builder')}
                    className="p-4 rounded-2xl bg-[#09090B] border border-zinc-800 hover:border-emerald-500/40 transition-colors cursor-pointer group"
                  >
                    <h4 className="font-bold text-sm text-white flex items-center gap-2.5 group-hover:text-emerald-400">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs">
                        2
                      </span>
                      <LayoutTemplate className="w-4 h-4 text-emerald-400" />
                      <span>GhostStudio (+55 Modelos) + Painel Admin do Lojista</span>
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1.5 ml-8">
                      Personalize cores e textos em tempo real, ative o <strong>Painel Admin SHA-256</strong> com login e senha para o cliente e publique o link em 1 clique.
                    </p>
                  </div>

                  <div
                    onClick={() => handleFinish('/proposta')}
                    className="p-4 rounded-2xl bg-[#09090B] border border-zinc-800 hover:border-emerald-500/40 transition-colors cursor-pointer group"
                  >
                    <h4 className="font-bold text-sm text-white flex items-center gap-2.5 group-hover:text-emerald-400">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs">
                        3
                      </span>
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>Scripts X1 & Proposta/Contrato em PDF</span>
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1.5 ml-8">
                      Envie a prévia no WhatsApp com nossos scripts de alta resposta e emita o Contrato PDF com sua chave PIX para receber na hora.
                    </p>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full font-bold h-12"
                  onClick={() => handleFinish()}
                >
                  Acessar Meu Dashboard Agora
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
