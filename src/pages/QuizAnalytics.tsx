import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, query, getDocs, orderBy, where, Timestamp } from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, CheckCircle, Eye, AlertTriangle, MessageCircle, X, ChevronRight, MousePointerClick, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#8b5cf6', '#a855f7', '#c084fc', '#e9d5ff'];

const LeadDetailsModal = ({ session, onClose, events }: { session: any, onClose: () => void, events: any[] }) => {
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const qAnswers = query(
          collection(db, 'quiz_answers'),
          where('session_id', '==', session.id),
          orderBy('answered_at', 'asc')
        );
        const snap = await getDocs(qAnswers);
        setAnswers(snap.docs.map(d => d.data()));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnswers();
  }, [session.id]);

  // Encontrar se clicou em alguma oferta final
  const offerClicks = events.filter(e => e.session_id === session.id && e.event_type === 'quiz_offer_clicked');

  const getWhatsappLink = (phone: string, name: string, score: number, bottleneck: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const msg = `Oi ${name}! Vi aqui que você fez o diagnóstico da Ghost AI e tirou nota ${score} (Gargalo: ${bottleneck}). Como posso te ajudar a acelerar seus resultados?`;
    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-surface border border-border w-full max-w-3xl max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-elevated">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 text-accent font-bold text-lg">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{session.name}</h2>
              <div className="flex items-center gap-2 text-gray-400 text-sm mt-0.5">
                <span>{session.phone}</span>
                <span>•</span>
                <span>{session.started_at ? format(session.started_at.toDate(), 'dd/MM/yyyy HH:mm') : ''}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Modal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Status and Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${
                session.status === 'Concluído' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              }`}>
              Status: {session.status}
            </div>
            {session.score && (
              <>
                <div className="px-4 py-2 rounded-xl text-sm font-bold bg-accent/10 text-accent border border-accent/20">
                  Nota: {session.score}
                </div>
                <div className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 text-gray-300 border border-white/10">
                  Perfil: {session.profile}
                </div>
                <div className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 text-gray-300 border border-white/10">
                  Gargalo: {session.bottleneck}
                </div>
              </>
            )}
            
            <a 
              href={getWhatsappLink(session.phone, session.name, session.score || 0, session.bottleneck || 'N/A')}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold rounded-xl transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chamar no WhatsApp
            </a>
          </div>

          {/* Offer Clicks Tracker */}
          {offerClicks.length > 0 && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex flex-col gap-3">
              <h4 className="text-sm font-bold text-accent flex items-center gap-2">
                <MousePointerClick className="w-4 h-4" />
                Interesse nas Ofertas Finais (Cliques)
              </h4>
              <div className="flex flex-wrap gap-2">
                {offerClicks.map((click, i) => (
                  <div key={i} className="flex items-center gap-2 bg-surface-elevated px-3 py-2 rounded-lg text-sm text-gray-300 border border-border">
                    <span className="text-white font-medium">{click.metadata?.offer || 'Oferta'}</span>
                    <span className="text-xs text-gray-500">
                      ({click.timestamp ? format(click.timestamp.toDate(), 'HH:mm:ss') : ''})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Answers Timeline */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 border-b border-border pb-2">Respostas Detalhadas</h3>
            {loading ? (
              <div className="animate-pulse flex flex-col gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-20 bg-white/5 rounded-xl"></div>
                ))}
              </div>
            ) : answers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-white/5 rounded-xl border border-white/5">
                Nenhuma resposta registrada para este lead.
              </div>
            ) : (
              <div className="space-y-4">
                {answers.map((ans, idx) => (
                  <div key={idx} className="bg-surface-elevated border border-border rounded-xl p-4 relative overflow-hidden group hover:border-accent/50 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-accent/50 group-hover:bg-accent transition-colors"></div>
                    <div className="pl-2">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h4 className="text-sm font-bold text-gray-300 leading-snug">
                          <span className="text-accent mr-2">Q{ans.question_number}.</span>
                          {ans.question_text}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap bg-background px-2 py-1 rounded-md border border-border">
                          <Clock className="w-3 h-3" />
                          {ans.time_spent_ms ? (ans.time_spent_ms / 1000).toFixed(1) + 's' : '-'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <ArrowRight className="w-4 h-4 text-accent" />
                        <span className="text-base text-white font-medium bg-accent/10 px-3 py-1.5 rounded-lg border border-accent/20">
                          {ans.option_text}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {session.status !== 'Concluído' && (
                  <div className="flex items-center justify-center gap-2 text-yellow-500/80 text-sm mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <AlertTriangle className="w-4 h-4" />
                    O lead abandonou o quiz neste ponto.
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export const QuizAnalytics = () => {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

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
    <div className="p-4 md:p-8 pb-32 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Analytics do Quiz</h1>
          <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">Visão geral do desempenho e conversão do seu quiz</p>
        </div>
        <select 
          className="bg-surface border border-border rounded-xl px-4 py-2.5 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none w-full sm:w-auto transition-all"
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
        >
          <option value={1}>Hoje</option>
          <option value={7}>Últimos 7 dias</option>
          <option value={30}>Últimos 30 dias</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 animate-pulse">Carregando inteligência de dados...</div>
      ) : (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {[
              { title: 'Visualizações', value: views, icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { title: 'Inícios (Leads)', value: starts, icon: Users, color: 'text-accent', bg: 'bg-accent/10' },
              { title: 'Conclusões', value: completes, sub: `(${convRate}%)`, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
              { title: 'Abandonos', value: abandons, icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
            ].map((stat, i) => (
              <div key={i} className="bg-surface p-5 sm:p-6 rounded-2xl border border-border shadow-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-white flex items-baseline gap-2">
                      {stat.value} 
                      {stat.sub && <span className={`text-sm ${stat.color}`}>{stat.sub}</span>}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-surface p-5 sm:p-6 rounded-2xl border border-border shadow-lg">
              <h3 className="text-lg font-bold text-white mb-6">Distribuição de Perfis</h3>
              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={profileData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {profileData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#120e1d', borderColor: '#2a2145', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {profileData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface p-5 sm:p-6 rounded-2xl border border-border shadow-lg">
              <h3 className="text-lg font-bold text-white mb-6">Gargalos Identificados</h3>
              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bottleneckData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9d94b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#6b7280" tick={{ fill: '#9d94b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      cursor={{fill: '#1f2937', radius: 4}}
                      contentStyle={{ backgroundColor: '#120e1d', borderColor: '#2a2145', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-lg">
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Últimos Participantes</h3>
              <span className="text-xs text-gray-500 bg-background px-3 py-1.5 rounded-full border border-border">
                Clique na linha para detalhes
              </span>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm text-gray-400 whitespace-nowrap">
                <thead className="bg-surface-elevated text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 sm:px-6 py-4 font-semibold tracking-wider">Data</th>
                    <th className="px-5 sm:px-6 py-4 font-semibold tracking-wider">Nome</th>
                    <th className="px-5 sm:px-6 py-4 font-semibold tracking-wider">Telefone</th>
                    <th className="px-5 sm:px-6 py-4 font-semibold tracking-wider">Status</th>
                    <th className="px-5 sm:px-6 py-4 font-semibold tracking-wider">Nota</th>
                    <th className="px-5 sm:px-6 py-4 font-semibold tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sessions.slice(0, 100).map((s) => {
                    // Check if they clicked any offer
                    const clickedMentoria = events.some(e => e.session_id === s.id && e.event_type === 'quiz_offer_clicked' && e.metadata?.offer === 'mentoria');
                    const clickedGhost = events.some(e => e.session_id === s.id && e.event_type === 'quiz_offer_clicked' && e.metadata?.offer === 'ghost-ai');
                    
                    return (
                      <tr 
                        key={s.id} 
                        onClick={() => setSelectedSession(s)}
                        className="hover:bg-surface-elevated/80 transition-colors cursor-pointer group"
                      >
                        <td className="px-5 sm:px-6 py-4">
                          {s.started_at ? format(s.started_at.toDate(), 'dd/MM HH:mm') : ''}
                        </td>
                        <td className="px-5 sm:px-6 py-4">
                          <div className="font-bold text-white group-hover:text-accent transition-colors">{s.name}</div>
                          {s.profile && <div className="text-xs text-gray-500 mt-1">{s.profile}</div>}
                        </td>
                        <td className="px-5 sm:px-6 py-4 font-mono text-gray-300">
                          {s.phone}
                        </td>
                        <td className="px-5 sm:px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            s.status === 'Concluído' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-5 sm:px-6 py-4">
                          {s.score ? (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white bg-accent/20 px-2 py-1 rounded border border-accent/30">{s.score}</span>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-5 sm:px-6 py-4">
                          <div className="flex items-center gap-2">
                            {clickedGhost && (
                              <span className="px-2 py-1 bg-[#7c3aed]/20 text-[#c4b5fd] border border-[#7c3aed]/30 rounded-md text-[10px] font-bold uppercase" title="Clicou em Ghost AI">
                                SaaS
                              </span>
                            )}
                            {clickedMentoria && (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md text-[10px] font-bold uppercase" title="Clicou na Mentoria">
                                Mentoria
                              </span>
                            )}
                            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors ml-auto" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {sessions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        Nenhum lead encontrado neste período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {selectedSession && (
          <LeadDetailsModal 
            session={selectedSession} 
            events={events}
            onClose={() => setSelectedSession(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
