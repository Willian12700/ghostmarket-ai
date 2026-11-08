import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Building2,
  Copy,
  Check,
  MapPin,
  Calendar,
  Briefcase,
  Phone,
  Users,
  User,
  DollarSign,
  Mail,
  MessageCircle,
  Wand2,
  Plus,
  CheckCircle2,
  ShieldAlert,
  LayoutTemplate,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/toastStore'
import { useContractStore } from '@/store/contractStore'
import { useAuthStore } from '@/store/authStore'

interface QSA {
  nome_socio: string
  qualificacao_socio: string
}

interface CnaeSecundario {
  codigo: number
  descricao: string
}

interface CnpjData {
  razao_social: string
  nome_fantasia: string
  cnpj: string
  data_inicio_atividade: string
  descricao_situacao_cadastral: string
  logradouro: string
  numero: string
  complemento?: string
  bairro?: string
  municipio: string
  uf: string
  cep: string
  cnae_fiscal_descricao: string
  cnae_fiscal: number
  cnaes_secundarios?: CnaeSecundario[]
  ddd_telefone_1: string
  ddd_telefone_2?: string
  email?: string
  capital_social?: number
  porte?: string
  natureza_juridica?: string
  qsa?: QSA[]
}

export const CnpjScanner = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addContract } = useContractStore()
  const { addToast } = useToastStore()

  const [cnpjInput, setCnpjInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CnpjData | null>(null)
  const [copied, setCopied] = useState(false)
  const [savedToCrm, setSavedToCrm] = useState(false)

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
      addToast('CNPJ inválido. Digite os 14 números.', 'error')
      return
    }

    setLoading(true)
    setResult(null)
    setSavedToCrm(false)

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`)
      if (!response.ok) {
        throw new Error('CNPJ não encontrado ou erro na API.')
      }
      const data = await response.json()
      setResult(data)
      addToast('Dossiê empresarial carregado com sucesso!', 'success')
    } catch (error) {
      console.error(error)
      addToast('Não foi possível localizar este CNPJ na base da Receita Federal.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const formatPhone = (phoneStr?: string) => {
    if (!phoneStr) return 'Não cadastrado'
    const p = phoneStr.replace(/\D/g, '')
    if (p.length === 10) {
      const ddd = p.substring(0, 2)
      const num = p.substring(2)
      if (['6', '7', '8', '9'].includes(num[0])) {
        return `(${ddd}) 9${num.substring(0, 4)}-${num.substring(4)}`
      }
      return `(${ddd}) ${num.substring(0, 4)}-${num.substring(4)}`
    }
    if (p.length === 11) {
      const ddd = p.substring(0, 2)
      const num = p.substring(2)
      return `(${ddd}) ${num.substring(0, 5)}-${num.substring(5)}`
    }
    return phoneStr
  }

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val || 0))

  const getDonoName = (data: CnpjData) => {
    if (data.qsa && data.qsa.length > 0) {
      return data.qsa.map(q => q.nome_socio).join(', ')
    }
    return data.razao_social.replace(/\d+$/, '').trim()
  }

  const formatDataToCopy = (data: CnpjData) => {
    const [year, month, day] = (data.data_inicio_atividade || '').split('-')
    let text = `*DOSSIÊ EMPRESARIAL — ${data.nome_fantasia || data.razao_social}*\n\n`
    text += `*Razão Social:* ${data.razao_social}\n`
    text += `*Nome Fantasia:* ${data.nome_fantasia || 'Não informado'}\n`
    text += `*CNPJ:* ${data.cnpj}\n`
    text += `*Situação Cadastral:* ${data.descricao_situacao_cadastral}\n`
    text += `*Data de Fundação:* ${day ? `${day}/${month}/${year}` : data.data_inicio_atividade}\n`
    text += `*Capital Social:* ${formatCurrency(data.capital_social)}\n`
    text += `*Porte:* ${data.porte || 'Não informado'}\n`
    text += `*Atividade Principal (CNAE):* ${data.cnae_fiscal_descricao} (${data.cnae_fiscal})\n`
    text += `*Decisor / Quadro Societário:* ${getDonoName(data)}\n`
    text += `*Telefone Principal:* ${formatPhone(data.ddd_telefone_1)}\n`
    if (data.email) text += `*E-mail Receita:* ${data.email.toLowerCase()}\n`
    text += `*Endereço:* ${data.logradouro}, ${data.numero} - ${data.municipio}/${data.uf}, CEP ${data.cep}\n`
    return text
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(formatDataToCopy(result))
    setCopied(true)
    addToast('Dossiê completo copiado!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    if (!result) return
    const rawPhone = (result.ddd_telefone_1 || '').replace(/\D/g, '')
    const socio = getDonoName(result).split(',')[0]
    const msg = encodeURIComponent(
      `Olá, falo com ${socio} ou responsável pela ${result.nome_fantasia || result.razao_social}?`
    )
    if (rawPhone) {
      window.open(`https://wa.me/55${rawPhone}?text=${msg}`, '_blank')
    } else {
      window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank')
    }
  }

  const handleOpenCreator = () => {
    if (!result) return
    const socio = getDonoName(result).split(',')[0]
    const params = new URLSearchParams({
      clientName: socio || result.nome_fantasia || result.razao_social,
      niche: result.cnae_fiscal_descricao || '',
      city: result.municipio || '',
      phone: formatPhone(result.ddd_telefone_1)
    })
    navigate(`/creator?${params.toString()}`)
  }

  const handleOpenStudio = () => {
    if (!result) return
    const params = new URLSearchParams({
      leadName: result.nome_fantasia || result.razao_social,
      leadCategory: result.cnae_fiscal_descricao || '',
      leadCity: `${result.municipio} - ${result.uf}`,
      leadPhone: formatPhone(result.ddd_telefone_1)
    })
    navigate(`/builder?${params.toString()}`)
  }

  const handleOpenProposalPdf = () => {
    if (!result) return
    const socio = getDonoName(result).split(',')[0]
    const params = new URLSearchParams({
      leadName: result.nome_fantasia || result.razao_social,
      socioName: socio || '',
      cnpj: result.cnpj || '',
      leadCategory: result.cnae_fiscal_descricao || '',
      leadCity: `${result.municipio} - ${result.uf}`,
      leadPhone: formatPhone(result.ddd_telefone_1)
    })
    navigate(`/proposta?${params.toString()}`)
  }

  const handleSaveToCrm = async () => {
    if (!result || !user?.email || savedToCrm) return
    try {
      const socio = getDonoName(result)
      await addContract(user.email, {
        client: result.nome_fantasia || result.razao_social,
        amount: 1500,
        date: new Date().toISOString().split('T')[0],
        status: 'Lead',
        phone: formatPhone(result.ddd_telefone_1),
        city: `${result.municipio} - ${result.uf}`,
        niche: result.cnae_fiscal_descricao,
        notes: `CNPJ: ${result.cnpj} | Sócio(s): ${socio} | Capital Social: ${formatCurrency(result.capital_social)}`
      })
      setSavedToCrm(true)
      addToast('Empresa e sócios salvos no seu CRM Kanban!', 'success')
    } catch (e) {
      console.error(e)
      addToast('Erro ao salvar no CRM.', 'error')
    }
  }

  const isAtiva = result?.descricao_situacao_cadastral?.toUpperCase().includes('ATIVA')

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] font-mono uppercase tracking-wider mb-2">
            <Building2 className="w-3 h-3 text-zinc-300" />
            <span>Receita Federal • Inteligência B2B</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Dossiê Empresarial por CNPJ</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Identifique o quadro societário (QSA), capital social, porte, CNAE e contate diretamente o decisor da empresa.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <Input
              label="CNPJ da Empresa (14 dígitos)"
              placeholder="00.000.000/0001-00"
              value={cnpjInput}
              onChange={e => handleMask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading || cnpjInput.replace(/\D/g, '').length < 14}
            className="w-full sm:w-auto h-10 px-6 text-xs sm:text-sm font-semibold"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Consultar Receita Federal
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results Dossier */}
      {result && (
        <div className="space-y-5">
          {/* Executive Summary Card & Commercial Actions */}
          <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${
                    isAtiva
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}
                >
                  {isAtiva ? <CheckCircle2 className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                  {result.descricao_situacao_cadastral}
                </span>
                {result.porte && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-900 text-zinc-400 border border-zinc-800">
                    Porte: {result.porte}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-500 bg-zinc-900/60 border border-zinc-800/60">
                  CNPJ: {result.cnpj}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {result.nome_fantasia || result.razao_social}
              </h2>
              <p className="text-xs text-zinc-500">{result.razao_social}</p>
            </div>

            {/* 1-Click Commercial Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                onClick={handleWhatsApp}
                className="h-9 px-3.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                Chamar no WhatsApp
              </Button>
              <Button variant="secondary" onClick={handleOpenStudio} className="h-9 px-3.5 text-xs font-semibold">
                <LayoutTemplate className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Criar Site no Studio
              </Button>
              <Button variant="secondary" onClick={handleOpenProposalPdf} className="h-9 px-3.5 text-xs font-semibold">
                <FileText className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Contrato/Proposta PDF
              </Button>
              <Button variant="secondary" onClick={handleOpenCreator} className="h-9 px-3.5 text-xs font-semibold">
                <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                Abordar Sócio com IA
              </Button>
              <Button
                variant="secondary"
                onClick={handleSaveToCrm}
                disabled={savedToCrm}
                className="h-9 px-3.5 text-xs font-semibold"
              >
                {savedToCrm ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    Salvo no CRM
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Salvar no CRM
                  </>
                )}
              </Button>
              <Button variant="secondary" onClick={handleCopy} className="h-9 px-3.5 text-xs font-semibold">
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    Copiar Dossiê
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 4 Key Commercial Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                <span>Decisor / Sócio Principal</span>
                <User className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="text-sm font-bold text-zinc-100 line-clamp-2">{getDonoName(result)}</div>
            </div>

            <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                <span>Capital Social Declarado</span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-lg font-bold text-emerald-400 tabular-nums">
                {formatCurrency(result.capital_social)}
              </div>
            </div>

            <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                <span>Telefones de Contato</span>
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="text-sm font-bold text-zinc-100 tabular-nums">{formatPhone(result.ddd_telefone_1)}</div>
              {result.ddd_telefone_2 && (
                <div className="text-xs text-zinc-500 mt-0.5 tabular-nums">{formatPhone(result.ddd_telefone_2)}</div>
              )}
            </div>

            <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                <span>Início das Atividades</span>
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="text-sm font-bold text-zinc-100 tabular-nums">
                {result.data_inicio_atividade
                  ? result.data_inicio_atividade.split('-').reverse().join('/')
                  : 'Não informado'}
              </div>
              {result.email && (
                <div className="text-[11px] text-zinc-400 truncate mt-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 shrink-0" />
                  {result.email.toLowerCase()}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Grid: QSA + CNAE & Address */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Quadro Societário */}
            <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-zinc-400" />
                  Quadro de Sócios e Administradores (QSA)
                </h3>
                <span className="text-xs font-mono text-zinc-500">{result.qsa?.length || 1} decisor(es)</span>
              </div>

              {result.qsa && result.qsa.length > 0 ? (
                <div className="space-y-2.5">
                  {result.qsa.map((socio, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#09090B] border border-zinc-800/80"
                    >
                      <div>
                        <p className="text-xs font-semibold text-zinc-100">{socio.nome_socio}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{socio.qualificacao_socio}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const params = new URLSearchParams({
                            clientName: socio.nome_socio,
                            niche: result.cnae_fiscal_descricao || '',
                            city: result.municipio || '',
                            phone: formatPhone(result.ddd_telefone_1)
                          })
                          navigate(`/creator?${params.toString()}`)
                        }}
                        className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 font-medium transition-colors cursor-pointer"
                      >
                        Gerar Copy p/ Sócio
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-[#09090B] border border-zinc-800/80">
                  <p className="text-xs font-semibold text-zinc-200">{getDonoName(result)}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Empresário Individual / MEI</p>
                </div>
              )}
            </div>

            {/* Atividade Econômica & Localização */}
            <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-zinc-400" />
                  Atividade Econômica (CNAE) & Endereço
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-[#09090B] border border-zinc-800/80">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                    CNAE Principal • {result.cnae_fiscal}
                  </span>
                  <p className="text-xs font-semibold text-zinc-100">{result.cnae_fiscal_descricao}</p>
                </div>

                {result.cnaes_secundarios && result.cnaes_secundarios.length > 0 && (
                  <div className="p-3 rounded-lg bg-[#09090B] border border-zinc-800/80">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1.5">
                      Atividades Secundárias ({result.cnaes_secundarios.length})
                    </span>
                    <div className="max-h-24 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                      {result.cnaes_secundarios.slice(0, 6).map(sec => (
                        <p key={sec.codigo} className="text-[11px] text-zinc-400 truncate">
                          • {sec.descricao}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-[#09090B] border border-zinc-800/80 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Localização Fiscal</span>
                    <p className="text-xs text-zinc-200">
                      {result.logradouro}, {result.numero} {result.complemento ? `(${result.complemento})` : ''}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {result.bairro ? `${result.bairro} • ` : ''}
                      {result.municipio} - {result.uf} • CEP: {result.cep}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${result.logradouro}, ${result.numero}, ${result.municipio} - ${result.uf}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 font-medium shrink-0 flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    Mapa
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
