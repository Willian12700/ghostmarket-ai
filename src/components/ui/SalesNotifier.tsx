import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/store/authStore'
import { DollarSign, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface SaleNotification {
  id: string
  clientName: string
  amount: number
  date: string
}

const CASH_SOUND_URL = "https://www.soundjay.com/misc/sounds/cash-register-01.mp3"

export const SalesNotifier = () => {
  const { user } = useAuthStore()
  const [sales, setSales] = useState<SaleNotification[]>([])
  

    useEffect(() => {
    if (!user?.email) return

    let isFirstSnapshot = true;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.email)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isFirstSnapshot) {
        isFirstSnapshot = false
        return
      }
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data()
          
          // Verifica se é uma transação aprovada recente (opcional)
          if (data.status === 'Aprovado' || data.status === 'paid') {
            const newSale = {
              id: change.doc.id,
              clientName: data.clientName || 'Cliente',
              amount: Number(data.amount) || 0,
              date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            }
            
            // Adiciona a notificação na tela
            setSales((prev) => [...prev, newSale])
            
            // Toca o som de dinheiro
            const audio = new Audio(CASH_SOUND_URL)
            audio.volume = 0.5
            audio.play().catch(e => console.log('Audio play failed:', e))

            // Remove a notificação após 5 segundos
            setTimeout(() => {
              setSales((prev) => prev.filter((s) => s.id !== newSale.id))
            }, 5000)
          }
        }
      })
    })

    return () => unsubscribe()
  }, [user])

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {sales.map((sale) => (
          <motion.div
            key={sale.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="bg-[#0b0416] border border-success/30 shadow-[0_0_20px_rgba(34,197,94,0.15)] rounded-xl p-4 flex items-center gap-4 pointer-events-auto relative overflow-hidden"
          >
            {/* Efeito de brilho de fundo */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-success/10 rounded-full blur-[30px] pointer-events-none" />

            <div className="w-12 h-12 rounded-full bg-[#0a1e14] border border-[#164a2e] flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
            
            <div className="flex-1">
              <h4 className="text-success font-bold text-sm uppercase tracking-wider mb-0.5">Venda Realizada!</h4>
              <p className="text-white font-medium text-sm truncate">{sale.clientName}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-lg font-extrabold text-success">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.amount)}
                </p>
                <span className="text-xs text-textSecondary">{sale.date}</span>
              </div>
            </div>

            <button 
              onClick={() => setSales(prev => prev.filter(s => s.id !== sale.id))}
              className="absolute top-2 right-2 text-textSecondary hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
