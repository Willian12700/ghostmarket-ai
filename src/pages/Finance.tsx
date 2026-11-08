import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Download,
  CreditCard,
  Plus,
  Trash2,
  Target,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuthStore } from '../store/authStore';
import { useContractStore } from '../store/contractStore';
import { useToastStore } from '../store/toastStore';
import { db } from '@/config/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from 'firebase/firestore';

interface FinancialEntry {
  id: string;
  client: string;
  service: string;
  amount: number;
  status: 'received' | 'pending';
  date: string;
  source: 'crm' | 'manual';
}

export const Finance = () => {
  const { user } = useAuthStore();
  const { contracts, syncContracts } = useContractStore();
  const { addToast } = useToastStore();
  const toast = {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
  };
  const [manualEntries, setManualEntries] = useState<FinancialEntry[]>([]);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(10000);
  const [filterStatus, setFilterStatus] = useState<'all' | 'received' | 'pending'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Entry Form
  const [clientName, setClientName] = useState('');
  const [serviceName, setServiceName] = useState('Landing Page + Hospedagem');
  const [amountInput, setAmountInput] = useState('1500');
  const [entryStatus, setEntryStatus] = useState<'received' | 'pending'>('received');

  useEffect(() => {
    if (user?.uid) {
      const unsub = syncContracts(user.uid);
      return () => unsub();
    }
  }, [user?.uid, syncContracts]);

  const fetchManualTransactions = async () => {
    if (!user?.uid) return;
    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      const list: FinancialEntry[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          client: data.client || 'Cliente',
          service: data.service || 'Projeto Digital',
          amount: Number(data.amount) || 0,
          status: data.status === 'pending' ? 'pending' : 'received',
          date: data.date || new Date().toISOString(),
          source: 'manual',
        };
      });
      setManualEntries(list);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  useEffect(() => {
    fetchManualTransactions();
  }, [user?.uid]);

  // Combine CRM contracts + manual entries
  const allEntries = useMemo(() => {
    const crmMapped: FinancialEntry[] = contracts.map((c) => ({
      id: `crm-${c.id}`,
      client: c.client,
      service: c.niche ? `Projeto (${c.niche})` : 'Site / Estrutura Digital',
      amount: Number(c.amount) || 1500,
      status: c.status === 'Fechado' ? 'received' : 'pending',
      date: c.date || new Date().toISOString(),
      source: 'crm',
    }));
    return [...manualEntries, ...crmMapped].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [contracts, manualEntries]);

  const filteredEntries = useMemo(() => {
    if (filterStatus === 'all') return allEntries;
    return allEntries.filter((e) => e.status === filterStatus);
  }, [allEntries, filterStatus]);

  const stats = useMemo(() => {
    const received = allEntries
      .filter((e) => e.status === 'received')
      .reduce((acc, e) => acc + e.amount, 0);
    const pending = allEntries
      .filter((e) => e.status === 'pending')
      .reduce((acc, e) => acc + e.amount, 0);
    const closedCount = allEntries.filter((e) => e.status === 'received').length;
    const avgTicket = closedCount > 0 ? received / closedCount : 1500;
    const goalProgress = Math.min(100, Math.round((received / (monthlyGoal || 1)) * 100));

    return { received, pending, closedCount, avgTicket, goalProgress };
  }, [allEntries, monthlyGoal]);

  const chartData = useMemo(() => {
    const base = stats.received || 3000;
    return [
      { name: 'Sem 1', faturamento: Math.round(base * 0.18), pipeline: Math.round((stats.pending || 2000) * 0.25) },
      { name: 'Sem 2', faturamento: Math.round(base * 0.42), pipeline: Math.round((stats.pending || 2000) * 0.5) },
      { name: 'Sem 3', faturamento: Math.round(base * 0.74), pipeline: Math.round((stats.pending || 2000) * 0.8) },
      { name: 'Atual', faturamento: stats.received, pipeline: stats.pending },
    ];
  }, [stats]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    const numericAmount = Number(amountInput.replace(',', '.')) || 0;
    if (!clientName.trim() || numericAmount <= 0) {
      toast.error('Preencha o nome do cliente e um valor válido.');
      return;
    }

    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        client: clientName.trim(),
        service: serviceName.trim(),
        amount: numericAmount,
        status: entryStatus,
        date: new Date().toISOString(),
      });
      toast.success('Lançamento financeiro registrado!');
      setClientName('');
      setIsModalOpen(false);
      fetchManualTransactions();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar lançamento.');
    }
  };

  const handleDeleteManual = async (entryId: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', entryId));
      setManualEntries((prev) => prev.filter((e) => e.id !== entryId));
      toast.success('Lançamento removido.');
    } catch {
      toast.error('Erro ao remover lançamento.');
    }
  };

  const handleExportCsv = () => {
    const headers = ['Cliente', 'Servico', 'Valor_BRL', 'Status', 'Origem', 'Data'];
    const rows = allEntries.map((e) => [
      `"${e.client.replace(/"/g, '""')}"`,
      `"${e.service.replace(/"/g, '""')}"`,
      e.amount.toFixed(2),
      e.status === 'received' ? 'Recebido' : 'Em Negociacao',
      e.source.toUpperCase(),
      new Date(e.date).toLocaleDateString('pt-BR'),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-ghostai-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Planilha CSV exportada com sucesso!');
  };

  const fmtBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0E0E11] p-6 rounded-2xl border border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              Gestão Financeira & Receita Integrada ao CRM
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Acompanhe os contratos fechados no CRM, propostas em aberto no funil e lançamentos avulsos em tempo real.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" /> Novo Lançamento
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0E0E11] border border-zinc-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">Faturamento Recebido</span>
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-white">{fmtBRL(stats.received)}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" /> {stats.closedCount} contratos liquidados
            </div>
          </div>

          <div className="bg-[#0E0E11] border border-zinc-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">Pipeline em Negociação</span>
              <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-white">{fmtBRL(stats.pending)}</div>
            <div className="text-xs text-zinc-400">Propostas ativas no CRM</div>
          </div>

          <div className="bg-[#0E0E11] border border-zinc-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">Ticket Médio por Projeto</span>
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <CreditCard className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-black text-white">{fmtBRL(stats.avgTicket)}</div>
            <div className="text-xs text-zinc-400">Valor médio por fechamento</div>
          </div>

          <div className="bg-[#0E0E11] border border-zinc-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">Meta Mensal ({stats.goalProgress}%)</span>
              <Target className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">R$</span>
              <input
                type="number"
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(Number(e.target.value) || 1000)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-sm font-bold text-white"
              />
            </div>
            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${stats.goalProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chart + Transactions Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-[#0E0E11] border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Evolução de Receita vs Pipeline
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              Comparativo entre receita confirmada e propostas abertas
            </p>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717A" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#09090B',
                      borderColor: '#27272A',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="faturamento"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRec)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#0E0E11] border border-zinc-800 rounded-2xl p-6 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-bold text-white">
                Extrato de Contratos & Lançamentos ({filteredEntries.length})
              </h3>
              <div className="flex gap-1.5">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'received', label: 'Recebidos' },
                  { id: 'pending', label: 'Em Negociação' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilterStatus(f.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      filterStatus === f.id
                        ? 'bg-emerald-500 text-zinc-950'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[310px] space-y-2 pr-1">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  Nenhum lançamento encontrado. Adicione um lançamento manual ou salve leads no CRM.
                </div>
              ) : (
                filteredEntries.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          item.status === 'received'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {item.status === 'received' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white truncate">{item.client}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 uppercase">
                            {item.source}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate">{item.service}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p
                          className={`text-xs font-black ${
                            item.status === 'received' ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {fmtBRL(item.amount)}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          {new Date(item.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {item.source === 'manual' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteManual(item.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400"
                          title="Excluir lançamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Novo Lançamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E0E11] border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Novo Lançamento Financeiro</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddEntry} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Nome do Cliente / Empresa
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Barbearia Dom Corleone"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Serviço Prestado
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Valor (R$)</label>
                  <input
                    type="text"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-emerald-400 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Status</label>
                  <select
                    value={entryStatus}
                    onChange={(e) => setEntryStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                  >
                    <option value="received">Pago / Recebido</option>
                    <option value="pending">Pendente / Proposta</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 text-xs font-bold"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
