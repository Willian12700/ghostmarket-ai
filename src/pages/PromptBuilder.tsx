import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutTemplate,
  Search,
  Sparkles,
  Palette,
  ArrowRight,
  Copy,
  Check,
  Sliders,
  Eye,
} from 'lucide-react';
import {
  SITE_TEMPLATES,
  TEMPLATE_CATEGORIES,
  COLOR_PALETTES,
  SiteStudioConfig,
  findBestTemplateForNiche,
} from '@/data/siteTemplates';
import { useToastStore } from '@/store/toastStore';

export const PromptBuilder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToastStore();

  // When user clicks the single "Modelos Prontos" card (or arrives with lead params), show the models grid
  const [modelsOpened, setModelsOpened] = useState<boolean>(() => {
    return Boolean(searchParams.get('leadName') || searchParams.get('leadCategory'));
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<SiteStudioConfig | null>(null);

  // Quick customization before opening Studio or copying Prompt
  const [customName, setCustomName] = useState<string>('');
  const [customCity, setCustomCity] = useState<string>('');
  const [customPhone, setCustomPhone] = useState<string>('');
  const [primaryColor, setPrimaryColor] = useState<string>('#10B981');
  const [secondaryColor, setSecondaryColor] = useState<string>('#34D399');
  const [bgColor, setBgColor] = useState<string>('#09090B');
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  useEffect(() => {
    const leadName = searchParams.get('leadName');
    const leadCategory = searchParams.get('leadCategory');
    const leadCity = searchParams.get('leadCity');
    const leadPhone = searchParams.get('leadPhone');

    if (leadName || leadCategory) {
      setModelsOpened(true);
      const matched = findBestTemplateForNiche(leadCategory || leadName || '');
      setSelectedModel(matched);
      setCustomName(leadName || matched.name);
      setCustomCity(leadCity || matched.city);
      setCustomPhone(leadPhone || matched.phone);
      setPrimaryColor(matched.primaryColor);
      setSecondaryColor(matched.secondaryColor);
      setBgColor(matched.backgroundColor);
    }
  }, [searchParams]);

  const filteredTemplates = useMemo(() => {
    return SITE_TEMPLATES.filter((t) => {
      const matchesCategory = selectedCategory === 'Todos' || t.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        t.templateTitle.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.headline.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const handleChooseModel = (tpl: SiteStudioConfig) => {
    setSelectedModel(tpl);
    setCustomName(searchParams.get('leadName') || tpl.name);
    setCustomCity(searchParams.get('leadCity') || tpl.city);
    setCustomPhone(searchParams.get('leadPhone') || tpl.phone);
    setPrimaryColor(tpl.primaryColor);
    setSecondaryColor(tpl.secondaryColor);
    setBgColor(tpl.backgroundColor);
  };

  const handleOpenInRealtimeStudio = (tpl: SiteStudioConfig) => {
    const params = new URLSearchParams();
    params.set('template', tpl.templateId);
    params.set('leadCategory', tpl.templateId);
    if (customName.trim()) params.set('leadName', customName.trim());
    if (customCity.trim()) params.set('leadCity', customCity.trim());
    if (customPhone.trim()) params.set('leadPhone', customPhone.trim());
    navigate(`/builder?${params.toString()}`);
  };

  const buildModelPrompt = (tpl: SiteStudioConfig) => {
    const finalName = customName.trim() || tpl.name;
    const finalCity = customCity.trim() || tpl.city;
    const finalPhone = customPhone.trim() || tpl.phone;
    const itemsList = tpl.catalog
      .map((item) => `- ${item.name} (${item.price}): ${item.description}`)
      .join('\n');

    return `Atue como um Engenheiro Front-End Sênior e Designer UI/UX Especialista em Conversão.
Crie uma Landing Page / Plataforma Web completa, responsiva e de altíssima conversão baseada no modelo "${tpl.templateTitle}".

# 1. IDENTIDADE E MARCA
- Nome da Empresa: ${finalName}
- Nicho / Categoria: ${tpl.category} (${tpl.templateTitle})
- Cidade / Região: ${finalCity}
- WhatsApp / Telefone: ${finalPhone}
- Slogan Superior: ${tpl.eyebrow}
- Headline Principal: ${tpl.headline}
- Subheadline: ${tpl.subheadline}
- Texto do Botão Principal (CTA): ${tpl.ctaText}

# 2. PALETA DE CORES & ESTILO VISUAL
- Cor Primária (Destaques e Botões): ${primaryColor}
- Cor Secundária: ${secondaryColor}
- Cor de Fundo Principal: ${bgColor}
- Tipografia Principal: ${tpl.fontFamily}
- Estilo de Layout: ${tpl.layoutVariant.toUpperCase()}

# 3. DIFERENCIAIS COMPETITIVOS
${tpl.perks.map((p) => `- ${p}`).join('\n')}

# 4. CATÁLOGO DE PRODUTOS / SERVIÇOS / CARDÁPIO
${itemsList}

# 5. FUNCIONALIDADES OBRIGATÓRIAS
- Modo de Interação: ${
      tpl.interactionMode === 'cart'
        ? 'Sacola de Pedidos Interativa que soma os itens e envia o pedido formatado direto para o WhatsApp'
        : tpl.interactionMode === 'booking'
        ? 'Modal de Agendamento Rápido que envia o serviço e horário escolhido para o WhatsApp'
        : 'Botões de Orçamento Direto integrados ao WhatsApp'
    }
- Seção Sobre Nós persuasiva: "${tpl.aboutText}"
- Depoimentos 5 estrelas verificados, FAQ em acordeão e botão flutuante de WhatsApp.`;
  };

  const handleCopyPrompt = (tpl: SiteStudioConfig) => {
    const promptText = buildModelPrompt(tpl);
    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    addToast('Super-Prompt do modelo copiado com sucesso!', 'success');
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0E0E11] p-6 rounded-2xl border border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <LayoutTemplate className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Central de Modelos Prontos & Prompt Studio
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                +{SITE_TEMPLATES.length} Nichos
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-0.5">
              Escolha o modelo ideal de acordo com o nicho do seu cliente, personalize cores e dados em tempo real ou copie o prompt estruturado.
            </p>
          </div>
        </div>

        {modelsOpened && (
          <button
            type="button"
            onClick={() => navigate('/builder')}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0"
          >
            <Sliders className="w-4 h-4" /> Ir para o Studio Visual Completo
          </button>
        )}
      </div>

      {/* STEP 1: SINGLE CARD ENTRY (ONLY MODELS OPTION) */}
      {!modelsOpened ? (
        <div className="py-8 max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() => setModelsOpened(true)}
            className="w-full p-8 md:p-10 bg-[#0E0E11] border-2 border-emerald-500/40 hover:border-emerald-400 rounded-3xl text-left group transition-all shadow-2xl relative overflow-hidden cursor-pointer"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> +{SITE_TEMPLATES.length} Modelos Prontos de Alta Conversão
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white">
                  Escolher Modelo Pronto por Nicho
                </h2>
                <p className="text-sm md:text-base text-zinc-400 max-w-xl leading-relaxed">
                  Clique aqui para abrir todos os modelos prontos divididos por categoria (Hamburgueria, Pizzaria, Clínica, Barbearia, Advocacia, Imobiliária, Estética, Oficina, Pet Shop e muito mais) e editar cores, textos e itens em tempo real.
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-zinc-950 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
                <ArrowRight className="w-8 h-8" />
              </div>
            </div>
          </button>
        </div>
      ) : (
        /* STEP 2: ALL 55+ MODELS + INSTANT CUSTOMIZER */
        <div className="space-y-6">
          {/* Search & Category Filter Bar */}
          <div className="bg-[#0E0E11] border border-zinc-800 rounded-2xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar modelo por nicho (ex: hamburgueria, dentista, barbearia, pizzaria, advogado, estética...)"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <span className="text-xs font-semibold text-zinc-400 shrink-0 px-2">
                Exibindo <strong className="text-white">{filteredTemplates.length}</strong> modelos prontos
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {TEMPLATE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Model Quick Customizer Drawer / Card */}
          {selectedModel && (
            <div className="bg-[#0E0E11] border-2 border-emerald-500/50 rounded-2xl p-6 space-y-5 shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedModel.heroImage}
                    alt={selectedModel.templateTitle}
                    className="w-16 h-16 rounded-xl object-cover border border-zinc-700"
                  />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      Modelo Selecionado • {selectedModel.category}
                    </span>
                    <h3 className="text-xl font-bold text-white">{selectedModel.templateTitle}</h3>
                    <p className="text-xs text-zinc-400">{selectedModel.headline}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(selectedModel)}
                    className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    {copiedPrompt ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copiedPrompt ? 'Prompt Copiado!' : 'Copiar Super-Prompt'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenInRealtimeStudio(selectedModel)}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" /> Abrir e Editar Site em Tempo Real →
                  </button>
                </div>
              </div>

              {/* Quick Customization Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Nome da Empresa do Cliente
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Ex: Dom Vincenzo Pizzaria"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Cidade / Estado
                  </label>
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    placeholder="Ex: Curitiba - PR"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    WhatsApp do Cliente
                  </label>
                  <input
                    type="text"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Quick Color Palettes */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 mb-2">
                  <Palette className="w-3.5 h-3.5 text-emerald-400" /> Paleta de Cores do Modelo (Personalizável em Tempo Real)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_PALETTES.slice(0, 8).map((pal) => (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => {
                        setPrimaryColor(pal.primary);
                        setSecondaryColor(pal.secondary);
                        setBgColor(pal.background);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center gap-2 text-xs text-zinc-200 cursor-pointer"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: pal.primary }}
                      />
                      <span>{pal.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Templates Grid (+55 Models) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((tpl) => {
              const isSelected = selectedModel?.templateId === tpl.templateId;
              return (
                <div
                  key={tpl.templateId}
                  onClick={() => handleChooseModel(tpl)}
                  className={`group bg-[#0E0E11] border rounded-2xl overflow-hidden flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div>
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={tpl.heroImage}
                        alt={tpl.templateTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/80 text-white backdrop-blur-md border border-white/10">
                        {tpl.category}
                      </span>
                      <div className="absolute bottom-3 right-3 flex -space-x-1">
                        <span
                          className="w-5 h-5 rounded-full border border-white/40"
                          style={{ backgroundColor: tpl.primaryColor }}
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-white/40"
                          style={{ backgroundColor: tpl.backgroundColor }}
                        />
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-emerald-400">
                          {tpl.interactionMode === 'cart'
                            ? '🛒 Com Sacola WhatsApp'
                            : tpl.interactionMode === 'booking'
                            ? '📅 Com Agendamento'
                            : '💬 Orçamento Rápido'}
                        </span>
                        <span className="text-[11px] text-zinc-500">{tpl.catalog.length} itens</span>
                      </div>
                      <h3 className="font-bold text-white text-base">{tpl.templateTitle}</h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{tpl.headline}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenInRealtimeStudio(tpl);
                      }}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" /> Editar em Tempo Real
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChooseModel(tpl);
                        handleCopyPrompt(tpl);
                      }}
                      className="px-3 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Copiar Super-Prompt deste Modelo"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
