import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  MapPin,
  Phone,
  Smartphone,
  Filter,
  ShieldAlert,
  Check,
  Plus,
  MessageSquare,
  Globe as GlobeIcon,
  Star,
  Sparkles,
  X,
  Building2,
  SearchCode,
  AlertTriangle,
  AtSign,
  LayoutTemplate,
  FileText,
  Download,
  Wand2,
  Flame
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import { useContractStore } from '@/store/contractStore'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { GlobalLeadScanner } from '@/components/dashboard/GlobalLeadScanner'

interface Lead {
  id: string
  name: string
  category: string
  city: string
  phone: string
  instagram: string
  website: string
  rating: number
  userRatingsTotal: number
  status: 'Novo' | 'Contatado'
  imageUrl?: string
  lat: number
  lng: number
  opportunityScore: number
}

interface State {
  id: number
  sigla: string
  nome: string
}

interface City {
  id: number
  nome: string
}

const STORAGE_KEY = 'ghostmarket_scanner_cache_v2'

const computeOpportunityScore = (hasWebsite: boolean, hasPhone: boolean, rating: number, reviewsCount: number): number => {
  let score = 20
  if (!hasWebsite) score += 45 // Sem site próprio = maior oportunidade de venda imediata
  if (hasPhone) score += 20 // Possui telefone/WhatsApp ativo para abordagem
  if (rating >= 4.2 && reviewsCount >= 10) score += 15 // Empresa estabelecida e bem avaliada
  return Math.min(100, score)
}

export const Scanner = () => {
  const navigate = useNavigate()
  const [isScanning, setIsScanning] = useState(false)
  const [showScannerAnimation, setShowScannerAnimation] = useState(false)

  const cached = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [])

  const [leads, setLeads] = useState<Lead[]>(cached?.leads || [])
  const [savedLeads, setSavedLeads] = useState<Record<string, boolean>>(cached?.savedLeads || {})

  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedState, setSelectedState] = useState(cached?.selectedState || 'SP')
  const [selectedCity, setSelectedCity] = useState(cached?.selectedCity || 'São Paulo')
  const [niche, setNiche] = useState(cached?.niche || 'Barbearia')
  const [onlyWithoutSite, setOnlyWithoutSite] = useState<boolean>(cached?.onlyWithoutSite || false)

  const [xrayLead, setXrayLead] = useState<Lead | null>(null)

  const placesLib = useMapsLibrary('places')
  const { addContract } = useContractStore()
  const { user } = useAuthStore()
  const { addToast } = useToastStore()

  // Salva automaticamente o estado da busca para nunca perder leads ao navegar
  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          leads,
          savedLeads,
          selectedState,
          selectedCity,
          niche,
          onlyWithoutSite
        })
      )
    } catch {
      // Ignore quota errors
    }
  }, [leads, savedLeads, selectedState, selectedCity, niche, onlyWithoutSite])

  useEffect(() => {
    if (xrayLead) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [xrayLead])

  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a: State, b: State) => a.nome.localeCompare(b.nome))
        setStates(sorted)
      })
  }, [])

  useEffect(() => {
    if (selectedState) {
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`)
        .then(res => res.json())
        .then(data => {
          setCities(data)
          if (!data.find((c: City) => c.nome === selectedCity)) {
            setSelectedCity(data[0]?.nome || '')
          }
        })
    }
  }, [selectedState])

  const handleScan = async () => {
    if (!placesLib) {
      addToast('A API do Google Maps ainda está inicializando. Tente novamente em 2 segundos.', 'error')
      return
    }

    setIsScanning(true)
    setShowScannerAnimation(true)
    setLeads([])

    try {
      const { Place } = placesLib
      const query = `${niche} em ${selectedCity}, ${selectedState}, Brasil`

      const request = {
        textQuery: query,
        fields: [
          'id',
          'displayName',
          'formattedAddress',
          'nationalPhoneNumber',
          'websiteURI',
          'rating',
          'userRatingCount',
          'photos',
          'location'
        ],
        maxResultCount: 20,
        region: 'br'
      }

      const { places } = await Place.searchByText(request)

      if (!places || places.length === 0) {
        setLeads([])
        setShowScannerAnimation(false)
        setIsScanning(false)
        return
      }

      const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
      const cityNorm = normalize(selectedCity)

      const matchedPlaces = places.filter((place: any) => {
        if (!place.formattedAddress) return true
        return normalize(place.formattedAddress).includes(cityNorm)
      })

      const finalPlaces = matchedPlaces.length > 0 ? matchedPlaces : places

      const realLeads: Lead[] = finalPlaces
        .map((place: any) => {
          let imageUrl = ''
          if (place.photos && place.photos.length > 0) {
            try {
              if (typeof place.photos[0].getURI === 'function' || typeof place.photos[0].getUrl === 'function') {
                imageUrl = place.photos[0].getURI
                  ? place.photos[0].getURI({ maxWidth: 600 })
                  : place.photos[0].getUrl({ maxWidth: 600 })
              } else if (place.photos[0].name) {
                imageUrl = `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=400&maxWidthPx=600&key=${import.meta.env.VITE_FIREBASE_API_KEY}`
              }
            } catch {
              // ignore photo error
            }
          }

          let phone = place.nationalPhoneNumber || ''
          phone = String(phone).replace(/\D/g, '')

          let insta = ''
          let website = ''

          if (place.websiteURI) {
            if (place.websiteURI.includes('instagram.com/') || place.websiteURI.includes('wa.me/')) {
              const match = place.websiteURI.match(/instagram\.com\/([^/?]+)/)
              if (match && match[1]) {
                insta = '@' + match[1]
              }
            } else {
              website = place.websiteURI
            }
          }

          const rating = place.rating || 0
          const userRatingsTotal = place.userRatingCount || 0
          const opportunityScore = computeOpportunityScore(Boolean(website), Boolean(phone), rating, userRatingsTotal)

          return {
            id: place.id,
            name: place.displayName || niche,
            category: niche,
            city: selectedCity,
            phone,
            instagram: insta,
            website,
            rating,
            userRatingsTotal,
            status: 'Novo' as const,
            imageUrl,
            lat: typeof place.location?.lat === 'function' ? place.location.lat() : place.location?.lat || 0,
            lng: typeof place.location?.lng === 'function' ? place.location.lng() : place.location?.lng || 0,
            opportunityScore
          }
        })
        .sort((a: Lead, b: Lead) => b.opportunityScore - a.opportunityScore)

      setLeads(realLeads)
    } catch (error) {
      setShowScannerAnimation(false)
      setIsScanning(false)
      console.error(error)
      addToast('Erro ao consultar o Google Maps. Verifique sua conexão.', 'error')
    }
  }

  const displayedLeads = useMemo(() => {
    if (onlyWithoutSite) {
      return leads.filter(l => !l.website)
    }
    return leads
  }, [leads, onlyWithoutSite])

  const formatPhone = (phone: string) => {
    if (phone.length === 11) {
      return `(${phone.substring(0, 2)}) ${phone.substring(2, 7)}-${phone.substring(7, 11)}`
    } else if (phone.length === 10) {
      return `(${phone.substring(0, 2)}) ${phone.substring(2, 6)}-${phone.substring(6, 10)}`
    }
    return phone
  }

  const exportToCSV = () => {
    if (displayedLeads.length === 0) return

    const headers = ['Nome,Categoria,Cidade,Telefone,Instagram,Website,Avaliacao,Score Oportunidade']
    const rows = displayedLeads.map(
      l =>
        `"${l.name.replace(/"/g, '""')}","${l.category}","${l.city}","${formatPhone(l.phone)}","${l.instagram}","${l.website || 'Sem Site'}","${l.rating}","${l.opportunityScore}%"`
    )
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + headers.concat(rows).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `leads_${selectedCity}_${niche}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    addToast('Planilha CSV exportada com sucesso!', 'success')
  }

  const handleSendToCRM = async (lead: Lead) => {
    if (!user?.email) {
      addToast('Erro: Usuário não logado.', 'error')
      return
    }
    try {
      await addContract(user.email, {
        client: lead.name,
        amount: 1500,
        date: new Date().toISOString().split('T')[0],
        status: 'Lead',
        phone: formatPhone(lead.phone),
        city: lead.city,
        niche: lead.category,
        instagram: lead.instagram,
        notes: `${lead.website ? `Site atual: ${lead.website}` : 'Empresa SEM SITE no Google Maps'} • Nota ${lead.rating} (${lead.userRatingsTotal} avaliações)`
      })

      setSavedLeads(prev => ({ ...prev, [lead.id]: true }))

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      })

      addToast(`${lead.name} salvo no seu CRM Kanban!`, 'success')
    } catch (e) {
      console.error(e)
      addToast('Erro ao salvar no CRM.', 'error')
    }
  }

  const handleSaveAllToCRM = async () => {
    if (!user?.email || displayedLeads.length === 0) return
    const unsaved = displayedLeads.filter(l => !savedLeads[l.id])
    if (unsaved.length === 0) {
      addToast('Todos os leads visíveis já estão salvos no CRM.', 'info')
      return
    }
    try {
      for (const lead of unsaved) {
        await addContract(user.email, {
          client: lead.name,
          amount: 1500,
          date: new Date().toISOString().split('T')[0],
          status: 'Lead',
          phone: formatPhone(lead.phone),
          city: lead.city,
          niche: lead.category,
          instagram: lead.instagram,
          notes: `${lead.website ? `Site: ${lead.website}` : 'Sem Site no Google'} • Score ${lead.opportunityScore}%`
        })
      }
      const nextSaved = { ...savedLeads }
      unsaved.forEach(l => {
        nextSaved[l.id] = true
      })
      setSavedLeads(nextSaved)
      addToast(`${unsaved.length} leads importados para o CRM Kanban!`, 'success')
    } catch (e) {
      console.error(e)
      addToast('Erro ao importar leads em lote.', 'error')
    }
  }

  const generateWhatsAppMessage = (lead: Lead) => {
    if (!lead.website && lead.rating >= 4.0) {
      return encodeURIComponent(
        `Olá! Encontrei a *${lead.name}* no Google Maps. Vocês têm uma avaliação excelente de ${lead.rating} estrelas (${lead.userRatingsTotal} avaliações), parabéns pelo trabalho!\n\nNotei que vocês ainda não possuem uma página própria de alta conversão vinculada ao perfil do Google para captar esses clientes direto no WhatsApp.\n\nPosso te enviar uma prévia rápida de como estruturamos isso para empresas de ${lead.category.toLowerCase()}?`
      )
    }
    return encodeURIComponent(
      `Olá, pessoal da *${lead.name}*! Tudo bem?\n\nEncontrei o perfil de vocês em ${lead.city} e preparei uma ideia prática para aumentar a captação de clientes de vocês pelo Google e WhatsApp. Posso mandar um resumo rápido por aqui?`
    )
  }

  const handleSearchInstagram = (lead: Lead) => {
    const query = `site:instagram.com ${lead.name} ${lead.city}`
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank')
  }

  const withoutSiteCount = leads.filter(l => !l.website).length
  const withPhoneCount = leads.filter(l => Boolean(l.phone)).length

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] font-mono uppercase tracking-wider mb-2">
            <Search className="w-3 h-3 text-zinc-300" />
            <span>Google Places API • Extrator B2B</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Scanner de Leads Geolocalizado</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Mapeie empresas locais, identifique negócios sem site próprio e aborde com 1 clique pelo Creator IA ou WhatsApp.
          </p>
        </div>

        {leads.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={handleSaveAllToCRM} className="h-9 px-3.5 text-xs font-semibold">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Salvar Todos no CRM
            </Button>
            <Button variant="secondary" onClick={exportToCSV} className="h-9 px-3.5 text-xs font-semibold">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Exportar CSV ({displayedLeads.length})
            </Button>
          </div>
        )}
      </div>

      {/* Search Filter Panel */}
      <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span>Parâmetros de Extração</span>
          </div>

          <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer text-zinc-300 select-none">
            <input
              type="checkbox"
              checked={onlyWithoutSite}
              onChange={e => setOnlyWithoutSite(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0"
            />
            <span className={onlyWithoutSite ? 'text-emerald-400 font-semibold' : 'text-zinc-400'}>
              Exibir apenas empresas SEM SITE ({withoutSiteCount})
            </span>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-4 items-end">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Estado (UF)</label>
            <select
              className="w-full h-10 rounded-lg border border-zinc-800 bg-[#09090B] px-3 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
            >
              {states.map(state => (
                <option key={state.id} value={state.sigla}>
                  {state.nome} ({state.sigla})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Cidade</label>
            <select
              className="w-full h-10 rounded-lg border border-zinc-800 bg-[#09090B] px-3 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              disabled={cities.length === 0}
            >
              {cities.map(city => (
                <option key={city.id} value={city.nome}>
                  {city.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Input
              label="Nicho / Segmento"
              placeholder="Ex: Clínica Odontológica, Barbearia..."
              value={niche}
              onChange={e => setNiche(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
            />
          </div>

          <Button
            className="h-10 text-xs sm:text-sm font-semibold w-full"
            onClick={handleScan}
            disabled={isScanning || !niche || !selectedCity}
          >
            {isScanning ? (
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Escanear Região
              </>
            )}
          </Button>
        </div>

        {/* Summary Metrics when leads exist */}
        {leads.length > 0 && (
          <div className="pt-3 border-t border-zinc-800/70 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <span>
              Extraídos: <strong className="text-zinc-100 tabular-nums">{leads.length} empresas</strong>
            </span>
            <span>•</span>
            <span>
              Sem Site Próprio:{' '}
              <strong className="text-amber-400 tabular-nums">{withoutSiteCount} oportunidades quentes</strong>
            </span>
            <span>•</span>
            <span>
              Com Telefone/WhatsApp: <strong className="text-emerald-400 tabular-nums">{withPhoneCount} contatos</strong>
            </span>
          </div>
        )}
      </div>

      {/* 3D Radar Animation Overlay */}
      <AnimatePresence mode="wait">
        {showScannerAnimation && (
          <motion.div
            key="scanner-3d"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="fixed inset-0 z-[100]"
          >
            <GlobalLeadScanner
              leads={leads}
              onAnimationComplete={() => {
                setShowScannerAnimation(false)
                setIsScanning(false)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Grid */}
      {!showScannerAnimation && displayedLeads.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayedLeads.map(lead => (
            <div
              key={lead.id}
              className="bg-[#0E0E11] border border-zinc-800/80 hover:border-zinc-700 rounded-xl flex flex-col relative overflow-hidden transition-colors"
            >
              {/* Top Image if available */}
              {lead.imageUrl && (
                <div className="w-full h-28 bg-zinc-900 shrink-0 border-b border-zinc-800/80 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E11] via-transparent to-transparent z-10" />
                  <img src={lead.imageUrl} alt={lead.name} className="w-full h-full object-cover opacity-85" />
                </div>
              )}

              {/* Badges Top Right */}
              <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                    lead.opportunityScore >= 80
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-zinc-900/90 text-zinc-300 border-zinc-700'
                  }`}
                >
                  <Flame className="w-3 h-3" />
                  Score {lead.opportunityScore}%
                </span>
                {!lead.website && (
                  <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                    SEM SITE
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-3">
                  <h3 className="font-bold text-zinc-100 text-base leading-snug line-clamp-1" title={lead.name}>
                    {lead.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    {lead.rating > 0 ? (
                      <span className="inline-flex items-center text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md tabular-nums">
                        <Star className="w-3 h-3 fill-current mr-1" />
                        {lead.rating} ({lead.userRatingsTotal})
                      </span>
                    ) : (
                      <span className="text-[11px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md">
                        Sem avaliações
                      </span>
                    )}
                    <span className="text-xs text-zinc-400 font-medium truncate">{lead.category}</span>
                  </div>
                </div>

                <div className="space-y-1.5 mb-5 flex-1 text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{lead.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="tabular-nums">{lead.phone ? formatPhone(lead.phone) : 'Telefone não listado'}</span>
                  </div>
                  {lead.website && (
                    <div className="flex items-center gap-2">
                      <GlobeIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-zinc-300 hover:text-white underline underline-offset-2"
                      >
                        {lead.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Matrix */}
                <div className="space-y-2 mt-auto pt-3 border-t border-zinc-800/80">
                  {/* Primary Row: WhatsApp + Creator IA */}
                  <div className="grid grid-cols-2 gap-2">
                    {lead.phone ? (
                      <a
                        href={`https://api.whatsapp.com/send?phone=55${lead.phone}&text=${generateWhatsAppMessage(lead)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chamar Zap</span>
                      </a>
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-zinc-900 text-zinc-600 border border-zinc-800 font-medium text-xs cursor-not-allowed"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Sem Zap</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const params = new URLSearchParams({
                          clientName: lead.name,
                          niche: lead.category,
                          city: lead.city,
                          phone: formatPhone(lead.phone)
                        })
                        navigate(`/creator?${params.toString()}`)
                      }}
                      className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Creator IA</span>
                    </button>
                  </div>

                  {/* Secondary Row: Criar Site + Proposta PDF + Raio-X */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const params = new URLSearchParams({
                          leadName: lead.name,
                          leadCategory: lead.category,
                          leadCity: lead.city,
                          leadPhone: lead.phone
                        })
                        if (lead.website) params.set('leadWebsite', lead.website)
                        if (lead.imageUrl) params.set('leadImage', lead.imageUrl)
                        navigate(`/builder?${params.toString()}`)
                      }}
                      className="inline-flex items-center justify-center gap-1 h-8 px-2 rounded-lg bg-[#09090B] hover:bg-zinc-900 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                      title="Abrir modelo pronto do nicho no Studio em Tempo Real"
                    >
                      <LayoutTemplate className="w-3 h-3" />
                      <span>Studio Site</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const params = new URLSearchParams({
                          leadName: lead.name,
                          leadCategory: lead.category,
                          leadCity: lead.city,
                          leadPhone: lead.phone
                        })
                        navigate(`/proposta?${params.toString()}`)
                      }}
                      className="inline-flex items-center justify-center gap-1 h-8 px-2 rounded-lg bg-[#09090B] hover:bg-zinc-900 text-zinc-300 border border-zinc-800 text-[11px] font-medium transition-colors cursor-pointer"
                      title="Gerar Proposta Comercial em PDF"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Proposta</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setXrayLead(lead)}
                      className="inline-flex items-center justify-center gap-1 h-8 px-2 rounded-lg bg-[#09090B] hover:bg-zinc-900 text-zinc-300 border border-zinc-800 text-[11px] font-medium transition-colors cursor-pointer"
                      title="Abrir Dossiê Raio-X e argumentos de venda"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Raio-X</span>
                    </button>
                  </div>

                  {/* Tertiary Row: Salvar CRM + Instagram */}
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSendToCRM(lead)}
                      disabled={savedLeads[lead.id]}
                      className={`flex-1 inline-flex items-center justify-center gap-1 h-8 px-2 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                        savedLeads[lead.id]
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-[#09090B] hover:bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {savedLeads[lead.id] ? (
                        <>
                          <Check className="w-3 h-3" /> Salvo no CRM
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" /> Salvar no CRM
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        lead.instagram
                          ? window.open(`https://instagram.com/${lead.instagram.replace('@', '')}`, '_blank')
                          : handleSearchInstagram(lead)
                      }
                      className="flex-1 inline-flex items-center justify-center gap-1 h-8 px-2 rounded-lg bg-[#09090B] hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>{lead.instagram ? 'Abrir Insta' : 'Achar Insta'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!showScannerAnimation && displayedLeads.length === 0 && !isScanning && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-xl bg-[#0E0E11]/50">
          <Search className="w-10 h-10 mb-3 text-zinc-600" />
          <p className="text-sm font-semibold text-zinc-300">Nenhuma empresa listada no momento</p>
          <p className="text-xs mt-1 text-zinc-500">
            Selecione o estado, cidade e nicho acima e clique em <strong className="text-zinc-300">Escanear Região</strong>.
          </p>
        </div>
      )}

      {/* RAIO-X MODAL */}
      <AnimatePresence>
        {xrayLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setXrayLead(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="bg-[#0E0E11] border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[88vh]"
            >
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-[#09090B]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-zinc-300" />
                  <h3 className="font-bold text-white text-sm">Raio-X Comercial & Inteligência de Abordagem</h3>
                </div>
                <button onClick={() => setXrayLead(null)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 p-5 overflow-y-auto space-y-5 custom-scrollbar">
                <div>
                  <h4 className="text-lg font-bold text-white">{xrayLead.name}</h4>
                  <p className="text-xs text-zinc-500">
                    {xrayLead.category} • {xrayLead.city}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-3.5 text-center">
                    <p className="text-[11px] text-zinc-500 mb-1">Reputação Google</p>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                      <span className="text-lg font-bold text-white tabular-nums">{xrayLead.rating || 'N/A'}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{xrayLead.userRatingsTotal} avaliações</p>
                  </div>

                  <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-3.5 text-center">
                    <p className="text-[11px] text-zinc-500 mb-1">Diagnóstico de Estrutura</p>
                    {xrayLead.website ? (
                      <div className="text-emerald-400 font-bold text-sm flex items-center justify-center gap-1.5 mt-1">
                        <GlobeIcon className="w-4 h-4" /> Possui Site
                      </div>
                    ) : (
                      <div className="text-amber-400 font-bold text-sm flex items-center justify-center gap-1.5 mt-1">
                        <ShieldAlert className="w-4 h-4" /> Sem Site Próprio
                      </div>
                    )}
                    <p className="text-[10px] text-zinc-500 mt-1">Score: {xrayLead.opportunityScore}%</p>
                  </div>
                </div>

                <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-4">
                  <h5 className="font-semibold text-zinc-200 text-xs flex items-center gap-2 mb-2">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Argumento Recomendado para o Fechamento:
                  </h5>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {!xrayLead.website && xrayLead.rating >= 4
                      ? `A ${xrayLead.name} possui excelente reputação (${xrayLead.rating} estrelas), mas perde clientes todos os dias porque quem pesquisa no Google não encontra uma Landing Page dedicada para atendimento rápido no WhatsApp.`
                      : !xrayLead.website
                      ? `A ${xrayLead.name} depende apenas de indicação ou redes sociais. Ofereça uma estrutura própria 24h com botão direto de WhatsApp e agendamento rápido.`
                      : `A ${xrayLead.name} já possui site, então a melhor entrada é oferecer modernização mobile + Chatbot de IA 24h para qualificar leads automaticamente.`}
                  </p>
                </div>

                <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-4">
                  <h5 className="font-semibold text-zinc-200 text-xs flex items-center gap-2 mb-3">
                    <SearchCode className="w-4 h-4 text-zinc-400" />
                    Investigação Profunda (1-Clique)
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(
                        xrayLead.name + ' ' + xrayLead.city + ' cnpj'
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 bg-[#0E0E11] border border-zinc-800 hover:border-zinc-600 rounded-lg text-xs text-zinc-300"
                    >
                      <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">Descobrir CNPJ no Google</span>
                    </a>

                    {xrayLead.website && (
                      <a
                        href={`https://registro.br/tecnologia/ferramentas/whois/?search=${
                          new URL(
                            xrayLead.website.startsWith('http') ? xrayLead.website : 'https://' + xrayLead.website
                          ).hostname
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2.5 bg-[#0E0E11] border border-zinc-800 hover:border-zinc-600 rounded-lg text-xs text-zinc-300"
                      >
                        <GlobeIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">Consultar Dono (Whois)</span>
                      </a>
                    )}

                    <a
                      href={`https://www.reclameaqui.com.br/busca/?q=${encodeURIComponent(xrayLead.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 bg-[#0E0E11] border border-zinc-800 hover:border-zinc-600 rounded-lg text-xs text-zinc-300"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">Pesquisar ReclameAqui</span>
                    </a>

                    <a
                      href={`https://www.google.com/search?q=site:instagram.com+${encodeURIComponent(
                        xrayLead.name + ' ' + xrayLead.city
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 bg-[#0E0E11] border border-zinc-800 hover:border-zinc-600 rounded-lg text-xs text-zinc-300"
                    >
                      <AtSign className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span className="truncate">Localizar Instagram</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
