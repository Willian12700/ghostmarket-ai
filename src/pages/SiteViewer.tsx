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
          
          if (data.isActive === false) {
            setHtml('<div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #000; color: #fff; font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 20px;"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 24px;"><path d="M18.36 6.64A9 9 0 0 1 20.77 15"></path><path d="M6.16 6.16a9 9 0 1 0 12.68 12.68"></path><path d="M12 2v4"></path><path d="m2 2 20 20"></path></svg><h1 style="font-size: 24px; font-weight: bold; margin-bottom: 12px; margin-top: 0;">Site Temporariamente Indisponível</h1><p style="color: #a1a1aa; max-width: 400px; line-height: 1.5;">Este site foi desativado pelo proprietário. Se você é o dono, acesse o painel GhostMarket para reativar o domínio.</p></div>');
            setLoading(false);
            return;
          }

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
            let finalHtml = data.rawHtml;
            
            // AUTO-HEALING SYSTEM
            if (data.autoHealed) {
              const autoHealingScript = `
                <!-- GHOST AUTO-HEALING INJECTED -->
                <style>
                  /* Previne rolagem horizontal no mobile (Botões vazando) */
                  html, body {
                    max-width: 100vw;
                    overflow-x: hidden;
                    box-sizing: border-box;
                  }
                  * { box-sizing: inherit; }
                </style>
                <script>
                  document.addEventListener('DOMContentLoaded', function() {
                    // Substitui qualquer imagem quebrada por um placeholder mantendo o tamanho
                    document.querySelectorAll('img').forEach(img => {
                      img.addEventListener('error', function() {
                        this.src = 'https://placehold.co/600x400/1a1a1a/8b5cf6?text=Imagem+Recuperada';
                        this.style.border = '2px dashed #8b5cf6';
                        this.style.opacity = '0.8';
                        console.log('Ghost Auto-Healing: Imagem 404 reparada com sucesso.');
                      });
                      
                      // Trigger manual caso a imagem já tenha falhado antes do script carregar
                      if (img.complete && img.naturalHeight === 0) {
                        const event = new Event('error');
                        img.dispatchEvent(event);
                      }
                    });
                  });
                </script>
              `;
              
              // Injeta antes de fechar a tag head, ou no topo do documento
              if (finalHtml.includes('</head>')) {
                finalHtml = finalHtml.replace('</head>', autoHealingScript + '</head>');
              } else {
                finalHtml = autoHealingScript + finalHtml;
              }
            }

            setHtml(finalHtml)
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
