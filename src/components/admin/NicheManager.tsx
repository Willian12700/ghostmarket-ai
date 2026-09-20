import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { db } from '@/config/firebase'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { useToastStore } from '@/store/toastStore'
import { Tags, Plus, X } from 'lucide-react'

export const NicheManager = () => {
  const [niches, setNiches] = useState<string[]>([])
  const [newNiche, setNewNiche] = useState('')
  const [loading, setLoading] = useState(true)
  const { addToast } = useToastStore()

  useEffect(() => {
    const docRef = doc(db, 'global_settings', 'niches')
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setNiches(snap.data().list || [])
      } else {
        // If it doesn't exist, create it with default niches
        const defaultNiches = [
          'SaaS / Tecnologia',
          'E-commerce / Lojas Virtuais',
          'Saúde e Bem-estar (Médicos/Estética)',
          'Finanças / Investimentos',
          'Imobiliária / Corretores',
          'Educação / Cursos Online (EAD)',
          'Restaurante / Delivery',
          'Agência de Marketing / Serviços'
        ]
        setDoc(docRef, { list: defaultNiches })
        setNiches(defaultNiches)
      }
      setLoading(false)
    }, (error) => {
      console.error(error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleAddNiche = async () => {
    if (!newNiche.trim()) return
    if (niches.includes(newNiche.trim())) {
      addToast('Este nicho já existe.', 'error')
      return
    }

    try {
      const updatedList = [...niches, newNiche.trim()]
      await setDoc(doc(db, 'global_settings', 'niches'), { list: updatedList }, { merge: true })
      setNewNiche('')
      addToast('Nicho adicionado com sucesso!', 'success')
    } catch (e) {
      console.error(e)
      addToast('Erro ao adicionar nicho.', 'error')
    }
  }

  const handleRemoveNiche = async (nicheToRemove: string) => {
    try {
      const updatedList = niches.filter(n => n !== nicheToRemove)
      await setDoc(doc(db, 'global_settings', 'niches'), { list: updatedList }, { merge: true })
      addToast('Nicho removido.', 'success')
    } catch (e) {
      console.error(e)
      addToast('Erro ao remover nicho.', 'error')
    }
  }

  return (
    <Card className="border-border shadow-[0_0_20px_rgba(0,0,0,0.1)] bg-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Tags className="w-5 h-5 text-primary" />
          Injetor de Nichos e Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-textSecondary mb-4">
          Adicione ou remova nichos. Eles aparecerão automaticamente na lista de seleção do Prompt Builder para todos os usuários do sistema.
        </p>

        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <Input 
              placeholder="Ex: Clínica Odontológica" 
              value={newNiche}
              onChange={e => setNewNiche(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddNiche()}
            />
          </div>
          <Button onClick={handleAddNiche} disabled={!newNiche.trim()} className="gap-2">
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-textSecondary text-sm py-4">Carregando nichos...</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {niches.map(niche => (
              <div key={niche} className="bg-background border border-border rounded-full pl-3 pr-1 py-1 flex items-center gap-2">
                <span className="text-sm text-textSecondary">{niche}</span>
                <button 
                  onClick={() => handleRemoveNiche(niche)}
                  className="p-1 hover:bg-error/10 hover:text-error text-textSecondary rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {niches.length === 0 && (
              <span className="text-sm text-textSecondary">Nenhum nicho cadastrado.</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
