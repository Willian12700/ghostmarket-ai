import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, query, getDocs, orderBy, where, Timestamp } from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, CheckCircle, Eye, AlertTriangle } from 'lucide-react';

import { format } from 'date-fns';

const COLORS = ['#8b5cf6', '#a855f7', '#c084fc', '#e9d5ff'];

export const QuizAnalytics = () => {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  const isAdmin = user?.email === 'willrandrier@gmail.com';
  const isPartner = user?.email === 'souza.abencoado4@gmail.com';

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const qSessions = query(
        collection(db, 'quiz_sessions'),
        where('started_at', '>=', Timestamp.fromDate(startDate)),
        orderBy('started_at', 'desc')
      );
      const snapshotSessions = await getDocs(qSessions);
      setSessions(snapshotSessions.docs.map(d => ({ id: d.id, ...d.data() })));

      const qEvents = query(
        collection(db, 'quiz_events'),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        orderBy('timestamp', 'desc')
      );
      const snapshotEvents = await getDocs(qEvents);
      setEvents(snapshotEvents.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const views = events.filter(e => e.event_type === 'quiz_view').length;
  const starts = sessions.length;
  const completes = sessions.filter(s => s.status === 'Concluído').length;
  const abandons = starts - completes;

  const convRate = starts ? ((completes / starts) * 100).toFixed(1) : 0;
  
  // const scores = sessions.filter(s => s.score).map(s => s.score);
  // const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;

  const profiles = sessions.reduce((acc, s) => {
    if (s.profile) acc[s.profile] = (acc[s.profile] || 0) + 1;
    return acc;
  }, {} as any);
  
  const bottlenecks = sessions.reduce((acc, s) => {
    if (s.bottleneck) acc[s.bottleneck] = (acc[s.bottleneck] || 0) + 1;
    return acc;
  }, {} as any);

  const profileData = Object.keys(profiles).map(k => ({ name: k, value: profiles[k] }));
  const bottleneckData = Object.keys(bottlenecks).map(k => ({ name: k, value: bottlenecks[k] }));

  if (!isAdmin && !isPartner) {
    return <div className="p-8">Acesso Negado.</div>;
  }

  return (
    <div className="p-8 pb-32">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Analytics do Quiz</h1>
          <p className="text-gray-400 mt-2">Visão geral do desempenho e conversão do seu quiz</p>
        </div>
        <select 
          className="bg-surface border border-border rounded-lg px-4 py-2 text-white"
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
        >
          <option value={1}>Hoje</option>
          <option value={7}>Últimos 7 dias</option>
          <option value={30}>Últimos 30 dias</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando dados...</div>
      ) : (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-surface p-6 rounded-xl border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Visualizações</p>
                  <p className="text-2xl font-bold text-white">{views}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-surface p-6 rounded-xl border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Inícios (Leads)</p>
                  <p className="text-2xl font-bold text-white">{starts}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Conclusões</p>
                  <p className="text-2xl font-bold text-white">{completes} <span className="text-sm text-green-500">({convRate}%)</span></p>
                </div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Abandonos</p>
                  <p className="text-2xl font-bold text-white">{abandons}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-surface p-6 rounded-xl border border-border">
              <h3 className="text-lg font-bold text-white mb-4">Distribuição de Perfis</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={profileData} cx="50%" cy="50%" outerRadius={80} fill="#8b5cf6" dataKey="value" label>
                      {profileData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-border">
              <h3 className="text-lg font-bold text-white mb-4">Gargalos Identificados</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bottleneckData}>
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip cursor={{fill: '#1f2937'}} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-white">Últimos Participantes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-surface-elevated text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">Telefone</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Nota</th>
                    <th className="px-6 py-3">Perfil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sessions.slice(0, 50).map((s) => (
                    <tr key={s.id} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="px-6 py-4">{s.started_at ? format(s.started_at.toDate(), 'dd/MM/yyyy HH:mm') : ''}</td>
                      <td className="px-6 py-4 font-bold text-white">{s.name}</td>
                      <td className="px-6 py-4">{s.phone}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          s.status === 'Concluído' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{s.score || '-'}</td>
                      <td className="px-6 py-4">{s.profile || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
