import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Copy,
  Trash2,
  Calendar,
  FileText,
  Search,
  Send,
  Edit3,
  Check,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

interface SavedCopyItem {
  id: string;
  collectionName: 'ai_history' | 'copies';
  type: string;
  productName: string;
  niche: string;
  content: string;
  createdAt: string;
}

export const Library = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [copies, setCopies] = useState<SavedCopyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const fetchAllCopies = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const results: SavedCopyItem[] = [];

      // 1. Fetch from 'ai_history' (saved by Creator.tsx)
      if (user.email) {
        const qHistory = query(collection(db, 'ai_history'), where('userId', '==', user.email));
        const snapHistory = await getDocs(qHistory);
        snapHistory.docs.forEach((d) => {
          const data = d.data();
          results.push({
            id: d.id,
            collectionName: 'ai_history',
            type: String(data.type || 'Abordagem WhatsApp'),
            productName: String(data.clientName || data.niche || 'Abordagem Comercial'),
            niche: String(data.niche || 'Geral'),
            content: String(data.script || data.content || ''),
            createdAt:
              data.timestamp?.toDate?.()?.toISOString?.() ||
              data.createdAt ||
              new Date().toISOString(),
          });
        });
      }

      // 2. Fetch from 'copies' (legacy collection by uid)
      const qCopies = query(collection(db, 'copies'), where('userId', '==', user.uid));
      const snapCopies = await getDocs(qCopies);
      snapCopies.docs.forEach((d) => {
        const data = d.data();
        results.push({
          id: d.id,
          collectionName: 'copies',
          type: String(data.type || 'Copy IA'),
          productName: String(data.productName || 'Projeto'),
          niche: String(data.niche || 'Geral'),
          content: String(data.content || ''),
          createdAt: String(data.createdAt || new Date().toISOString()),
        });
      });

      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCopies(results);
    } catch (err) {
      console.error('Error fetching library:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAllCopies();
  }, [fetchAllCopies]);

  const copyTypes = useMemo<string[]>(() => {
    const unique = Array.from(new Set(copies.map((c) => c.type).filter(Boolean)));
    return ['Todos', ...unique];
  }, [copies]);

  const filteredCopies = useMemo(() => {
    return copies.filter((c) => {
      const matchesType = selectedType === 'Todos' || c.type === selectedType;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        c.productName.toLowerCase().includes(q) ||
        c.niche.toLowerCase().includes(q) ||
        c.content.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [copies, selectedType, searchQuery]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Copiado para a área de transferência!', 'success');
  };

  const handleSendWhatsApp = (text: string) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDelete = async (item: SavedCopyItem) => {
    if (!window.confirm('Tem certeza que deseja excluir esta copy?')) return;
    try {
      await deleteDoc(doc(db, item.collectionName, item.id));
      setCopies((prev) => prev.filter((c) => c.id !== item.id));
      addToast('Copy excluída com sucesso', 'info');
    } catch {
      addToast('Erro ao excluir copy', 'error');
    }
  };

  const handleSaveEdit = async (item: SavedCopyItem) => {
    try {
      const fieldKey = item.collectionName === 'ai_history' ? 'script' : 'content';
      await updateDoc(doc(db, item.collectionName, item.id), { [fieldKey]: editingText });
      setCopies((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, content: editingText } : c))
      );
      setEditingId(null);
      addToast('Copy atualizada com sucesso!', 'success');
    } catch {
      addToast('Erro ao atualizar copy.', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0E0E11] p-6 rounded-2xl border border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Biblioteca de Copies & Abordagens</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Gerencie, pesquise, edite e dispare suas copies geradas direto para o WhatsApp.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, nicho ou texto..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      {copyTypes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {copyTypes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedType(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedType === t
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'bg-[#0E0E11] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl border border-zinc-800 bg-[#0E0E11] animate-pulse" />
          ))}
        </div>
      ) : filteredCopies.length === 0 ? (
        <div className="text-center py-16 bg-[#0E0E11] rounded-2xl border border-zinc-800">
          <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Nenhuma copy encontrada</h3>
          <p className="text-xs text-zinc-400">
            Use o Creator IA para criar suas abordagens e estruturas de venda.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCopies.map((copy) => (
            <div
              key={copy.id}
              className="flex flex-col justify-between bg-[#0E0E11] border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {copy.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(copy.id);
                        setEditingText(copy.content);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-lg"
                      title="Editar texto"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(copy)}
                      className="p-1.5 text-zinc-400 hover:text-red-400 rounded-lg"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-1 line-clamp-1">
                  {copy.productName}
                </h3>
                <p className="text-xs text-zinc-500 mb-3">Nicho: {copy.niche}</p>

                {editingId === copy.id ? (
                  <div className="space-y-2 mb-4">
                    <textarea
                      rows={5}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full p-3 bg-zinc-950 border border-emerald-500/50 rounded-xl text-xs text-white outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 text-xs text-zinc-400 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(copy)}
                        className="px-3 py-1 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800/80 mb-4 h-36 overflow-hidden relative">
                    <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                      {copy.content}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-zinc-950 to-transparent" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800 gap-2">
                <div className="flex items-center text-[11px] text-zinc-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(copy.createdAt)}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopy(copy.content)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copiar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp(copy.content)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
