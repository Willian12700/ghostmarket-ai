import { useState } from 'react'
import { Search, Building2, Copy, Check, MapPin, Calendar, Briefcase, Phone, Users, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/toastStore'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'

interface QSA {
  nome_socio: string
  qualificacao_socio: string
}

interface CnpjData {
  razao_social: string
  nome_fantasia: string
  cnpj: string
  data_inicio_atividade: string
  descricao_situacao_cadastral: string
  logradouro: string
  numero: string
  municipio: string
  uf: string
  cep: string
  cnae_fiscal_descricao: string
  cnae_fiscal: number
  ddd_telefone_1: string
  qsa?: QSA[]
}

export const CnpjScanner = () => {
  const [cnpjInput, setCnpjInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CnpjData | null>(null)
  const [copied, setCopied] = useState(false)
  const { addToast } = useToastStore()

  const handleMask = (value: string) => {
    let v = value.replace(/\D/g, '')
    if (v.length > 14) v = v.substring(0, 14)
    v = v.replace(/^(\d{2})(\d)/, '$1.$2')
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2')
    v = v.replace(/(\d{4})(\d)/, '$1-$2')
    setCnpjInput(v)
  }

  const handleSearch = async () => {
    const cleanCnpj = cnpjInput.replace(/\D/g, '')
    if (cleanCnpj.length !== 14) {
      addToast('CNPJ inválido. Digite 14 números.', 'error')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`)
      if (!response.ok) {
        throw new Error('CNPJ não encontrado ou erro na API.')
      }
      const data = await response.json()
      setResult(data)
      addToast('Dossiê carregado com sucesso!', 'success')
    } catch (error) {
      console.error(error)
      addToast('Erro ao puxar dados do CNPJ.', 'error')
    } finally {
      setLoading(false)
    }
  }

  
  const formatPhone = (phoneStr: string) => {
    if (!phoneStr) return 'Não cadastrado';
    let p = phoneStr.replace(/\D/g, '');
    if (p.length === 10) {
      const ddd = p.substring(0, 2);
      const num = p.substring(2);
      if (['6','7','8','9'].includes(num[0])) {
        return `(${ddd}) 9${num.substring(0,4)}-${num.substring(4)}`;
      }
      return `(${ddd}) ${num.substring(0,4)}-${num.substring(4)}`;
    }
    if (p.length === 11) {
      const ddd = p.substring(0, 2);
      const num = p.substring(2);
      return `(${ddd}) ${num.substring(0,5)}-${num.substring(5)}`;
    }
    return phoneStr;
  };

  const getDonoName = (data: CnpjData) => {
    if (data.qsa && data.qsa.length > 0) {
      return data.qsa.map(q => q.nome_socio).join(', ');
    }
    // Remove os números de CPF que ficam no final da Razão Social do MEI
    let nome = data.razao_social.replace(/\d+$/, '').trim();
    return nome;
  };

  const formatDataToCopy = (data: CnpjData) => {
    let text = `*DADOS CADASTRAIS — ${data.nome_fantasia || data.razao_social}*\n\n`
    text += `*Razão Social:* ${data.razao_social}\n`
    text += `*Nome Fantasia:* ${data.nome_fantasia || 'Não informado'}\n`
    text += `*CNPJ:* ${data.cnpj}\n`
    
    // Format date from YYYY-MM-DD to DD/MM/YYYY
    const [year, month, day] = data.data_inicio_atividade.split('-')
    text += `*Data de Fundação:* ${day}/${month}/${year}\n`
    
    text += `*Situação Cadastral:* ${data.descricao_situacao_cadastral}\n`
    text += `*Endereço:* ${data.logradouro}, ${data.numero}, ${data.municipio} - ${data.uf}, CEP ${data.cep}\n`
    text += `*Atividade Principal (CNAE):* ${data.cnae_fiscal_descricao} (${data.cnae_fiscal})\n`
    text += `*Nome do Dono (Sócio/Responsável):* ${getDonoName(data)}\n`
    text += `*Telefone de Contato:* ${formatPhone(data.ddd_telefone_1)}\n`

    if (data.qsa && data.qsa.length > 0) {
      text += `\n*Sócios / Administradores:*\n`
      data.qsa.forEach(socio => {
        text += `- ${socio.nome_socio} (${socio.qualificacao_socio})\n`
      })
    }

    return text
  }

  const handleCopy = () => {
    if (!result) return
    const text = formatDataToCopy(result)
    navigator.clipboard.writeText(text)
    setCopied(true)
    addToast('Dossiê copiado!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 relative min-h-screen">
      <AnimatedBackground />
      
      <div className="relative z-10">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Dossiê de CNPJ
          </h1>
          <p className="text-textSecondary mt-2 text-lg">Puxe todos os dados públicos, endereço e sócios de qualquer empresa em tempo real.</p>
        </div>

        <Card className="mt-8 bg-panel/50 backdrop-blur-xl border-border">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full space-y-2">
                <Input 
                  label="Digite o CNPJ"
                  placeholder="00.000.000/0001-00"
                  value={cnpjInput}
                  onChange={(e) => handleMask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={loading || cnpjInput.length < 18}
                className="w-full sm:w-auto h-[42px] bg-gradient-to-r from-primary to-accent hover:opacity-90 font-bold px-8 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Puxar Dados
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8"
            >
              <Card className="bg-[#130e1d] border-[#261f36] overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
                
                <CardHeader className="flex flex-row justify-between items-start pb-4 border-b border-[#261f36] bg-[#0b0714]/50">
                  <div>
                    <CardTitle className="text-2xl font-black text-white flex items-center gap-2">
                      {result.nome_fantasia || result.razao_social}
                    </CardTitle>
                    <p className="text-textSecondary text-sm mt-1">CNPJ: {result.cnpj}</p>
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={handleCopy}
                    className="shrink-0 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                  >
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copiado' : 'Copiar Dossiê'}
                  </Button>
                </CardHeader>
                
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Razão Social</h4>
                      <p className="text-white text-lg font-medium bg-[#0b0714] p-3 rounded-lg border border-[#261f36]">{result.razao_social}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> Fundação</h4>
                        <p className="text-white bg-[#0b0714] p-3 rounded-lg border border-[#261f36]">{result.data_inicio_atividade.split('-').reverse().join('/')}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Situação</h4>
                        <p className="text-white bg-[#0b0714] p-3 rounded-lg border border-[#261f36] flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${result.descricao_situacao_cadastral === 'ATIVA' ? 'bg-success' : 'bg-error'}`}></span>
                          {result.descricao_situacao_cadastral}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1"><Briefcase className="w-3 h-3" /> CNAE Principal</h4>
                      <p className="text-white bg-[#0b0714] p-3 rounded-lg border border-[#261f36] text-sm">
                        {result.cnae_fiscal_descricao} <span className="text-textSecondary block mt-1">({result.cnae_fiscal})</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> Endereço Completo</h4>
                      <div className="text-white bg-[#0b0714] p-3 rounded-lg border border-[#261f36] space-y-1 text-sm">
                        <p>{result.logradouro}, {result.numero}</p>
                        <p>{result.municipio} - {result.uf}</p>
                        <p className="text-textSecondary">CEP: {result.cep}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1"><User className="w-3 h-3" /> Nome do Dono (Responsável)</h4>
                      <p className="text-white bg-[#0b0714] p-3 rounded-lg border border-[#261f36] font-medium mb-4">
                        {getDonoName(result)}
                      </p>
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1"><Phone className="w-3 h-3" /> Telefone de Contato</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-white bg-[#0b0714] p-3 rounded-lg border border-[#261f36] font-mono flex-1">
                          {formatPhone(result.ddd_telefone_1)}
                        </p>
                        {result.ddd_telefone_1 && (
                          <a
                            href={`https://wa.me/55${result.ddd_telefone_1.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#25D366] hover:bg-[#128C7E] text-white p-3 rounded-lg flex items-center justify-center transition-colors shadow-lg shadow-[#25D366]/20"
                            title="Chamar no WhatsApp"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>

                    {result.qsa && result.qsa.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1"><Users className="w-3 h-3" /> Sócios / Administradores</h4>
                        <div className="bg-[#0b0714] rounded-lg border border-[#261f36] overflow-hidden">
                          {result.qsa.map((socio, idx) => (
                            <div key={idx} className="p-3 border-b border-[#261f36] last:border-0">
                              <p className="text-white font-medium text-sm">{socio.nome_socio}</p>
                              <p className="text-textSecondary text-xs mt-0.5">{socio.qualificacao_socio}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
