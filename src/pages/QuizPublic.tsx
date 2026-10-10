import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '@/config/firebase';
import { collection, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Loader2, Play, Phone, User, AlertCircle, PhoneCall } from 'lucide-react';
import { handleCheckoutRedirect } from '@/utils/analytics';

const CFG = {
  zapSuporte: "5575000000000",
  checkoutGhost: "https://pay.cakto.com.br/fiqwtse_1119916?affiliate=psuf2rhA",
  checkoutMentoria: "https://pay.cakto.com.br/yonkyi5_1119928",
  precoGhost: "R$ 19,99",
  precoMentoria: "R$ 49,99"
};

const Q = [
  {q:"Em que momento você está?",h:"Seja sincero. O diagnóstico só funciona com a verdade.",o:[["🌱","Nunca vendi um site","Vou começar do zero"],["🔧","Vendi poucos","Menos de 5 clientes até hoje"],["📈","Vendo todo mês","Quero escalar o processo"]]},
  {q:"Que tipo de cliente você quer atender?",h:"Escolha o foco principal.",o:[["🍽️","Restaurantes e comércio local"],["💼","Profissionais e autônomos"],["🏢","Empresas e prestadores de serviço"],["🧩","Qualquer negócio que precise de site"]]},
  {q:"Qual destas situações mais te trava?",h:"Escolha a que mais dói hoje.",o:[["🎯","Não sei quem abordar nem como chamar a atenção",0],["💬","O cliente pede desconto ou some depois da proposta",1],["🎬","Não consigo mostrar meu trabalho e manter presença online",2],["⏱️","Perco horas fazendo proposta, texto e página",3]]},
  {q:"Quanto tempo por dia você pode dedicar?",h:"Para montar o plano no seu ritmo.",o:[["⏳","Até 1 hora"],["🕐","De 1 a 2 horas"],["🕓","De 3 a 4 horas"],["🔥","Mais de 4 horas"]]},
  {q:"Qual é sua meta de faturamento mensal?",h:"Pense no próximo passo, não no sonho final.",o:[["🎯","Até R$ 2 mil"],["🎯","De R$ 2 mil a R$ 5 mil"],["🎯","De R$ 5 mil a R$ 10 mil"],["🎯","Mais de R$ 10 mil"]]},
  {q:"Quando você quer começar?",h:"Última pergunta.",o:[["🚀","Hoje"],["📅","Nesta semana"],["🤔","Ainda estou avaliando"]]}
];

const G = ["Clientes", "Fechamento", "Presença", "Velocidade"];
const GT = [
  ["Atrair clientes","Seu maior gargalo é gerar demanda. Sem conversa com cliente, não existe venda. O plano começa por abordagem e conteúdo que chama atenção."],
  ["Fechar a venda","Seu maior gargalo é transformar conversa em venda: proposta, preço e follow-up. É o ponto onde mais gente perde dinheiro."],
  ["Presença online","Seu maior gargalo é visibilidade. Quem mostra o trabalho com constância atrai mais clientes, e você precisa de um jeito de fazer isso sem travar."],
  ["Velocidade","Seu maior gargalo é tempo. Quanto menos horas em proposta, texto e página, mais clientes você atende."]
];

export const QuizPublic = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState('inicio'); // inicio, quiz, lead, load, res
  const [nome, setNome] = useState('');
  const [zap, setZap] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const questionStartTime = useRef(Date.now());
  const [loadStep, setLoadStep] = useState(0);
  const [scoreAnim, setScoreAnim] = useState(0);

  const trackEvent = async (eventType: string, meta: any = {}) => {
    try {
      // Allow capturing even before session is explicitly attached if need be
      await addDoc(collection(db, 'quiz_events'), {
        session_id: sessionId || 'anonymous',
        event_type: eventType,
        timestamp: serverTimestamp(),
        metadata: meta
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    trackEvent('quiz_view', { source: searchParams.get('utm_source') || 'direto' });
  }, []);

  const handleStartQuiz = async () => {
    // Create an anonymous session first to track quiz progress
    try {
      const docRef = await addDoc(collection(db, 'quiz_sessions'), {
        status: 'Iniciado',
        current_question: 1,
        questions_answered: 0,
        started_at: serverTimestamp(),
        last_activity_at: serverTimestamp(),
        source: searchParams.get('utm_source') || 'direto',
        utm_source: searchParams.get('utm_source') || '',
        utm_medium: searchParams.get('utm_medium') || '',
        utm_campaign: searchParams.get('utm_campaign') || '',
        user_agent: navigator.userAgent
      });
      setSessionId(docRef.id);
      
      await addDoc(collection(db, 'quiz_events'), {
        session_id: docRef.id,
        event_type: 'quiz_started',
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error(e);
    }

    setStep('quiz');
    questionStartTime.current = Date.now();
  };

  const handleAnswer = async (k: number, t: any, optionText: string) => {
    const timeSpent = Date.now() - questionStartTime.current;
    const newAnswers = [...answers];
    newAnswers[currentQ] = { k, t, optionText };
    setAnswers(newAnswers);

    if (sessionId) {
      try {
        await addDoc(collection(db, 'quiz_answers'), {
          session_id: sessionId,
          question_id: currentQ,
          question_number: currentQ + 1,
          question_text: Q[currentQ].q,
          option_index: k,
          option_text: optionText,
          answered_at: serverTimestamp(),
          time_spent_ms: timeSpent
        });

        await updateDoc(doc(db, 'quiz_sessions', sessionId), {
          current_question: currentQ + 2,
          questions_answered: currentQ + 1,
          last_activity_at: serverTimestamp()
        });

        await trackEvent('quiz_question_answered', { question: currentQ + 1, option: k });
      } catch (e) {
        console.error(e);
      }
    }

    setTimeout(() => {
      if (currentQ + 1 < Q.length) {
        setCurrentQ(currentQ + 1);
        questionStartTime.current = Date.now();
      } else {
        setStep('lead');
      }
    }, 300);
  };

  const handleLeadSubmit = async () => {
    const n = nome.trim();
    const z = zap.replace(/\D/g, "");
    if (n.length < 2 || z.length < 10) {
      setErrorMsg("Digite seu nome e um telefone válido com DDD.");
      return;
    }
    setErrorMsg("");

    if (sessionId) {
      try {
        await updateDoc(doc(db, 'quiz_sessions', sessionId), {
          name: n,
          phone: z,
          lead_captured_at: serverTimestamp(),
          status: 'Lead'
        });
        await trackEvent('lead_captured', { name: n, phone: z });
      } catch (e) {
        console.error(e);
      }
    }

    doLoadAndCalc(answers);
  };

  const doLoadAndCalc = (finalAnswers: any[]) => {
    setStep('load');
    let n = 0;
    const stepInterval = setInterval(() => {
      if (n < 3) {
        setLoadStep(n + 1);
        n++;
      } else {
        clearInterval(stepInterval);
        setTimeout(() => showResult(finalAnswers), 600);
      }
    }, 900);
  };

  const showResult = async (finalAnswers: any[]) => {
    const exp = finalAnswers[0].k;
    const tempo = finalAnswers[3].k;
    const meta = finalAnswers[4].k;
    const quando = finalAnswers[5].k;
    const g = finalAnswers[2].t;
    
    let nota = Math.round(30 + exp * 14 + tempo * 7 + (2 - quando) * 6 + (meta >= 2 ? 4 : 0));
    nota = Math.min(96, Math.max(35, nota));
    
    let base = [55, 55, 55, 55].map(v => Math.min(92, v + exp * 12 + (tempo >= 2 ? 5 : 0)));
    base[g] = Math.max(18, base[g] - 32);
    
    const res = { nota, bars: base, g, exp };
    setResult(res);
    setStep('res');

    if (sessionId) {
      try {
        const perfis = ["Iniciante", "Em evolução", "Pronto para escalar"];
        const profileStr = perfis[res.exp];
        
        await addDoc(collection(db, 'quiz_results'), {
          session_id: sessionId,
          score: nota,
          profile: profileStr,
          bottleneck: GT[res.g][0],
          bars: res.bars,
          created_at: serverTimestamp()
        });

        await updateDoc(doc(db, 'quiz_sessions', sessionId), {
          status: 'Concluído',
          completed_at: serverTimestamp(),
          score: nota,
          profile: profileStr,
          bottleneck: GT[res.g][0]
        });

        await trackEvent('quiz_completed', { score: nota, profile: profileStr });
      } catch (e) {
        console.error(e);
      }
    }

    let c = 0;
    const t = setInterval(() => {
      c += 2;
      if (c >= res.nota) {
        c = res.nota;
        clearInterval(t);
      }
      setScoreAnim(c);
    }, 20);
  };

  // Variants for animations
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };
  const pageTransition: any = { type: "tween", ease: "easeInOut", duration: 0.3 };

  return (
    <div className="min-h-screen bg-[#07060b] text-[#f3f0ff] font-sans pb-14 bg-[radial-gradient(60%_40%_at_50%_0,#2b1659_0,transparent_70%)]">
      <div className="max-w-[560px] mx-auto px-5 pt-6 pb-14">
        {step !== 'inicio' && (
          <header className="flex justify-between items-center mb-6">
            <div className="font-extrabold tracking-wider text-purple-400">GHOST MARKET</div>
            <div className="text-sm text-purple-200/60">
              {step === 'quiz' ? `Pergunta ${currentQ + 1} de ${Q.length}` : step === 'lead' ? 'Quase lá...' : ''}
            </div>
          </header>
        )}

        <AnimatePresence mode="wait">
          {step === 'inicio' && (
            <motion.section key="inicio" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="text-center pt-10">
              <svg className="w-24 h-24 mx-auto mb-4 drop-shadow-[0_8px_24px_rgba(124,58,237,0.4)]" viewBox="0 0 64 64" role="img" aria-label="Logo Ghost Market">
                <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c4b5fd"/><stop offset="1" stopColor="#7c3aed"/></linearGradient></defs>
                <path d="M12 56V28C12 15 21 6 32 6s20 9 20 22v28l-7-6-6 6-7-6-7 6-7-6z" fill="url(#lg)"/>
                <circle cx="25" cy="28" r="4" fill="#07060b"/><circle cx="39" cy="28" r="4" fill="#07060b"/>
              </svg>
              <div className="font-extrabold tracking-widest text-purple-400 mb-8">GHOST MARKET</div>
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">Descubra seu gargalo de vendas</h1>
              <p className="text-purple-200/70 mb-8 max-w-md mx-auto">Responda a um breve diagnóstico e descubra o que está travando seus resultados e qual o plano exato para escalar.</p>
              
              <button 
                onClick={handleStartQuiz}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98]"
              >
                <span>Começar Diagnóstico Gratuito</span>
                <Play className="w-5 h-5 fill-current" />
              </button>
              <p className="text-xs text-purple-200/50 mt-4">Leva menos de 2 minutos. 100% gratuito.</p>
            </motion.section>
          )}

          {step === 'quiz' && (
            <motion.section key={`q-${currentQ}`} initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <div className="h-1.5 bg-purple-950 rounded-full overflow-hidden mb-8">
                <motion.div 
                  className="h-full bg-purple-500 rounded-full"
                  initial={{ width: `${(currentQ / Q.length) * 100}%` }}
                  animate={{ width: `${((currentQ + 1) / Q.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <h2 className="text-2xl font-bold mb-2 leading-tight">{Q[currentQ].q}</h2>
              <p className="text-sm text-purple-400 mb-6">{Q[currentQ].h}</p>
              <div className="flex flex-col gap-3">
                {Q[currentQ].o.map((opt, k) => (
                  <button 
                    key={k} 
                    onClick={() => handleAnswer(k, typeof opt[2] === 'number' ? opt[2] : null, opt[1] as string)}
                    className="flex items-center gap-4 text-left w-full p-4 bg-[#120e1d] border border-purple-900/50 rounded-xl hover:border-purple-500 hover:bg-[#1a1429] transition-all group active:scale-[0.99]"
                  >
                    <span className="text-3xl">{opt[0]}</span>
                    <span className="flex-1 flex flex-col">
                      <span className="font-semibold">{opt[1]}</span>
                      {typeof opt[2] === 'string' && <span className="text-xs text-purple-200/60 mt-1">{opt[2]}</span>}
                    </span>
                    <ChevronRight className="w-5 h-5 text-purple-900 group-hover:text-purple-400 transition-colors" />
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {step === 'lead' && (
            <motion.section key="lead" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="pt-4">
              <h1 className="text-3xl font-extrabold mb-3 leading-tight">Análise concluída!</h1>
              <p className="text-purple-200/70 mb-8">Para liberar seu plano de ação personalizado e descobrir seu gargalo, informe para onde devemos enviar o resumo:</p>
              
              <div className="space-y-4 mb-8">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-purple-400/50" />
                  </div>
                  <input 
                    className="w-full bg-[#120e1d] border border-purple-900/50 focus:border-purple-500 text-white rounded-xl pl-12 pr-4 py-4 outline-none transition-colors"
                    value={nome} 
                    onChange={e => setNome(e.target.value)} 
                    placeholder="Seu primeiro nome" 
                    autoComplete="given-name" 
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-purple-400/50" />
                  </div>
                  <input 
                    className="w-full bg-[#120e1d] border border-purple-900/50 focus:border-purple-500 text-white rounded-xl pl-12 pr-4 py-4 outline-none transition-colors"
                    value={zap} 
                    onChange={e => setZap(e.target.value)} 
                    placeholder="Seu WhatsApp (com DDD)" 
                    inputMode="tel" 
                    autoComplete="tel" 
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button 
                onClick={handleLeadSubmit}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98]"
              >
                Ver Meu Resultado Agora
              </button>
            </motion.section>
          )}

          {step === 'load' && (
            <motion.section key="load" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="pt-10 flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-6" />
              <h1 className="text-2xl font-bold mb-8">Processando diagnóstico...</h1>
              <ul className="space-y-4 w-full max-w-sm">
                <li className={`flex items-center gap-3 transition-opacity duration-500 ${loadStep >= 1 ? 'opacity-100 text-white' : 'opacity-30 text-purple-200/50'}`}>
                  {loadStep > 1 ? <Check className="w-5 h-5 text-green-400" /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                  Calculando nota de prontidão
                </li>
                <li className={`flex items-center gap-3 transition-opacity duration-500 ${loadStep >= 2 ? 'opacity-100 text-white' : 'opacity-30 text-purple-200/50'}`}>
                  {loadStep > 2 ? <Check className="w-5 h-5 text-green-400" /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                  Identificando gargalo principal
                </li>
                <li className={`flex items-center gap-3 transition-opacity duration-500 ${loadStep >= 3 ? 'opacity-100 text-white' : 'opacity-30 text-purple-200/50'}`}>
                  {loadStep > 3 ? <Check className="w-5 h-5 text-green-400" /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                  Montando plano personalizado
                </li>
              </ul>
            </motion.section>
          )}

          {step === 'res' && result && (
            <motion.section key="res" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <div className="text-center mb-6">
                <div className="w-36 h-36 mx-auto rounded-full grid place-items-center bg-purple-950 p-2 mb-4" style={{ background: `conic-gradient(#8b5cf6 ${scoreAnim}%, #2a2145 0)` }}>
                  <div className="w-full h-full rounded-full bg-[#07060b] grid place-items-center text-4xl font-extrabold shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                    {result.nota}
                  </div>
                </div>
                <span className="inline-block bg-[#1c1433] border border-purple-500/50 text-purple-300 rounded-full px-4 py-1.5 text-sm font-medium tracking-wide">
                  Perfil: {["Iniciante", "Em evolução", "Pronto para escalar"][result.exp]}
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-3 leading-tight">
                {nome ? `${nome}, seu` : 'Seu'} gargalo é: <span className="text-purple-400">{GT[result.g][0]}</span>
              </h1>
              <p className="text-purple-200/70 mb-8">{GT[result.g][1]}</p>
              
              <div className="mb-10 bg-[#120e1d] p-5 rounded-2xl border border-purple-900/50">
                {result.bars.map((v: number, k: number) => (
                  <div key={k} className="mb-4 last:mb-0">
                    <div className={`flex justify-between text-sm mb-1.5 font-medium ${k === result.g ? 'text-red-400' : 'text-purple-200'}`}>
                      <span>{G[k]}</span>
                      <span>{v}%</span>
                    </div>
                    <div className="h-2 bg-[#2a2145] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${v}%` }} 
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`h-full rounded-full ${k === result.g ? 'bg-red-500' : 'bg-purple-500'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-5">
                {((result.exp === 0 || result.g === 1) ? ['ment', 'ghost'] : ['ghost', 'ment']).map(order => {
                  if (order === 'ghost') {
                    const isDest = !(result.exp === 0 || result.g === 1);
                    return (
                      <div key="ghost" className={`bg-[#120e1d] border ${isDest ? 'border-purple-500 ring-1 ring-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.15)]' : 'border-purple-900/50'} rounded-2xl p-6`}>
                        {isDest && <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">Recomendação Principal</div>}
                        <h3 className="text-xl font-bold mb-3">Ghost AI</h3>
                        <ul className="space-y-2 text-purple-200/70 text-sm mb-5">
                          <li className="flex items-start gap-2"><Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> Propostas de site prontas em minutos</li>
                          <li className="flex items-start gap-2"><Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> Textos da página de venda e de abordagem</li>
                          <li className="flex items-start gap-2"><Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> Respostas para objeções e follow-up</li>
                        </ul>
                        <div className="text-2xl font-extrabold mb-4">{CFG.precoGhost}<span className="text-sm font-normal text-purple-200/50">/m�s</span></div>
                        <a 
                          href="/" onClick={(e) => { e.preventDefault(); trackEvent('quiz_offer_clicked', { offer: 'Ghost AI' }); window.location.href = '/'; }}
                          className="block text-center w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg active:scale-[0.98]"
                        >
                          Quero a Ghost AI
                        </a>
                      </div>
                    )
                  } else {
                    const isDest = (result.exp === 0 || result.g === 1);
                    return (
                      <div key="ment" className={`bg-[#120e1d] border ${isDest ? 'border-purple-500 ring-1 ring-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.15)]' : 'border-purple-900/50'} rounded-2xl p-6`}>
                        {isDest && <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">Recomendação Principal</div>}
                        <h3 className="text-xl font-bold mb-3">Ghost AI <span className="text-purple-400">� Vital�cio</span></h3>
                        <ul className="space-y-2 text-purple-200/70 text-sm mb-5">
                          <li className="flex items-start gap-2"><Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> Acesso ilimitado e para sempre � plataforma</li>\n                          <li className="flex items-start gap-2"><Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> Atualiza��es gratuitas e novos agentes de IA</li>\n                          <li className="flex items-start gap-2"><Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> Economize R$ 190 por ano, sem mensalidades</li>
                        </ul>
                        <div className="text-2xl font-extrabold mb-4">{CFG.precoMentoria}<span className="text-sm font-normal text-purple-200/50">/m�s</span></div>
                        <a 
                          href="/" onClick={(e) => { e.preventDefault(); trackEvent('quiz_offer_clicked', { offer: 'Vital�cio' }); window.location.href = '/'; }}
                          className="block text-center w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg active:scale-[0.98]"
                        >\n                          Quero o Plano Vital�cio\n                        </a>
                      </div>
                    )
                  }
                })}
              </div>

              <a 
                href={`https://wa.me/${CFG.zapSuporte}?text=${encodeURIComponent(`Oi! Sou ${nome}. Fiz o diagnóstico da Ghost AI (nota ${result.nota}, gargalo: ${GT[result.g][0]}). Meu telefone: ${zap}. Origem: ${searchParams.get('utm_source') || 'direto'}.`)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => trackEvent('quiz_offer_clicked', { offer: 'WhatsApp' })}
                className="flex items-center justify-center gap-2 w-full mt-6 bg-transparent border border-purple-900/80 hover:bg-[#1a1429] hover:border-purple-500 text-purple-200 font-semibold py-3.5 px-6 rounded-xl transition-all"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Tirar dúvidas no WhatsApp</span>
              </a>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
