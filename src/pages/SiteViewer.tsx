import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Button } from '@/components/ui/Button'
import { CheckCircle2 } from 'lucide-react'

// Mesmo formato de blocos
type BlockContent = any;
type Block = { id: string; type: string; content: BlockContent };

export const SiteViewer = () => {
  const { siteId } = useParams()
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchSite = async () => {
      if (!siteId) return
      try {
        const docRef = doc(db, 'sites', siteId.toLowerCase())
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          setBlocks(docSnap.data().blocks || [])
        } else {
          setError(true)
        }
      } catch (err) {
        console.error(err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchSite()
  }, [siteId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || blocks.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Site não encontrado</h1>
        <p className="text-textSecondary mb-8">Este endereço não existe ou foi removido.</p>
        <Link to="/">
          <Button>Criar meu próprio site</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-white font-sans overflow-x-hidden">
      {blocks.map((block) => {
        if (block.type === 'hero') {
          return (
            <div key={block.id} className="py-20 px-6 md:px-12 text-center bg-gradient-to-b from-primary/10 to-transparent relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
              <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
                {block.content.title}
              </h1>
              <p className="text-lg text-textSecondary max-w-2xl mx-auto mb-8">
                {block.content.subtitle}
              </p>
              <Button size="lg" className="shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                {block.content.button}
              </Button>
            </div>
          )
        }

        if (block.type === 'features') {
          return (
            <div key={block.id} className="py-20 px-6 md:px-12 bg-panel">
              <h2 className="text-3xl font-bold text-center text-white mb-12">
                {block.content.title}
              </h2>
              <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {[block.content.f1, block.content.f2, block.content.f3].map((f: string, i: number) => (
                  <div key={i} className="p-6 rounded-xl border border-border bg-background text-center">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {f}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        if (block.type === 'pricing') {
          return (
            <div key={block.id} className="py-20 px-6 md:px-12 bg-background">
              <div className="max-w-sm mx-auto p-8 rounded-2xl border border-primary/50 bg-panel shadow-[0_0_30px_rgba(139,92,246,0.15)] text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-purple-400" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {block.content.title}
                </h3>
                <div className="text-4xl font-extrabold text-primary mb-4">
                  {block.content.price}
                </div>
                <p className="text-textSecondary mb-8">
                  {block.content.desc}
                </p>
                <Button className="w-full">Comprar Agora</Button>
              </div>
            </div>
          )
        }

        if (block.type === 'cta') {
          return (
            <div key={block.id} className="py-24 px-6 md:px-12 text-center bg-primary relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-8 relative z-10">
                {block.content.title}
              </h2>
              <button className="bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl relative z-10">
                {block.content.button}
              </button>
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
