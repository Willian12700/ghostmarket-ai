import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Printer,
  CheckCircle2,
  Plus,
  Trash2,
  Send,
  Scale,
  Briefcase,
  UserCheck,
  QrCode,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useContractStore } from '../store/contractStore';
import { useToastStore } from '../store/toastStore';

type DocumentMode = 'proposal' | 'contract';

interface PackagePreset {
  id: string;
  label: string;
  projectType: string;
  price: string;
  maintenance: string;
  deadline: string;
  deliverables: string[];
}

const PACKAGE_PRESETS: PackagePreset[] = [
  {
    id: 'lp-express',
    label: 'Landing Page Alta Conversão',
    projectType: 'Landing Page Profissional + Integração WhatsApp',
    price: '997,00',
    maintenance: '97,00',
    deadline: '3 dias úteis',
    deliverables: [
      'Design exclusivo Mobile-First de carregamento ultrarrápido',
      'Copywriting persuasivo focado em conversão no WhatsApp',
      'Certificado de Segurança SSL (HTTPS) e Hospedagem Premium',
      'Botão flutuante e rastreamento de cliques preparado para anúncios',
      'Otimização para buscas locais no Google (SEO Local)',
    ],
  },
  {
    id: 'catalog-delivery',
    label: 'Site + Cardápio / Catálogo Digital',
    projectType: 'Plataforma Web com Catálogo Interativo & Sacola no WhatsApp',
    price: '1.497,00',
    maintenance: '147,00',
    deadline: '5 dias úteis',
    deliverables: [
      'Site completo com vitrine de produtos/serviços separados por categorias',
      'Sistema de sacola de pedidos ou agendamento enviado direto ao WhatsApp',
      'Identidade visual personalizada com cores e fotos do estabelecimento',
      'Seção de avaliações de clientes, perguntas frequentes e localização',
      'Hospedagem em nuvem de alta disponibilidade + Proteção Anti-Clone',
    ],
  },
  {
    id: 'full-ai',
    label: 'Ecossistema Completo + Chatbot IA',
    projectType: 'Site Institucional Premium + Assistente Virtual IA 24h',
    price: '2.490,00',
    maintenance: '247,00',
    deadline: '7 dias úteis',
    deliverables: [
      'Desenvolvimento de Site / Landing Page de Alto Padrão',
      'Treinamento e implantação de Chatbot com Inteligência Artificial 24/7',
      'Qualificação automática de clientes e redirecionamento para o WhatsApp',
      'Configuração de domínio próprio, SSL e otimização PageSpeed 99/100',
      'Suporte técnico prioritário e atualizações mensais inclusas',
    ],
  },
];

export const PropostaPdf = () => {
  const { user } = useAuthStore();
  const { contracts } = useContractStore();
  const { addToast } = useToastStore();
  const toast = {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
  };
  const [searchParams] = useSearchParams();

  const [docMode, setDocMode] = useState<DocumentMode>('proposal');
  const [clientName, setClientName] = useState('');
  const [clientDoc, setClientDoc] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCity, setClientCity] = useState('');

  const [agencyName, setAgencyName] = useState(user?.name || 'Especialista Digital');
  const [agencyDoc, setAgencyDoc] = useState('');
  const [projectType, setProjectType] = useState(PACKAGE_PRESETS[1].projectType);
  const [price, setPrice] = useState(PACKAGE_PRESETS[1].price);
  const [maintenancePrice, setMaintenancePrice] = useState(PACKAGE_PRESETS[1].maintenance);
  const [deadline, setDeadline] = useState(PACKAGE_PRESETS[1].deadline);
  const [paymentTerms, setPaymentTerms] = useState(
    '50% de sinal na aprovação do projeto e 50% na entrega final (via PIX ou Cartão em até 6x).'
  );
  const [pixKey, setPixKey] = useState(user?.email || '');
  const [validityDays, setValidityDays] = useState('5');
  const [deliverables, setDeliverables] = useState<string[]>(PACKAGE_PRESETS[1].deliverables);
  const [newDeliverable, setNewDeliverable] = useState('');

  useEffect(() => {
    const leadName = searchParams.get('leadName') || searchParams.get('client');
    const socioName = searchParams.get('socioName');
    const cnpjParam = searchParams.get('cnpj');
    const leadCategory = searchParams.get('leadCategory') || searchParams.get('niche');
    const leadCity = searchParams.get('leadCity') || searchParams.get('city');
    const leadPhone = searchParams.get('leadPhone') || searchParams.get('phone');
    const amountParam = searchParams.get('amount');

    if (leadName) {
      setClientCompany(leadName);
      setClientName(socioName || `Responsável — ${leadName}`);
    } else if (socioName) {
      setClientName(socioName);
    }
    if (cnpjParam) setClientDoc(cnpjParam);
    if (leadCity) setClientCity(leadCity);
    if (leadPhone) setClientPhone(leadPhone);
    if (amountParam) setPrice(amountParam);
    if (leadCategory) {
      setProjectType(`Site Profissional + Painel Admin do Lojista (${leadCategory})`);
    }
  }, [searchParams]);

  const applyPackage = (pkg: PackagePreset) => {
    setProjectType(pkg.projectType);
    setPrice(pkg.price);
    setMaintenancePrice(pkg.maintenance);
    setDeadline(pkg.deadline);
    setDeliverables([...pkg.deliverables]);
    toast.success(`Pacote "${pkg.label}" aplicado!`);
  };

  const handleImportLead = (contractId: string) => {
    const found = contracts.find((c) => c.id === contractId);
    if (!found) return;
    setClientCompany(found.client);
    setClientName(found.client);
    setClientPhone(found.phone || '');
    if (found.amount > 0) {
      setPrice(
        found.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      );
    }
    if (found.niche) {
      setProjectType(`Estrutura Digital & Conversão (${found.niche})`);
    }
    toast.success(`Dados de "${found.client}" importados do CRM!`);
  };

  const handleAddDeliverable = () => {
    if (!newDeliverable.trim()) return;
    setDeliverables((prev) => [...prev, newDeliverable.trim()]);
    setNewDeliverable('');
  };

  const handleRemoveDeliverable = (idx: number) => {
    setDeliverables((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsAppSummary = () => {
    const digits = clientPhone.replace(/\D/g, '');
    const companyLabel = clientCompany || clientName || 'Cliente';
    const text =
      docMode === 'proposal'
        ? `Olá, *${companyLabel}*! 👋\n\nConforme conversamos, preparei a *Proposta Comercial* para o projeto *${projectType}*:\n\n✅ *Escopo Incluso:*\n${deliverables
            .map((d) => `• ${d}`)
            .join('\n')}\n\n⏱️ *Prazo de Entrega:* ${deadline}\n💰 *Investimento:* R$ ${price}\n💳 *Condição:* ${paymentTerms}\n${
            pixKey ? `🔑 *Chave PIX:* ${pixKey}\n` : ''
          }\nPodemos confirmar o início do seu projeto hoje?`
        : `Olá, *${companyLabel}*! 👋\n\nSegue o resumo do nosso *Contrato de Prestação de Serviços* referente a *${projectType}*:\n\n• *Valor Acordado:* R$ ${price}\n• *Prazo de Entrega:* ${deadline}\n• *Forma de Pagamento:* ${paymentTerms}\n\nEstou te enviando o documento em PDF logo abaixo para formalizarmos!`;

    const url = digits
      ? `https://wa.me/${digits.startsWith('55') ? digits : `55${digits}`}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Action Bar (Hidden on Print) */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0E0E11] p-6 rounded-2xl border border-zinc-800 print:hidden">
          <div>
            <div className="flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-emerald-400" />
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Gerador 2-em-1: Proposta Comercial & Contrato Jurídico
              </h1>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Monte uma proposta executiva ou contrato de prestação de serviços pronto para assinatura e envie em PDF ou WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
            <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setDocMode('proposal')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  docMode === 'proposal'
                    ? 'bg-white text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" /> Proposta Comercial
              </button>
              <button
                type="button"
                onClick={() => setDocMode('contract')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  docMode === 'contract'
                    ? 'bg-white text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Scale className="w-3.5 h-3.5" /> Contrato Jurídico
              </button>
            </div>

            <button
              type="button"
              onClick={handleSendWhatsAppSummary}
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-xs flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Enviar no WhatsApp
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT FORM CONTROLS (Hidden on Print) */}
          <div className="lg:col-span-5 bg-[#0E0E11] border border-zinc-800 rounded-2xl p-5 space-y-5 h-fit print:hidden">
            {/* Import from CRM */}
            {contracts.length > 0 && (
              <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <UserCheck className="w-3.5 h-3.5" /> Importar Cliente do CRM (1 Clique)
                </label>
                <select
                  onChange={(e) => handleImportLead(e.target.value)}
                  defaultValue=""
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                >
                  <option value="" disabled>
                    Selecione um lead salvo no CRM...
                  </option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.client} ({c.niche || 'Lead'}) — R$ {c.amount || 1500}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick Package Presets */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Pacotes Prontos (Preenchimento Rápido)
              </label>
              <div className="grid grid-cols-1 gap-2">
                {PACKAGE_PRESETS.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => applyPackage(pkg)}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="block text-xs font-bold text-white">{pkg.label}</span>
                      <span className="text-[11px] text-zinc-400">{pkg.deadline}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">R$ {pkg.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Client & Agency Details */}
            <div className="space-y-3 pt-3 border-t border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Dados das Partes
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Empresa do Cliente</label>
                  <input
                    type="text"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    placeholder="Ex: Clínica OdontoPrime"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Responsável / Contratante</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Dr. Roberto Silva"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">CNPJ/CPF do Cliente</label>
                  <input
                    type="text"
                    value={clientDoc}
                    onChange={(e) => setClientDoc(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">WhatsApp do Cliente</label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Seu Nome / Sua Agência</label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Seu CPF/CNPJ</label>
                  <input
                    type="text"
                    value={agencyDoc}
                    onChange={(e) => setAgencyDoc(e.target.value)}
                    placeholder="Opcional"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Project Values & Deadlines */}
            <div className="space-y-3 pt-3 border-t border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Valores, Prazos & Pagamento
              </h3>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Objeto / Tipo de Projeto</label>
                <input
                  type="text"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Valor Setup (R$)</label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Mensalidade (R$)</label>
                  <input
                    type="text"
                    value={maintenancePrice}
                    onChange={(e) => setMaintenancePrice(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Prazo Entrega</label>
                  <input
                    type="text"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Condições de Pagamento</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Chave PIX p/ Fechamento</label>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="CPF, CNPJ, E-mail ou Celular"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Validade da Proposta (dias)</label>
                  <input
                    type="text"
                    value={validityDays}
                    onChange={(e) => setValidityDays(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Deliverables Editor */}
            <div className="space-y-2.5 pt-3 border-t border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Itens Inclusos no Escopo ({deliverables.length})
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDeliverable()}
                  placeholder="Adicionar entregável ao escopo..."
                  className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAddDeliverable}
                  className="px-3 py-2 bg-emerald-500 text-zinc-950 rounded-lg text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {deliverables.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs"
                  >
                    <span className="text-zinc-200 truncate">{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(idx)}
                      className="text-zinc-500 hover:text-red-400 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PRINTABLE A4 DOCUMENT PREVIEW */}
          <div className="lg:col-span-7 print:col-span-12">
            <div className="bg-white text-zinc-900 rounded-2xl p-8 md:p-12 shadow-2xl print:shadow-none print:p-0 min-h-[860px] flex flex-col justify-between">
              {docMode === 'proposal' ? (
                /* MODE 1: COMMERCIAL PROPOSAL */
                <div className="space-y-8">
                  <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-6">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest mb-2">
                        Proposta Comercial Executiva
                      </span>
                      <h2 className="text-3xl font-black tracking-tight text-zinc-900">
                        {clientCompany || 'Empresa Parceira'}
                      </h2>
                      <p className="text-sm text-zinc-600 mt-1">
                        Aos cuidados de: <strong>{clientName || 'Diretoria / Responsável'}</strong>
                        {clientCity ? ` • ${clientCity}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Emitido por
                      </p>
                      <p className="text-base font-extrabold text-zinc-900">{agencyName}</p>
                      <p className="text-xs text-zinc-500 mt-1">{todayFormatted}</p>
                      <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
                        Válida por {validityDays} dias
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                      1. Solução Proposta
                    </h3>
                    <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200">
                      <p className="text-lg font-extrabold text-zinc-900">{projectType}</p>
                      <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
                        Estruturação profissional focada em autoridade de marca, velocidade de carregamento em dispositivos móveis e conversão imediata de visitantes em clientes reais no WhatsApp.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
                      2. Escopo & Entregáveis Inclusos
                    </h3>
                    <div className="grid grid-cols-1 gap-2.5">
                      {deliverables.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200"
                        >
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-sm font-medium text-zinc-800">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 rounded-2xl bg-zinc-900 text-white">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                        Investimento de Implementação
                      </span>
                      <div className="text-3xl font-black mt-1">R$ {price}</div>
                      <p className="text-xs text-zinc-300 mt-2 leading-relaxed">{paymentTerms}</p>
                      {maintenancePrice && maintenancePrice !== '0' && (
                        <p className="text-[11px] text-zinc-400 mt-3 pt-3 border-t border-zinc-800">
                          Hospedagem Nuvem, SSL & Suporte Mensal: R$ {maintenancePrice}/mês
                        </p>
                      )}
                    </div>

                    <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                          Prazo de Entrega & Garantia
                        </span>
                        <div className="text-2xl font-black text-zinc-900 mt-1">{deadline}</div>
                        <p className="text-xs text-zinc-600 mt-2">
                          Contados a partir da confirmação do projeto e envio das informações básicas.
                        </p>
                      </div>
                      {pixKey && (
                        <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center gap-2 text-xs">
                          <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-mono text-zinc-700 truncate">
                            <strong>Chave PIX:</strong> {pixKey}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* MODE 2: LEGAL SERVICE CONTRACT */
                <div className="space-y-6 text-sm leading-relaxed text-zinc-800">
                  <div className="text-center border-b-2 border-zinc-900 pb-5">
                    <h2 className="text-xl font-black uppercase tracking-wide text-zinc-900">
                      Contrato de Prestação de Serviços de Desenvolvimento Digital
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1">
                      Instrumento Particular com Força de Título Executivo Extrajudicial
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
                    <p>
                      <strong>CONTRATANTE:</strong> {clientCompany || clientName || '______________________'}
                      {clientDoc ? `, inscrito(a) no CPF/CNPJ sob o nº ${clientDoc}` : ''}, representado(a) por{' '}
                      {clientName || 'seu representante legal'}.
                    </p>
                    <p>
                      <strong>CONTRATADA:</strong> {agencyName}
                      {agencyDoc ? `, inscrito(a) no CPF/CNPJ sob o nº ${agencyDoc}` : ''}.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <p>
                      <strong>CLÁUSULA 1ª – DO OBJETO:</strong> O presente contrato tem como objeto a prestação de serviços profissionais de{' '}
                      <strong>{projectType}</strong>, compreendendo os seguintes entregáveis técnicos:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      {deliverables.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>

                    <p>
                      <strong>CLÁUSULA 2ª – DO PRAZO DE EXECUÇÃO:</strong> A CONTRATADA compromete-se a entregar a versão funcional do projeto no prazo estimado de{' '}
                      <strong>{deadline}</strong>, iniciando-se a contagem após o envio dos materiais básicos pelo CONTRATANTE e confirmação do pagamento inicial.
                    </p>

                    <p>
                      <strong>CLÁUSULA 3ª – DO VALOR E FORMA DE PAGAMENTO:</strong> Pelos serviços prestados, o CONTRATANTE pagará à CONTRATADA o valor total de{' '}
                      <strong>R$ {price}</strong>, nas seguintes condições: <em>{paymentTerms}</em>
                      {pixKey ? ` (Chave PIX oficial para liquidação: ${pixKey}).` : '.'}
                    </p>

                    {maintenancePrice && maintenancePrice !== '0' && (
                      <p>
                        <strong>CLÁUSULA 4ª – DA HOSPEDAGEM E SUPORTE CONTINUADO:</strong> Para manutenção da infraestrutura em nuvem, certificado SSL e suporte técnico, fica estabelecida a mensalidade de{' '}
                        <strong>R$ {maintenancePrice}/mês</strong> após a entrega do projeto.
                      </p>
                    )}

                    <p>
                      <strong>CLÁUSULA 5ª – DA PROPRIEDADE INTELECTUAL E SIGILO:</strong> Após a quitação integral dos valores acordados, o CONTRATANTE detém pleno direito de uso comercial sobre o projeto entregue, comprometendo-se ambas as partes com o sigilo das informações comerciais compartilhadas.
                    </p>
                  </div>
                </div>
              )}

              {/* Signatures Footer */}
              <div className="pt-10 mt-10 border-t border-zinc-200">
                <div className="grid grid-cols-2 gap-8 text-center text-xs">
                  <div className="pt-8 border-t border-zinc-400">
                    <strong className="block text-zinc-900">{agencyName}</strong>
                    <span className="text-zinc-500">Contratada / Responsável Técnico</span>
                  </div>
                  <div className="pt-8 border-t border-zinc-400">
                    <strong className="block text-zinc-900">
                      {clientCompany || clientName || 'Contratante'}
                    </strong>
                    <span className="text-zinc-500">De Acordo / Aprovação do Cliente</span>
                  </div>
                </div>
                <p className="text-center text-[11px] text-zinc-400 mt-6">
                  Documento gerado eletronicamente em {todayFormatted}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
