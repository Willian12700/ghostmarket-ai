import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { MousePointerClick, TrendingUp, Link as LinkIcon, Calendar } from 'lucide-react'

interface ClickEvent {
  id: string
  plan: string
  source: string
  timestamp: Timestamp | null
  userAgent?: string
}

export const CheckoutStats = () => {
  const [clicks, setClicks] = useState<ClickEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'checkout_clicks'), orderBy('timestamp', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ClickEvent[]
      setClicks(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const clicksToday = clicks.filter(c => c.timestamp && c.timestamp.toDate() >= today).length
  const mensalClicks = clicks.filter(c => c.plan === 'mensal').length
  const vitalicioClicks = clicks.filter(c => c.plan === 'anual' || c.plan === 'vitalicio').length

  // By source
  const sourceCount = clicks.reduce((acc, c) => {
    const s = c.source || 'direto'
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <Card className="bg-surface border-border overflow-hidden relative mb-8">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
      <CardHeader className="border-b border-border relative z-10">
        <CardTitle className="text-xl flex items-center gap-2">
          <MousePointerClick className="w-5 h-5 text-primary" />
          Cliques no Checkout (Cakto)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 relative z-10">
        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded"></div>
                <div className="h-4 bg-white/10 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-background rounded-xl p-4 border border-border">
              <div className="text-textSecondary text-xs mb-1 flex items-center gap-1 uppercase tracking-wider font-bold"><Calendar className="w-3 h-3" /> Cliques Hoje</div>
              <div className="text-3xl font-bold text-white">{clicksToday}</div>
              <div className="text-xs text-primary mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Em tempo real</div>
            </div>
            
            <div className="bg-background rounded-xl p-4 border border-border">
              <div className="text-textSecondary text-xs mb-1 flex items-center gap-1 uppercase tracking-wider font-bold"><MousePointerClick className="w-3 h-3" /> Total Histórico</div>
              <div className="text-3xl font-bold text-white">{clicks.length}</div>
            </div>

            <div className="bg-background rounded-xl p-4 border border-border">
              <div className="text-textSecondary text-xs mb-1 flex items-center gap-1 uppercase tracking-wider font-bold">Planos</div>
              <div className="space-y-2 mt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/70">Mensal</span>
                  <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">{mensalClicks}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/70">Vitalício</span>
                  <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{vitalicioClicks}</span>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-xl p-4 border border-border">
              <div className="text-textSecondary text-xs mb-1 flex items-center gap-1 uppercase tracking-wider font-bold"><LinkIcon className="w-3 h-3" /> Origem (UTM/Ref)</div>
              <div className="space-y-2 mt-2 max-h-[80px] overflow-y-auto pr-1 custom-scrollbar">
                {Object.entries(sourceCount).sort((a,b) => b[1] - a[1]).map(([source, count]) => (
                  <div key={source} className="flex justify-between items-center text-sm">
                    <span className="text-white/70 truncate max-w-[80px]" title={source}>{source}</span>
                    <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded text-xs">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
