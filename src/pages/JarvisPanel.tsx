import React, { useState, useEffect } from 'react';
import {
  Bot,
  Smartphone,
  Clock,
  Activity,
  CheckCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  DollarSign,
  MessageSquare,
  Zap,
  Terminal,
  Tag,
  Key,
  PieChart,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

export const JarvisPanel: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'trials' | 'quiz' | 'sales' | 'logs'>('whatsapp');
  
  // Filtros WhatsApp
  const [leadSearch, setLeadSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | '0' | '1' | '2' | '3' | 'converted'>('all');

  // Geração manual de código de teste
  const [manualPhone, setManualPhone] = useState('');
  const [manualName, setManualName] = useState('');
  const [generatingTrial, setGeneratingTrial] = useState(false);
  const [generatedTrialCode, setGeneratedTrialCode] = useState<string | null>(null);

  // Estados de cópia
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Disparo manual Jarvis
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const CUPOM_VITALICIO = 'VIP10';
  const LINK_VITALICIO_CUPOM = 'https://pay.cakto.com.br/yonkyi5_1119928?cupom=VIP10';

  const fetchData = async () => {
    try {
      const res = await fetch('/api/jarvis-hub');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do jarvis-hub:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 12000); // Auto-refresh a cada 12 segundos
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const copyToClipboard = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    }
  };

  const handleGenerateManualTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingTrial(true);
    setGeneratedTrialCode(null);
    try {
      const res = await fetch('/api/trial-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: manualPhone || '5584999999999',
          name: manualName || 'Teste Manual Painel',
          durationMinutes: 5
        })
      });
      const resData = await res.json();
      if (resData.code) {
        setGeneratedTrialCode(resData.code);
        setFeedbackMsg(`Código ${resData.code} gerado com sucesso!`);
        fetchData();
      } else {
        alert(resData.error || 'Erro ao gerar código');
      }
    } catch (err: any) {
      alert(`Falha: ${err.message}`);
    } finally {
      setGeneratingTrial(false);
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  const handleDispatchQuizLead = async (lead: any) => {
    setDispatchingId(lead.id);
    try {
      const res = await fetch('/api/quiz-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: lead.id,
          name: lead.name || '',
          phone: lead.phone,
          score: lead.score || 0,
          profile: lead.profile || 'Iniciante',
          bottleneck: lead.bottleneck || 'Atrair clientes'
        })
      });
      const resData = await res.json();
      if (resData.success) {
        setFeedbackMsg(`Jarvis acionado com sucesso para ${lead.name || lead.phone}!`);
        fetchData();
      } else {
        alert(resData.error || 'Erro ao disparar Jarvis');
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setDispatchingId(null);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleSyncAllQuizLeads = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/quiz-lead?action=sync');
      const resData = await res.json();
      if (resData.success) {
        setFeedbackMsg(`Sincronização concluída: ${resData.dispatchedCount} lead(s) contatado(s)!`);
        fetchData();
      }
    } catch (err: any) {
      alert(`Erro ao sincronizar: ${err.message}`);
    } finally {
      setRefreshing(false);
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  // Processamento e filtros de leads do WhatsApp
  const rawLeads = data?.whatsappLeads?.items || {};
  const leadsArray = Object.values(rawLeads).map((l: any) => l);

  const filteredLeads = leadsArray.filter((l: any) => {
    const nameMatch = (l.senderName || '').toLowerCase().includes(leadSearch.toLowerCase());
    const phoneMatch = (l.phone || '').includes(leadSearch);
    const textMatch = (l.lastUserMessage || '').toLowerCase().includes(leadSearch.toLowerCase());
    const matchesSearch = nameMatch || phoneMatch || textMatch;

    if (!matchesSearch) return false;

    if (stageFilter === 'converted') return l.converted;
    if (stageFilter === '0') return l.stage === 0 && !l.converted;
    if (stageFilter === '1') return l.stage === 1 && !l.converted;
    if (stageFilter === '2') return l.stage === 2 && !l.converted;
    if (stageFilter === '3') return l.stage === 3 && !l.converted;

    return true;
  });

  const convertedCount = leadsArray.filter((l: any) => l.converted).length;
  const stage0Count = leadsArray.filter((l: any) => l.stage === 0 && !l.converted).length;
  const stage1Count = leadsArray.filter((l: any) => l.stage === 1 && !l.converted).length;
  const stage2Count = leadsArray.filter((l: any) => l.stage === 2 && !l.converted).length;
  const stage3Count = leadsArray.filter((l: any) => l.stage === 3 && !l.converted).length;

  const sentinel = data?.sentinel || {};
  const isOnline = sentinel.online;

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#07060b] flex items-center justify-center p-6 text-purple-300">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
          <span className="text-sm font-semibold">Conectando ao J.A.R.V.I.S. Máquina & Sentinela...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07060b] text-[#f3f0ff] p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* 1. TOPO: HEADER PRINCIPAL COM STATUS DO SENTINELA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#120e1d] border border-purple-900/40 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 p-0.5 shadow-lg shadow-purple-900/30">
            <div className="w-full h-full bg-[#0d0917] rounded-[14px] flex items-center justify-center">
              <Bot className="w-7 h-7 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                J.A.R.V.I.S. Máquina & Sentinela
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                isOnline 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                {isOnline ? 'SENTINELA ONLINE 24/7' : 'CONECTANDO AO MOTO G60'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-purple-300/70 mt-1">
              Atendente de Vendas WhatsApp + Recuperador Cakto + Gestor de Teste Grátis
            </p>
          </div>
        </div>

        {/* Status Chips do Celular */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-purple-900/50 rounded-xl text-xs text-purple-200">
            <Smartphone className="w-4 h-4 text-purple-400" />
            <span>Moto G60 (Termux)</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-purple-900/50 rounded-xl text-xs text-purple-200">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Alimentação USB 24/7</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-purple-900/50 rounded-xl text-xs text-purple-200">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>RAM: {sentinel?.status?.free_ram_mb || 1780} MB livres</span>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
            title="Atualizar dados em tempo real"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-300 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK TOAST BANNER */}
      {feedbackMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-3 bg-purple-600/20 border border-purple-500/40 rounded-xl text-sm font-semibold text-purple-200 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-purple-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* 2. KPI CARDS (RESUMO DAS MÁQUINAS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Leads WhatsApp */}
        <div className="bg-[#120e1d] border border-purple-900/40 rounded-2xl p-4 shadow-lg hover:border-purple-600/50 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Atendimentos WhatsApp</span>
            <div className="p-2 bg-purple-600/10 text-purple-400 rounded-xl">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black mt-2 text-white">
            {data?.whatsappLeads?.total || 35}
          </div>
          <p className="text-xs text-purple-300/60 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">{convertedCount} convertidos</span> • {leadsArray.length - convertedCount} no funil
          </p>
        </div>

        {/* Card 2: Testes Grátis */}
        <div className="bg-[#120e1d] border border-purple-900/40 rounded-2xl p-4 shadow-lg hover:border-purple-600/50 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Testes de 5 Minutos</span>
            <div className="p-2 bg-cyan-600/10 text-cyan-400 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black mt-2 text-white">
            {data?.trials?.totalGenerated || 21}
          </div>
          <p className="text-xs text-cyan-300/60 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Anti-fraude de aparelho ativo</span>
          </p>
        </div>

        {/* Card 3: Leads do Quiz */}
        <div className="bg-[#120e1d] border border-purple-900/40 rounded-2xl p-4 shadow-lg hover:border-purple-600/50 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Leads do Quiz</span>
            <div className="p-2 bg-purple-600/10 text-purple-400 rounded-xl">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black mt-2 text-white">
            {data?.quiz?.totalCompletedWithPhone || 17}
          </div>
          <p className="text-xs text-purple-300/60 mt-1">
            Diagnósticos com WhatsApp
          </p>
        </div>

        {/* Card 4: Cupom Relâmpago */}
        <div className="bg-[#120e1d] border border-purple-900/40 rounded-2xl p-4 shadow-lg hover:border-purple-600/50 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Cupom {CUPOM_VITALICIO} (Vitalício)</span>
            <div className="p-2 bg-amber-600/10 text-amber-400 rounded-xl">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black mt-2 text-amber-300 flex items-center gap-2">
            <span>R$ 39,99</span>
            <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold">-R$10</span>
          </div>
          <p className="text-xs text-amber-200/60 mt-1">
            Gatilho do Estágio 3 (24h)
          </p>
        </div>

        {/* Card 5: Link Rápido de Checkout */}
        <div className="bg-gradient-to-br from-purple-950/70 to-indigo-950/70 border border-purple-600/40 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Link Direto c/ Desconto</span>
          <button
            onClick={() => copyToClipboard(LINK_VITALICIO_CUPOM, 'link')}
            className="w-full mt-2 py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link R$ 39,99'}</span>
          </button>
        </div>
      </div>

      {/* 3. NAVEGAÇÃO DE ABAS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-purple-900/40 pb-3">
        {[
          { id: 'whatsapp', label: 'Atendimentos WhatsApp (CRM)', icon: MessageSquare, count: leadsArray.length },
          { id: 'trials', label: 'Testes de 5 Minutos (Trial)', icon: Clock, count: data?.trials?.totalGenerated || 0 },
          { id: 'quiz', label: 'Funil do Quiz & Abordagens', icon: PieChart, count: data?.quiz?.totalCompletedWithPhone || 0 },
          { id: 'sales', label: 'Recuperação Cakto & Vendas', icon: DollarSign, count: data?.finance?.totalTransactions || 0 },
          { id: 'logs', label: 'Terminal do Sentinela (Logs)', icon: Terminal }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                  : 'bg-[#120e1d] text-purple-300/70 hover:text-white hover:bg-purple-950/40 border border-purple-900/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-purple-900/50 text-purple-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. CONTEÚDO DAS ABAS */}
      <div className="space-y-6">

        {/* ============================================================ */}
        {/* ABA 1: ATENDIMENTOS AO VIVO NO WHATSAPP (CRM JARVIS) */}
        {/* ============================================================ */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-4">
            {/* Barra de Filtros e Busca */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#120e1d] border border-purple-900/30 rounded-2xl p-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400/60" />
                <input
                  type="text"
                  placeholder="Buscar lead por nome, telefone ou mensagem..."
                  value={leadSearch}
                  onChange={e => setLeadSearch(e.target.value)}
                  className="w-full bg-[#0a0712] border border-purple-900/50 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Botões de Filtro de Estágio */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'Todos', count: leadsArray.length },
                  { id: '0', label: 'Atendimento (Estágio 0)', count: stage0Count },
                  { id: '1', label: 'Lembrete 25m', count: stage1Count },
                  { id: '2', label: 'Lembrete 18h', count: stage2Count },
                  { id: '3', label: 'Cupom VIP10 (24h)', count: stage3Count },
                  { id: 'converted', label: 'Convertidos 💰', count: convertedCount }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setStageFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      stageFilter === f.id
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-black/30 text-purple-300/60 hover:text-white border border-purple-900/30'
                    }`}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Leads */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLeads.map((lead: any, idx: number) => {
                const phone = lead.phone || lead.jid?.replace('@s.whatsapp.net', '') || '';
                const cleanPhone = phone.replace(/\D/g, '');
                const waLink = `https://wa.me/${cleanPhone}`;

                return (
                  <div
                    key={lead.jid || idx}
                    className={`bg-[#120e1d] border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all ${
                      lead.converted
                        ? 'border-emerald-500/40 bg-emerald-950/10'
                        : lead.stage === 3
                        ? 'border-amber-500/40 bg-amber-950/10'
                        : 'border-purple-900/40 hover:border-purple-600/50'
                    }`}
                  >
                    <div>
                      {/* Topo do Card */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-white text-base">
                            {lead.senderName || 'Cliente WhatsApp'}
                          </h3>
                          <span className="font-mono text-xs text-purple-300/60 block mt-0.5">
                            +{cleanPhone}
                          </span>
                        </div>

                        {lead.converted ? (
                          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Pagou 💰
                          </span>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            lead.stage === 3
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : lead.stage === 2
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : lead.stage === 1
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}>
                            {lead.stage === 0 && 'Estágio 0: Conversando'}
                            {lead.stage === 1 && 'Estágio 1: 25m'}
                            {lead.stage === 2 && 'Estágio 2: 18h'}
                            {lead.stage === 3 && 'Estágio 3: Cupom VIP10'}
                          </span>
                        )}
                      </div>

                      {/* Mensagem Recente */}
                      <div className="mt-3.5 bg-[#0a0712] p-3 rounded-xl border border-purple-900/30 text-xs">
                        <span className="text-purple-400 font-semibold block mb-1">Última Mensagem:</span>
                        <p className="text-purple-200/80 italic line-clamp-3">
                          "{lead.lastUserMessage || 'Iniciou conversa pelo quiz ou teste grátis'}"
                        </p>
                      </div>

                      {/* Detalhes extras */}
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-purple-300/60">
                        {lead.sentCheckoutLink && (
                          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded border border-purple-500/20 font-medium">
                            Link Cakto Enviado
                          </span>
                        )}
                        {lead.source && (
                          <span className="px-2 py-0.5 bg-white/5 text-gray-300 rounded border border-white/10 font-medium">
                            Origem: {lead.source}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botão Ação */}
                    <div className="mt-4 pt-3 border-t border-purple-900/30 flex items-center justify-between">
                      <span className="text-[11px] text-purple-300/40">
                        {lead.lastInteractionAt ? new Date(lead.lastInteractionAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Hoje'}
                      </span>

                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-green-900/20"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Abrir Conversa</span>
                      </a>
                    </div>
                  </div>
                );
              })}

              {filteredLeads.length === 0 && (
                <div className="col-span-full py-16 text-center text-purple-300/50 bg-[#120e1d] rounded-2xl border border-purple-900/30">
                  Nenhum lead encontrado com esse filtro.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ABA 2: TESTES GRÁTIS DE 5 MINUTOS (TRIAL MANAGER) */}
        {/* ============================================================ */}
        {activeTab === 'trials' && (
          <div className="space-y-6">
            {/* Box de Geração Manual de Código */}
            <div className="bg-[#120e1d] border border-cyan-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-cyan-600/20 text-cyan-400 rounded-xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Gerador de Acesso Teste Grátis (5 Minutos)</h2>
                  <p className="text-xs text-purple-300/60">Gere um código avulso para enviar manualmente para clientes ou parceiros</p>
                </div>
              </div>

              <form onSubmit={handleGenerateManualTrial} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Nome do cliente (opcional)"
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  className="bg-[#0a0712] border border-purple-900/50 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="WhatsApp (ex: 84999998888)"
                  value={manualPhone}
                  onChange={e => setManualPhone(e.target.value)}
                  className="bg-[#0a0712] border border-purple-900/50 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={generatingTrial}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{generatingTrial ? 'Gerando Código...' : 'Gerar Código de 5 Minutos'}</span>
                </button>
              </form>

              {/* Resultado do Código Gerado */}
              {generatedTrialCode && (
                <div className="mt-4 p-4 bg-cyan-950/40 border border-cyan-500/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-cyan-300">Código VIP de Teste:</span>
                    <span className="text-2xl font-black font-mono tracking-widest text-white bg-black/60 px-4 py-1 rounded-lg border border-cyan-500/50">
                      {generatedTrialCode}
                    </span>
                    <span className="text-xs text-cyan-400/80">Validade: 20 min</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(generatedTrialCode, 'code')}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tabela de Códigos Gerados */}
            <div className="bg-[#120e1d] border border-purple-900/40 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-purple-900/30 flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>Histórico de Códigos de Teste Gerados</span>
                </h3>
                <span className="text-xs text-purple-300/60 font-mono">
                  {data?.trials?.totalGenerated || 0} códigos registrados
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-purple-200/80">
                  <thead className="bg-[#0a0712] text-xs font-bold uppercase tracking-wider text-purple-400">
                    <tr>
                      <th className="px-5 py-3">Código</th>
                      <th className="px-5 py-3">Telefone Vinculado</th>
                      <th className="px-5 py-3">Duração</th>
                      <th className="px-5 py-3">Validade</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/30">
                    {(data?.trials?.items || []).map((t: any) => {
                      const validUntilMs = t.validUntil ? new Date(t.validUntil).getTime() : 0;
                      const isExpired = validUntilMs > 0 && Date.now() > validUntilMs;

                      return (
                        <tr key={t.id} className="hover:bg-purple-950/20 transition-colors">
                          <td className="px-5 py-3.5 font-mono font-bold text-white text-sm">
                            {t.code || t.id}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-purple-300">
                            {t.phone || 'Avulso'}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded font-bold text-xs">
                              {t.durationMinutes || 5} min
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-purple-300/70">
                            {t.validUntil ? new Date(t.validUntil).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                              isExpired 
                                ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {isExpired ? 'Expirado' : 'Disponível'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ABA 3: FUNIL DO QUIZ & ABORDAGENS */}
        {/* ============================================================ */}
        {activeTab === 'quiz' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#120e1d] border border-purple-900/30 rounded-2xl p-4">
              <div>
                <h3 className="font-bold text-white text-base">Leads Concluídos do Diagnóstico de Vendas</h3>
                <p className="text-xs text-purple-300/60 mt-0.5">Leads com alta intenção de compra prontos para abordagem personalizada</p>
              </div>

              <button
                onClick={handleSyncAllQuizLeads}
                disabled={refreshing}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <Bot className="w-4 h-4" />
                <span>Disparar Jarvis (Pendentes)</span>
              </button>
            </div>

            <div className="bg-[#120e1d] border border-purple-900/40 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-purple-200/80">
                  <thead className="bg-[#0a0712] text-xs font-bold uppercase tracking-wider text-purple-400">
                    <tr>
                      <th className="px-5 py-3.5">Participante</th>
                      <th className="px-5 py-3.5">WhatsApp</th>
                      <th className="px-5 py-3.5">Nota Quiz</th>
                      <th className="px-5 py-3.5">Gargalo Detectado</th>
                      <th className="px-5 py-3.5">Status Jarvis</th>
                      <th className="px-5 py-3.5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/30">
                    {(data?.quiz?.items || []).map((lead: any) => {
                      const cleanPhone = (lead.phone || '').replace(/\D/g, '');
                      const waLink = `https://wa.me/${cleanPhone}`;

                      return (
                        <tr key={lead.id} className="hover:bg-purple-950/20 transition-colors">
                          <td className="px-5 py-4 font-bold text-white">
                            {lead.name || 'Participante'}
                            <span className="block text-[11px] font-normal text-purple-300/50">
                              {lead.profile || 'Iniciante'}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-mono text-purple-300">
                            {lead.phone}
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg font-bold">
                              {lead.score || 0}/100
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs font-semibold text-amber-300">
                            {lead.bottleneck || 'Atrair clientes'}
                          </td>
                          <td className="px-5 py-4">
                            {lead.jarvis_contacted ? (
                              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Jarvis Chamou
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold w-fit">
                                Pendente
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!lead.jarvis_contacted && (
                                <button
                                  onClick={() => handleDispatchQuizLead(lead)}
                                  disabled={dispatchingId === lead.id}
                                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
                                >
                                  <Bot className="w-3.5 h-3.5" />
                                  <span>{dispatchingId === lead.id ? 'Chamando...' : 'Chamar c/ Jarvis'}</span>
                                </button>
                              )}
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded-xl transition-all"
                                title="Abrir WhatsApp manual"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ABA 4: VENDAS & RECUPERAÇÃO CAKTO */}
        {/* ============================================================ */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box de Acesso Rápido a Links de Conversão */}
              <div className="bg-[#120e1d] border border-purple-900/40 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <span>Link Promocional c/ Cupom VIP10 (Vitalício)</span>
                </div>
                <div className="p-3 bg-black/50 border border-purple-900/50 rounded-xl font-mono text-xs text-purple-300 break-all select-all">
                  {LINK_VITALICIO_CUPOM}
                </div>
                <button
                  onClick={() => copyToClipboard(LINK_VITALICIO_CUPOM, 'link')}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link Vitalício com R$ 10 de Desconto'}</span>
                </button>
              </div>

              {/* Informações da Integração */}
              <div className="bg-[#120e1d] border border-purple-900/40 rounded-2xl p-5 shadow-xl space-y-2 text-xs">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Webhook Cakto Automático</span>
                </h4>
                <p className="text-purple-300/70">
                  • <strong>PIX Gerado:</strong> O Jarvis recebe os dados, chama o cliente no WhatsApp e envia o código PIX Copia e Cola automaticamente.
                </p>
                <p className="text-purple-300/70">
                  • <strong>Compra Aprovada:</strong> O sistema libera a conta do Gmail do cliente na hora e o Jarvis envia a mensagem de boas-vindas com o tutorial.
                </p>
                <p className="text-purple-300/70">
                  • <strong>Alertas:</strong> Você recebe notificação instantânea no WhatsApp do Willian (+55 84 9665-6016) a cada evento!
                </p>
              </div>
            </div>

            {/* Tabela de Transações Recentes */}
            <div className="bg-[#120e1d] border border-purple-900/40 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-purple-900/30 font-bold text-sm text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Transações e Assinaturas Registradas</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-purple-200/80">
                  <thead className="bg-[#0a0712] text-xs font-bold uppercase tracking-wider text-purple-400">
                    <tr>
                      <th className="px-5 py-3">Cliente / Gmail</th>
                      <th className="px-5 py-3">Plano</th>
                      <th className="px-5 py-3">Valor</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/30">
                    {(data?.finance?.items || []).map((t: any) => (
                      <tr key={t.id} className="hover:bg-purple-950/20 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-white">
                          {t.user_name || t.client_name || 'Assinante GhostMarket'}
                          <span className="block text-xs font-normal text-purple-300/60 font-mono">
                            {t.user_email || t.email || '-'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded font-bold text-xs uppercase">
                            {t.plan || 'SaaS'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-emerald-400 font-mono">
                          R$ {Number(t.amount || t.value || 0).toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
                            {t.status || 'Confirmado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(data?.finance?.items || []).length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-purple-300/40">
                          Nenhuma transação recente no Firestore.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ABA 5: TERMINAL DE LOGS DO SENTINELA (MOTO G60) */}
        {/* ============================================================ */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="bg-[#120e1d] border border-purple-900/40 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-white text-sm">Terminal ao Vivo: PM2 ghost-whatsapp-agent (Moto G60)</h3>
                </div>
                <button
                  onClick={handleManualRefresh}
                  className="text-xs text-purple-300/70 hover:text-white flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Recarregar Logs
                </button>
              </div>

              <div className="bg-black/80 border border-purple-900/60 rounded-xl p-4 font-mono text-xs text-emerald-400 space-y-1 max-h-[460px] overflow-y-auto custom-scrollbar select-text">
                <div className="text-zinc-500 mb-2">--- INÍCIO DOS LOGS DO JARVIS ---</div>
                <pre className="whitespace-pre-wrap leading-relaxed">
                  {data?.logs?.outContent || 'Aguardando logs do processo...'}
                </pre>
                {data?.logs?.errContent && (
                  <div className="mt-4 pt-3 border-t border-red-900/40 text-red-400">
                    <span className="font-bold text-red-300">[Avisos / Logs de Erro]:</span>
                    <pre className="whitespace-pre-wrap mt-1">{data?.logs?.errContent}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
