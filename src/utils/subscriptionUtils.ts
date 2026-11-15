export interface SubscriptionStatusInfo {
  stage: '5_days_before' | 'tomorrow' | 'today' | 'overdue' | 'paid_this_month' | 'upcoming';
  diffDays: number;
  label: string;
  badgeClass: string;
  isPaidThisMonth: boolean;
  dueDateFormatted: string;
  overdueDays: number;
}

export function calculateSubscriptionStatus(
  dueDay: number,
  lastPaymentDate?: string,
  referenceDate = new Date()
): SubscriptionStatusInfo {
  const ref = new Date(referenceDate);
  const currentYear = ref.getFullYear();
  const currentMonth = ref.getMonth(); // 0 a 11
  const todayDay = ref.getDate();

  // Validar dia limite do mês atual (ex: fevereiro 28/29, meses de 30 dias)
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const clampedDueDay = Math.min(Math.max(1, Number(dueDay) || 10), daysInCurrentMonth);

  // Verificar se já pagou no mês atual
  let isPaidThisMonth = false;
  if (lastPaymentDate) {
    const lastDate = new Date(lastPaymentDate);
    if (!isNaN(lastDate.getTime())) {
      isPaidThisMonth = lastDate.getFullYear() === currentYear && lastDate.getMonth() === currentMonth;
    }
  }

  const dueDateFormatted = `${String(clampedDueDay).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}`;

  if (isPaidThisMonth) {
    return {
      stage: 'paid_this_month',
      diffDays: 99,
      label: 'Em Dia (Pago este Mês)',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      isPaidThisMonth: true,
      dueDateFormatted,
      overdueDays: 0
    };
  }

  const diffDays = clampedDueDay - todayDay;

  if (diffDays === 0) {
    return {
      stage: 'today',
      diffDays: 0,
      label: 'Vence Hoje!',
      badgeClass: 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold animate-pulse',
      isPaidThisMonth: false,
      dueDateFormatted,
      overdueDays: 0
    };
  }

  if (diffDays === 1) {
    return {
      stage: 'tomorrow',
      diffDays: 1,
      label: 'Vence Amanhã',
      badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold',
      isPaidThisMonth: false,
      dueDateFormatted,
      overdueDays: 0
    };
  }

  if (diffDays > 1 && diffDays <= 5) {
    return {
      stage: '5_days_before',
      diffDays,
      label: `Vence em ${diffDays} dias`,
      badgeClass: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-medium',
      isPaidThisMonth: false,
      dueDateFormatted,
      overdueDays: 0
    };
  }

  if (diffDays > 5) {
    return {
      stage: 'upcoming',
      diffDays,
      label: `Vence em ${diffDays} dias`,
      badgeClass: 'bg-zinc-800 text-zinc-300 border border-zinc-700/60 font-medium',
      isPaidThisMonth: false,
      dueDateFormatted,
      overdueDays: 0
    };
  }

  // Atrasado
  const overdueDays = Math.abs(diffDays);
  return {
    stage: 'overdue',
    diffDays,
    label: `Atrasado há ${overdueDays} ${overdueDays === 1 ? 'dia' : 'dias'}`,
    badgeClass: 'bg-rose-950/60 text-rose-300 border border-rose-500/50 font-bold',
    isPaidThisMonth: false,
    dueDateFormatted,
    overdueDays
  };
}

export function generateLocalSubscriptionMessage(
  params: {
    clientName: string;
    phone: string;
    serviceName?: string;
    amount: number;
    dueDay: number;
    pixKey?: string;
    pixReceiverName?: string;
    lastPaymentDate?: string;
  },
  tone: 'friendly' | 'formal' | 'direct' | 'firm' = 'friendly',
  referenceDate = new Date()
): string {
  const status = calculateSubscriptionStatus(params.dueDay, params.lastPaymentDate, referenceDate);
  const clientFirstName = (params.clientName || 'Cliente').split(' ')[0];
  const service = params.serviceName || 'Hospedagem & Manutenção de Site';
  const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(params.amount) || 0);
  const pix = params.pixKey ? `\n🔑 *Chave PIX:* ${params.pixKey}` : '';
  const titular = params.pixReceiverName ? ` (${params.pixReceiverName})` : '';
  const pixBlock = pix ? `${pix}${titular}` : '';

  // 1. Faltam 5 dias (ou aviso prévio suave)
  if (status.stage === '5_days_before' || status.stage === 'upcoming') {
    if (tone === 'formal') {
      return `Prezado(a) ${params.clientName || 'Cliente'}, bom dia.\n\nInformamos com antecedência que a mensalidade do serviço (*${service}*) referente à estrutura online do seu negócio vencerá em ${status.dueDateFormatted}, no valor de ${formattedAmount}.${pixBlock}\n\nAgradecemos a parceria contínua e permanecemos à inteira disposição para qualquer suporte.`;
    }
    if (tone === 'direct') {
      return `Fala ${clientFirstName}, tudo bem? Passando só pra avisar que a mensalidade do seu site vence no dia ${status.dueDateFormatted} (${formattedAmount}).${pixBlock}\n\nQualquer dúvida estou por aqui!`;
    }
    // Friendly
    return `Olá ${clientFirstName}, tudo bem? Passando para avisar com antecedência que a mensalidade do seu site (*${service}*) vence no próximo dia ${status.dueDateFormatted}, no valor de ${formattedAmount}.${pixBlock}\n\nQualquer dúvida ou ajuste que precisar no site, estou à disposição! Muito obrigado pela parceria.`;
  }

  // 2. Vence Amanhã
  if (status.stage === 'tomorrow') {
    if (tone === 'formal') {
      return `Prezado(a) ${params.clientName || 'Cliente'}, boa tarde.\n\nLembramos que o vencimento da mensalidade de hospedagem e suporte do seu site ocorrerá amanhã, dia ${status.dueDateFormatted}, no valor de ${formattedAmount}.${pixBlock}\n\nSolicitamos a gentileza do envio do comprovante para atualização do nosso sistema financeiro.`;
    }
    if (tone === 'direct') {
      return `Fala ${clientFirstName}, beleza? Só lembrando rapidinho que a mensalidade do site vence amanhã (${formattedAmount}).${pixBlock}\n\nAbraço!`;
    }
    // Friendly
    return `Olá ${clientFirstName}, boa tarde! Passando rapidinho pra te lembrar que a mensalidade da manutenção e hospedagem do seu site vence amanhã (dia ${status.dueDateFormatted}), no valor de ${formattedAmount}.${pixBlock}\n\nAssim que você efetuar o pagamento, se puder me mandar o comprovante por aqui eu já dou baixa. Gratidão pela parceria!`;
  }

  // 3. Vence Hoje
  if (status.stage === 'today') {
    if (tone === 'formal') {
      return `Prezado(a) ${params.clientName || 'Cliente'}, bom dia.\n\nInformamos que hoje é a data de vencimento da mensalidade do seu site (*${service}*), no valor de ${formattedAmount}.${pixBlock}\n\nPara mantermos os serviços de hospedagem e suporte 100% ativos, solicitamos a quitação e envio do comprovante.`;
    }
    if (tone === 'direct') {
      return `Fala ${clientFirstName}, bom dia! Hoje é o vencimento da mensalidade do site (${formattedAmount}).${pixBlock}\n\nMe manda o comprovante assim que pagar pra eu dar baixa!`;
    }
    // Friendly
    return `Olá ${clientFirstName}, bom dia! Hoje é o dia do vencimento da mensalidade do seu site (*${service}*), no valor de ${formattedAmount}.\n\nPara mantermos seu domínio, servidores e estrutura online 100% ativos e protegidos, segue a chave:${pixBlock}\n\nAssim que efetuar o pagamento me manda o comprovante por aqui. Tamo junto!`;
  }

  // 4. Em atraso
  if (status.stage === 'overdue') {
    if (tone === 'firm' || status.overdueDays >= 5) {
      return `Olá ${clientFirstName}, tudo bem?\n\nEntramos em contato referente à mensalidade do seu site (*${service}*), com vencimento em ${status.dueDateFormatted}, que consta com *${status.overdueDays} dias em atraso* (${formattedAmount}).\n\nPara mantermos os servidores no ar e evitarmos a suspensão temporária do seu site e do suporte, solicitamos a regularização:${pixBlock}\n\nCaso já tenha realizado o pagamento nas últimas horas, por favor nos envie o comprovante para atualização imediata no sistema.`;
    }
    if (tone === 'formal') {
      return `Prezado(a) ${params.clientName || 'Cliente'}, boa tarde.\n\nConstatamos que a mensalidade do seu site (*${service}*) referente ao vencimento de ${status.dueDateFormatted} (${formattedAmount}) ainda não foi identificada em nosso sistema.${pixBlock}\n\nSolicitamos a regularização ou o envio do comprovante caso já tenha sido liquidado. Permanecemos à disposição.`;
    }
    if (tone === 'direct') {
      return `Fala ${clientFirstName}, beleza? Notei que a mensalidade do site com vencimento em ${status.dueDateFormatted} (${formattedAmount}) ainda tá em aberto.${pixBlock}\n\nMe dá um toque por aqui pra gente regularizar!`;
    }
    // Friendly
    return `Olá ${clientFirstName}, tudo bem? Notei aqui no sistema que a mensalidade do seu site com vencimento em ${status.dueDateFormatted} (${formattedAmount}) ainda não foi confirmada. Houve algum imprevisto ou esquecimento?${pixBlock}\n\nMe dá um toque por aqui para mantermos tudo certinho e o seu site 100% no ar. Valeu!`;
  }

  // 5. Já pago
  return `Olá ${clientFirstName}, tudo bem? Passando apenas para agradecer a confiança e confirmar que sua mensalidade de *${service}* está 100% em dia! Seu site continua voando e totalmente seguro. Conte conosco sempre que precisar!`;
}

export async function fetchAiPolishedMessage(
  baseMessage: string,
  instruction: string
): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const prompt = `Você é um assistente comercial de alta conversão de uma agência de sites e marketing digital.
Reescreva a seguinte mensagem de cobrança de mensalidade para WhatsApp mantendo as informações essenciais (nome, valor, data de vencimento e chave PIX).
Instrução do usuário: "${instruction}".
Mensagem original:
"${baseMessage}"

Responda APENAS com o texto final pronto para enviar no WhatsApp, sem aspas, sem explicações prévias e sem enrolação.`;

    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'Você é um assistente que reescreve mensagens de cobrança comercial com tom profissional, educado e de alta retenção.' },
          { role: 'user', content: prompt }
        ],
        model: 'openai'
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 20) {
        return text.trim();
      }
    }
  } catch (_) {}

  return baseMessage;
}
