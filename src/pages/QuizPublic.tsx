import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '@/config/firebase';
import { collection, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const CFG = {
  zapSuporte: "5575000000000",
  checkoutGhost: "https://pay.cakto.com.br/fiqwtse_1119916?affiliate=psuf2rhA",
  checkoutMentoria: "https://www.ghostmarket.cyou/s/mentoriadaghost",
  precoGhost: "R$ 19,99",
  precoMentoria: "R$ 10,90"
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
  const [step, setStep] = useState('inicio'); // inicio, quiz, load, res
  const [nome, setNome] = useState('');
  const [zap, setZap] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [result, setResult] = useState<any>(null);
  
  const questionStartTime = useRef(Date.now());
  const [loadStep, setLoadStep] = useState(0);
  const [scoreAnim, setScoreAnim] = useState(0);

  const trackEvent = async (eventType: string, meta: any = {}) => {
    if (!sessionId) return;
    try {
      await addDoc(collection(db, 'quiz_events'), {
        session_id: sessionId,
        event_type: eventType,
        timestamp: serverTimestamp(),
        metadata: meta
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Initial view
    trackEvent('quiz_view');
  }, []);

  const handleStart = async () => {
    const n = nome.trim();
    const z = zap.replace(/\D/g, "");
    if (n.length < 2 || z.length < 10) {
      alert("Digite seu nome e um telefone válido com DDD.");
      return;
    }
    
    // Create session
    try {
      const docRef = await addDoc(collection(db, 'quiz_sessions'), {
        name: n,
        phone: z,
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
        metadata: { name: n, phone: z }
      });
      
    } catch (e) {
      console.error(e);
      // fallback if DB fails, allow user to proceed
    }

    setStep('quiz');
    questionStartTime.current = Date.now();
  };

  const handleAnswer = async (k: number, t: any, optionText: string) => {
    const timeSpent = Date.now() - questionStartTime.current;
    const newAnswers = [...answers];
    newAnswers[currentQ] = { k, t };
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
        doLoadAndCalc(newAnswers);
      }
    }, 240);
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

  const onOfferClick = (offerName: string) => {
    trackEvent('quiz_offer_clicked', { offer: offerName });
  };

  return (
    <div className="quiz-wrap" style={{ minHeight: '100vh', background: '#07060b', color: '#f3f0ff', fontFamily: 'Sora, system-ui, sans-serif', paddingBottom: '56px', backgroundImage: 'radial-gradient(60% 40% at 50% 0, #2b1659 0, transparent 70%)' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .q-wrap { max-width: 560px; margin: 0 auto; padding: 22px 18px 56px; }
        .q-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
        .q-logo { font-weight: 800; letter-spacing: 0.04em; color: #a78bfa; }
        .q-cnt { font-size: 13px; color: #9d94b8; }
        .q-h1 { font-size: clamp(26px, 7vw, 34px); line-height: 1.15; margin: 0 0 12px; font-weight: 800; }
        .q-h2 { font-size: 22px; line-height: 1.25; margin: 0 0 6px; }
        .q-p { color: #9d94b8; margin: 0 0 16px; }
        .q-btn { display: block; width: 100%; text-align: center; border: 0; border-radius: 12px; padding: 16px; font: inherit; font-weight: 800; color: #fff; background: linear-gradient(135deg, #7c3aed, #a855f7); cursor: pointer; text-decoration: none; font-size: 16px; margin-bottom: 10px; }
        .q-btn.ghost { background: transparent; border: 1px solid #2a2145; color: #f3f0ff; font-weight: 600; }
        .q-bar { height: 6px; background: #2a2145; border-radius: 9px; overflow: hidden; margin-bottom: 22px; }
        .q-bar i { display: block; height: 100%; width: 0; background: #8b5cf6; transition: width 0.4s; }
        .q-opt { display: flex; gap: 12px; align-items: center; width: 100%; text-align: left; background: #120e1d; border: 1px solid #2a2145; color: #f3f0ff; border-radius: 14px; padding: 15px; margin: 0 0 10px; font: inherit; cursor: pointer; transition: border-color 0.2s, background 0.2s, transform 0.15s; }
        .q-opt:hover { border-color: #8b5cf6; }
        .q-opt b { font-size: 22px; line-height: 1; }
        .q-opt span { flex: 1; }
        .q-opt small { display: block; color: #9d94b8; font-size: 12px; }
        .q-hint { font-size: 13px; color: #a78bfa; margin: 0 0 16px; }
        .q-input { width: 100%; background: #120e1d; border: 1px solid #2a2145; color: #f3f0ff; border-radius: 12px; padding: 15px; font: inherit; margin: 0 0 10px; }
        .q-tag { display: inline-block; background: #1c1433; border: 1px solid #8b5cf6; color: #a78bfa; border-radius: 99px; padding: 4px 12px; font-size: 13px; margin-bottom: 12px; }
        .q-box { background: #120e1d; border: 1px solid #2a2145; border-radius: 16px; padding: 20px; margin: 0 0 16px; }
        .q-box.dest { border-color: #8b5cf6; box-shadow: 0 0 0 1px #8b5cf6 inset; }
        .q-box h3 { margin: 0 0 6px; font-size: 18px; }
        .q-box ul { margin: 0 0 14px; padding-left: 18px; color: #9d94b8; }
        .q-preco { font-size: 26px; font-weight: 800; margin: 6px 0 12px; }
        .q-small { font-size: 12px; color: #9d94b8; text-align: center; }
        .q-cover { text-align: center; padding-top: 28px; }
        .q-cover .mark { width: 96px; height: 96px; display: block; margin: 0 auto 6px; filter: drop-shadow(0 8px 24px rgba(124,58,237,0.4)); }
        .q-cover .wm { font-weight: 800; letter-spacing: 0.18em; color: #a78bfa; margin-bottom: 22px; }
        .q-cover input { text-align: center; }
        .q-score { text-align: center; margin: 6px 0 18px; }
        .q-ring { width: 150px; height: 150px; border-radius: 50%; margin: 0 auto 10px; display: grid; place-items: center; background: conic-gradient(#8b5cf6 var(--p, 0%), #2a2145 0); }
        .q-ring div { width: 122px; height: 122px; border-radius: 50%; background: #07060b; display: grid; place-items: center; font-size: 34px; font-weight: 800; }
        .q-row { margin: 0 0 12px; }
        .q-row label { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px; }
        .q-row.low label { color: #fca5a5; }
        .q-row .q-bar i { background: #a78bfa; }
        .q-row.low .q-bar i { background: #f87171; }
        .q-ld { padding: 0; margin: 20px 0; }
        .q-ld li { list-style: none; color: #9d94b8; padding: 8px 0; opacity: 0.3; transition: opacity 0.4s; }
        .q-ld li.on { opacity: 1; color: #f3f0ff; }
      `}}/>
      <div className="q-wrap">
        {step !== 'inicio' && (
          <div className="q-top">
            <div className="q-logo">GHOST MARKET</div>
            <div className="q-cnt">{step === 'quiz' ? `Pergunta ${currentQ + 1} de ${Q.length}` : ''}</div>
          </div>
        )}

        {step === 'inicio' && (
          <section className="q-cover">
            <svg className="mark" viewBox="0 0 64 64" role="img" aria-label="Logo Ghost Market">
              <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c4b5fd"/><stop offset="1" stopColor="#7c3aed"/></linearGradient></defs>
              <path d="M12 56V28C12 15 21 6 32 6s20 9 20 22v28l-7-6-6 6-7-6-7 6-7-6z" fill="url(#lg)"/>
              <circle cx="25" cy="28" r="4" fill="#07060b"/><circle cx="39" cy="28" r="4" fill="#07060b"/>
            </svg>
            <div className="wm">GHOST MARKET</div>
            <h1 className="q-h1">Seja bem-vindo ao quiz do Ghost Market</h1>
            <p className="q-p">Para darmos início, digite seu nome (não precisa ser completo) e o seu número de telefone.</p>
            <input className="q-input" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" autoComplete="given-name" />
            <input className="q-input" value={zap} onChange={e => setZap(e.target.value)} placeholder="Seu telefone com DDD" inputMode="tel" autoComplete="tel" />
            <button className="q-btn" onClick={handleStart}>Começar o quiz</button>
            <p className="q-small">Leva cerca de 1 minuto. Você recebe sua nota e seu plano.</p>
          </section>
        )}

        {step === 'quiz' && (
          <section>
            <div className="q-bar"><i style={{ width: `${(currentQ / Q.length) * 100}%` }}></i></div>
            <h2 className="q-h2">{Q[currentQ].q}</h2>
            <p className="q-hint">{Q[currentQ].h}</p>
            <div>
              {Q[currentQ].o.map((opt, k) => (
                <button key={k} className="q-opt" onClick={() => handleAnswer(k, typeof opt[2] === 'number' ? opt[2] : null, opt[1] as string)}>
                  <b>{opt[0]}</b>
                  <span>
                    {opt[1]}
                    {typeof opt[2] === 'string' && <small>{opt[2]}</small>}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 'load' && (
          <section>
            <h1 className="q-h1">Analisando suas respostas...</h1>
            <ul className="q-ld">
              <li className={loadStep >= 1 ? 'on' : ''}>Calculando sua nota de prontidão</li>
              <li className={loadStep >= 2 ? 'on' : ''}>Identificando seu maior gargalo</li>
              <li className={loadStep >= 3 ? 'on' : ''}>Montando seu plano personalizado</li>
            </ul>
          </section>
        )}

        {step === 'res' && result && (
          <section>
            <div className="q-score">
              <div className="q-ring" style={{ '--p': `${scoreAnim}%` } as any}>
                <div>{result.nota}</div>
              </div>
              <span className="q-tag">
                Perfil: {["iniciante", "em evolução", "pronto para escalar"][result.exp]}
              </span>
            </div>
            <h1 className="q-h1">{nome}, seu gargalo é: {GT[result.g][0]}</h1>
            <p className="q-p">{GT[result.g][1]}</p>
            <div style={{ marginBottom: '20px' }}>
              {result.bars.map((v: number, k: number) => (
                <div key={k} className={`q-row ${k === result.g ? 'low' : ''}`}>
                  <label><span>{G[k]}</span><span>{v}%</span></label>
                  <div className="q-bar"><i style={{ width: `${v}%` }}></i></div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* If exp===0 or g===1, mentoria is first, else ghost is first */}
              {((result.exp === 0 || result.g === 1) ? ['ment', 'ghost'] : ['ghost', 'ment']).map(order => {
                if (order === 'ghost') {
                  return (
                    <div key="ghost" className={`q-box ${!(result.exp === 0 || result.g === 1) ? 'dest' : ''}`}>
                      <h3>Ghost AI</h3>
                      <ul><li>Propostas de site prontas em minutos</li><li>Textos da página de venda e de abordagem para clientes</li><li>Respostas para objeções e follow-up depois da proposta</li></ul>
                      <div className="q-preco">{CFG.precoGhost}</div>
                      <a className="q-btn" href={CFG.checkoutGhost} target="_blank" rel="noopener noreferrer" onClick={() => onOfferClick('Ghost AI')}>Quero a Ghost AI</a>
                    </div>
                  )
                } else {
                  return (
                    <div key="ment" className={`q-box ${(result.exp === 0 || result.g === 1) ? 'dest' : ''}`}>
                      <h3>Mentoria: como vender sites</h3>
                      <ul><li>Passo a passo para conseguir os primeiros clientes</li><li>Como precificar, apresentar e fechar</li><li>Como atrair clientes todas as semanas</li></ul>
                      <div className="q-preco">{CFG.precoMentoria}</div>
                      <a className="q-btn" href={CFG.checkoutMentoria} target="_blank" rel="noopener noreferrer" onClick={() => onOfferClick('Mentoria')}>Quero a mentoria</a>
                    </div>
                  )
                }
              })}
            </div>
            <a 
              className="q-btn ghost" 
              style={{ marginTop: '16px' }}
              href={`https://wa.me/${CFG.zapSuporte}?text=${encodeURIComponent(`Oi! Sou ${nome}. Fiz o diagnóstico da Ghost AI (nota ${result.nota}, gargalo: ${GT[result.g][0]}). Meu telefone: ${zap}. Origem: ${searchParams.get('utm_source') || 'direto'}.`)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => onOfferClick('WhatsApp')}
            >
              Tirar dúvidas no WhatsApp
            </a>
          </section>
        )}
      </div>
    </div>
  );
};
