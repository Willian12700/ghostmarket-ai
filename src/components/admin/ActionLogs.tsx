import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Search, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActionLog {
  id: string;
  action: string;
  userEmail: string;
  userName: string;
  details: any;
  timestamp: any;
}

interface TrialCode {
  code: string;
  activatedAt: any | null;
  expiresAt: number | null;
}

export const ActionLogs = () => {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [trialCodes, setTrialCodes] = useState<Record<string, TrialCode>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [durationFilter, setDurationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'action_logs'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActionLog));
      setLogs(fetched);
    });

    const qCodes = query(collection(db, 'trial_codes'));
    const unsubscribeCodes = onSnapshot(qCodes, (snap) => {
      const codesMap: Record<string, TrialCode> = {};
      snap.docs.forEach(doc => {
        codesMap[doc.id] = doc.data() as TrialCode;
      });
      setTrialCodes(codesMap);
    });

    return () => {
      unsubscribe();
      unsubscribeCodes();
    };
  }, []);

  const getCodeStatus = (code: string) => {
    const data = trialCodes[code];
    if (!data) return 'Desconhecido';
    if (data.activatedAt) {
      if (data.expiresAt && Date.now() > data.expiresAt) {
        return 'Expirado';
      }
      return 'Em uso';
    }
    return 'Disponível';
  };

  const filteredLogs = logs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = 
      log.userName?.toLowerCase().includes(searchLower) ||
      log.userEmail?.toLowerCase().includes(searchLower) ||
      log.details?.code?.toLowerCase().includes(searchLower);

    const matchDuration = 
      durationFilter === 'all' || 
      (log.details?.durationMinutes?.toString() === durationFilter);

    const codeStatus = log.details?.code ? getCodeStatus(log.details.code) : '';
    const matchStatus = 
      statusFilter === 'all' || 
      codeStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchSearch && matchDuration && matchStatus;
  });

  return (
    <Card className="border-border bg-panel mt-8">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Registro de Ações (Sócio)
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full sm:w-64 bg-background border border-border rounded-lg text-sm text-white focus:outline-none focus:border-primary/50"
              />
            </div>
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg text-sm text-white focus:outline-none focus:border-primary/50"
            >
              <option value="all">Qualquer Duração</option>
              <option value="5">5 Minutos</option>
              <option value="10">10 Minutos</option>
              <option value="15">15 Minutos</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg text-sm text-white focus:outline-none focus:border-primary/50"
            >
              <option value="all">Qualquer Status</option>
              <option value="disponível">Disponível</option>
              <option value="em uso">Em uso</option>
              <option value="expirado">Expirado</option>
            </select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-background border-b border-border text-white/50">
              <tr>
                <th className="px-6 py-4 font-medium">Sócio</th>
                <th className="px-6 py-4 font-medium">Ação</th>
                <th className="px-6 py-4 font-medium">Código</th>
                <th className="px-6 py-4 font-medium">Duração</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Data / Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map(log => {
                const status = log.details?.code ? getCodeStatus(log.details.code) : '-';
                return (
                  <motion.tr 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    key={log.id} 
                    className="hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{log.userName}</p>
                      <p className="text-xs text-white/50">{log.userEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-white/80">
                      {log.details?.code || '-'}
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {log.details?.durationMinutes ? `${log.details.durationMinutes} min` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {status !== '-' && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          status === 'Disponível' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          status === 'Em uso' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-white/50">
                      {log.timestamp?.toDate ? new Date(log.timestamp.toDate()).toLocaleString('pt-BR') : 'Agora'}
                    </td>
                  </motion.tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-white/40">
                    Nenhuma ação encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
