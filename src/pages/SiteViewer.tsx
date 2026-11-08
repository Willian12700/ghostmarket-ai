import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { compileTemplateToHtml } from '@/data/siteTemplates'

export const SiteViewer = () => {
  const { siteId } = useParams()
  const [html, setHtml] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSite = async () => {
      if (!siteId) return
      try {
        let docRef = doc(db, 'sites', siteId)
        let docSnap = await getDoc(docRef)

        // Fallback 1: check hosted_sites collection by ID
        if (!docSnap.exists()) {
          docRef = doc(db, 'hosted_sites', siteId)
          docSnap = await getDoc(docRef)
        }

        // Fallback 2: check sites collection by slug field
        if (!docSnap.exists()) {
          const qSites = query(collection(db, 'sites'), where('slug', '==', siteId))
          const snapSites = await getDocs(qSites)
          if (!snapSites.empty) {
            docSnap = snapSites.docs[0]
            docRef = doc(db, 'sites', docSnap.id)
          }
        }

        // Fallback 3: check hosted_sites collection by slug field
        if (!docSnap.exists()) {
          const qHosted = query(collection(db, 'hosted_sites'), where('slug', '==', siteId))
          const snapHosted = await getDocs(qHosted)
          if (!snapHosted.empty) {
            docSnap = snapHosted.docs[0]
            docRef = doc(db, 'hosted_sites', docSnap.id)
          }
        }

        if (docSnap.exists()) {
          const data = docSnap.data()

          if (data.isActive === false) {
            setHtml(
              '<div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #000; color: #fff; font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 20px;"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 24px;"><path d="M18.36 6.64A9 9 0 0 1 20.77 15"></path><path d="M6.16 6.16a9 9 0 1 0 12.68 12.68"></path><path d="M12 2v4"></path><path d="m2 2 20 20"></path></svg><h1 style="font-size: 24px; font-weight: bold; margin-bottom: 12px; margin-top: 0;">Site Temporariamente Indisponível</h1><p style="color: #a1a1aa; max-width: 400px; line-height: 1.5;">Este site foi desativado pelo proprietário. Se você é o dono, acesse o painel GhostMarket para reativar o domínio.</p></div>'
            )
            setLoading(false)
            return
          }

          if (data.isRedirect && data.redirectUrl) {
            window.location.replace(data.redirectUrl)
            return
          }

          const resolvedHtml =
            data.rawHtml ||
            data.html ||
            (data.studioConfig ? compileTemplateToHtml(data.studioConfig) : '')

          if (resolvedHtml) {
            let finalHtml = resolvedHtml

            // Auto-normalize WhatsApp links (ensures 55 country code and noopener noreferrer so Chrome never blocks api.whatsapp.com inside iframe)
            const whatsappFixScript = `
              <script>
                (function() {
                  function normalizeWaUrl(url) {
                    if (!url) return url;
                    return url.replace(/(wa\\.me\\/|phone=)(\\d{10,11})(?!\\d)/g, function(match, prefix, digits) {
                      if (!digits.startsWith('55')) {
                        return prefix + '55' + digits;
                      }
                      return match;
                    });
                  }
                  document.addEventListener('click', function(e) {
                    const a = e.target.closest && e.target.closest('a');
                    if (!a) return;
                    const href = a.getAttribute('href') || '';
                    if (href.includes('wa.me/') || href.includes('whatsapp.com')) {
                      const fixed = normalizeWaUrl(href);
                      a.setAttribute('href', fixed);
                      a.setAttribute('target', '_blank');
                      a.setAttribute('rel', 'noopener noreferrer');
                    }
                  }, true);
                  const origOpen = window.open;
                  window.open = function(url, target, features) {
                    const fixedUrl = typeof url === 'string' ? normalizeWaUrl(url) : url;
                    return origOpen.call(window, fixedUrl, target || '_blank', features || 'noopener,noreferrer');
                  };
                })();
              </script>
            `
            if (finalHtml.includes('</body>')) {
              finalHtml = finalHtml.replace('</body>', whatsappFixScript + '</body>')
            } else {
              finalHtml = finalHtml + whatsappFixScript
            }

            // AUTO-HEALING SYSTEM
            if (data.autoHealed) {
              const autoHealingScript = `
                <!-- GHOST AUTO-HEALING INJECTED -->
                <style>
                  html, body {
                    max-width: 100vw;
                    overflow-x: hidden;
                    box-sizing: border-box;
                  }
                  * { box-sizing: inherit; }
                </style>
                <script>
                  document.addEventListener('DOMContentLoaded', function() {
                    document.querySelectorAll('img').forEach(img => {
                      img.addEventListener('error', function() {
                        this.src = 'https://placehold.co/600x400/1a1a1a/10b981?text=Imagem+Recuperada';
                        this.style.border = '2px dashed #10b981';
                        this.style.opacity = '0.8';
                      });
                      if (img.complete && img.naturalHeight === 0) {
                        const event = new Event('error');
                        img.dispatchEvent(event);
                      }
                    });
                  });
                </script>
              `

              if (finalHtml.includes('</head>')) {
                finalHtml = finalHtml.replace('</head>', autoHealingScript + '</head>')
              } else {
                finalHtml = autoHealingScript + finalHtml
              }
            }

            setHtml(finalHtml)
          } else {
            setHtml(
              '<h1>Este site foi criado na versão antiga do sistema. Por favor, recrie o site usando o novo GhostStudio.</h1>'
            )
          }

          setLoading(false)

          // Analytics Tracker Fire-and-forget
          const visited = sessionStorage.getItem(`visited_${siteId}`)
          if (!visited) {
            updateDoc(docRef, { views: increment(1) })
              .then(() => {
                sessionStorage.setItem(`visited_${siteId}`, 'true')
              })
              .catch((e) => console.error('Analytics err', e))
          }
        } else {
          console.error('Site not found')
          setLoading(false)
        }
      } catch (err) {
        console.error('Error fetching site', err)
        setLoading(false)
      }
    }
    fetchSite()
  }, [siteId])

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            border: '3px solid rgba(16, 185, 129, 0.2)',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
        <style>
          {`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}
        </style>
      </div>
    )
  }

  if (!html) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
        Site não encontrado ou vazio.
      </div>
    )
  }

  return (
    <iframe
      title="Site Publicado"
      srcDoc={html}
      style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-top-navigation-by-user-activation allow-modals"
    />
  )
}
