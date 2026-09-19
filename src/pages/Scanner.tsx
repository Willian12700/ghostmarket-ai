import { useState, useEffect } from 'react'
import { Search, MapPin, Phone, Smartphone, Filter, ShieldAlert, Check, Plus, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import { useContractStore } from '@/store/contractStore'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import confetti from 'canvas-confetti'

interface Lead {
  id: string
  name: string
  category: string
  city: string
  phone: string
  instagram: string
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
  
  const placesLib = useMapsLibrary('places')
  
  const { addContract } = useContractStore()
  const { user } = useAuthStore()
  const { addToast } = useToastStore()

  // Load States
  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => res.json())
      .then(data => setStates(data))
      .catch(console.error)
  }, [])

  // Load Cities when State changes
  useEffect(() => {
    if (!selectedState) return
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios?orderBy=nome`)
      .then(res => res.json())
      .then(data => {
        setCities(data)
        if (data.length > 0 && !data.find((c: City) => c.nome === selectedCity)) {
          setSelectedCity(data[0].nome)
        }
      })
      .catch(console.error)
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
        fields: ['id', 'displayName', 'formattedAddress', 'nationalPhoneNumber', 'websiteURI'],
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
        if (place.websiteURI && place.websiteURI.includes('instagram.com/')) {
          const match = place.websiteURI.match(/instagram\.com\/([^\/]+)/);
          if (match && match[1]) {
            insta = '@' + match[1].split('?')[0];
          }
        }
        
        if (!insta) {
          insta = '@' + (place.displayName || niche).toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
        }

        return {
          id: place.id,
          name: place.displayName || niche,
          category: niche,
          city: selectedCity,
          phone: phone,
          instagram: insta,
          status: 'Novo'
        };
      });

      setLeads(realLeads);
    } catch (error: any) {
      console.error("Erro ao buscar leads reais no Google Maps:", error);
      setLeads([{
        id: 'error',
        name: `Erro: ${error.message || String(error)}`,
        category: 'Erro',
        city: selectedCity,
        phone: '',
        instagram: '',
        status: 'Novo'
      }]);
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
    return phone;
  }

  const exportToCSV = () => {
    if (leads.length === 0) return;
    
    const headers = ['Nome,Categoria,Cidade,Telefone,Instagram,Status'];
    const rows = leads.map(l => 
      `"${l.name}","${l.category}","${l.city}","${l.phone}","${l.instagram}","${l.status}"`
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
      await addContract(user.uid, {
        client: lead.name,
        amount: 0, // Pode ser atualizado depois
        date: new Date().toISOString().split('T')[0],
        status: 'Lead',
        phone: lead.phone,
        instagram: lead.instagram,
        city: lead.city
      });
      
      setSavedLeads(prev => ({ ...prev, [lead.id]: true }));
      addToast(`${lead.name} salvo no CRM!`, 'success');
      
      // Estoura um micro confete pra dar dopamina
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#8B5CF6', '#A855F7', '#D946EF']
      });

    } catch (error) {
      addToast('Erro ao salvar no CRM.', 'error');
    }
  }

  const generateWhatsAppMessage = (lead: Lead) => {
    return encodeURIComponent(`Olá, encontrei o perfil da *${lead.name}* e percebi um potencial gigantesco! Posso enviar um material rápido de como podemos escalar as vendas de vocês?`);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Search className="w-6 h-6 text-primary" /> Scanner de Leads
        </h2>
        <p className="text-textSecondary">Encontre oportunidades comerciais por localização e nicho e prospecte instantaneamente.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5 text-primary" />
            Filtros de Busca
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
            <Card key={lead.id} className="hover:border-primary/50 transition-colors flex flex-col">
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-white truncate pr-2" title={lead.name}>{lead.name}</h3>
                    <p className="text-xs text-primary font-medium mt-1">{lead.category}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    savedLeads[lead.id]
                      ? 'bg-success/10 text-success border-success/20' 
                      : 'bg-panelHover text-textSecondary border-border'
                  }`}>
                    {savedLeads[lead.id] ? 'Salvo' : lead.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex items-center text-sm text-textSecondary">
                    <MapPin className="w-4 h-4 mr-2 text-primary/70" />
                    <span className="truncate">{lead.city}</span>
                  </div>
                  <div className="flex items-center text-sm text-textSecondary">
                    <Phone className="w-4 h-4 mr-2 text-primary/70" />
                    {lead.phone ? formatPhone(lead.phone) : 'Não informado'}
                  </div>
                  <div className="flex items-center text-sm text-textSecondary">
                    <Smartphone className="w-4 h-4 mr-2 text-primary/70" />
                    {lead.instagram || 'Não informado'}
                  </div>
                </div>

                {lead.id !== 'error' && (
                  <div className="flex flex-col gap-2 mt-auto">
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
                          Chamar no WhatsApp
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
                          <><Check className="w-4 h-4 mr-1" /> CRM</>
                        ) : (
                          <><Plus className="w-4 h-4 mr-1" /> CRM</>
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
                            Instagram
                          </Button>
                        </a>
                      ) : (
                        <Button variant="secondary" disabled className="flex-1 opacity-50 text-[#E1306C]">
                          Insta (X)
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
    </div>
  )
}
