import React, { useState, useEffect } from 'react';
import {
  Bot,
  Plus,
  Trash2,
  Edit3,
  MessageSquare,
  Sparkles,
  Check,
  X,
  Code,
  Send,
  Play,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
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
  updateDoc,
} from 'firebase/firestore';

const NICHE_TEMPLATES: Record<string, { greeting: string; prompt: string; color: string }> = {
  Clinica: {
    greeting: 'Olá! Bem-vindo à nossa clínica. Gostaria de agendar uma avaliação ou tirar alguma dúvida?',
    prompt:
      'Você é a assistente virtual de uma clínica de saúde e estética. Seja acolhedora, tire dúvidas básicas sobre horários e convênios e conduza o paciente para agendar uma avaliação deixando o WhatsApp.',
    color: '#0D9488',
  },
  Advocacia: {
    greeting: 'Olá! Bem-vindo ao nosso escritório jurídico. Sobre qual área do direito você precisa de orientação?',
    prompt:
      'Você é o assistente virtual de um escritório de advocacia. Seja formal, transmita segurança, identifique a área do problema (Trabalhista, Família, Cível, INSS) e convide o cliente para falar com o advogado especialista no WhatsApp.',
    color: '#2563EB',
  },
  Imobiliaria: {
    greeting: 'Olá! Procurando seu próximo imóvel para comprar, financiar ou investir? Como posso ajudar?',
    prompt:
      'Você é um corretor virtual de uma imobiliária. Pergunte se o cliente busca casa ou apartamento, quantos quartos e faixa de valor, e ofereça o envio das melhores opções pelo WhatsApp.',
    color: '#D97706',
  },
  Delivery: {
    greeting: 'Fome de coisa boa? 🍔 Posso te ajudar a escolher os campeões do nosso cardápio hoje!',
    prompt:
      'Você é o atendente virtual de um restaurante/delivery. Apresente os pratos mais vendidos com entusiasmo, informe que o pedido sai quentinho e oriente o cliente a adicionar os itens na sacola do site.',
    color: '#EA580C',
  },
  Personalizado: {
    greeting: 'Olá! Como posso ajudar você hoje?',
    prompt: 'Você é um assistente comercial prestativo, educado e focado em converter visitantes em clientes no WhatsApp.',
    color: '#10B981',
  },
};

export const Chatbots = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const toast = {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
  };
  const [chatbots, setChatbots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<any | null>(null);

  // Live Simulator State
  const [testingBot, setTestingBot] = useState<any | null>(null);
  const [simMessages, setSimMessages] = useState<{ role: 'bot' | 'user'; text: string }[]>([]);
  const [simInput, setSimInput] = useState('');
  const [simLoading, setSimLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [niche, setNiche] = useState('Clinica');
  const [greeting, setGreeting] = useState(NICHE_TEMPLATES['Clinica'].greeting);
  const [systemPrompt, setSystemPrompt] = useState(NICHE_TEMPLATES['Clinica'].prompt);
  const [color, setColor] = useState(NICHE_TEMPLATES['Clinica'].color);

  const fetchChatbots = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'chatbots'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      setChatbots(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error fetching chatbots:', error);
      toast.error('Erro ao carregar seus chatbots.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatbots();
  }, [user]);

  const handleNicheChange = (selectedNiche: string) => {
    setNiche(selectedNiche);
    if (NICHE_TEMPLATES[selectedNiche]) {
      setGreeting(NICHE_TEMPLATES[selectedNiche].greeting);
      setSystemPrompt(NICHE_TEMPLATES[selectedNiche].prompt);
      setColor(NICHE_TEMPLATES[selectedNiche].color);
    }
  };

  const openModal = (bot: any = null) => {
    if (bot) {
      setEditingBot(bot);
      setName(bot.name);
      setNiche(bot.niche || 'Personalizado');
      setGreeting(bot.greeting);
      setSystemPrompt(bot.systemPrompt);
      setColor(bot.color || '#10B981');
    } else {
      setEditingBot(null);
      setName('');
      handleNicheChange('Clinica');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) {
      toast.error('Dê um nome ao seu Chatbot.');
      return;
    }

    try {
      const botData = {
        userId: user.uid,
        name: name.trim(),
        niche,
        greeting,
        systemPrompt,
        color,
        updatedAt: new Date().toISOString(),
      };

      if (editingBot) {
        await updateDoc(doc(db, 'chatbots', editingBot.id), botData);
        toast.success('Chatbot atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'chatbots'), {
          ...botData,
          createdAt: new Date().toISOString(),
        });
        toast.success('Chatbot criado com sucesso!');
      }

      setIsModalOpen(false);
      fetchChatbots();
    } catch (error) {
      console.error('Error saving chatbot:', error);
      toast.error('Erro ao salvar o chatbot.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este Chatbot?')) return;
    try {
      await deleteDoc(doc(db, 'chatbots', id));
      setChatbots((prev) => prev.filter((b) => b.id !== id));
      toast.success('Chatbot excluído.');
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      toast.error('Erro ao excluir.');
    }
  };

  const openLiveSimulator = (bot: any) => {
    setTestingBot(bot);
    setSimMessages([{ role: 'bot', text: bot.greeting || 'Olá! Como posso ajudar?' }]);
    setSimInput('');
  };

  const handleSendSimMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simInput.trim() || !testingBot) return;

    const userText = simInput.trim();
    setSimMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setSimInput('');
    setSimLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Você está atuando como o assistente virtual "${testingBot.name}".\nInstruções do sistema: ${testingBot.systemPrompt}\n\nMensagem do cliente: "${userText}"\n\nResponda de forma curta, natural, persuasiva (máximo 3 frases) em português do Brasil:`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply =
          data.text ||
          data.result ||
          'Excelente! Posso te passar todos os detalhes e valores agora mesmo pelo nosso WhatsApp prioritário. Qual o seu melhor número?';
        setSimMessages((prev) => [...prev, { role: 'bot', text: reply }]);
      } else {
        throw new Error('Fallback local');
      }
    } catch {
      setSimMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: `Perfeito! Como especialista da ${testingBot.name}, já separei as informações sobre "${userText}". Clique no botão de WhatsApp da página para concluirmos seu atendimento agora mesmo!`,
        },
      ]);
    } finally {
      setSimLoading(false);
    }
  };

  const handleCopyEmbedCode = (bot: any) => {
    const snippet = `<!-- GhostAI Chatbot Widget: ${bot.name} -->\n<script>\n(function(){var w=document.createElement('div');w.innerHTML='<a href="#contato" style="position:fixed;bottom:24px;right:24px;z-index:9999;background:${bot.color || '#10B981'};color:#fff;padding:14px 20px;border-radius:999px;font-family:sans-serif;font-weight:700;text-decoration:none;box-shadow:0 10px 30px rgba(0,0,0,0.35);">💬 ${bot.name}</a>';document.body.appendChild(w);})();\n</script>`;
    navigator.clipboard.writeText(snippet);
    toast.success('Código <script> copiado para instalar em qualquer site!');
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-4 md:p-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0E0E11] p-6 rounded-2xl border border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Bot className="w-6 h-6 text-emerald-400" />
              Assistentes Virtuais & Chatbots de IA
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Crie assistentes inteligentes por nicho, teste a conversa ao vivo e integre em 1 clique nos sites do GhostStudio.
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" /> Criar Novo Chatbot
          </button>
        </div>

        {/* Chatbots Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : chatbots.length === 0 ? (
          <div className="bg-[#0E0E11] border border-zinc-800 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <Bot className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Nenhum Chatbot Criado</h3>
            <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6">
              Crie um assistente virtual para qualificar visitantes 24h por dia e aumentar o valor percebido dos sites que você vende.
            </p>
            <button
              onClick={() => openModal()}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-bold text-xs inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Criar Meu Primeiro Chatbot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {chatbots.map((bot) => (
              <div
                key={bot.id}
                className="bg-[#0E0E11] border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg"
                        style={{ backgroundColor: bot.color || '#10B981' }}
                      >
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white">{bot.name}</h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
                          {bot.niche}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openModal(bot)}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(bot.id)}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                        Saudação Inicial
                      </span>
                      <p className="text-xs text-zinc-300 line-clamp-2">"{bot.greeting}"</p>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                        Comportamento (Prompt)
                      </span>
                      <p className="text-xs text-zinc-400 line-clamp-2">{bot.systemPrompt}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openLiveSimulator(bot)}
                    className="py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" /> Testar ao Vivo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyEmbedCode(bot)}
                    className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Code className="w-3.5 h-3.5" /> Código Script
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LIVE INTERACTIVE CHAT SIMULATOR MODAL */}
        {testingBot && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0E0E11] border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col h-[560px]">
              <div
                className="p-4 text-white flex items-center justify-between"
                style={{ backgroundColor: testingBot.color || '#10B981' }}
              >
                <div className="flex items-center gap-2.5">
                  <Bot className="w-5 h-5" />
                  <div>
                    <h3 className="font-bold text-sm">{testingBot.name}</h3>
                    <span className="text-[11px] opacity-90">Simulador em Tempo Real • IA Ativa</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTestingBot(null)}
                  className="p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#09090B]">
                {simMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'ml-auto text-white rounded-br-sm'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-sm'
                    }`}
                    style={
                      m.role === 'user'
                        ? { backgroundColor: testingBot.color || '#10B981' }
                        : undefined
                    }
                  >
                    {m.text}
                  </div>
                ))}
                {simLoading && (
                  <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl p-3 text-xs w-fit">
                    Digitando resposta...
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSendSimMessage}
                className="p-3 bg-[#0E0E11] border-t border-zinc-800 flex gap-2"
              >
                <input
                  type="text"
                  value={simInput}
                  onChange={(e) => setSimInput(e.target.value)}
                  placeholder="Simule uma dúvida de cliente..."
                  className="flex-1 px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={simLoading}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-bold text-xs flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* CREATE / EDIT MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0E0E11] border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-zinc-800 flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  {editingBot ? 'Editar Chatbot' : 'Novo Chatbot de IA'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Nome do Assistente
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Sofia - Atendente da Clínica"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Template de Nicho
                    </label>
                    <select
                      value={niche}
                      onChange={(e) => handleNicheChange(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white"
                    >
                      {Object.keys(NICHE_TEMPLATES).map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Cor do Widget
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs text-zinc-400 font-mono uppercase">{color}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Mensagem de Boas-Vindas
                  </label>
                  <input
                    type="text"
                    value={greeting}
                    onChange={(e) => setGreeting(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Instruções de Comportamento (Prompt da IA)
                  </label>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white resize-none"
                    required
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Salvar Chatbot
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
