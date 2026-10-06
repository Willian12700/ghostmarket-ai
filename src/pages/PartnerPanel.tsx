import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { db } from '@/config/firebase';
import { collection, query, where, orderBy, onSnapshot, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Key, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToastStore } from '@/store/toastStore';

interface GeneratedCode {
  id: string;
  code: string;
  durationMinutes: number;
  createdAt: any;
  activatedAt: any | null;
  expiresAt: number | null;
  status: 'Disponível' | 'Em uso' | 'Expirado';
}

export const PartnerPanel = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [duration, setDuration] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [codes, setCodes] = useState<GeneratedCode[]>([]);

  useEffect(() => {
    if (user?.email) {
      const q = query(
        collection(db, 'trial_codes'),
        where('createdByEmail', '==', user.email),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snap) => {
        const fetched = snap.docs.map(doc => {
          const data = doc.data();
          let status: 'Disponível' | 'Em uso' | 'Expirado' = 'Disponível';
          
          if (data.activatedAt) {
            if (data.expiresAt && Date.now() > data.expiresAt) {
              status = 'Expirado';
            } else {
              status = 'Em uso';
            }
          }

          return {
            id: doc.id,
            ...data,
            status,
          } as GeneratedCode;
        });
        setCodes(fetched);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleGenerate = async () => {
    if (!user) return;
    setIsGenerating(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      const newCodeData = {
        code,
        createdAt: serverTimestamp(),
        activatedAt: null,
        uid: null,
        expiresAt: null,
        durationMinutes: duration,
        createdByEmail: user.email,
        createdByName: user.name || 'Sócio'
      };

      await setDoc(doc(db, 'trial_codes', code), newCodeData);

      // Save log for admin
      await setDoc(doc(collection(db, 'action_logs')), {
        action: 'GERAR_CODIGO',
        userEmail: user.email,
        userName: user.name || 'Sócio',
        details: {
          code,
          durationMinutes: duration,
        },
        timestamp: serverTimestamp()
      });

      addToast(`Código de ${duration} minutos gerado!`, 'success');
    } catch (e) {
      console.error(e);
      addToast('Erro ao gerar código', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Código copiado!', 'success');
  };

  if (user?.email !== 'souza.abencoado4@gmail.com') {
    return <div className="p-8 text-white">Acesso Negado. Esta área é restrita aos sócios.</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 md:space-y-8 w-full">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/20 rounded-xl">
          <Key className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Painel do Sócio</h1>
          <p className="text-white/60">Gere códigos de acesso VIP temporários</p>
        </div>
      </div>

      <Card className="bg-panel border-border">
        <CardHeader>
          <CardTitle>Gerar Teste Grátis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm text-white/70 mb-3 block">Duração do Teste:</label>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              {[5, 10, 15].map(min => (
                <button
                  key={min}
                  onClick={() => setDuration(min)}
                  className={`flex-1 py-4 rounded-xl border transition-all ${
                    duration === min 
                    ? 'border-primary bg-primary/10 text-primary font-bold' 
                    : 'border-white/10 bg-[#050505] text-white/60 hover:bg-white/5'
                  }`}
                >
                  {min} MINUTOS
                </button>
              ))}
            </div>
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-white font-bold"
          >
            {isGenerating ? 'Gerando...' : 'Gerar Código'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-panel border-border">
        <CardHeader>
          <CardTitle>Meus Códigos Gerados</CardTitle>
        </CardHeader>
        <CardContent>
          {codes.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              Nenhum código gerado ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-white/70">
                <thead className="text-xs text-white/40 uppercase bg-black/20 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 font-medium">Código</th>
                    <th className="px-6 py-4 font-medium">Duração</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Código</th>
                    <th className="px-6 py-4 font-medium text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {codes.map(code => (
                    <motion.tr 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      key={code.id} 
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-bold tracking-widest text-white">
                        {code.code}
                      </td>
                      <td className="px-6 py-4">
                        {code.durationMinutes || 5} min
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          code.status === 'Disponível' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          code.status === 'Em uso' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {code.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/50">
                        {code.createdAt?.toDate ? new Date(code.createdAt.toDate()).toLocaleString('pt-BR') : 'Açãora'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(code.code)}
                          className="h-8 hover:bg-white/10"
                        >
                          <Copy className="w-4 h-4 mr-2" /> Copiar
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
