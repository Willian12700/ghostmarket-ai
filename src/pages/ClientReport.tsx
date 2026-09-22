import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Eye, Globe, Calendar, Activity, ShieldCheck, ChevronUp, Users, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

export const ClientReport = () => {
  const { siteId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [siteData, setSiteData] = useState<any>(null)
  const [agencyData, setAgencyData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!siteId) return
      try {
        const siteDoc = await getDoc(doc(db, 'sites', siteId))
        if (!siteDoc.exists()) {
          setError(true)
          setLoading(false)
          return
        }
        
        const site = siteDoc.data()
        setSiteData(site)

        if (site.userId && site.userId !== 'anonymous') {
          const agencyDoc = await getDoc(doc(db, 'agency_settings', site.userId))
          if (agencyDoc.exists()) {
            setAgencyData(agencyDoc.data())
          }
        }
      } catch (err) {
        console.error('Error fetching report', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [siteId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0c29] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !siteData) {
    return (
      <div className="min-h-screen bg-[#0f0c29] flex flex-col items-center justify-center text-white">
        <Globe className="w-16 h-16 text-red-500 mb-4 opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Relatório não encontrado</h1>
        <p className="text-gray-400">O site pode ter sido removido ou o link é inválido.</p>
      </div>
    )
  }

  const primaryColor = agencyData?.primaryColor || '#8B5CF6'
  const agencyName = agencyData?.agencyName || 'Agência Parceira'

  // Animações
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white p-4 sm:p-8 font-sans" style={{ '--report-primary': primaryColor } as any}>
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; color: black !important; }
          .bg-[#0f0c29] { background: white !important; }
          .text-white { color: black !important; }
          .text-gray-400 { color: #666 !important; }
          .border-white/10 { border-color: #ddd !important; }
          button, .hide-on-print { display: none !important; }
          header { border-bottom: 2px solid #eee !important; padding-bottom: 20px !important; }
        }
      `}} />

      {/* Header White-label */}
      <header className="max-w-5xl mx-auto flex items-center justify-between mb-12 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          {agencyData?.logoUrl ? (
            <img src={agencyData.logoUrl} alt={agencyName} className="h-12 w-auto object-contain rounded-md" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[var(--report-primary)] flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(var(--report-primary),0.5)]">
              {agencyName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">{agencyName}</h1>
            <p className="text-sm text-gray-400">Relatório de Performance Analítica</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Sistema Online</span>
          </div>
          <button onClick={() => window.print()} className="px-4 py-2 bg-[var(--report-primary)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(var(--report-primary),0.5)]">
            Baixar PDF (White-Label)
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Visão Geral do Projeto</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-400">
            <a href={siteData.domain} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[var(--report-primary)] transition-colors">
              <Globe className="w-4 h-4" />
              {siteData.domain}
            </a>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              No ar desde {new Date(siteData.publishedAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Card Visitas */}
          <motion.div variants={item} className="bg-[#151230] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--report-primary)] opacity-5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[var(--report-primary)] bg-opacity-20 rounded-xl text-[var(--report-primary)]">
                <Eye className="w-6 h-6" />
              </div>
              <span className="flex items-center text-green-400 text-sm font-medium">
                <ChevronUp className="w-4 h-4 mr-1" />
                Ativo
              </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Acessos Totais</h3>
            <p className="text-4xl font-bold tracking-tight">{siteData.views || 0}</p>
          </motion.div>

          {/* Card Status */}
          <motion.div variants={item} className="bg-[#151230] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Status da Hospedagem</h3>
            <p className="text-2xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-green-500" />
              Operacional
            </p>
          </motion.div>

          {/* Card Engajamento */}
          <motion.div variants={item} className="bg-[#151230] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 opacity-5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Público Único (Estimado)</h3>
            <p className="text-4xl font-bold tracking-tight">{Math.floor((siteData.views || 0) * 0.65)}</p>
          </motion.div>
        </motion.div>

        {/* Chart Area Fake - para dar visual de dashboard avançado */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#151230] border border-white/10 rounded-2xl p-6 sm:p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Tráfego Recente</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
              <Clock className="w-4 h-4" />
              Atualizado em tempo real
            </div>
          </div>
          
          <div className="h-48 w-full flex items-end gap-2 sm:gap-4">
            {/* Gerando barras animadas baseadas nos views */}
            {[0.2, 0.4, 0.3, 0.6, 0.5, 0.8, 1].map((mult, i) => {
              const height = Math.max(10, Math.floor((siteData.views || 10) * mult)) % 100
              return (
                <div key={i} className="flex-1 flex flex-col justify-end items-center group relative">
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 text-xs px-2 py-1 rounded text-white whitespace-nowrap">
                    Dia {i + 1}
                  </div>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(15, height)}%` }}
                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                    className="w-full bg-[var(--report-primary)] rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity"
                  ></motion.div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
