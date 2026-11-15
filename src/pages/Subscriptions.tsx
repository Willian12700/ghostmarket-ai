import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Send,
  Copy,
  Check,
  Edit2,
  Trash2,
  Sparkles,
  CreditCard,
  X,
  FileDown,
  Wand2,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { useContractStore } from '@/store/contractStore';
import {
  useSubscriptionStore,
  ClientSubscription
} from '@/store/subscriptionStore';
import {
  calculateSubscriptionStatus,
  generateLocalSubscriptionMessage,
  fetchAiPolishedMessage
} from '@/utils/subscriptionUtils';

export const Subscriptions = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const { contracts, syncContracts } = useContractStore();
  const {
    subscriptions,
    pixSettings,
    syncSubscriptions,
    loadPixSettings,
    savePixSettings,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    markAsPaid
  } = useSubscriptionStore();

  const toast = {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    info: (msg: string) => addToast(msg, 'info')
  };

  // Filtros e busca
  const [activeFilter, setActiveFilter] = useState<'all' | '5_days_before' | 'tomorrow' | 'today' | 'overdue' | 'paid_this_month'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modais
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<ClientSubscription | null>(null);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [activeAiSub, setActiveAiSub] = useState<ClientSubscription | null>(null);

  // Estado do Gerador IA de Cobrança
  const [aiTone, setAiTone] = useState<'friendly' | 'formal' | 'direct' | 'firm'>('friendly');
  const [aiMessage, setAiMessage] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Form de Mensalidade
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formService, setFormService] = useState('Hospedagem & Manutenção de Site');
  const [formAmount, setFormAmount] = useState('99');
  const [formDueDay, setFormDueDay] = useState('10');
  const [formPixKey, setFormPixKey] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [savingSub, setSavingSub] = useState(false);

  // Form de PIX Global
  const [pixKeyInput, setPixKeyInput] = useState('');
  const [pixTypeInput, setPixTypeInput] = useState<'cpf' | 'cnpj' | 'email' | 'phone' | 'random'>('cpf');
  const [pixReceiverInput, setPixReceiverInput] = useState('');
  const [savingPix, setSavingPix] = useState(false);

  // Sincronização inicial
  useEffect(() => {
    if (user?.uid) {
      const unsubSubs = syncSubscriptions(user.uid);
      const unsubContracts = syncContracts(user.uid);
      loadPixSettings(user.uid);
      return () => {
        unsubSubs();
        unsubContracts();
      };
    }
  }, [user?.uid]);

  // Atualizar inputs de PIX quando pixSettings carregar
  useEffect(() => {
    if (pixSettings) {
      setPixKeyInput(pixSettings.pixKey || '');
      setPixTypeInput(pixSettings.pixType || 'cpf');
      setPixReceiverInput(pixSettings.pixReceiverName || '');
    }
  }, [pixSettings]);

  // Processamento e métricas de todas as mensalidades
  const enrichedSubscriptions = useMemo(() => {
    return subscriptions.map(sub => {
      const statusInfo = calculateSubscriptionStatus(sub.dueDay, sub.lastPaymentDate);
      return {
        ...sub,
        statusInfo
      };
    });
  }, [subscriptions]);

  // Métricas financeiras (MRR, Vencendo, Atrasados, Recebidos)
  const stats = useMemo(() => {
    const activeSubs = enrichedSubscriptions.filter(s => s.status !== 'cancelled');
    const mrr = activeSubs.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
    
    const count5Days = activeSubs.filter(s => s.statusInfo.stage === '5_days_before' || s.statusInfo.stage === 'upcoming' && s.statusInfo.diffDays <= 7).length;
    const countTomorrow = activeSubs.filter(s => s.statusInfo.stage === 'tomorrow').length;
    const countToday = activeSubs.filter(s => s.statusInfo.stage === 'today').length;
    const countOverdue = activeSubs.filter(s => s.statusInfo.stage === 'overdue').length;
    const countPaid = activeSubs.filter(s => s.statusInfo.isPaidThisMonth).length;

    const amountOverdue = activeSubs
      .filter(s => s.statusInfo.stage === 'overdue')
      .reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

    const amountReceivedThisMonth = activeSubs
      .filter(s => s.statusInfo.isPaidThisMonth)
      .reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

    return {
      totalClients: activeSubs.length,
      mrr,
      count5Days,
      countTomorrow,
      countToday,
      countOverdue,
      countPaid,
      amountOverdue,
      amountReceivedThisMonth
    };
  }, [enrichedSubscriptions]);

  // Filtragem
  const filteredSubscriptions = useMemo(() => {
    return enrichedSubscriptions.filter(sub => {
      const nameMatch = (sub.clientName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const phoneMatch = (sub.phone || '').includes(searchQuery.replace(/\D/g, ''));
      const serviceMatch = (sub.serviceName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = !searchQuery || nameMatch || phoneMatch || serviceMatch;

      if (!matchesSearch) return false;

      if (activeFilter === '5_days_before') {
        return sub.statusInfo.stage === '5_days_before';
      }
      if (activeFilter === 'tomorrow') {
        return sub.statusInfo.stage === 'tomorrow';
      }
      if (activeFilter === 'today') {
        return sub.statusInfo.stage === 'today';
      }
      if (activeFilter === 'overdue') {
        return sub.statusInfo.stage === 'overdue';
      }
      if (activeFilter === 'paid_this_month') {
        return sub.statusInfo.isPaidThisMonth;
      }
      return true;
    }).sort((a, b) => {
      // Ordenação prioritária: Hoje > Amanhã > Atrasados > 5 dias > Pagos
      const order = { today: 1, tomorrow: 2, overdue: 3, '5_days_before': 4, upcoming: 5, paid_this_month: 6 };
      return (order[a.statusInfo.stage] || 99) - (order[b.statusInfo.stage] || 99);
    });
  }, [enrichedSubscriptions, activeFilter, searchQuery]);

  // Abrir Modal de Cobrança com IA
  const handleOpenAiModal = (sub: ClientSubscription) => {
    setActiveAiSub(sub);
    const pixToUse = sub.pixKey || pixSettings.pixKey;
    const receiverToUse = sub.pixReceiverName || pixSettings.pixReceiverName;

    const initialMsg = generateLocalSubscriptionMessage(
      {
        clientName: sub.clientName,
        phone: sub.phone,
        serviceName: sub.serviceName,
        amount: sub.amount,
        dueDay: sub.dueDay,
        pixKey: pixToUse,
        pixReceiverName: receiverToUse,
        lastPaymentDate: sub.lastPaymentDate
      },
      aiTone
    );

    setAiMessage(initialMsg);
    setCopiedMessage(false);
    setIsAiModalOpen(true);
  };

  // Trocar tom de voz da IA
  const handleToneChange = (newTone: 'friendly' | 'formal' | 'direct' | 'firm') => {
    setAiTone(newTone);
    if (!activeAiSub) return;

    const pixToUse = activeAiSub.pixKey || pixSettings.pixKey;
    const receiverToUse = activeAiSub.pixReceiverName || pixSettings.pixReceiverName;

    const updated = generateLocalSubscriptionMessage(
      {
        clientName: activeAiSub.clientName,
        phone: activeAiSub.phone,
        serviceName: activeAiSub.serviceName,
        amount: activeAiSub.amount,
        dueDay: activeAiSub.dueDay,
        pixKey: pixToUse,
        pixReceiverName: receiverToUse,
        lastPaymentDate: activeAiSub.lastPaymentDate
      },
      newTone
    );
    setAiMessage(updated);
  };

  // Polir com IA em Tempo Real
  const handlePolishingWithAi = async () => {
    if (!aiMessage) return;
    setIsGeneratingAi(true);
    try {
      const tonePrompts = {
        friendly: 'Deixe o texto muito amigável, acolhedor e parceiro, transmitindo carinho e gratidão pela confiança.',
        formal: 'Deixe o texto executivo, corporativo e elegante, ideal para médicos, advogados e donos de empresas tradicionais.',
        direct: 'Deixe o texto super enxuto e direto ao ponto, perfeito para leitura rápida no celular.',
        firm: 'Deixe o texto firme mas respeitoso, enfatizando a importância do pagamento para não interromper a hospedagem do site.'
      };

      const polished = await fetchAiPolishedMessage(aiMessage, tonePrompts[aiTone]);
      setAiMessage(polished);
      toast.success('Mensagem polida com IA com sucesso!');
    } catch (_) {
      toast.error('Não foi possível conectar com o gerador IA');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Enviar direto no WhatsApp com 1 Clique
  const handleSendWhatsApp = () => {
    if (!activeAiSub) return;
    let clean = (activeAiSub.phone || '').replace(/\D/g, '');
    if (clean.length === 10 || clean.length === 11) {
      clean = '55' + clean;
    }
    const encoded = encodeURIComponent(aiMessage);
    window.open(`https://wa.me/${clean}?text=${encoded}`, '_blank');
  };

  // Copiar mensagem
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(aiMessage);
    setCopiedMessage(true);
    toast.success('Mensagem copiada para a área de transferência!');
    setTimeout(() => setCopiedMessage(false), 3000);
  };

  // Salvar / Criar Mensalidade
  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    if (!formName || !formPhone) {
      toast.error('Nome do cliente e telefone são obrigatórios');
      return;
    }

    setSavingSub(true);
    try {
      if (editingSub) {
        await updateSubscription(editingSub.id, {
          clientName: formName,
          phone: formPhone,
          serviceName: formService,
          amount: Number(formAmount) || 0,
          dueDay: Number(formDueDay) || 10,
          pixKey: formPixKey || undefined,
          notes: formNotes || undefined
        });
        toast.success('Mensalidade atualizada!');
      } else {
        await addSubscription(user.uid, {
          clientName: formName,
          phone: formPhone,
          serviceName: formService,
          amount: Number(formAmount) || 0,
          dueDay: Number(formDueDay) || 10,
          pixKey: formPixKey || undefined,
          notes: formNotes || undefined,
          status: 'active'
        });
        toast.success('Cliente de mensalidade cadastrado com sucesso!');
      }

      setIsNewModalOpen(false);
      setEditingSub(null);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSavingSub(false);
    }
  };

  // Abrir Modal de Edição
  const handleOpenEdit = (sub: ClientSubscription) => {
    setEditingSub(sub);
    setFormName(sub.clientName || '');
    setFormPhone(sub.phone || '');
    setFormService(sub.serviceName || 'Hospedagem & Manutenção de Site');
    setFormAmount(String(sub.amount || '99'));
    setFormDueDay(String(sub.dueDay || '10'));
    setFormPixKey(sub.pixKey || '');
    setFormNotes(sub.notes || '');
    setIsNewModalOpen(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormPhone('');
    setFormService('Hospedagem & Manutenção de Site');
    setFormAmount('99');
    setFormDueDay('10');
    setFormPixKey('');
    setFormNotes('');
  };

  // Salvar PIX Padrão
  const handleSavePixSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setSavingPix(true);
    try {
      await savePixSettings(user.uid, {
        pixKey: pixKeyInput,
        pixType: pixTypeInput,
        pixReceiverName: pixReceiverInput
      });
      toast.success('Chave PIX padrão salva!');
      setIsPixModalOpen(false);
    } catch (e: any) {
      toast.error('Erro ao salvar configurações PIX');
    } finally {
      setSavingPix(false);
    }
  };

  // Dar Baixa (Marcar como Pago no Mês Atual)
  const handleMarkAsPaid = async (sub: ClientSubscription) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await markAsPaid(sub.id, today);
      toast.success(`Mensalidade de ${sub.clientName} marcada como paga!`);
    } catch (e) {
      toast.error('Erro ao registrar pagamento');
    }
  };

  // Excluir
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente remover o cliente ${name} das mensalidades?`)) return;
    try {
      await deleteSubscription(id);
      toast.success('Mensalidade removida');
    } catch (e) {
      toast.error('Erro ao excluir');
    }
  };

  // Importar Clientes do CRM
  const handleImportFromCrm = async () => {
    if (!user?.uid) return;
    const closedContracts = contracts.filter(c => c.status === 'Fechado' && c.client);

    if (closedContracts.length === 0) {
      toast.info('Nenhum cliente fechado encontrado no CRM para importar.');
      return;
    }

    const existingNames = new Set(subscriptions.map(s => (s.clientName || '').toLowerCase().trim()));
    let importedCount = 0;

    for (const c of closedContracts) {
      const cleanName = (c.client || '').toLowerCase().trim();
      if (!existingNames.has(cleanName)) {
        await addSubscription(user.uid, {
          clientName: c.client,
          phone: c.phone || '',
          serviceName: c.niche ? `Hospedagem (${c.niche})` : 'Hospedagem & Manutenção de Site',
          amount: 89, // valor sugerido de mensalidade padrão
          dueDay: 10,
          status: 'active',
          notes: 'Importado automaticamente do CRM Comercial'
        });
        existingNames.add(cleanName);
        importedCount++;
      }
    }

    if (importedCount > 0) {
      toast.success(`${importedCount} cliente(s) fechado(s) do CRM importado(s) com sucesso!`);
    } else {
      toast.info('Todos os clientes do CRM já estão cadastrados nas mensalidades.');
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val || 0));

  return (
    <div className="space-y-6 pb-16">
      {/* 1. TOPO & BOAS-VINDAS */}
      <div className="bg-[#120e1d] border border-purple-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-600/20 text-purple-400 rounded-2xl border border-purple-500/30">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Cobrador IA & Mensalidades
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-600/30 text-purple-300 border border-purple-500/30">
                    MRR RECORRENTE
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-purple-300/70 mt-1 max-w-2xl">
                  Automatize as cobranças dos seus clientes de sites. A IA identifica quem vence daqui a 5 dias, amanhã ou está em atraso e monta mensagens humanizadas com sua chave PIX com 1 clique.
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Ação Topo */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsPixModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-[#181326] hover:bg-[#221b36] border border-purple-900/50 hover:border-purple-600/50 text-purple-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Configurar chave PIX padrão que sairá nas cobranças da IA"
            >
              <CreditCard className="w-4 h-4 text-purple-400" />
              <span>{pixSettings.pixKey ? 'PIX Configurado' : 'Configurar Meu PIX'}</span>
            </button>

            <button
              onClick={handleImportFromCrm}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-[#181326] hover:bg-[#221b36] border border-purple-900/50 hover:border-purple-600/50 text-purple-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Importa clientes com status Fechado do CRM para criar a mensalidade deles"
            >
              <FileDown className="w-4 h-4 text-cyan-400" />
              <span>Importar do CRM</span>
            </button>

            <button
              onClick={() => {
                resetForm();
                setEditingSub(null);
                setIsNewModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-purple-900/40 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nova Mensalidade</span>
            </button>
          </div>
        </div>

        {/* 2. CARDS DE MÉTRICAS MRR & STATUS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
          {/* Card 1: MRR Total */}
          <div className="bg-black/40 border border-purple-900/40 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-purple-300/70 uppercase tracking-wider">
              💰 MRR Contratado
            </span>
            <div className="mt-1">
              <span className="text-xl sm:text-2xl font-black text-white block">
                {formatCurrency(stats.mrr)}
              </span>
              <span className="text-[11px] text-purple-300/60 font-medium">
                {stats.totalClients} {stats.totalClients === 1 ? 'cliente ativo' : 'clientes ativos'}
              </span>
            </div>
          </div>

          {/* Card 2: Vence em 5 Dias */}
          <div
            onClick={() => setActiveFilter('5_days_before')}
            className={`border rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition-all ${
              activeFilter === '5_days_before'
                ? 'bg-yellow-950/30 border-yellow-500/60 ring-1 ring-yellow-500/40'
                : 'bg-black/40 border-yellow-900/30 hover:border-yellow-700/50'
            }`}
          >
            <span className="text-[11px] font-bold text-yellow-300/80 uppercase tracking-wider">
              🟡 Vence em 5 Dias
            </span>
            <div className="mt-1">
              <span className="text-xl sm:text-2xl font-black text-yellow-400 block">
                {stats.count5Days}
              </span>
              <span className="text-[11px] text-yellow-300/60 font-medium">
                Aviso prévio suave
              </span>
            </div>
          </div>

          {/* Card 3: Vence Amanhã / Hoje */}
          <div
            onClick={() => setActiveFilter('today')}
            className={`border rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition-all ${
              activeFilter === 'today' || activeFilter === 'tomorrow'
                ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/40'
                : 'bg-black/40 border-amber-900/30 hover:border-amber-700/50'
            }`}
          >
            <span className="text-[11px] font-bold text-amber-300/80 uppercase tracking-wider">
              ⚡ Hoje & Amanhã
            </span>
            <div className="mt-1">
              <span className="text-xl sm:text-2xl font-black text-amber-400 block">
                {stats.countToday + stats.countTomorrow}
              </span>
              <span className="text-[11px] text-amber-300/60 font-medium">
                {stats.countToday} hoje | {stats.countTomorrow} amanhã
              </span>
            </div>
          </div>

          {/* Card 4: Em Atraso */}
          <div
            onClick={() => setActiveFilter('overdue')}
            className={`border rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition-all ${
              activeFilter === 'overdue'
                ? 'bg-rose-950/30 border-rose-500/60 ring-1 ring-rose-500/40'
                : 'bg-black/40 border-rose-900/30 hover:border-rose-700/50'
            }`}
          >
            <span className="text-[11px] font-bold text-rose-300/80 uppercase tracking-wider">
              🚨 Em Atraso
            </span>
            <div className="mt-1">
              <span className="text-xl sm:text-2xl font-black text-rose-400 block">
                {stats.countOverdue}
              </span>
              <span className="text-[11px] text-rose-300/60 font-medium">
                {formatCurrency(stats.amountOverdue)} a recuperar
              </span>
            </div>
          </div>

          {/* Card 5: Recebido este Mês */}
          <div
            onClick={() => setActiveFilter('paid_this_month')}
            className={`border rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition-all ${
              activeFilter === 'paid_this_month'
                ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/40'
                : 'bg-black/40 border-emerald-900/30 hover:border-emerald-700/50'
            }`}
          >
            <span className="text-[11px] font-bold text-emerald-300/80 uppercase tracking-wider">
              ✅ Recebido no Mês
            </span>
            <div className="mt-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 block">
                {formatCurrency(stats.amountReceivedThisMonth)}
              </span>
              <span className="text-[11px] text-emerald-300/60 font-medium">
                {stats.countPaid} mensalidades pagas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BARRA DE FILTROS & BUSCA */}
      <div className="bg-[#120e1d] border border-purple-900/40 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filtros em Abas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {[
            { id: 'all', label: 'Todos', count: stats.totalClients },
            { id: '5_days_before', label: 'Vence em 5 Dias', count: stats.count5Days },
            { id: 'tomorrow', label: 'Vence Amanhã', count: stats.countTomorrow },
            { id: 'today', label: 'Vence Hoje', count: stats.countToday },
            { id: 'overdue', label: 'Em Atraso', count: stats.countOverdue },
            { id: 'paid_this_month', label: 'Em Dia / Pagos', count: stats.countPaid }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                  : 'bg-black/40 text-purple-300/70 hover:text-white border border-purple-900/30'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Input de Busca */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por cliente ou telefone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-black/40 border border-purple-900/40 rounded-xl text-xs text-white placeholder-purple-400/40 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* 4. LISTA DE CLIENTES / CARDS */}
      {filteredSubscriptions.length === 0 ? (
        <div className="bg-[#120e1d] border border-purple-900/40 rounded-2xl p-12 text-center shadow-xl">
          <Clock className="w-12 h-12 text-purple-500/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Nenhuma mensalidade encontrada</h3>
          <p className="text-xs text-purple-300/60 max-w-md mx-auto mt-1 mb-4">
            Cadastre os clientes para os quais você criou sites ou importe diretamente do seu CRM comercial. A IA calculará os vencimentos e gerará os lembretes automáticos para o WhatsApp.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                resetForm();
                setIsNewModalOpen(true);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              + Cadastrar Primeiro Cliente
            </button>
            <button
              onClick={handleImportFromCrm}
              className="px-4 py-2 bg-[#181326] border border-purple-900/60 text-purple-300 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Importar do CRM
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubscriptions.map(sub => {
            const { statusInfo } = sub;
            const cleanPhone = (sub.phone || '').replace(/\D/g, '');

            return (
              <div
                key={sub.id}
                className={`bg-[#120e1d] border rounded-2xl p-5 shadow-xl transition-all relative flex flex-col justify-between ${
                  statusInfo.stage === 'today'
                    ? 'border-red-500/50 bg-red-950/10 ring-1 ring-red-500/30'
                    : statusInfo.stage === 'tomorrow'
                    ? 'border-amber-500/50 bg-amber-950/10'
                    : statusInfo.stage === 'overdue'
                    ? 'border-rose-600/50 bg-rose-950/15'
                    : statusInfo.isPaidThisMonth
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : 'border-purple-900/40 hover:border-purple-700/60'
                }`}
              >
                <div>
                  {/* Topo do Card: Nome e Badge de Vencimento */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <h3 className="font-bold text-white text-sm sm:text-base leading-snug">
                        {sub.clientName}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-xs text-purple-300/70 font-mono">
                          {sub.phone ? `+${cleanPhone}` : 'Sem WhatsApp cadastrado'}
                        </span>
                      </div>
                    </div>

                    {/* Badge de Status */}
                    <span className={`px-2.5 py-1 rounded-xl text-[11px] whitespace-nowrap ${statusInfo.badgeClass}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Informações de Serviço e Preço */}
                  <div className="bg-black/30 border border-purple-900/30 rounded-xl p-3 my-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-purple-300/70">Serviço:</span>
                      <span className="font-bold text-white truncate max-w-[170px]" title={sub.serviceName}>
                        {sub.serviceName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-purple-300/70">Mensalidade:</span>
                      <span className="font-black text-emerald-400 text-sm">
                        {formatCurrency(sub.amount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-300/70">Vencimento:</span>
                      <span className="font-bold text-purple-200">
                        Todo dia {sub.dueDay} (próx: {statusInfo.dueDateFormatted})
                      </span>
                    </div>
                  </div>

                  {/* Chave PIX vinculada */}
                  <div className="text-[11px] text-purple-300/60 mb-4 flex items-center justify-between">
                    <span>PIX p/ Receber:</span>
                    <span className="font-mono text-purple-200 truncate max-w-[150px]" title={sub.pixKey || pixSettings.pixKey}>
                      {sub.pixKey || pixSettings.pixKey || 'Usando PIX padrão'}
                    </span>
                  </div>
                </div>

                {/* Botões de Ação do Card */}
                <div className="pt-3 border-t border-purple-900/30 flex flex-wrap items-center gap-2">
                  {/* Botão de Cobrar com IA */}
                  <button
                    onClick={() => handleOpenAiModal(sub)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
                    title="Gera mensagem elegante com IA para enviar via WhatsApp"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Cobrar com IA</span>
                  </button>

                  {/* Botão Marcar como Pago */}
                  {!statusInfo.isPaidThisMonth ? (
                    <button
                      onClick={() => handleMarkAsPaid(sub)}
                      className="p-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      title="Marcar mensalidade como paga no ciclo atual"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <span
                      className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl"
                      title="Já pago no ciclo atual"
                    >
                      <Check className="w-4 h-4" />
                    </span>
                  )}

                  {/* Editar */}
                  <button
                    onClick={() => handleOpenEdit(sub)}
                    className="p-2 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 hover:text-white border border-purple-900/40 rounded-xl transition-all cursor-pointer"
                    title="Editar informações"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Excluir */}
                  <button
                    onClick={() => handleDelete(sub.id, sub.clientName)}
                    className="p-2 bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 border border-red-900/40 rounded-xl transition-all cursor-pointer"
                    title="Excluir mensalidade"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: COBRADOR IA (WHATSAPP COM 1 CLIQUE) */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isAiModalOpen && activeAiSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#120e1d] border border-purple-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="absolute top-4 right-4 text-purple-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cabeçalho do Modal IA */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-xl shadow-md">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Cobrança Inteligente com IA
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300">
                      {calculateSubscriptionStatus(activeAiSub.dueDay, activeAiSub.lastPaymentDate).label}
                    </span>
                  </h3>
                  <p className="text-xs text-purple-300/70">
                    Mensagem personalizada para <strong className="text-white">{activeAiSub.clientName}</strong>
                  </p>
                </div>
              </div>

              {/* Seletor de Tom da IA */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-purple-300/80 mb-1.5">
                  Tom de Voz da IA:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'friendly', label: '🤝 Amigável' },
                    { id: 'formal', label: '💼 Formal' },
                    { id: 'direct', label: '⚡ Direto' },
                    { id: 'firm', label: '🚨 Firme' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleToneChange(t.id as any)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        aiTone === t.id
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-black/40 text-purple-300/70 hover:text-white border border-purple-900/40'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caixa de Mensagem Gerada */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-purple-300/80 mb-1.5 font-bold">
                  <span>Mensagem para WhatsApp:</span>
                  <button
                    onClick={handlePolishingWithAi}
                    disabled={isGeneratingAi}
                    className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-200 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGeneratingAi ? 'Polindo...' : 'Polir com IA'}</span>
                  </button>
                </div>
                <textarea
                  rows={7}
                  value={aiMessage}
                  onChange={e => setAiMessage(e.target.value)}
                  className="w-full p-3.5 bg-black/60 border border-purple-900/60 rounded-xl text-xs text-purple-100 placeholder-purple-400/30 focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
                />
              </div>

              {/* Botões de Envio e Cópia */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleSendWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-green-900/30 transition-all cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar no WhatsApp</span>
                </button>

                <button
                  onClick={handleCopyMessage}
                  className="px-4 py-3 bg-[#181326] hover:bg-[#221b36] border border-purple-900/60 text-purple-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {copiedMessage ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MODAL: CONFIGURAR PIX PADRÃO */}
      {/* ============================================================ */}
      {isPixModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#120e1d] border border-purple-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsPixModalOpen(false)}
              className="absolute top-4 right-4 text-purple-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Configurar Minha Chave PIX</h3>
                <p className="text-xs text-purple-300/70">Essa chave será inserida automaticamente nas cobranças da IA</p>
              </div>
            </div>

            <form onSubmit={handleSavePixSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-purple-300/80 mb-1">Tipo de Chave PIX</label>
                <select
                  value={pixTypeInput}
                  onChange={e => setPixTypeInput(e.target.value as any)}
                  className="w-full px-3 py-2 bg-black/40 border border-purple-900/40 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">E-mail</option>
                  <option value="phone">Telefone / Celular</option>
                  <option value="random">Chave Aleatória (EVP)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-300/80 mb-1">Chave PIX</label>
                <input
                  type="text"
                  placeholder="Ex: 84999665601 ou email@exemplo.com"
                  value={pixKeyInput}
                  onChange={e => setPixKeyInput(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-purple-900/40 rounded-xl text-sm text-white placeholder-purple-400/30 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-300/80 mb-1">Nome do Titular da Conta (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Willian Souza (GhostMarket)"
                  value={pixReceiverInput}
                  onChange={e => setPixReceiverInput(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-purple-900/40 rounded-xl text-sm text-white placeholder-purple-400/30 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPixModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-purple-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingPix}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingPix ? 'Salvando...' : 'Salvar Chave PIX'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: NOVA / EDITAR MENSALIDADE */}
      {/* ============================================================ */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#120e1d] border border-purple-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => {
                setIsNewModalOpen(false);
                setEditingSub(null);
              }}
              className="absolute top-4 right-4 text-purple-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingSub ? 'Editar Mensalidade' : 'Nova Mensalidade de Cliente'}
                </h3>
                <p className="text-xs text-purple-300/70">A IA cuidará dos lembretes automáticos para este cliente</p>
              </div>
            </div>

            <form onSubmit={handleSaveSubscription} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-purple-300/80 mb-1">Nome do Cliente / Empresa</label>
                <input
                  type="text"
                  placeholder="Ex: Barbearia Don Juan ou Dr. Carlos"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-purple-900/40 rounded-xl text-sm text-white placeholder-purple-400/30 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-300/80 mb-1">WhatsApp do Cliente</label>
                <input
                  type="text"
                  placeholder="Ex: 84999999999 ou com DDD"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-purple-900/40 rounded-xl text-sm text-white placeholder-purple-400/30 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-purple-300/80 mb-1">Valor da Mensalidade (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 99.00"
                    value={formAmount}
                    onChange={e => setFormAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-purple-900/40 rounded-xl text-sm text-white placeholder-purple-400/30 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-300/80 mb-1">Dia do Vencimento (1 a 31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Ex: 10"
                    value={formDueDay}
                    onChange={e => setFormDueDay(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-purple-900/40 rounded-xl text-sm text-white placeholder-purple-400/30 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-300/80 mb-1">Serviço Prestado</label>
                <input
                  type="text"
                  placeholder="Ex: Hospedagem & Manutenção de Site"
                  value={formService}
                  onChange={e => setFormService(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-purple-900/40 rounded-xl text-sm text-white placeholder-purple-400/30 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-300/80 mb-1">Chave PIX Específica (Opcional)</label>
                <input
                  type="text"
                  placeholder="Deixe em branco para usar seu PIX padrão"
                  value={formPixKey}
                  onChange={e => setFormPixKey(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-purple-900/40 rounded-xl text-sm text-white placeholder-purple-400/30 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-300/80 mb-1">Observações Internas (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Cliente prefere pagar até o 5º dia útil"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-purple-900/40 rounded-xl text-sm text-white placeholder-purple-400/30 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewModalOpen(false);
                    setEditingSub(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-purple-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingSub}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingSub ? 'Salvando...' : editingSub ? 'Atualizar Mensalidade' : 'Cadastrar Mensalidade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
