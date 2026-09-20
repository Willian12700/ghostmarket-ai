import { useState, useEffect } from 'react'
import { Search, MapPin, Phone, Smartphone, Filter, ShieldAlert, Check, Plus, MessageSquare, Globe as GlobeIcon, Star, Sparkles, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import { useContractStore } from '@/store/contractStore'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'

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

export const Scanner = () => {
  const [isScanning, setIsScanning] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [savedLeads, setSavedLeads] = useState<Record<string, boolean>>({})
  
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedState, setSelectedState] = useState('SP')
  const [selectedCity, setSelectedCity] = useState('São Paulo')
  const [niche, setNiche] = useState('Barbearia')
  const [onlyWithoutSite, setOnlyWithoutSite] = useState(false)
  
  const [xrayLead, setXrayLead] = useState<Lead | null>(null)

  const placesLib = useMapsLibrary('places')
  
  const { addContract } = useContractStore()
  const { user } = useAuthStore()
  const { addToast } = useToastStore()

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
      alert("A API do Google Maps ainda está carregando ou ocorreu um erro.");
      return;
    }
    
    setIsScanning(true)
    setLeads([])
    
    try {
      const { Place } = placesLib;
      
      const query = `${niche} em ${selectedCity}, ${selectedState}, Brasil`;
      
      const request = {
        textQuery: query,
        fields: ['id', 'displayName', 'formattedAddress', 'nationalPhoneNumber', 'websiteURI', 'rating', 'userRatingCount'],
        maxResultCount: 20
      };
      
      const { places } = await Place.searchByText(request);
      
      if (!places || places.length === 0) {
        setLeads([]);
        setIsScanning(false);
        return;
      }
      
      const realLeads: Lead[] = places.map((place: any) => {
        let phone = place.nationalPhoneNumber || '';
        phone = String(phone).replace(/\D/g, ''); 
        
        let insta = '';
        let website = '';

        if (place.websiteURI) {
          if (place.websiteURI.includes('instagram.com/')) {
            const match = place.websiteURI.match(/instagram\\.com\/([^\/]+)/);
            if (match && match[1]) {
              insta = '@' + match[1].split('?')[0];
            }
          } else {
            website = place.websiteURI;
          }
        }
        
        return {
          id: place.id,
          name: place.displayName || niche,
          category: niche,
          city: selectedCity,
          phone: phone,
          instagram: insta,
          website: website,
          rating: place.rating || 0,
          userRatingsTotal: place.userRatingCount || 0,
          status: 'Novo'
        }
      });

      if (onlyWithoutSite) {
        setLeads(realLeads.filter(l => !l.website));
      } else {
        setLeads(realLeads);
      }
    } catch (error) {
      console.error(error);
      setLeads([{ id: 'error', name: 'Erro na Busca', category: 'Verifique a API', city: '', phone: '', instagram: '', website: '', rating: 0, userRatingsTotal: 0, status: 'Novo' }]);
    } finally {
      setIsScanning(false)
    }
  }

  const formatPhone = (phone: string) => {
    if (phone.length === 11) {
      return `(${phone.substring(0, 2)}) ${phone.substring(2, 7)}-${phone.substring(7, 11)}`
    } else if (phone.length === 10) {
      return `(${phone.substring(0, 2)}) ${phone.substring(2, 6)}-${phone.substring(6, 10)}`
    }
    return phone
  }

  const exportToCSV = () => {
    if (leads.length === 0) return;
    
    const headers = ['Nome,Categoria,Cidade,Telefone,Instagram,Website,Status'];
    const rows = leads.map(l => 
      `"${l.name}","${l.category}","${l.city}","${l.phone}","${l.instagram}","${l.website}","${l.status}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_${selectedCity}_${niche}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleSendToCRM = async (lead: Lead) => {
    if (!user?.email) {
      addToast('Erro: Usuário não logado.', 'error');
      return;
    }
    try {
      await addContract(user.email, {
        client: lead.name,
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'Lead',
        phone: lead.phone,
        city: lead.city,
        instagram: lead.instagram
      })
      
      setSavedLeads(prev => ({ ...prev, [lead.id]: true }))
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      
      addToast('Lead adicionado ao CRM com sucesso!', 'success')
    } catch (e) {
      console.error(e)
      addToast('Erro ao salvar no CRM.', 'error')
    }
  }

  const generateWhatsAppMessage = (lead: Lead) => {
    if (!lead.website && lead.rating >= 4.0) {
      return encodeURIComponent(`Olá! Encontrei a *${lead.name}* no Google Maps. Vocês tem uma avaliação incrível de ${lead.rating} estrelas, parabéns pelo ótimo trabalho! 🚀\n\nPorém, notei que vocês ainda não possuem um catálogo ou site próprio no perfil. Muitas pessoas desistem de comprar/agendar porque buscam essa facilidade.\n\nPosso enviar um material rápido de como a gente resolve isso e atrai mais clientes para vocês?`);
    }
    return encodeURIComponent(`Olá, encontrei o perfil da *${lead.name}* e percebi um potencial gigantesco! Posso enviar um material rápido de como podemos escalar as vendas de vocês com automação e um sistema próprio?`);
  }

  const handleSearchInstagram = (lead: Lead) => {
    const query = `site:instagram.com ${lead.name} ${lead.city}`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  }

  return (
    <div className="space-y-6 max-w-7xl pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Search className="w-8 h-8 text-primary" />
          Scanner de Leads
        </h2>
        <p className="text-textSecondary mt-2">Encontre oportunidades comerciais por localização e nicho e prospecte instantaneamente.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Filtros de Busca
            </div>
            
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer text-textSecondary hover:text-white transition-colors">
              <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={onlyWithoutSite} onChange={(e) => setOnlyWithoutSite(e.target.checked)} />
                <div className="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-error"></div>
              </div>
              <span className={onlyWithoutSite ? 'text-error font-bold' : ''}>Apenas Sem Site</span>
            </label>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-textSecondary">Estado</label>
              <select 
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                {states.map(state => (
                  <option key={state.id} value={state.sigla}>{state.nome}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-textSecondary">Cidade</label>
              <select 
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={cities.length === 0}
              >
                {cities.map(city => (
                  <option key={city.id} value={city.nome}>{city.nome}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Input 
                label="Nicho (ex: Barbearia)"
                placeholder="Ex: Restaurante"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                className="flex-1 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]" 
                onClick={handleScan}
                disabled={isScanning || !niche || !selectedCity}
              >
                {isScanning ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Pesquisar leads'
                )}
              </Button>
              
              {leads.length > 0 && leads[0].id !== 'error' && (
                <Button 
                  variant="secondary" 
                  onClick={exportToCSV}
                  title="Exportar para Excel (CSV)"
                  className="px-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isScanning ? (
        <div className="flex flex-col items-center justify-center py-20 text-textSecondary">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
            <Search className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-lg font-medium text-white animate-pulse">Varrendo o Google Places...</p>
          <p className="text-sm mt-2 text-primary">Encontrando as melhores oportunidades pra você.</p>
        </div>
      ) : leads.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leads.map((lead) => (
            <Card key={lead.id} className="hover:border-primary/50 transition-colors flex flex-col relative overflow-hidden">
              {!lead.website && lead.id !== 'error' && (
                <div className="absolute top-0 right-0 bg-error text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-lg z-10 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  SEM SITE
                </div>
              )}
              
              <CardContent className="p-5 pt-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-white pr-2 text-lg leading-tight" title={lead.name}>{lead.name}</h3>
                    
                    <div className="flex items-center gap-2 mt-1.5">
                      {lead.rating > 0 ? (
                        <div className="flex items-center text-xs font-medium text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 fill-current mr-1" />
                          {lead.rating} ({lead.userRatingsTotal})
                        </div>
                      ) : (
                        <div className="text-xs text-textSecondary bg-border px-2 py-0.5 rounded-full">Novo no Maps</div>
                      )}
                      <p className="text-xs text-primary font-medium">{lead.category}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6 flex-1 mt-2">
                  <div className="flex items-center text-sm text-textSecondary">
                    <MapPin className="w-4 h-4 mr-2 text-primary/70 shrink-0" />
                    <span className="truncate">{lead.city}</span>
                  </div>
                  <div className="flex items-center text-sm text-textSecondary">
                    <Phone className="w-4 h-4 mr-2 text-primary/70 shrink-0" />
                    {lead.phone ? formatPhone(lead.phone) : 'Não informado'}
                  </div>
                  {lead.website && (
                    <div className="flex items-center text-sm text-textSecondary">
                      <GlobeIcon className="w-4 h-4 mr-2 text-success/70 shrink-0" />
                      <a href={lead.website} target="_blank" rel="noreferrer" className="truncate text-blue-400 hover:underline">{lead.website.replace('https://', '').replace('http://', '')}</a>
                    </div>
                  )}
                </div>

                {lead.id !== 'error' && (
                  <div className="flex flex-col gap-2 mt-auto">
                    <Button 
                      onClick={() => setXrayLead(lead)} 
                      className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 font-bold mb-1"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Raio-X com IA (Argumentos)
                    </Button>
                    
                    {/* WhatsApp Botão Principal */}
                    {lead.phone ? (
                      <a 
                        href={`https://wa.me/55${lead.phone}?text=${generateWhatsAppMessage(lead)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <Button className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-black font-bold">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Abordar no Whats
                        </Button>
                      </a>
                    ) : (
                      <Button disabled className="w-full bg-[#25D366]/20 text-[#25D366] font-bold border-none">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Sem Telefone
                      </Button>
                    )}
                    
                    {/* Botões Secundários */}
                    <div className="flex gap-2">
                      <Button 
                        variant="secondary" 
                        className={`flex-1 ${savedLeads[lead.id] ? 'text-success bg-success/10 border-success/20' : ''}`}
                        onClick={() => handleSendToCRM(lead)}
                        disabled={savedLeads[lead.id]}
                      >
                        {savedLeads[lead.id] ? (
                          <><Check className="w-4 h-4 mr-1" /> No CRM</>
                        ) : (
                          <><Plus className="w-4 h-4 mr-1" /> Add CRM</>
                        )}
                      </Button>

                      {lead.instagram ? (
                        <a 
                          href={`https://instagram.com/${lead.instagram.replace('@', '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button variant="secondary" className="w-full text-[#E1306C] hover:bg-[#E1306C]/10 border-[#E1306C]/20">
                            <Smartphone className="w-4 h-4 mr-1" /> Ver Insta
                          </Button>
                        </a>
                      ) : (
                        <Button variant="secondary" onClick={() => handleSearchInstagram(lead)} className="flex-1 text-[#E1306C] hover:bg-[#E1306C]/10 border-[#E1306C]/20">
                          <Search className="w-3 h-3 mr-1" /> Buscar Insta
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-textSecondary border-2 border-dashed border-border rounded-xl">
          <ShieldAlert className="w-12 h-12 mb-4 text-borderHover" />
          <p className="text-lg font-medium text-textPrimary">Nenhum lead encontrado</p>
          <p className="text-sm mt-1">Realize uma busca para encontrar oportunidades.</p>
        </div>
      )}

      {/* RAIO-X MODAL */}
      <AnimatePresence>
        {xrayLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setXrayLead(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-panel border border-border w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <h3 className="font-bold text-white text-lg">Raio-X com IA</h3>
                </div>
                <button onClick={() => setXrayLead(null)} className="text-textSecondary hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <h4 className="text-xl font-black text-white mb-1">{xrayLead.name}</h4>
                  <p className="text-sm text-textSecondary">{xrayLead.category} em {xrayLead.city}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background border border-border rounded-xl p-4 text-center">
                    <p className="text-xs text-textSecondary mb-1 font-medium">Reputação (Google)</p>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="text-xl font-bold text-white">{xrayLead.rating || 'N/A'}</span>
                    </div>
                    <p className="text-[10px] text-textSecondary mt-1">{xrayLead.userRatingsTotal} avaliações</p>
                  </div>
                  
                  <div className="bg-background border border-border rounded-xl p-4 text-center">
                    <p className="text-xs text-textSecondary mb-1 font-medium">Presença Digital</p>
                    {xrayLead.website ? (
                      <div className="text-success font-bold text-lg flex items-center justify-center gap-2">
                        <GlobeIcon className="w-5 h-5" /> Tem Site
                      </div>
                    ) : (
                      <div className="text-error font-bold text-lg flex items-center justify-center gap-2">
                        <ShieldAlert className="w-5 h-5" /> Sem Site
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-xl p-5">
                  <h5 className="font-bold text-primary flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4" />
                    Argumento de Venda Sugerido:
                  </h5>
                  <p className="text-sm text-white leading-relaxed">
                    {!xrayLead.website && xrayLead.rating >= 4 ? (
                      <>`Olha só: a ${xrayLead.name}` tem uma nota altíssima no Google (${xrayLead.rating} estrelas)! Isso prova que o serviço/produto deles é excelente. A fraqueza? Eles não têm um site ou sistema de vendas online.\n\n**O seu Pitch:** "Oi! Vocês são muito bem avaliados, mas estão perdendo dinheiro no boca a boca digital porque os clientes procuram o site de vocês no Google para comprar/agendar e não acham nada. Deixa eu montar uma página focada em conversão pra vocês e dobrar essas avaliações!"</>
                    ) : !xrayLead.website ? (
                      <>`A ${xrayLead.name}` não tem site e a presença digital é fraca.\n\n**O seu Pitch:** "Oi! Percebi que vocês ainda dependem 100% de indicações ou do Instagram. Posso criar uma plataforma que funciona 24h vendendo por vocês, passando muito mais credibilidade e profissionalismo."</>
                    ) : (
                      <>`A ${xrayLead.name}` já tem um site. O objetivo aqui é vender um RE-DESIGN ou automação.\n\n**O seu Pitch:** "Oi! Vi o site de vocês e achei bacana, mas notei que a tecnologia é um pouco antiga. Com as IAs atuais, conseguimos fazer um sistema que atende os clientes sozinho, muito mais rápido. Topa uma avaliação gratuita?"</>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
