import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Button } from '@/components/ui/Button'
import { CheckCircle2 } from 'lucide-react'

export const SiteViewer = () => {
  const { siteId } = useParams()
  const [blocks, setBlocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSite = async () => {
      if (!siteId) return
      try {
        const docRef = doc(db, 'sites', siteId)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          setBlocks(docSnap.data().blocks || [])
        } else {
          console.error('Site not found')
        }
      } catch (err) {
        console.error('Error fetching site', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSite()
  }, [siteId])

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-white">Carregando site...</div>
  }

  if (blocks.length === 0) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-white">Site não encontrado ou vazio.</div>
  }

  return (
    <div className="min-h-screen bg-background text-textPrimary font-sans">
      {blocks.map((block) => (
        <div key={block.id}>
          {block.type === 'custom-html' && (
            <div dangerouslySetInnerHTML={{ __html: block.content.html }} />
          )}

          {block.type === 'hero' && (
            <div className="py-20 px-6 md:px-12 text-center bg-gradient-to-b from-primary/10 to-transparent relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
              <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 max-w-4xl">
                {block.content.title}
              </h1>
              <p className="text-lg text-textSecondary max-w-2xl mx-auto mb-8">
                {block.content.subtitle}
              </p>
              
              <div className="mb-12">
                {block.content.buttonLink ? (
                  <a href={block.content.buttonLink} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="shadow-[0_0_20px_rgba(139,92,246,0.4)]">{block.content.button}</Button>
                  </a>
                ) : (
                  <Button size="lg" className="shadow-[0_0_20px_rgba(139,92,246,0.4)]">{block.content.button}</Button>
                )}
              </div>

              {block.content.imageUrl && (
                <div className="w-full max-w-3xl mx-auto relative z-10">
                  <img src={block.content.imageUrl} alt="Hero Image" className="w-full h-auto rounded-2xl shadow-2xl object-cover" />
                </div>
              )}
            </div>
          )}

          {block.type === 'features' && (
            <div className="py-20 px-6 md:px-12 bg-panel">
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
          )}

          {block.type === 'pricing' && (
            <div className="py-20 px-6 md:px-12 bg-background">
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
                {block.content.buttonLink ? (
                  <a href={block.content.buttonLink} target="_blank" rel="noopener noreferrer" className="block w-full">
                    <Button className="w-full">{block.content.button || 'Comprar Agora'}</Button>
                  </a>
                ) : (
                  <Button className="w-full">{block.content.button || 'Comprar Agora'}</Button>
                )}
              </div>
            </div>
          )}

          {block.type === 'cta' && (
            <div className="py-24 px-6 md:px-12 bg-primary relative overflow-hidden text-center">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-8 relative z-10">
                {block.content.title}
              </h2>
              <div className="relative z-10">
                {block.content.buttonLink ? (
                  <a href={block.content.buttonLink} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="secondary" className="text-primary font-bold shadow-2xl hover:scale-105">{block.content.button}</Button>
                  </a>
                ) : (
                  <Button size="lg" variant="secondary" className="text-primary font-bold shadow-2xl hover:scale-105">{block.content.button}</Button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
