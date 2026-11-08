import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Code,
  Eye,
  Upload,
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  Smartphone,
  Monitor,
  Shield,
  Bot,
  Trash2,
  Maximize2,
  Minimize2,
  Download,
  Palette,
  Type,
  Layout,
  ShoppingBag,
  Image as ImageIcon,
  Plus,
  Search,
  Layers,
  Sliders,
  Globe,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { db } from '@/config/firebase';
import { collection, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore';
import { createAdminCredentials, ClientAdminAuth } from '../utils/clientAdminCrypto';
import {
  SITE_TEMPLATES,
  TEMPLATE_CATEGORIES,
  COLOR_PALETTES,
  FONT_PRESETS,
  LAYOUT_VARIANTS,
  SiteStudioConfig,
  InteractionMode,
  findBestTemplateForNiche,
  compileTemplateToHtml,
} from '../data/siteTemplates';

type StudioTab = 'templates' | 'colors' | 'texts' | 'catalog' | 'media' | 'extras';
type BuilderWorkspaceMode = 'studio' | 'code';

export const SiteBuilder = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const toast = {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string, _opts?: any) => addToast(msg, 'error'),
  };
  const [searchParams] = useSearchParams();

  // Workspace Mode: Visual Studio (default) vs Raw Code Editor
  const [workspaceMode, setWorkspaceMode] = useState<BuilderWorkspaceMode>('studio');
  const [activeStudioTab, setActiveStudioTab] = useState<StudioTab>('templates');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [templateSearch, setTemplateSearch] = useState<string>('');
  const [showTemplateGalleryModal, setShowTemplateGalleryModal] = useState<boolean>(false);

  // Active Studio Configuration (Real-time state)
  const [studioConfig, setStudioConfig] = useState<SiteStudioConfig>(() =>
    structuredClone(SITE_TEMPLATES[0])
  );

  // Raw Code Mode States
  const [siteName, setSiteName] = useState(SITE_TEMPLATES[0].name);
  const [customSlug, setCustomSlug] = useState('');
  const [htmlCode, setHtmlCode] = useState(() => compileTemplateToHtml(SITE_TEMPLATES[0]));
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'css' | 'js'>('html');

  // Preview & Publish States
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [publishedAdminUrl, setPublishedAdminUrl] = useState<string | null>(null);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [protectCode, setProtectCode] = useState(true);
  const [selectedChatbot, setSelectedChatbot] = useState<string>('none');
  const [chatbots, setChatbots] = useState<any[]>([]);

  // Establishment Client Admin Panel States (SHA-256 Protected)
  const [enableClientAdmin, setEnableClientAdmin] = useState<boolean>(true);
  const [clientAdminUser, setClientAdminUser] = useState<string>('admin');
  const [clientAdminPass, setClientAdminPass] = useState<string>('Mudar@123');
  const [existingAdminAuth, setExistingAdminAuth] = useState<ClientAdminAuth | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing site if ?edit=siteId is provided, or sync URL params from Scanner / PromptBuilder
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      const loadExistingSite = async () => {
        try {
          let snap = await getDoc(doc(db, 'sites', editId));
          if (!snap.exists()) {
            snap = await getDoc(doc(db, 'hosted_sites', editId));
          }
          if (snap.exists()) {
            const data = snap.data();
            setEditingSiteId(snap.id);
            setCustomSlug(data.slug || snap.id);
            setSiteName(data.name || snap.id);
            if (data.studioConfig) {
              setStudioConfig(data.studioConfig);
              setWorkspaceMode('studio');
            } else if (data.rawHtml || data.html) {
              setHtmlCode(data.rawHtml || data.html);
              setCssCode(data.rawCss || '');
              setJsCode(data.rawJs || '');
              setWorkspaceMode('code');
            }
            if (data.adminAuth) {
              setExistingAdminAuth(data.adminAuth);
              setEnableClientAdmin(Boolean(data.adminAuth.enabled));
              setClientAdminUser(data.adminAuth.username || 'admin');
              setClientAdminPass('');
            }
            toast.success(`Projeto "${data.name || snap.id}" carregado para edição!`);
          }
        } catch (err) {
          console.error('Error loading site for edit:', err);
        }
      };
      loadExistingSite();
      return;
    }

    const leadName = searchParams.get('leadName') || searchParams.get('name');
    const leadCategory = searchParams.get('leadCategory') || searchParams.get('niche') || searchParams.get('template');
    const leadCity = searchParams.get('leadCity') || searchParams.get('city');
    const leadPhone = searchParams.get('leadPhone') || searchParams.get('phone');

    if (leadName || leadCategory || leadCity || leadPhone) {
      const matched = findBestTemplateForNiche(leadCategory || leadName || '');
      if (leadName) {
        matched.name = leadName;
        matched.aboutTitle = `Por que escolher a ${leadName}?`;
        matched.footerText = `© ${new Date().getFullYear()} ${leadName}. Todos os direitos reservados.`;
        setSiteName(leadName);
        const suggestedUser = leadName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '')
          .slice(0, 14);
        if (suggestedUser) setClientAdminUser(suggestedUser);
      }
      if (leadCity) {
        matched.city = leadCity;
      }
      if (leadPhone) {
        const digits = leadPhone.replace(/\D/g, '');
        matched.phone = leadPhone;
        matched.whatsapp = digits.startsWith('55') ? digits : `55${digits}`;
      }
      setStudioConfig(matched);
      setActiveStudioTab('colors');
      toast.success(`Modelo "${matched.templateTitle}" carregado para ${leadName || 'seu projeto'}!`);
    }
  }, [searchParams]);

  // Compile Studio Config into HTML in real time whenever studioConfig changes in Studio mode
  useEffect(() => {
    if (workspaceMode === 'studio') {
      const compiled = compileTemplateToHtml(studioConfig);
      setHtmlCode(compiled);
      setSiteName(studioConfig.name);
    }
  }, [studioConfig, workspaceMode]);

  // Fetch user's AI Chatbots
  useEffect(() => {
    const fetchChatbots = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'chatbots'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        setChatbots(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching chatbots:', err);
      }
    };
    fetchChatbots();
  }, [user]);

  const filteredTemplates = useMemo(() => {
    return SITE_TEMPLATES.filter((t) => {
      const matchesCat = selectedCategory === 'Todos' || t.category === selectedCategory;
      const q = templateSearch.trim().toLowerCase();
      const matchesQuery =
        !q ||
        t.templateTitle.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.headline.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [selectedCategory, templateSearch]);

  const handleSelectTemplate = (template: SiteStudioConfig) => {
    const cloned = structuredClone(template);
    const editParam = searchParams.get('edit');
    if (!editParam) {
      // Ao escolher outro modelo sem estar em modo de edição fixa (?edit=), prepara para criar um novo site
      setEditingSiteId(null);
      setPublishedUrl(null);
      setPublishedAdminUrl(null);
      setCustomSlug('');
    }
    setStudioConfig(cloned);
    setSiteName(cloned.name);
    setWorkspaceMode('studio');
    setShowTemplateGalleryModal(false);
    toast.success(`Modelo "${template.templateTitle}" aplicado em tempo real!`);
  };

  const updateConfig = <K extends keyof SiteStudioConfig>(key: K, value: SiteStudioConfig[K]) => {
    setStudioConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyColorPalette = (palette: (typeof COLOR_PALETTES)[number]) => {
    setStudioConfig((prev) => ({
      ...prev,
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      backgroundColor: palette.background,
      surfaceColor: palette.surface,
      textColor: palette.text,
    }));
    toast.success(`Paleta "${palette.name}" aplicada!`);
  };

  const handleUpdateCatalogItem = (idx: number, field: string, value: string) => {
    setStudioConfig((prev) => {
      const next = [...prev.catalog];
      next[idx] = { ...next[idx], [field]: value };
      return { ...prev, catalog: next };
    });
  };

  const handleAddCatalogItem = () => {
    setStudioConfig((prev) => ({
      ...prev,
      catalog: [
        ...prev.catalog,
        {
          id: `item-${Date.now()}`,
          name: 'Novo Item ou Serviço',
          description: 'Descrição detalhada com os principais benefícios e diferenciais.',
          price: 'R$ 99,90',
          category: prev.catalog[0]?.category || 'Destaques',
          image: prev.heroImage,
          badge: 'Novo',
        },
      ],
    }));
    toast.success('Novo item adicionado ao catálogo!');
  };

  const handleRemoveCatalogItem = (idx: number) => {
    setStudioConfig((prev) => ({
      ...prev,
      catalog: prev.catalog.filter((_, i) => i !== idx),
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (file.name.endsWith('.html')) {
          setHtmlCode(content);
          setWorkspaceMode('code');
          toast.success(`Arquivo ${file.name} carregado no Editor!`);
        } else if (file.name.endsWith('.css')) {
          setCssCode((prev) => prev + '\n/* ' + file.name + ' */\n' + content);
          setWorkspaceMode('code');
          toast.success(`Arquivo ${file.name} carregado!`);
        } else if (file.name.endsWith('.js')) {
          setJsCode((prev) => prev + '\n// ' + file.name + '\n' + content);
          setWorkspaceMode('code');
          toast.success(`Arquivo ${file.name} carregado!`);
        }
      };
      reader.readAsText(file);
    });
  };

  const generateCombinedCode = () => {
    let finalHtml = htmlCode;

    if (cssCode.trim()) {
      const styleTag = `<style>\n${cssCode}\n</style>`;
      if (finalHtml.includes('</head>')) {
        finalHtml = finalHtml.replace('</head>', `${styleTag}\n</head>`);
      } else {
        finalHtml = `${styleTag}\n${finalHtml}`;
      }
    }

    let finalJs = jsCode;

    if (protectCode) {
      const protectionScript = `
      // Anti-Clone Protection
      document.addEventListener('contextmenu', event => event.preventDefault());
      document.onkeydown = function(e) {
        if(e.keyCode == 123) return false;
        if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) return false;
        if(e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) return false;
        if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) return false;
        if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) return false;
        if(e.ctrlKey && e.keyCode == 'S'.charCodeAt(0)) return false;
      };`;
      finalJs = `${protectionScript}\n${finalJs}`;
    }

    if (selectedChatbot !== 'none') {
      const bot = chatbots.find((b) => b.id === selectedChatbot);
      if (bot) {
        const chatbotScript = `
        // GhostAI Chatbot Widget
        (function() {
          const style = document.createElement('style');
          style.innerHTML = \`
            .ghost-chat-widget { position: fixed; bottom: 92px; right: 22px; z-index: 9999; font-family: 'Inter', sans-serif; }
            .ghost-chat-btn { width: 58px; height: 58px; border-radius: 50%; background: ${bot.color || '#10B981'}; color: white; border: none; box-shadow: 0 8px 25px rgba(0,0,0,0.35); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
            .ghost-chat-btn:hover { transform: scale(1.06); }
            .ghost-chat-window { position: absolute; bottom: 72px; right: 0; width: 340px; height: 460px; background: #121216; border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); display: none; flex-direction: column; overflow: hidden; }
            .ghost-chat-window.open { display: flex; }
            .ghost-chat-header { background: ${bot.color || '#10B981'}; color: white; padding: 14px 16px; font-weight: 700; display: flex; justify-content: space-between; align-items: center; }
            .ghost-chat-messages { flex: 1; padding: 14px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
            .ghost-msg { max-width: 82%; padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.45; }
            .ghost-msg.bot { background: rgba(255,255,255,0.08); color: #fff; align-self: flex-start; border-bottom-left-radius: 4px; }
            .ghost-msg.user { background: ${bot.color || '#10B981'}; color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
            .ghost-chat-input { display: flex; padding: 10px; border-top: 1px solid rgba(255,255,255,0.1); background: #09090B; }
            .ghost-chat-input input { flex: 1; background: transparent; border: none; color: white; padding: 8px; outline: none; font-size: 13px; }
            .ghost-chat-input button { background: ${bot.color || '#10B981'}; color: white; border: none; padding: 8px 14px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 12px; }
          \`;
          document.head.appendChild(style);
          const widget = document.createElement('div');
          widget.className = 'ghost-chat-widget';
          widget.innerHTML = \`
            <div class="ghost-chat-window" id="ghostChatWindow">
              <div class="ghost-chat-header">
                <span>${bot.name}</span>
                <button onclick="document.getElementById('ghostChatWindow').classList.remove('open')" style="background:none;border:none;color:white;cursor:pointer;font-size:18px;">&times;</button>
              </div>
              <div class="ghost-chat-messages" id="ghostChatMessages">
                <div class="ghost-msg bot">${bot.greeting || 'Olá! Como posso ajudar você hoje?'}</div>
              </div>
              <div class="ghost-chat-input">
                <input type="text" id="ghostChatInput" placeholder="Digite sua dúvida..." onkeypress="if(event.key === 'Enter') window.sendGhostMsg()" />
                <button onclick="window.sendGhostMsg()">Enviar</button>
              </div>
            </div>
            <button class="ghost-chat-btn" onclick="document.getElementById('ghostChatWindow').classList.toggle('open')" title="Assistente IA">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </button>
          \`;
          document.body.appendChild(widget);
          window.sendGhostMsg = function() {
            const input = document.getElementById('ghostChatInput');
            const messages = document.getElementById('ghostChatMessages');
            const text = input.value.trim();
            if(!text) return;
            const userMsg = document.createElement('div');
            userMsg.className = 'ghost-msg user';
            userMsg.innerText = text;
            messages.appendChild(userMsg);
            input.value = '';
            messages.scrollTop = messages.scrollHeight;
            setTimeout(() => {
              const botMsg = document.createElement('div');
              botMsg.className = 'ghost-msg bot';
              botMsg.innerText = "Perfeito! Já registrei sua solicitação. Clique no botão de WhatsApp da página para concluir seu atendimento prioritário.";
              messages.appendChild(botMsg);
              messages.scrollTop = messages.scrollHeight;
            }, 700);
          };
        })();`;
        finalJs = `${finalJs}\n${chatbotScript}`;
      }
    }

    if (finalJs.trim()) {
      const scriptTag = `<script>\n${finalJs}\n</script>`;
      if (finalHtml.includes('</body>')) {
        finalHtml = finalHtml.replace('</body>', `${scriptTag}\n</body>`);
      } else {
        finalHtml = `${finalHtml}\n${scriptTag}`;
      }
    }

    return finalHtml;
  };

  const handleDownloadHtml = () => {
    const combined = generateCombinedCode();
    const blob = new Blob([combined], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(siteName || 'site-profissional').toLowerCase().replace(/[^a-z0-9-_]/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Arquivo HTML completo baixado!');
  };

  const handlePublish = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para publicar um site.');
      return;
    }
    const finalSiteName = (siteName || studioConfig.name || '').trim();
    if (!finalSiteName) {
      toast.error('Por favor, dê um nome ao seu projeto.');
      return;
    }

    setIsPublishing(true);
    try {
      const normalizedCustomSlug = customSlug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-');

      const finalSlug = normalizedCustomSlug
        ? normalizedCustomSlug
        : editingSiteId
        ? editingSiteId
        : `${finalSiteName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;

      // Sistema de segurança contra domínio/slug duplicado (sem qualquer limite de quantidade de sites)
      const [existingSiteSnap, existingHostedSnap] = await Promise.all([
        getDoc(doc(db, 'sites', finalSlug)).catch(() => null),
        getDoc(doc(db, 'hosted_sites', finalSlug)).catch(() => null),
      ]);

      const existingDoc =
        existingSiteSnap && existingSiteSnap.exists()
          ? existingSiteSnap.data()
          : existingHostedSnap && existingHostedSnap.exists()
          ? existingHostedSnap.data()
          : null;

      if (existingDoc) {
        const isOwner =
          existingDoc.userId === user.uid ||
          existingDoc.userId === user.email ||
          user.email === 'willrandrier@gmail.com' ||
          user.email === 'souza.abencoado4@gmail.com';
        const isSameEditingSite = editingSiteId === finalSlug && isOwner;
        if (!isSameEditingSite) {
          toast.error(
            `Este domínio (/s/${finalSlug}) já está em uso! Escolha outro nome no campo "Slug Personalizado do Link".`,
            { duration: 5000 }
          );
          setIsPublishing(false);
          return;
        }
      }

      const finalStudioConfig: SiteStudioConfig = {
        ...studioConfig,
        siteSlug: finalSlug,
      };

      const combinedCode =
        workspaceMode === 'studio'
          ? (() => {
              const baseCompiled = compileTemplateToHtml(finalStudioConfig);
              setHtmlCode(baseCompiled);
              return generateCombinedCode();
            })()
          : generateCombinedCode();

      // Build SHA-256 salted credentials for the establishment owner
      let adminAuthPayload: ClientAdminAuth | null = existingAdminAuth;
      if (enableClientAdmin) {
        if (clientAdminPass.trim()) {
          adminAuthPayload = await createAdminCredentials(
            clientAdminUser.trim() || 'admin',
            clientAdminPass.trim(),
            true
          );
        } else if (existingAdminAuth) {
          adminAuthPayload = {
            ...existingAdminAuth,
            enabled: true,
            username: (clientAdminUser.trim() || existingAdminAuth.username).toLowerCase(),
          };
        } else {
          adminAuthPayload = await createAdminCredentials(
            clientAdminUser.trim() || 'admin',
            'Mudar@123',
            true
          );
        }
      } else if (existingAdminAuth) {
        adminAuthPayload = { ...existingAdminAuth, enabled: false };
      }

      const publicUrl = `${window.location.origin}/s/${finalSlug}`;
      const adminUrl = `${window.location.origin}/painel/${finalSlug}`;

      await setDoc(
        doc(db, 'sites', finalSlug),
        {
          id: finalSlug,
          userId: user.uid,
          name: finalSiteName,
          slug: finalSlug,
          domain: publicUrl,
          domainType: 'subdomain',
          templateId: finalStudioConfig.templateId,
          category: finalStudioConfig.category,
          studioConfig: finalStudioConfig,
          adminAuth: adminAuthPayload,
          html: combinedCode,
          rawHtml: combinedCode,
          rawCss: cssCode,
          rawJs: jsCode,
          protectCode,
          chatbotId: selectedChatbot,
          isActive: true,
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          views: 0,
        },
        { merge: true }
      );

      setEditingSiteId(finalSlug);
      setPublishedUrl(publicUrl);
      setPublishedAdminUrl(enableClientAdmin ? adminUrl : null);
      toast.success('Site e Painel do Estabelecimento publicados com sucesso!');
    } catch (error) {
      console.error('Error publishing site:', error);
      toast.error('Erro ao publicar o site. Tente novamente.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-4 md:p-6 pb-20">
      <div className="max-w-[1600px] mx-auto space-y-5">
        {/* Top Studio Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-[#0E0E11] p-5 rounded-2xl border border-zinc-800/80">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  GhostStudio • Criador de Sites em Tempo Real
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {SITE_TEMPLATES.length} Modelos Prontos
                </span>
              </div>
              <p className="text-xs md:text-sm text-zinc-400 mt-0.5">
                Escolha um modelo do nicho do cliente, troque nome, cores, fotos e cardápio/serviços em tempo real e publique em 1 clique.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto justify-end">
            {/* Switch Studio vs Code Editor */}
            <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setWorkspaceMode('studio')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  workspaceMode === 'studio'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Studio Visual (Tempo Real)
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceMode('code')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  workspaceMode === 'code'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Editor HTML/CSS/JS
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowTemplateGalleryModal(true)}
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              Catálogo ({SITE_TEMPLATES.length} Modelos)
            </button>

            <button
              type="button"
              onClick={handleDownloadHtml}
              className="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
              title="Baixar arquivo HTML único pronto para hospedar"
            >
              <Download className="w-4 h-4" />
              Baixar HTML
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isPublishing ? (
                <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              {isPublishing ? 'Publicando...' : 'Publicar e Gerar Link'}
            </button>
          </div>
        </div>

        {/* Published URL & Client Admin Delivery Kit Banner */}
        {publishedUrl && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-400 text-sm">
                    Site Publicado & Kit do Cliente Pronto para Entrega!
                  </h3>
                  <div className="mt-1 space-y-1">
                    <p className="text-xs text-zinc-200 font-mono break-all">
                      🌐 <strong>Site Público:</strong> {publishedUrl}
                    </p>
                    {publishedAdminUrl && (
                      <p className="text-xs text-emerald-300 font-mono break-all">
                        🔐 <strong>Painel Admin do Cliente:</strong> {publishedAdminUrl} &nbsp;|&nbsp;{' '}
                        <strong>Login:</strong> {clientAdminUser} &nbsp;|&nbsp;{' '}
                        <strong>Senha:</strong> {clientAdminPass || '(mantida)'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(publishedUrl);
                    toast.success('Link do site copiado!');
                  }}
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Copiar Site
                </button>

                {publishedAdminUrl && (
                  <>
                    <a
                      href={publishedAdminUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" /> Abrir Painel do Lojista
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        const msg = `🚀 *ENTREGA OFICIAL — ${studioConfig.name.toUpperCase()}*\n\nSeu novo site e painel de gestão já estão no ar!\n\n🌐 *Link do Site Oficial:*\n${publishedUrl}\n\n🔐 *Painel Administrativo do Estabelecimento:*\n${publishedAdminUrl}\n👤 *Usuário:* ${clientAdminUser}\n🔑 *Senha:* ${clientAdminPass || 'Sua senha configurada'}\n\nPelo Painel Administrativo você pode alterar preços, adicionar itens, pausar produtos esgotados e mudar o status de Aberto/Fechado em tempo real!`;
                        navigator.clipboard.writeText(msg);
                        toast.success('Kit de entrega com Site + Painel Admin + Senha copiado para enviar no WhatsApp!');
                      }}
                      className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-950 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copiar Kit p/ WhatsApp do Cliente
                    </button>
                  </>
                )}

                <a
                  href={publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Abrir Site
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setEditingSiteId(null);
                    setPublishedUrl(null);
                    setPublishedAdminUrl(null);
                    setCustomSlug('');
                    setShowTemplateGalleryModal(true);
                  }}
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Criar Outro Site
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Split Layout: Left Control Panel + Right Live Preview */}
        <div
          className={`grid gap-5 ${
            isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'
          }`}
        >
          {/* LEFT PANEL: STUDIO VISUAL OR CODE EDITOR */}
          {!isFullscreen && (
            <div className="lg:col-span-5 xl:col-span-5 flex flex-col bg-[#0E0E11] border border-zinc-800/90 rounded-2xl overflow-hidden h-[780px]">
              {workspaceMode === 'studio' ? (
                <>
                  {/* Studio Navigation Tabs */}
                  <div className="grid grid-cols-6 border-b border-zinc-800 bg-zinc-950/60 p-1.5 gap-1">
                    {[
                      { id: 'templates', label: 'Modelo', icon: Layout },
                      { id: 'colors', label: 'Cores', icon: Palette },
                      { id: 'texts', label: 'Textos', icon: Type },
                      { id: 'catalog', label: 'Itens', icon: ShoppingBag },
                      { id: 'media', label: 'Fotos', icon: ImageIcon },
                      { id: 'extras', label: 'Painel Adm', icon: Lock },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const active = activeStudioTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveStudioTab(tab.id as StudioTab)}
                          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition-all gap-1 ${
                            active
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Studio Tab Content */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                    {/* TAB 1: TEMPLATES & LAYOUT */}
                    {activeStudioTab === 'templates' && (
                      <div className="space-y-5">
                        <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                              Modelo Ativo
                            </span>
                            <h3 className="text-sm font-bold text-white">
                              {studioConfig.templateTitle}
                            </h3>
                            <p className="text-xs text-zinc-400">{studioConfig.category}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowTemplateGalleryModal(true)}
                            className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-xs font-bold whitespace-nowrap"
                          >
                            Ver Todos (+55)
                          </button>
                        </div>

                        {/* Layout Structure Selector */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                            Estrutura Visual do Site (Layout)
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {LAYOUT_VARIANTS.map((variant) => (
                              <button
                                key={variant.id}
                                type="button"
                                onClick={() => updateConfig('layoutVariant', variant.id)}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                  studioConfig.layoutVariant === variant.id
                                    ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                }`}
                              >
                                <div className="text-xs font-bold text-white">{variant.name}</div>
                                <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                                  {variant.desc}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Interaction Mode Selector */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                            Modo de Conversão dos Botões
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'cart', label: 'Sacola / Delivery', desc: 'Soma itens p/ WhatsApp' },
                              { id: 'booking', label: 'Agendamento', desc: 'Escolhe dia e horário' },
                              { id: 'whatsapp', label: 'Orçamento Direto', desc: 'Abre conversa rápida' },
                            ].map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => updateConfig('interactionMode', m.id as InteractionMode)}
                                className={`p-2.5 rounded-xl border text-left transition-all ${
                                  studioConfig.interactionMode === m.id
                                    ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                }`}
                              >
                                <div className="text-xs font-bold text-white">{m.label}</div>
                                <div className="text-[10px] text-zinc-400 mt-0.5">{m.desc}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Quick Niche Filter & Template List */}
                        <div className="space-y-3 pt-2 border-t border-zinc-800">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                              Trocar Modelo Rápido ({filteredTemplates.length})
                            </label>
                          </div>

                          <div className="relative">
                            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={templateSearch}
                              onChange={(e) => setTemplateSearch(e.target.value)}
                              placeholder="Buscar nicho (ex: pizzaria, dentista, barbearia, advogado...)"
                              className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                            />
                          </div>

                          <div className="flex gap-1.5 overflow-x-auto pb-1.5 custom-scrollbar">
                            {TEMPLATE_CATEGORIES.map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                                  selectedCategory === cat
                                    ? 'bg-white text-zinc-950'
                                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>

                          <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1 custom-scrollbar">
                            {filteredTemplates.map((tpl) => {
                              const isSelected = tpl.templateId === studioConfig.templateId;
                              return (
                                <button
                                  key={tpl.templateId}
                                  type="button"
                                  onClick={() => handleSelectTemplate(tpl)}
                                  className={`w-full p-2.5 rounded-xl border flex items-center gap-3 text-left transition-all ${
                                    isSelected
                                      ? 'bg-emerald-500/10 border-emerald-500/50'
                                      : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700'
                                  }`}
                                >
                                  <img
                                    src={tpl.heroImage}
                                    alt={tpl.templateTitle}
                                    className="w-12 h-12 rounded-lg object-cover shrink-0 border border-zinc-700"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: tpl.primaryColor }}
                                      />
                                      <p className="text-xs font-bold text-white truncate">
                                        {tpl.templateTitle}
                                      </p>
                                    </div>
                                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                      {tpl.category} • {tpl.name}
                                    </p>
                                  </div>
                                  <span className="text-[11px] font-bold text-emerald-400 shrink-0">
                                    {isSelected ? 'Ativo' : 'Usar →'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: REAL-TIME COLORS & TYPOGRAPHY */}
                    {activeStudioTab === 'colors' && (
                      <div className="space-y-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                            Paletas de Cores Instantâneas (1 Clique)
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {COLOR_PALETTES.map((pal) => (
                              <button
                                key={pal.id}
                                type="button"
                                onClick={() => applyColorPalette(pal)}
                                className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-600 flex items-center gap-2.5 text-left transition-all"
                              >
                                <div className="flex -space-x-1.5 shrink-0">
                                  <span
                                    className="w-5 h-5 rounded-full border border-black/40"
                                    style={{ backgroundColor: pal.primary }}
                                  />
                                  <span
                                    className="w-5 h-5 rounded-full border border-black/40"
                                    style={{ backgroundColor: pal.background }}
                                  />
                                  <span
                                    className="w-5 h-5 rounded-full border border-black/40"
                                    style={{ backgroundColor: pal.surface }}
                                  />
                                </div>
                                <span className="text-xs font-semibold text-zinc-200 truncate">
                                  {pal.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-zinc-800">
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                            Personalização Fina de Cores (Tempo Real)
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { key: 'primaryColor', label: 'Cor Principal / Botões' },
                              { key: 'secondaryColor', label: 'Cor Secundária / Destaques' },
                              { key: 'backgroundColor', label: 'Fundo da Página' },
                              { key: 'surfaceColor', label: 'Fundo dos Cards / Blocos' },
                              { key: 'textColor', label: 'Cor dos Textos' },
                            ].map((c) => {
                              const val = studioConfig[c.key as keyof SiteStudioConfig] as string;
                              return (
                                <div
                                  key={c.key}
                                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-2"
                                >
                                  <div>
                                    <span className="block text-[11px] font-semibold text-zinc-300">
                                      {c.label}
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                                      {val}
                                    </span>
                                  </div>
                                  <input
                                    type="color"
                                    value={val}
                                    onChange={(e) =>
                                      updateConfig(c.key as keyof SiteStudioConfig, e.target.value as any)
                                    }
                                    className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Typography Selector */}
                        <div className="pt-3 border-t border-zinc-800">
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                            Tipografia / Fonte do Site
                          </label>
                          <div className="grid grid-cols-1 gap-2">
                            {FONT_PRESETS.map((f) => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => updateConfig('fontFamily', f.id)}
                                className={`px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between ${
                                  studioConfig.fontFamily === f.id
                                    ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                                }`}
                              >
                                <span className="text-xs font-bold">{f.label}</span>
                                {studioConfig.fontFamily === f.id && (
                                  <Check className="w-4 h-4 text-emerald-400" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Border Radius Selector */}
                        <div className="pt-3 border-t border-zinc-800">
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                            Formato dos Botões & Cards
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { val: '0px', label: 'Reto (0px)' },
                              { val: '8px', label: 'Suave (8px)' },
                              { val: '16px', label: 'Moderno (16px)' },
                              { val: '24px', label: 'Curvo (24px)' },
                            ].map((r) => (
                              <button
                                key={r.val}
                                type="button"
                                onClick={() => updateConfig('borderRadius', r.val as any)}
                                className={`py-2 px-2 rounded-xl border text-xs font-bold ${
                                  studioConfig.borderRadius === r.val
                                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                                }`}
                              >
                                {r.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: BRAND, HEADLINES & CONTACT INFO */}
                    {activeStudioTab === 'texts' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-300 mb-1">
                            Nome da Empresa / Negócio
                          </label>
                          <input
                            type="text"
                            value={studioConfig.name}
                            onChange={(e) => {
                              updateConfig('name', e.target.value);
                              updateConfig('aboutTitle', `Por que escolher a ${e.target.value}?`);
                              updateConfig(
                                'footerText',
                                `© ${new Date().getFullYear()} ${e.target.value}. Todos os direitos reservados.`
                              );
                            }}
                            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-zinc-300 mb-1">
                            Selo de Destaque Superior (Eyebrow)
                          </label>
                          <input
                            type="text"
                            value={studioConfig.eyebrow}
                            onChange={(e) => updateConfig('eyebrow', e.target.value)}
                            className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-zinc-300 mb-1">
                            Título Principal (Headline)
                          </label>
                          <textarea
                            rows={2}
                            value={studioConfig.headline}
                            onChange={(e) => updateConfig('headline', e.target.value)}
                            className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-zinc-300 mb-1">
                            Subtítulo Explicativo
                          </label>
                          <textarea
                            rows={2}
                            value={studioConfig.subheadline}
                            onChange={(e) => updateConfig('subheadline', e.target.value)}
                            className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-zinc-300 mb-1">
                              Texto do Botão Principal
                            </label>
                            <input
                              type="text"
                              value={studioConfig.ctaText}
                              onChange={(e) => updateConfig('ctaText', e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-300 mb-1">
                              Título da Seção de Itens
                            </label>
                            <input
                              type="text"
                              value={studioConfig.catalogTitle}
                              onChange={(e) => updateConfig('catalogTitle', e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                            />
                          </div>
                        </div>

                        <div className="pt-3 border-t border-zinc-800 grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-emerald-400 mb-1">
                              WhatsApp (c/ DDD, números)
                            </label>
                            <input
                              type="text"
                              value={studioConfig.whatsapp}
                              onChange={(e) => updateConfig('whatsapp', e.target.value)}
                              placeholder="5511999999999"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-300 mb-1">
                              Telefone Exibido
                            </label>
                            <input
                              type="text"
                              value={studioConfig.phone}
                              onChange={(e) => updateConfig('phone', e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-300 mb-1">
                              Cidade / UF
                            </label>
                            <input
                              type="text"
                              value={studioConfig.city}
                              onChange={(e) => updateConfig('city', e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-300 mb-1">
                              Horário de Atendimento
                            </label>
                            <input
                              type="text"
                              value={studioConfig.hours}
                              onChange={(e) => updateConfig('hours', e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-zinc-300 mb-1">
                            Endereço Completo
                          </label>
                          <input
                            type="text"
                            value={studioConfig.address}
                            onChange={(e) => updateConfig('address', e.target.value)}
                            className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-zinc-300 mb-1">
                            Sobre a Empresa
                          </label>
                          <textarea
                            rows={3}
                            value={studioConfig.aboutText}
                            onChange={(e) => updateConfig('aboutText', e.target.value)}
                            className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* TAB 4: CATALOG / MENU / SERVICES */}
                    {activeStudioTab === 'catalog' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                              Produtos, Cardápio ou Serviços ({studioConfig.catalog.length})
                            </h3>
                            <p className="text-[11px] text-zinc-500">
                              Edite preços, nomes, fotos e descrições em tempo real.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddCatalogItem}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Adicionar Item
                          </button>
                        </div>

                        <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer">
                          <span className="text-xs font-semibold text-zinc-200">
                            Exibir preços nos cards
                          </span>
                          <input
                            type="checkbox"
                            checked={studioConfig.showPrices}
                            onChange={(e) => updateConfig('showPrices', e.target.checked)}
                            className="w-4 h-4 accent-emerald-500"
                          />
                        </label>

                        <div className="space-y-3">
                          {studioConfig.catalog.map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold text-emerald-400">
                                  Item #{idx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCatalogItem(idx)}
                                  className="text-zinc-500 hover:text-red-400 p-1"
                                  title="Remover item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) =>
                                    handleUpdateCatalogItem(idx, 'name', e.target.value)
                                  }
                                  placeholder="Nome do produto/serviço"
                                  className="col-span-2 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                                />
                                <input
                                  type="text"
                                  value={item.price}
                                  onChange={(e) =>
                                    handleUpdateCatalogItem(idx, 'price', e.target.value)
                                  }
                                  placeholder="Preço"
                                  className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-emerald-400 font-bold"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={item.category}
                                  onChange={(e) =>
                                    handleUpdateCatalogItem(idx, 'category', e.target.value)
                                  }
                                  placeholder="Categoria (ex: Destaques)"
                                  className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300"
                                />
                                <input
                                  type="text"
                                  value={item.badge || ''}
                                  onChange={(e) =>
                                    handleUpdateCatalogItem(idx, 'badge', e.target.value)
                                  }
                                  placeholder="Selo (ex: Mais Pedido)"
                                  className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300"
                                />
                              </div>

                              <textarea
                                rows={2}
                                value={item.description}
                                onChange={(e) =>
                                  handleUpdateCatalogItem(idx, 'description', e.target.value)
                                }
                                placeholder="Descrição do item..."
                                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300"
                              />

                              <input
                                type="text"
                                value={item.image}
                                onChange={(e) =>
                                  handleUpdateCatalogItem(idx, 'image', e.target.value)
                                }
                                placeholder="URL da foto do produto/serviço"
                                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-[11px] text-zinc-400 font-mono"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB 5: MEDIA, PHOTOS & SECTION TOGGLES */}
                    {activeStudioTab === 'media' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-300 mb-1">
                            URL da Logo (Opcional — deixe vazio para usar ícone moderno)
                          </label>
                          <input
                            type="text"
                            value={studioConfig.logoUrl}
                            onChange={(e) => updateConfig('logoUrl', e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-zinc-300 mb-1">
                            Foto Principal de Capa (Hero Image)
                          </label>
                          <input
                            type="text"
                            value={studioConfig.heroImage}
                            onChange={(e) => updateConfig('heroImage', e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono mb-2"
                          />
                          <img
                            src={studioConfig.heroImage}
                            alt="Hero Preview"
                            className="w-full h-36 object-cover rounded-xl border border-zinc-800"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-zinc-300 mb-1">
                            Diferenciais Rápidos (separados por vírgula)
                          </label>
                          <input
                            type="text"
                            value={studioConfig.perks.join(', ')}
                            onChange={(e) =>
                              updateConfig(
                                'perks',
                                e.target.value
                                  .split(',')
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                              )
                            }
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
                          />
                        </div>

                        <div className="pt-3 border-t border-zinc-800 space-y-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                            Seções Visíveis na Página
                          </label>
                          {[
                            { key: 'showGallery', label: 'Galeria de Fotos & Estrutura' },
                            { key: 'showReviews', label: 'Depoimentos e Avaliações 5 Estrelas' },
                            { key: 'showFaq', label: 'Perguntas Frequentes (FAQ)' },
                            { key: 'showFloatingWhatsapp', label: 'Botão Flutuante de WhatsApp' },
                          ].map((sec) => (
                            <label
                              key={sec.key}
                              className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer"
                            >
                              <span className="text-xs font-semibold text-zinc-200">
                                {sec.label}
                              </span>
                              <input
                                type="checkbox"
                                checked={Boolean(studioConfig[sec.key as keyof SiteStudioConfig])}
                                onChange={(e) =>
                                  updateConfig(sec.key as keyof SiteStudioConfig, e.target.checked as any)
                                }
                                className="w-4 h-4 accent-emerald-500"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB 6: CLIENT ADMIN PANEL, SLUG, ANTI-CLONE & CHATBOT */}
                    {activeStudioTab === 'extras' && (
                      <div className="space-y-4">
                        {/* Client Establishment Admin Panel Configuration */}
                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 space-y-3.5">
                          <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                <Lock className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="block text-xs font-bold text-white">
                                  Painel Admin do Cliente (Lojista)
                                </span>
                                <span className="text-[10px] text-emerald-400 font-mono">
                                  Blindado com SHA-256 (Invisível no F12)
                                </span>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={enableClientAdmin}
                              onChange={(e) => setEnableClientAdmin(e.target.checked)}
                              className="w-4 h-4 accent-emerald-500"
                            />
                          </label>

                          {enableClientAdmin && (
                            <div className="space-y-3 pt-2 border-t border-emerald-500/20">
                              <p className="text-[11px] text-zinc-300 leading-relaxed">
                                Crie o login e a senha para o dono do estabelecimento editar cardápio, preços, promoções e status Aberto/Fechado em{' '}
                                <code className="text-emerald-400">/painel/slug-do-site</code>.
                              </p>

                              <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                                    Login do Cliente
                                  </label>
                                  <input
                                    type="text"
                                    value={clientAdminUser}
                                    onChange={(e) => setClientAdminUser(e.target.value)}
                                    placeholder="ex: brutoburger"
                                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                                    Senha do Cliente
                                  </label>
                                  <input
                                    type="text"
                                    value={clientAdminPass}
                                    onChange={(e) => setClientAdminPass(e.target.value)}
                                    placeholder={existingAdminAuth ? 'Nova senha (opcional)' : 'Ex: Mudar@123'}
                                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-emerald-400 font-mono font-bold"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                                    Status Inicial da Loja
                                  </label>
                                  <select
                                    value={studioConfig.storeStatus || 'open'}
                                    onChange={(e) => updateConfig('storeStatus', e.target.value as any)}
                                    className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
                                  >
                                    <option value="open">🟢 Aberto Agora</option>
                                    <option value="busy">⚡ Horário de Pico</option>
                                    <option value="closed">🔴 Fechado</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                                    Tempo de Fila / Entrega
                                  </label>
                                  <input
                                    type="text"
                                    value={studioConfig.waitTimeText || ''}
                                    onChange={(e) => updateConfig('waitTimeText', e.target.value)}
                                    placeholder="Ex: Entrega 35 min"
                                    className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                                  Barra de Promoção no Topo (Opcional)
                                </label>
                                <input
                                  type="text"
                                  value={studioConfig.promoBannerText || ''}
                                  onChange={(e) => updateConfig('promoBannerText', e.target.value)}
                                  placeholder="Ex: 🔥 Combo Duplo + Batata Grátis nos pedidos hoje!"
                                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
                                />
                              </div>

                              <label className="flex items-center justify-between pt-1 cursor-pointer">
                                <span className="text-[11px] text-zinc-300">
                                  Mostrar link discreto "🔒 Área do Estabelecimento" no rodapé
                                </span>
                                <input
                                  type="checkbox"
                                  checked={Boolean(studioConfig.showAdminLinkInFooter)}
                                  onChange={(e) => updateConfig('showAdminLinkInFooter', e.target.checked)}
                                  className="w-4 h-4 accent-emerald-500"
                                />
                              </label>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-zinc-300 mb-1">
                            Slug Personalizado do Link (Opcional)
                          </label>
                          <input
                            type="text"
                            value={customSlug}
                            onChange={(e) => setCustomSlug(e.target.value)}
                            placeholder="ex: hamburgueria-do-joao"
                            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono"
                          />
                        </div>

                        <label className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <div>
                              <span className="block text-xs font-bold text-white">
                                Proteção Anti-Clone Ativa
                              </span>
                              <span className="text-[11px] text-zinc-400">
                                Bloqueia botão direito, F12 e inspeção de código
                              </span>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={protectCode}
                            onChange={(e) => setProtectCode(e.target.checked)}
                            className="w-4 h-4 accent-emerald-500"
                          />
                        </label>

                        <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-white">
                            <Bot className="w-4 h-4 text-emerald-400" />
                            <span>Integrar Chatbot IA no Site</span>
                          </div>
                          <select
                            value={selectedChatbot}
                            onChange={(e) => setSelectedChatbot(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                          >
                            <option value="none">Sem Chatbot Adicional</option>
                            {chatbots.map((bot) => (
                              <option key={bot.id} value={bot.id}>
                                {bot.name} ({bot.niche || 'Personalizado'})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                          <p className="text-xs font-bold text-zinc-200">
                            Precisa editar o código HTML/CSS diretamente?
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            Todo o site gerado pelo Studio já está compilado e pronto no Editor de Código.
                          </p>
                          <button
                            type="button"
                            onClick={() => setWorkspaceMode('code')}
                            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                          >
                            <Code className="w-3.5 h-3.5" /> Abrir no Editor HTML/CSS/JS
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* RAW CODE EDITOR MODE */
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-950">
                    <div className="flex gap-1.5">
                      {(['html', 'css', 'js'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveCodeTab(tab)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                            activeCodeTab === tab
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        multiple
                        accept=".html,.css,.js"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" /> Importar Arquivo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setHtmlCode(compileTemplateToHtml(studioConfig));
                          toast.success('Código sincronizado com o Studio Visual!');
                        }}
                        className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 rounded-lg text-xs font-semibold flex items-center gap-1"
                        title="Regerar HTML a partir do Studio"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 border-b border-zinc-800 bg-zinc-900/40 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="Nome do Projeto"
                      className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                    />
                    <input
                      type="text"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                      placeholder="Slug da URL (opcional)"
                      className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                    />
                  </div>

                  <div className="flex-1 relative">
                    {activeCodeTab === 'html' && (
                      <textarea
                        value={htmlCode}
                        onChange={(e) => setHtmlCode(e.target.value)}
                        className="w-full h-full bg-[#09090B] text-zinc-200 font-mono text-xs p-4 focus:outline-none resize-none"
                        spellCheck="false"
                      />
                    )}
                    {activeCodeTab === 'css' && (
                      <textarea
                        value={cssCode}
                        onChange={(e) => setCssCode(e.target.value)}
                        placeholder="/* CSS Extra Opcional */"
                        className="w-full h-full bg-[#09090B] text-zinc-200 font-mono text-xs p-4 focus:outline-none resize-none"
                        spellCheck="false"
                      />
                    )}
                    {activeCodeTab === 'js' && (
                      <textarea
                        value={jsCode}
                        onChange={(e) => setJsCode(e.target.value)}
                        placeholder="// JavaScript Extra Opcional"
                        className="w-full h-full bg-[#09090B] text-zinc-200 font-mono text-xs p-4 focus:outline-none resize-none"
                        spellCheck="false"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RIGHT PANEL: REAL-TIME INTERACTIVE PREVIEW */}
          <div
            className={`${
              isFullscreen ? 'col-span-1' : 'lg:col-span-7 xl:col-span-7'
            } flex flex-col bg-[#0E0E11] border border-zinc-800/90 rounded-2xl overflow-hidden h-[780px]`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/70">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <span className="text-xs font-mono text-zinc-400 truncate max-w-[260px] sm:max-w-md">
                  https://ghostai.studio/{(customSlug || studioConfig.name || 'preview').toLowerCase().replace(/[^a-z0-9-]/g, '-')}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Eye className="w-3 h-3" /> Tempo Real
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    previewMode === 'desktop'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Visualização Desktop"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    previewMode === 'mobile'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Visualização Celular"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-zinc-800 mx-1" />
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                  title={isFullscreen ? 'Sair da Tela Cheia' : 'Expandir Preview'}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 bg-zinc-950 flex items-center justify-center overflow-hidden p-2">
              <div
                className={`h-full transition-all duration-300 bg-white overflow-hidden shadow-2xl ${
                  previewMode === 'mobile'
                    ? 'w-[390px] max-h-[710px] rounded-[34px] border-[7px] border-zinc-800'
                    : 'w-full rounded-xl'
                }`}
              >
                <iframe
                  srcDoc={generateCombinedCode()}
                  title="Live Studio Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-modals"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULL TEMPLATE GALLERY MODAL (+55 TEMPLATES) */}
      {showTemplateGalleryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0E0E11] border border-zinc-800 rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Biblioteca Completa GhostStudio
                </span>
                <h2 className="text-xl font-bold text-white">
                  Escolha um Modelo Pronto por Nicho ({SITE_TEMPLATES.length} Modelos)
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="Buscar nicho..."
                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowTemplateGalleryModal(false)}
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold"
                >
                  Fechar ✕
                </button>
              </div>
            </div>

            <div className="px-5 py-3 border-b border-zinc-800 flex gap-2 overflow-x-auto custom-scrollbar bg-zinc-950/50">
              {TEMPLATE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 custom-scrollbar">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.templateId}
                  className="group bg-zinc-900/70 border border-zinc-800 hover:border-emerald-500/60 rounded-2xl overflow-hidden flex flex-col transition-all"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={tpl.heroImage}
                      alt={tpl.templateTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/75 text-white backdrop-blur-md border border-white/10">
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
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-white text-sm">{tpl.templateTitle}</h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{tpl.headline}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectTemplate(tpl)}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-bold text-xs transition-colors"
                    >
                      Carregar Este Modelo no Studio →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
