import { useState } from 'react'
import { Search, MapPin, Phone, Smartphone, Filter, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Lead {
  id: string
  name: string
  category: string
  city: string
  phone: string
  instagram: string
  status: 'Novo' | 'Contatado'
}

export const Scanner = () => {
  const [isScanning, setIsScanning] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  
  const [filters, setFilters] = useState({
    country: 'Brasil',
    city: 'São Paulo',
    niche: 'Barbearia'
  })

  const handleScan = () => {
    setIsScanning(true)
    setLeads([])
    
    setTimeout(() => {
      // Generate some dummy leads based on the niche and city
      const mockLeads: Lead[] = Array.from({ length: Math.floor(Math.random() * 5) + 5 }).map((_, i) => ({
        id: `lead-${i}`,
        name: `${filters.niche} ${['Elite', 'Premium', 'Prime', 'VIP', 'Master'][Math.floor(Math.random() * 5)]} ${i + 1}`,
        category: filters.niche,
        city: filters.city,
        phone: '11999999999',
        instagram: `@${filters.niche.toLowerCase().replace(/\s+/g, '')}elite${i}`,
        status: Math.random() > 0.7 ? 'Contatado' : 'Novo'
      }))
      
      setLeads(mockLeads)
      setIsScanning(false)
    }, 2000)
  }

  const formatPhone = (phone: string) => {
    return `(${phone.substring(0, 2)}) ${phone.substring(2, 7)}-${phone.substring(7, 11)}`
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
            <Input
              label="País"
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
            />
            <Input
              label="Cidade"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            />
            <Input
              label="Nicho"
              value={filters.niche}
              onChange={(e) => setFilters({ ...filters, niche: e.target.value })}
            />
            <Button 
              className="w-full" 
              onClick={handleScan}
              disabled={isScanning || !filters.city || !filters.niche}
            >
              {isScanning ? 'Escaneando...' : 'Pesquisar leads'}
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
                    {formatPhone(lead.phone)}
                  </div>
                  <div className="flex items-center text-sm text-textSecondary">
                    <Smartphone className="w-4 h-4 mr-2" />
                    {lead.instagram}
                  </div>
                </div>

                <div className="flex gap-2">
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
