import { useState, useEffect } from 'react'
import { Search, MapPin, Phone, Smartphone, Filter, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useMapsLibrary } from '@vis.gl/react-google-maps'

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
  
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedState, setSelectedState] = useState('SP')
  const [selectedCity, setSelectedCity] = useState('São Paulo')
  const [niche, setNiche] = useState('Barbearia')
  
  const placesLib = useMapsLibrary('places')

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
        // Formatar o telefone do Google
        let phone = place.nationalPhoneNumber || '';
        phone = String(phone).replace(/\D/g, ''); 
        
        // Se a empresa não tiver telefone público no Google, deixamos vazio
        // Opcional: tentar pegar instagram do websiteURI
        let insta = '';
        if (place.websiteURI && place.websiteURI.includes('instagram.com/')) {
          const match = place.websiteURI.match(/instagram\.com\/([^\/]+)/);
          if (match && match[1]) {
            insta = '@' + match[1].split('?')[0];
          }
        }
        
        if (!insta) {
          insta = '@' + (place.displayName || niche).toLowerCase().replace(/[^a-z0-9]/g, '');
        }

        return {
          id: place.id,
          name: place.displayName || niche,
          category: niche,
          city: selectedCity,
          phone: phone, // Agora é real!
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Estado</label>
              <select 
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-white placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                {states.map(s => (
                  <option key={s.sigla} value={s.sigla}>{s.nome}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Cidade</label>
              <select 
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-white placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                {cities.map(c => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
            </div>

            <Input
              label="Nicho (ex: Barbearia)"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            />
            <Button 
              className="w-full" 
              onClick={handleScan}
              disabled={isScanning || !selectedCity || !niche}
            >
              {isScanning ? 'Buscando reais...' : 'Pesquisar leads'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isScanning ? (
        <div className="flex flex-col items-center justify-center py-20 text-textSecondary">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
            <Search className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-lg font-medium animate-pulse">Escaneando oportunidades...</p>
          <p className="text-sm mt-2">Isso pode levar alguns segundos.</p>
        </div>
      ) : leads.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leads.map((lead) => (
            <Card key={lead.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-white truncate pr-2">{lead.name}</h3>
                    <p className="text-xs text-primary font-medium mt-1">{lead.category}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    lead.status === 'Novo' 
                      ? 'bg-success/10 text-success border-success/20' 
                      : 'bg-panelHover text-textSecondary border-border'
                  }`}>
                    {lead.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-textSecondary">
                    <MapPin className="w-4 h-4 mr-2" />
                    {lead.city}
                  </div>
                  <div className="flex items-center text-sm text-textSecondary">
                    <Phone className="w-4 h-4 mr-2" />
                    {lead.phone ? formatPhone(lead.phone) : 'Não informado'}
                  </div>
                  <div className="flex items-center text-sm text-textSecondary">
                    <Smartphone className="w-4 h-4 mr-2" />
                    {lead.instagram || 'Não informado'}
                  </div>
                </div>

                <div className="flex gap-2">
                  {lead.phone ? (
                    <a 
                      href={`https://wa.me/55${lead.phone}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="secondary" className="w-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-[#25D366]/20">
                        WhatsApp
                      </Button>
                    </a>
                  ) : (
                    <Button variant="secondary" disabled className="flex-1 opacity-50 bg-[#25D366]/5 text-[#25D366] border-[#25D366]/10">
                      Sem Telefone
                    </Button>
                  )}
                  
                  {lead.instagram ? (
                    <a 
                      href={`https://instagram.com/${lead.instagram.replace('@', '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="secondary" className="w-full bg-[#E1306C]/10 text-[#E1306C] hover:bg-[#E1306C]/20 border-[#E1306C]/20">
                        Instagram
                      </Button>
                    </a>
                  ) : (
                    <Button variant="secondary" disabled className="flex-1 opacity-50 bg-[#E1306C]/5 text-[#E1306C] border-[#E1306C]/10">
                      Sem Instagram
                    </Button>
                  )}
                </div>
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
