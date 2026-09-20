import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/config/firebase'

export const SiteViewer = () => {
  const { siteId } = useParams()
  const [html, setHtml] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSite = async () => {
      if (!siteId) return
      try {
        const docRef = doc(db, 'sites', siteId)
        const docSnap = await getDoc(docRef)
        

        if (docSnap.exists()) {
          const data = docSnap.data()
          
          if (data.isRedirect && data.redirectUrl) {
            window.location.replace(data.redirectUrl)
            return;
          }
          
          // Analytics Tracker Invisível
          const visited = sessionStorage.getItem(`visited_${siteId}`)
          if (!visited) {
            try {
              await updateDoc(docRef, { views: increment(1) })
              sessionStorage.setItem(`visited_${siteId}`, 'true')
            } catch(e) { console.error('Analytics err', e) }
          }
          
          if (data.rawHtml) {

            setHtml(data.rawHtml)
          } else {
            // Caso seja um site antigo feito com blocks
            setHtml('<h1>Este site foi criado na versão antiga do sistema. Por favor, recrie o site usando o novo Ghost Builder.</h1>')
          }
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
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Carregando site...</div>
  }

  if (!html) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Site não encontrado ou vazio.</div>
  }

  return (
    <iframe 
      title="Site Publicado"
      srcDoc={html} 
      className="w-full h-screen border-none m-0 p-0 block"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-top-navigation allow-top-navigation-by-user-activation"
    />
  )
}
