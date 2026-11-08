import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, query, getDocs, orderBy, where, Timestamp } from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Users, 
  CheckCircle, 
  Eye, 
  AlertTriangle, 
  MessageCircle, 
  X, 
  ChevronRight, 
  MousePointerClick, 
  Clock, 
  ArrowRight, 
  User, 
  Smartphone, 
  Monitor, 
  Info, 
  Phone, 
  Calendar,
  Layers
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#8b5cf6', '#a855f7', '#c084fc', '#e9d5ff', '#6366f1'];

const formatDateSafe = (dateVal: any, formatStr = 'dd/MM/yyyy HH:mm') => {
  if (!dateVal) return '-';
  try {
    if (typeof dateVal.toDate === 'function') {
      return format(dateVal.toDate(), formatStr);
    }
    if (dateVal.seconds) {
      return format(new Date(dateVal.seconds * 1000), formatStr);
    }
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return format(d, formatStr);
    }
    return '-';
  } catch {
    return '-';
  }
};

const getDeviceInfo = (ua?: string) => {
  if (!ua) return { name: 'Desconhecido', isMobile: false, app: null };
  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  let name = 'Desktop';
  if (/iphone/i.test(ua)) name = 'iPhone';
  else if (/ipad/i.test(ua)) name = 'iPad';
  else if (/android/i.test(ua)) name = 'Android';
  else if (/windows/i.test(ua)) name = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) name = 'Mac';
  else if (/linux/i.test(ua)) name = 'Linux';

  let app = null;
  if (/musical_ly|tiktok/i.test(ua)) app = 'TikTok';
  else if (/instagram/i.test(ua)) app = 'Instagram';
  else if (/fban|fbav/i.test(ua)) app = 'Facebook';
  else if (/whatsapp/i.test(ua)) app = 'WhatsApp';

  return { name, isMobile, app };
};

const LeadDetailsModal = ({ session, onClose, events }: { session: any, onClose: () => void, events: any[] }) => {
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        // Sem orderBy para não exigir índice composto no Firestore
        const qAnswers = query(
          collection(db, 'quiz_answers'),
          where('session_id', '==', session.id)
        );
        const snap = await getDocs(qAnswers);
        const docs = snap.docs.map(d => d.data());
        // Ordena em memória por número da pergunta
        docs.sort((a, b) => (a.question_number || 0) - (b.question_number || 0));
        setAnswers(docs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnswers();
  }, [session.id]);

  // Cliques em ofertas finais
  const offerClicks = events.filter(e => e.session_id === session.id && e.event_type === 'quiz_offer_clicked');

  const getWhatsappLink = (phone?: string, name?: string, score?: number, bottleneck?: string) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    const clientName = name ? ` ${name}` : '';
    const msg = `Oi${clientName}! Vi aqui que você fez o diagnóstico da Ghost AI e tirou nota ${score || 0}${bottleneck ? ` (Gargalo: ${bottleneck})` : ''}. Como posso te ajudar a acelerar seus resultados?`;
    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const device = getDeviceInfo(session.user_agent);
  const hasPhone = Boolean(session.phone && session.phone.replace(/\D/g, '').length >= 8);

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
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 text-accent font-bold text-lg shrink-0">
              {session.name ? session.name.charAt(0).toUpperCase() : <User className="w-6 h-6 text-accent" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">
                  {session.name || 'Visitante Anônimo'}
                </h2>
                {!session.name && (
                  <span className="text-[11px] bg-white/10 text-gray-400 px-2 py-0.5 rounded-full border border-white/10">
                    Sem Nome
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-gray-400 text-sm mt-0.5">
                <span className="font-mono text-gray-300">
                  {session.phone || 'Telefone não informado'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  {formatDateSafe(session.started_at)}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Modal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Status, Context and Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <div className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold border ${
                session.status === 'Concluído' 
                  ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                  : session.status === 'Lead'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              }`}>
              Status: {session.status === 'Iniciado' && !session.questions_answered ? 'Não começou a responder' : session.status}
            </div>

            {session.score && (
              <>
                <div className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-accent/10 text-accent border border-accent/20">
                  Nota: {session.score}
                </div>
                {session.profile && (
                  <div className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white/5 text-gray-300 border border-white/10">
                    Perfil: {session.profile}
                  </div>
                )}
                {session.bottleneck && (
                  <div className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white/5 text-gray-300 border border-white/10">
                    Gargalo: {session.bottleneck}
                  </div>
                )}
              </>
            )}

            {/* Dispositivo e Origem */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-white/5 text-gray-400 border border-white/10">
              {device.isMobile ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
              <span>{device.name}</span>
              {device.app && (
                <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                  {device.app}
                </span>
              )}
              {session.source && (
                <span className="text-gray-500">({session.source})</span>
              )}
            </div>
            
            {hasPhone ? (
              <a 
                href={getWhatsappLink(session.phone, session.name, session.score || 0, session.bottleneck || 'N/A')}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-lg shadow-green-500/20"
              >
                <MessageCircle className="w-4 h-4" />
                Chamar no WhatsApp
              </a>
            ) : (
              <div 
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-500 text-xs sm:text-sm font-medium rounded-xl border border-white/10 cursor-not-allowed"
                title="Este lead não preencheu o número de WhatsApp"
              >
                <Phone className="w-4 h-4" />
                Sem WhatsApp
              </div>
            )}
          </div>

          {/* Notificação para Abandonos */}
          {session.status !== 'Concluído' && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3 text-sm text-yellow-300">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-200">
                  {session.questions_answered > 0
                    ? `O participante abandonou após responder ${session.questions_answered} de 6 perguntas.`
                    : 'O participante iniciou o diagnóstico, mas fechou a página antes de responder à primeira pergunta.'}
                </p>
                <p className="text-xs text-yellow-400/80 mt-1">
                  {!session.name && 'Ele não chegou até a etapa de cadastro de nome e WhatsApp.'}
                </p>
              </div>
            </div>
          )}

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
                      ({formatDateSafe(click.timestamp, 'HH:mm:ss')})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Answers Timeline */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Respostas Detalhadas</span>
                {answers.length > 0 && (
                  <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                    {answers.length} de 6
                  </span>
                )}
              </h3>
            </div>
            
            {loading ? (
              <div className="animate-pulse flex flex-col gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-20 bg-white/5 rounded-xl"></div>
                ))}
              </div>
            ) : answers.length === 0 ? (
              <div className="text-center py-8 text-gray-400 bg-white/5 rounded-xl border border-white/5">
                <Info className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-60" />
                Nenhuma resposta registrada para este participante.
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
                
                {session.status !== 'Concluído' && answers.length < 6 && (
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
  const [period, setPeriod] = useState<number>(30); // 1, 7, 30, 90, 0 (all)
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  
  // Tabs & filtros da tabela
  const [activeTab, setActiveTab] = useState<'participants' | 'all_views'>('participants');
  const [filterStatus, setFilterStatus] = useState<'all' | 'with_contact' | 'completed' | 'abandoned'>('all');

  const isAdmin = user?.email === 'willrandrier@gmail.com';
  const isPartner = user?.email === 'souza.abencoado4@gmail.com';

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let qSessions;
      let qEvents;

      if (period > 0) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);
        const timestampBoundary = Timestamp.fromDate(startDate);

        qSessions = query(
          collection(db, 'quiz_sessions'),
          where('started_at', '>=', timestampBoundary),
          orderBy('started_at', 'desc')
        );

        qEvents = query(
          collection(db, 'quiz_events'),
          where('timestamp', '>=', timestampBoundary),
          orderBy('timestamp', 'desc')
        );
      } else {
        // Todo o período
        qSessions = query(
          collection(db, 'quiz_sessions'),
          orderBy('started_at', 'desc')
        );

        qEvents = query(
          collection(db, 'quiz_events'),
          orderBy('timestamp', 'desc')
        );
      }

      const snapshotSessions = await getDocs(qSessions);
      setSessions(snapshotSessions.docs.map(d => ({ id: d.id, ...d.data() })));

      const snapshotEvents = await getDocs(qEvents);
      setEvents(snapshotEvents.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const viewsEvents = events.filter(e => e.event_type === 'quiz_view');
  const views = viewsEvents.length;
  const starts = sessions.length;
  const completes = sessions.filter(s => s.status === 'Concluído').length;
  const leadsWithContact = sessions.filter(s => s.phone && s.phone.replace(/\D/g, '').length >= 8).length;
  const abandons = starts - completes;

  const convRate = starts ? ((completes / starts) * 100).toFixed(1) : '0';
  const startRate = views ? ((starts / views) * 100).toFixed(1) : '0';
  
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

  // Filtragem dos participantes
  const filteredSessions = sessions.filter(s => {
    if (filterStatus === 'with_contact') {
      return Boolean(s.phone && s.phone.replace(/\D/g, '').length >= 8);
    }
    if (filterStatus === 'completed') {
      return s.status === 'Concluído';
    }
    if (filterStatus === 'abandoned') {
      return s.status !== 'Concluído';
    }
    return true;
  });

  if (!isAdmin && !isPartner) {
    return <div className="p-8">Acesso Negado.</div>;
  }

  return (
    <div className="p-4 md:p-8 pb-32 w-full max-w-full overflow-x-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Analytics do Quiz</h1>
          <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
            Visão geral de tráfego, funil de conversão e leads do diagnóstico
          </p>
        </div>
        <select 
          className="bg-surface border border-border rounded-xl px-4 py-2.5 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none w-full sm:w-auto transition-all cursor-pointer"
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
        >
          <option value={1}>Hoje</option>
          <option value={7}>Últimos 7 dias</option>
          <option value={30}>Últimos 30 dias</option>
          <option value={90}>Últimos 90 dias</option>
          <option value={0}>Todo o período (Sempre)</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 animate-pulse flex flex-col items-center justify-center gap-3">
          <Clock className="w-8 h-8 text-accent animate-spin" />
          <span>Carregando inteligência de dados...</span>
        </div>
      ) : (
        <>
          {/* Cards de Métricas Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            {[
              { 
                title: 'Visualizações do Link', 
                value: views, 
                sub: 'Total de acessos na capa',
                icon: Eye, 
                color: 'text-blue-500', 
                bg: 'bg-blue-500/10' 
              },
              { 
                title: 'Inícios do Quiz', 
                value: starts, 
                sub: `${startRate}% clicaram em começar`,
                icon: Users, 
                color: 'text-accent', 
                bg: 'bg-accent/10' 
              },
              { 
                title: 'Leads com Contato', 
                value: leadsWithContact, 
                sub: 'Nome e WhatsApp salvos',
                icon: MessageCircle, 
                color: 'text-emerald-400', 
                bg: 'bg-emerald-400/10' 
              },
              { 
                title: 'Conclusões', 
                value: completes, 
                sub: `${convRate}% dos que iniciaram`, 
                icon: CheckCircle, 
                color: 'text-green-500', 
                bg: 'bg-green-500/10' 
              },
            ].map((stat, i) => (
              <div key={i} className="bg-surface p-5 sm:p-6 rounded-2xl border border-border shadow-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-white flex items-baseline gap-2">
                      {stat.value} 
                    </p>
                    {stat.sub && (
                      <p className="text-xs text-gray-500 mt-0.5">{stat.sub}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Banner Explicativo do Funil de Conversão */}
          <div className="bg-surface border border-border rounded-2xl p-5 mb-8 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-accent" />
                <h3 className="font-bold text-white text-base">Funil Completo de Conversão</h3>
              </div>
              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-accent" />
                Mostra o caminho exato dos {views} visitantes até o WhatsApp
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div className="bg-surface-elevated/70 border border-border/60 p-4 rounded-xl">
                <div className="text-xs text-gray-400 mb-1">1. Abriram o Link</div>
                <div className="text-xl font-bold text-white">{views}</div>
                <div className="text-[11px] text-gray-500 mt-1">100% de alcance</div>
              </div>

              <div className="bg-surface-elevated/70 border border-border/60 p-4 rounded-xl">
                <div className="text-xs text-gray-400 mb-1">2. Clicaram em Começar</div>
                <div className="text-xl font-bold text-accent">{starts}</div>
                <div className="text-[11px] text-accent/80 mt-1">
                  {startRate}% taxa de clique
                </div>
              </div>

              <div className="bg-surface-elevated/70 border border-border/60 p-4 rounded-xl">
                <div className="text-xs text-gray-400 mb-1">3. Preencheram Contato</div>
                <div className="text-xl font-bold text-emerald-400">{leadsWithContact}</div>
                <div className="text-[11px] text-emerald-400/80 mt-1">
                  {starts ? ((leadsWithContact / starts) * 100).toFixed(1) : 0}% dos inícios
                </div>
              </div>

              <div className="bg-surface-elevated/70 border border-border/60 p-4 rounded-xl">
                <div className="text-xs text-gray-400 mb-1">4. Diagnóstico Completo</div>
                <div className="text-xl font-bold text-green-400">{completes}</div>
                <div className="text-[11px] text-green-400/80 mt-1">
                  {convRate}% concluíram
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-accent/5 border border-accent/10 rounded-xl text-xs text-gray-300 flex items-start sm:items-center gap-2">
              <Info className="w-4 h-4 text-accent shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>Por que há {views} visualizações e {starts} na lista de participantes?</strong>{' '}
                {views} pessoas acessaram a página de entrada. Destas, {starts} clicaram no botão "Começar Diagnóstico" e as demais {Math.max(0, views - starts)} apenas visualizaram a capa sem iniciar.
              </span>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-surface p-5 sm:p-6 rounded-2xl border border-border shadow-lg">
              <h3 className="text-lg font-bold text-white mb-6">Distribuição de Perfis</h3>
              <div className="h-64 sm:h-72 w-full">
                {profileData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                    Nenhum perfil concluído neste período.
                  </div>
                ) : (
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
                )}
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
                {bottleneckData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                    Nenhum gargalo identificado neste período.
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          </div>

          {/* Seção de Tabelas com Navegação em Abas */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-lg">
            
            {/* Header com Abas */}
            <div className="px-5 sm:px-6 py-4 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-elevated/40">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('participants')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'participants'
                      ? 'bg-accent text-white shadow-lg shadow-accent/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Participantes do Quiz
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === 'participants' ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-300'
                  }`}>
                    {sessions.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('all_views')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'all_views'
                      ? 'bg-accent text-white shadow-lg shadow-accent/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Todas as Visitas
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === 'all_views' ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-300'
                  }`}>
                    {views}
                  </span>
                </button>
              </div>

              {activeTab === 'participants' && (
                <div className="flex flex-wrap items-center gap-1.5 self-stretch sm:self-auto">
                  {[
                    { id: 'all', label: 'Todos', count: sessions.length },
                    { id: 'with_contact', label: 'Com WhatsApp', count: leadsWithContact },
                    { id: 'completed', label: 'Concluídos', count: completes },
                    { id: 'abandoned', label: 'Abandonos', count: abandons },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilterStatus(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filterStatus === f.id
                          ? 'bg-white/15 text-white border border-white/20 font-bold'
                          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      {f.label} ({f.count})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Visualização 1: Tabela de Participantes */}
            {activeTab === 'participants' && (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm text-gray-400 whitespace-nowrap">
                  <thead className="bg-surface-elevated text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-5 sm:px-6 py-4 font-semibold tracking-wider">Data</th>
                      <th className="px-5 sm:px-6 py-4 font-semibold tracking-wider">Participante</th>
                      <th className="px-5 sm:px-6 py-4 font-semibold tracking-wider">Telefone</th>
                      <th className="px-5 sm:px-6 py-4 font-semibold tracking-wider">Status / Progresso</th>
                      <th className="px-5 sm:px-6 py-4 font-semibold tracking-wider">Dispositivo</th>
                      <th className="px-5 sm:px-6 py-4 font-semibold tracking-wider">Nota</th>
                      <th className="px-5 sm:px-6 py-4 font-semibold tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredSessions.map((s) => {
                      const clickedMentoria = events.some(e => e.session_id === s.id && e.event_type === 'quiz_offer_clicked' && e.metadata?.offer === 'mentoria');
                      const clickedGhost = events.some(e => e.session_id === s.id && e.event_type === 'quiz_offer_clicked' && e.metadata?.offer === 'ghost-ai');
                      const dev = getDeviceInfo(s.user_agent);
                      
                      return (
                        <tr 
                          key={s.id} 
                          onClick={() => setSelectedSession(s)}
                          className="hover:bg-surface-elevated/80 transition-colors cursor-pointer group"
                        >
                          <td className="px-5 sm:px-6 py-4">
                            {formatDateSafe(s.started_at, 'dd/MM HH:mm')}
                          </td>
                          <td className="px-5 sm:px-6 py-4">
                            <div className="font-bold text-white group-hover:text-accent transition-colors flex items-center gap-2">
                              {s.name ? (
                                <span>{s.name}</span>
                              ) : (
                                <span className="text-gray-400 italic font-normal flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-gray-500" />
                                  Visitante Anônimo
                                </span>
                              )}
                            </div>
                            {s.profile ? (
                              <div className="text-xs text-accent mt-0.5">{s.profile}</div>
                            ) : s.questions_answered !== undefined ? (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {s.questions_answered > 0 ? `Respondeu ${s.questions_answered}/6 perguntas` : 'Saiu antes da 1ª pergunta'}
                              </div>
                            ) : null}
                          </td>
                          <td className="px-5 sm:px-6 py-4 font-mono text-gray-300">
                            {s.phone ? (
                              <span className="text-white">{s.phone}</span>
                            ) : (
                              <span className="text-gray-600">-</span>
                            )}
                          </td>
                          <td className="px-5 sm:px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              s.status === 'Concluído' 
                                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                : s.status === 'Lead'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                              {s.status === 'Iniciado' && !s.questions_answered
                                ? 'Não começou'
                                : s.status === 'Iniciado'
                                ? `Abandonou (${s.questions_answered}/6)`
                                : s.status || 'Iniciado'}
                            </span>
                          </td>
                          <td className="px-5 sm:px-6 py-4 text-xs text-gray-400">
                            <div className="flex items-center gap-1.5">
                              {dev.isMobile ? <Smartphone className="w-3.5 h-3.5 text-gray-500" /> : <Monitor className="w-3.5 h-3.5 text-gray-500" />}
                              <span>{dev.name}</span>
                              {dev.app && (
                                <span className="bg-purple-500/20 text-purple-300 px-1 py-0.2 rounded text-[10px] font-bold">
                                  {dev.app}
                                </span>
                              )}
                            </div>
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
                                <span className="px-2 py-0.5 bg-[#7c3aed]/20 text-[#c4b5fd] border border-[#7c3aed]/30 rounded-md text-[10px] font-bold uppercase" title="Clicou em Ghost AI">
                                  SaaS
                                </span>
                              )}
                              {clickedMentoria && (
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md text-[10px] font-bold uppercase" title="Clicou na Mentoria">
                                  Mentoria
                                </span>
                              )}
                              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors ml-auto" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredSessions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          Nenhum participante encontrado para este filtro.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Visualização 2: Tabela de Todas as Visitas */}
            {activeTab === 'all_views' && (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm text-gray-400 whitespace-nowrap">
                  <thead className="bg-surface-elevated text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-5 sm:px-6 py-4 font-semibold tracking-wider">Data e Horário</th>
                      <th className="px-5 sm:px-6 py-4 font-semibold tracking-wider">Origem</th>
                      <th className="px-5 sm:px-6 py-4 font-semibold tracking-wider">Campanha / UTM</th>
                      <th className="px-5 sm:px-6 py-4 font-semibold tracking-wider">Dispositivo</th>
                      <th className="px-5 sm:px-6 py-4 font-semibold tracking-wider">Ação Tomada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {viewsEvents.map((v) => {
                      const dev = getDeviceInfo(v.metadata?.user_agent);
                      // Verifica se essa view tem sessão iniciada ou se foi anônima
                      const hadSession = v.session_id && v.session_id !== 'anonymous';
                      
                      return (
                        <tr key={v.id} className="hover:bg-surface-elevated/50 transition-colors">
                          <td className="px-5 sm:px-6 py-4 text-white font-mono text-xs">
                            {formatDateSafe(v.timestamp, 'dd/MM/yyyy HH:mm:ss')}
                          </td>
                          <td className="px-5 sm:px-6 py-4">
                            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-gray-300">
                              {v.metadata?.source || 'direto'}
                            </span>
                          </td>
                          <td className="px-5 sm:px-6 py-4 text-xs text-gray-400">
                            {v.metadata?.utm_campaign || v.metadata?.utm_medium ? (
                              <span>{v.metadata?.utm_campaign} {v.metadata?.utm_medium && `(${v.metadata?.utm_medium})`}</span>
                            ) : (
                              <span className="text-gray-600">-</span>
                            )}
                          </td>
                          <td className="px-5 sm:px-6 py-4 text-xs">
                            <div className="flex items-center gap-1.5">
                              {dev.isMobile ? <Smartphone className="w-3.5 h-3.5 text-gray-500" /> : <Monitor className="w-3.5 h-3.5 text-gray-500" />}
                              <span className="text-gray-300">{dev.name}</span>
                              {dev.app && (
                                <span className="bg-purple-500/20 text-purple-300 px-1 py-0.2 rounded text-[10px] font-bold">
                                  {dev.app}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 sm:px-6 py-4">
                            {hadSession ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                                Iniciou o Quiz
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                Visualizou a Capa
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {viewsEvents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          Nenhuma visita registrada neste período.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </>
      )}

      {/* Modal de Detalhes do Lead / Sessão */}
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
