import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BookMarked, Trash2, Copy, Check, Users, ImageIcon, Code } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const PersonaHistory = () => {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) return

    const q = query(
      collection(db, 'persona_history'),
      where('userEmail', '==', user.email),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setHistory(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja apagar este histÃ³rico?')) {
      try {
        await deleteDoc(doc(db, 'persona_history', id))
        addToast('HistÃ³rico apagado com sucesso', 'success')
      } catch (error) {
        addToast('Erro ao apagar histÃ³rico', 'error')
      }
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    addToast('Prompt copiado!', 'success')
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <BookMarked className="w-6 h-6 text-primary" /> HistÃ³rico de Personas
        </h2>
        <p className="text-textSecondary">Suas personas geradas ficam salvas aqui para vocÃª nunca perder seus prompts.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 bg-panel border border-border rounded-xl">
          <Users className="w-12 h-12 text-textSecondary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white mb-2">Nenhum histÃ³rico encontrado</h3>
          <p className="text-textSecondary">Gere sua primeira persona para ela aparecer aqui.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((item) => (
            <Card key={item.id} className="relative overflow-hidden group">
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-error hover:bg-error/10 hover:text-error h-8 px-2">
                  <Trash2 className="w-4 h-4 mr-1" /> Apagar
                </Button>
              </div>

              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* ESPECIFICAÃ‡Ã•ES */}
                  <div className="w-full md:w-1/3 space-y-4 border-r border-border pr-6">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{item.productName || 'Produto sem nome'}</h3>
                      <p className="text-xs text-textSecondary flex items-center gap-1">
                        {item.createdAt?.toDate ? format(item.createdAt.toDate(), "dd 'de' MMMM 'Ã s' HH:mm", { locale: ptBR }) : 'Recentemente'}
                      </p>
                    </div>

                    {item.productImageUrl && (
                      <div className="aspect-square w-32 rounded-lg overflow-hidden border border-border">
                        <img src={item.productImageUrl} alt="Produto" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-textSecondary">Nicho:</span> <span className="text-white font-medium">{item.niche}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-textSecondary">GÃªnero:</span> <span className="text-white font-medium">{item.gender}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-textSecondary">Idade:</span> <span className="text-white font-medium">{item.ageGroup}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-textSecondary">Etnia:</span> <span className="text-white font-medium">{item.ethnicity}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-textSecondary">Cabelo:</span> <span className="text-white font-medium">{item.hair}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-textSecondary">Estilo:</span> <span className="text-white font-medium">{item.style}</span>
                      </div>
                    </div>
                  </div>

                  {/* PROMPTS */}
                  <div className="w-full md:w-2/3 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2"><ImageIcon className="w-4 h-4 text-primary" /> Prompt de Imagem</h4>
                        <Button variant="secondary" size="sm" onClick={() => copyToClipboard(item.imagePrompt, `img_${item.id}`)} className="h-6 text-[10px] px-2">
                          {copiedId === `img_${item.id}` ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                          Copiar
                        </Button>
                      </div>
                      <div className="bg-background rounded-md p-3 border border-border text-xs text-textSecondary font-mono break-words">
                        {item.imagePrompt}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2"><Code className="w-4 h-4 text-primary" /> Prompt de Roteiro</h4>
                        <Button variant="secondary" size="sm" onClick={() => copyToClipboard(item.chatPrompt, `chat_${item.id}`)} className="h-6 text-[10px] px-2">
                          {copiedId === `chat_${item.id}` ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                          Copiar
                        </Button>
                      </div>
                      <div className="bg-background rounded-md p-3 border border-border text-xs text-textSecondary font-mono whitespace-pre-wrap max-h-40 overflow-auto custom-scrollbar">
                        {item.chatPrompt}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
