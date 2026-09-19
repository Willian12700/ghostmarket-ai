import { useState, useEffect } from 'react'
import { BookMarked, Copy, Check, MessageSquare, Loader2, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { db } from '@/config/firebase'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'

export const Library = () => {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.email) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const q = query(
          collection(db, 'ai_history'),
          where('userId', '==', user.email)
          // Sem orderBy para nǜo precisar de comp index. Vamos ordenar no front.
        )
        const snap = await getDocs(q)
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        // sort in descending order
        data.sort((a: any, b: any) => {
          const timeA = a.timestamp?.toMillis() || 0
          const timeB = b.timestamp?.toMillis() || 0
          return timeB - timeA
        })
        setHistory(data)
      } catch (err) {
        console.error("Erro ao buscar histórico:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [user])

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    addToast('Copiado para a área de transferência!', 'success')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja apagar este item?')) return
    try {
      await deleteDoc(doc(db, 'ai_history', id))
      setHistory(prev => prev.filter(item => item.id !== id))
      addToast('Item removido.', 'success')
    } catch (err) {
      addToast('Erro ao remover item.', 'error')
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/20 rounded-xl">
          <BookMarked className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Biblioteca da IA</h2>
          <p className="text-textSecondary">Seu histórico de criações e scripts gerados.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <Card className="bg-surface/50 border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-20 text-textSecondary">
            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Sua biblioteca está vazia.</p>
            <p className="text-sm">Os scripts que você gerar na Creator IA aparecerão aqui.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {history.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-textPrimary flex items-center gap-2">
                    {item.type}
                    <span className="text-xs font-normal px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                      {item.niche}
                    </span>
                  </CardTitle>
                </div>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="text-textSecondary hover:text-error transition-colors p-1"
                  title="Apagar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="bg-background rounded-lg border border-border p-4 mb-4 flex-1 text-sm text-textSecondary whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {item.script}
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => copyToClipboard(item.id, item.script)}
                >
                  {copiedId === item.id ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copiedId === item.id ? 'Copiado!' : 'Copiar Texto'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
