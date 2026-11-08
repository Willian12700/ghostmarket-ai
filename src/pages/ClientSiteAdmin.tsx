import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useToastStore } from '@/store/toastStore';
import {
  SITE_TEMPLATES,
  SiteStudioConfig,
  compileTemplateToHtml,
} from '@/data/siteTemplates';
import {
  ClientAdminAuth,
  verifyAdminCredentials,
} from '@/utils/clientAdminCrypto';
import {
  Lock,
  ShieldCheck,
  Store,
  ShoppingBag,
  Settings,
  Plus,
  Trash2,
  Save,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  LogOut,
  Phone,
  MapPin,
  Flame,
  RefreshCw,
} from 'lucide-react';

export const ClientSiteAdmin: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const { addToast } = useToastStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siteDocCollection, setSiteDocCollection] = useState<'sites' | 'hosted_sites'>('sites');
  const [siteData, setSiteData] = useState<any>(null);
  const [studioConfig, setStudioConfig] = useState<SiteStudioConfig>(SITE_TEMPLATES[0]);
  const [adminAuth, setAdminAuth] = useState<ClientAdminAuth | null>(null);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number>(0);

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState<'status' | 'catalog' | 'info' | 'preview'>('catalog');

  useEffect(() => {
    const fetchSite = async () => {
      if (!siteId) return;
      setLoading(true);
      try {
        let snap = await getDoc(doc(db, 'sites', siteId));
        let col: 'sites' | 'hosted_sites' = 'sites';

        if (!snap.exists()) {
          snap = await getDoc(doc(db, 'hosted_sites', siteId));
          col = 'hosted_sites';
        }

        if (snap.exists()) {
          const data = snap.data();
          setSiteDocCollection(col);
          setSiteData({ id: snap.id, ...data });

          // Load or reconstruct studioConfig
          if (data.studioConfig) {
            setStudioConfig({
              ...SITE_TEMPLATES[0],
              ...data.studioConfig,
              siteSlug: snap.id,
            });
          } else {
            const matched =
              SITE_TEMPLATES.find((t) => t.templateId === data.templateId) || SITE_TEMPLATES[0];
            setStudioConfig({
              ...structuredClone(matched),
              name: data.name || snap.id,
              siteSlug: snap.id,
            });
          }

          if (data.adminAuth) {
            setAdminAuth(data.adminAuth);
            const savedToken = sessionStorage.getItem(`client_admin_auth_${snap.id}`);
            if (savedToken && savedToken === data.adminAuth.passwordHash) {
              setIsAuthenticated(true);
            }
          }
        }
      } catch (err) {
        console.error('Error loading establishment admin:', err);
        addToast('Erro ao carregar dados do estabelecimento.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [siteId, addToast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Date.now() < lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      addToast(`Muitas tentativas. Aguarde ${remaining}s para tentar novamente.`, 'error');
      return;
    }

    if (!usernameInput.trim() || !passwordInput) {
      addToast('Preencha o login e a senha de acesso.', 'error');
      return;
    }

    setVerifying(true);
    try {
      const valid = await verifyAdminCredentials(usernameInput, passwordInput, adminAuth);
      if (valid && adminAuth && siteId) {
        sessionStorage.setItem(`client_admin_auth_${siteId}`, adminAuth.passwordHash);
        setIsAuthenticated(true);
        setFailedAttempts(0);
        addToast(`Bem-vindo ao painel de gestão da ${studioConfig.name}!`, 'success');
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= 5) {
          setLockoutUntil(Date.now() + 60000);
          addToast('Acesso bloqueado temporariamente por 60 segundos.', 'error');
        } else {
          addToast('Usuário ou senha incorretos.', 'error');
        }
      }
    } catch (err) {
      console.error('Auth verification error:', err);
      addToast('Erro ao validar credenciais.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
    if (siteId) {
      sessionStorage.removeItem(`client_admin_auth_${siteId}`);
    }
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  const updateConfig = <K extends keyof SiteStudioConfig>(key: K, value: SiteStudioConfig[K]) => {
    setStudioConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleUpdateCatalogItem = (idx: number, field: string, value: any) => {
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
        {
          id: `item-${Date.now()}`,
          name: 'Novo Produto ou Serviço',
          description: 'Descrição completa dos ingredientes ou detalhes do serviço.',
          price: 'R$ 39,90',
          category: prev.catalog[0]?.category || 'Destaques',
          image: prev.heroImage,
          badge: 'Novidade',
          available: true,
        },
        ...prev.catalog,
      ],
    }));
    addToast('Novo item adicionado! Edite os detalhes e clique em Salvar.', 'success');
  };

  const handleRemoveCatalogItem = (idx: number) => {
    if (!window.confirm('Deseja remover este item do cardápio/catálogo?')) return;
    setStudioConfig((prev) => ({
      ...prev,
      catalog: prev.catalog.filter((_, i) => i !== idx),
    }));
  };

  const livePreviewHtml = useMemo(() => {
    return compileTemplateToHtml({
      ...studioConfig,
      siteSlug: siteId,
    });
  }, [studioConfig, siteId]);

  const handleSaveChanges = async () => {
    if (!siteId || !siteData) return;
    setSaving(true);
    try {
      const finalConfig: SiteStudioConfig = {
        ...studioConfig,
        siteSlug: siteId,
      };
      let compiledHtml = compileTemplateToHtml(finalConfig);

      if (siteData.protectCode) {
        const protectionScript = `<script>
          document.addEventListener('contextmenu', event => event.preventDefault());
          document.onkeydown = function(e) {
            if(e.keyCode == 123) return false;
            if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) return false;
            if(e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) return false;
            if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) return false;
            if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) return false;
          };
        </script>`;
        compiledHtml = compiledHtml.replace('</body>', `${protectionScript}\n</body>`);
      }

      const ref = doc(db, siteDocCollection, siteId);
      await updateDoc(ref, {
        studioConfig: finalConfig,
        rawHtml: compiledHtml,
        html: compiledHtml,
        updatedAt: new Date().toISOString(),
      });

      addToast('Site atualizado em tempo real com sucesso!', 'success');
    } catch (err) {
      console.error('Error saving establishment updates:', err);
      addToast('Erro ao salvar alterações. Tente novamente.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center text-white">
        <div className="w-9 h-9 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-zinc-400">Carregando Painel do Estabelecimento...</p>
      </div>
    );
  }

  if (!siteData) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
          <Store className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold mb-2">Estabelecimento não encontrado</h1>
        <p className="text-sm text-zinc-400 max-w-md mb-6">
          Verifique se o endereço do painel foi digitado corretamente.
        </p>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200 hover:text-white"
        >
          Voltar ao Início
        </Link>
      </div>
    );
  }

  if (!adminAuth || !adminAuth.enabled) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold mb-2">Painel Administrativo Desativado</h1>
        <p className="text-sm text-zinc-400 max-w-md mb-6">
          O administrador responsável pela criação do site ainda não habilitou as credenciais de lojista para <strong className="text-white">{studioConfig.name}</strong>.
        </p>
        <a
          href={`/s/${siteId}`}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 text-xs font-bold hover:bg-emerald-400 transition-colors"
        >
          Ver Site Público
        </a>
      </div>
    );
  }

  // LOGIN SCREEN (SHA-256 Protected)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div
          className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[130px] opacity-20 pointer-events-none"
          style={{ backgroundColor: studioConfig.primaryColor || '#10B981' }}
        />

        <div className="w-full max-w-md bg-[#0E0E11] border border-zinc-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
          <div className="flex flex-col items-center text-center mb-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold mb-3 shadow-lg"
              style={{ backgroundColor: studioConfig.primaryColor || '#10B981' }}
            >
              <Store className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono uppercase tracking-wider text-emerald-400 mb-2">
              <ShieldCheck className="w-3 h-3" /> Criptografia SHA-256 Ativa
            </span>
            <h1 className="text-xl font-bold text-white">{studioConfig.name}</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Painel Administrativo Exclusivo do Estabelecimento
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Usuário / Login do Estabelecimento
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Ex: admin"
                autoComplete="username"
                className="w-full h-11 px-3.5 rounded-xl bg-[#09090B] border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Digite sua senha segura"
                  autoComplete="current-password"
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-[#09090B] border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={verifying || Date.now() < lockoutUntil}
              className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Lock className="w-4 h-4" />
              <span>{verifying ? 'Verificando Criptografia...' : 'Acessar Painel do Lojista'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
            <a
              href={`/s/${siteId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 flex items-center gap-1"
            >
              <span>Ver site público</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>Protegido contra inspeção</span>
          </div>
        </div>
      </div>
    );
  }

  const publicSiteUrl = `${window.location.origin}/s/${siteId}`;
  const availableCount = studioConfig.catalog.filter((i) => i.available !== false).length;
  const unavailableCount = studioConfig.catalog.length - availableCount;

  return (
    <div className="min-h-screen bg-[#09090B] text-white pb-24">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 bg-[#09090B]/90 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
              style={{ backgroundColor: studioConfig.primaryColor || '#10B981' }}
            >
              <Store className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white truncate">
                  {studioConfig.name}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                  PAINEL DO LOJISTA
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                Gerencie preços, disponibilidade, status de funcionamento e promoções em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={publicSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition-colors"
            >
              <span>Ver Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={saving}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              {saving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{saving ? 'Salvando...' : 'Salvar no Site Agora'}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              title="Sair do Painel"
              className="h-9 w-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Quick Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-4">
            <span className="text-[11px] text-zinc-400">Status Atual na Loja</span>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  studioConfig.storeStatus === 'closed'
                    ? 'bg-red-500'
                    : studioConfig.storeStatus === 'busy'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400 animate-pulse'
                }`}
              />
              <strong className="text-sm text-white">
                {studioConfig.storeStatus === 'closed'
                  ? 'Fechado Agora'
                  : studioConfig.storeStatus === 'busy'
                  ? 'Horário de Pico'
                  : 'Aberto Agora'}
              </strong>
            </div>
          </div>

          <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-4">
            <span className="text-[11px] text-zinc-400">Itens Ativos no Cardápio/Catálogo</span>
            <div className="mt-1 flex items-baseline gap-2">
              <strong className="text-xl font-bold text-emerald-400 tabular-nums">
                {availableCount}
              </strong>
              {unavailableCount > 0 && (
                <span className="text-xs text-red-400">({unavailableCount} esgotados)</span>
              )}
            </div>
          </div>

          <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-4">
            <span className="text-[11px] text-zinc-400">Visitas Reais no Site</span>
            <div className="mt-1">
              <strong className="text-xl font-bold text-white tabular-nums">
                {siteData.views || 0}
              </strong>
            </div>
          </div>

          <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-4">
            <span className="text-[11px] text-zinc-400">WhatsApp de Pedidos</span>
            <div className="mt-1 truncate">
              <strong className="text-sm font-mono text-zinc-200">{studioConfig.phone}</strong>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20'
                : 'bg-[#0E0E11] text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cardápio / Catálogo & Preços ({studioConfig.catalog.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'status'
                ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20'
                : 'bg-[#0E0E11] text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Status Aberto/Fechado & Promoção do Dia</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'info'
                ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20'
                : 'bg-[#0E0E11] text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>WhatsApp, Horários & Endereço</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20'
                : 'bg-[#0E0E11] text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Prévia em Tempo Real</span>
          </button>
        </div>

        {/* TAB 1: CATALOG / MENU MANAGER */}
        {activeTab === 'catalog' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0E0E11] border border-zinc-800/80 rounded-2xl p-5">
              <div>
                <h2 className="text-base font-bold text-white">
                  Gerenciar {studioConfig.catalogTitle || 'Cardápio / Catálogo'}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Altere preços, descrições, fotos ou marque produtos como <strong>Esgotado Hoje</strong> em 1 clique.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCatalogItem}
                className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Novo Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studioConfig.catalog.map((item, idx) => {
                const isAvailable = item.available !== false;
                return (
                  <div
                    key={item.id || idx}
                    className={`bg-[#0E0E11] border rounded-2xl p-4 transition-all flex flex-col gap-3.5 ${
                      isAvailable ? 'border-zinc-800/90' : 'border-red-500/30 bg-red-950/5 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover border border-zinc-800 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateCatalogItem(idx, 'name', e.target.value)}
                            className="w-full bg-[#09090B] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                            placeholder="Nome do produto ou serviço"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateCatalogItem(idx, 'available', !isAvailable)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                            isAvailable
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25'
                          }`}
                          title="Alternar disponibilidade hoje"
                        >
                          {isAvailable ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Disponível</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Esgotado</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveCatalogItem(idx)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-500/15 text-zinc-500 hover:text-red-400 border border-zinc-800 transition-colors cursor-pointer"
                          title="Excluir item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                          Preço
                        </label>
                        <input
                          type="text"
                          value={item.price}
                          onChange={(e) => handleUpdateCatalogItem(idx, 'price', e.target.value)}
                          placeholder="R$ 34,90"
                          className="w-full h-9 px-2.5 rounded-lg bg-[#09090B] border border-zinc-800 text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                          Categoria
                        </label>
                        <input
                          type="text"
                          value={item.category}
                          onChange={(e) => handleUpdateCatalogItem(idx, 'category', e.target.value)}
                          placeholder="Ex: Burgers"
                          className="w-full h-9 px-2.5 rounded-lg bg-[#09090B] border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                          Selo Destaque
                        </label>
                        <input
                          type="text"
                          value={item.badge || ''}
                          onChange={(e) => handleUpdateCatalogItem(idx, 'badge', e.target.value)}
                          placeholder="Ex: Mais Pedido"
                          className="w-full h-9 px-2.5 rounded-lg bg-[#09090B] border border-zinc-800 text-xs text-amber-300 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Descrição / Ingredientes / Detalhes
                      </label>
                      <textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) => handleUpdateCatalogItem(idx, 'description', e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-[#09090B] border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                        Link da Foto do Produto/Serviço (URL)
                      </label>
                      <input
                        type="text"
                        value={item.image}
                        onChange={(e) => handleUpdateCatalogItem(idx, 'image', e.target.value)}
                        placeholder="https://..."
                        className="w-full h-8 px-2.5 rounded-lg bg-[#09090B] border border-zinc-800 text-[11px] text-zinc-400 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE STORE STATUS & PROMO BANNER */}
        {activeTab === 'status' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-2xl p-6 space-y-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Status do Estabelecimento em Tempo Real</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Escolha como os clientes veem o seu estabelecimento ao abrir o site agora.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    id: 'open',
                    title: '🟢 Aberto Agora (Atendimento Normal)',
                    desc: 'Mostra selo verde pulsante indicando que está recebendo pedidos/agendamentos.',
                  },
                  {
                    id: 'busy',
                    title: '⚡ Horário de Pico / Últimas Vagas Hoje',
                    desc: 'Gera urgência mostrando que a fila ou agenda está quase cheia.',
                  },
                  {
                    id: 'closed',
                    title: '🔴 Fechado no Momento',
                    desc: 'Informa que o estabelecimento está fora do horário de atendimento.',
                  },
                ].map((opt) => {
                  const active = (studioConfig.storeStatus || 'open') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateConfig('storeStatus', opt.id as any)}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        active
                          ? 'bg-emerald-500/10 border-emerald-500 text-white'
                          : 'bg-[#09090B] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-bold text-sm text-white">{opt.title}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Tempo de Entrega / Fila / Aviso Rápido no Selo
                </label>
                <input
                  type="text"
                  value={studioConfig.waitTimeText || ''}
                  onChange={(e) => updateConfig('waitTimeText', e.target.value)}
                  placeholder="Ex: Entrega 35-45 min | Agenda Aberta Hoje"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#09090B] border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-2xl p-6 space-y-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Barra de Promoção / Cupom Relâmpago no Topo</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Destaque uma promoção do dia no topo do site para aumentar os pedidos no WhatsApp. Deixe em branco para ocultar.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Texto da Barra de Oferta do Dia
                </label>
                <textarea
                  rows={3}
                  value={studioConfig.promoBannerText || ''}
                  onChange={(e) => updateConfig('promoBannerText', e.target.value)}
                  placeholder="Ex: 🔥 TERÇA DO SMASH: Na compra de 2 hambúrgueres, a Batata Rústica sai GRÁTIS hoje!"
                  className="w-full p-3.5 rounded-xl bg-[#09090B] border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-zinc-400">
                  Exemplos Prontos (Clique para usar):
                </span>
                <div className="flex flex-col gap-2">
                  {[
                    '🔥 PROMOÇÃO DE HOJE: Frete Grátis em pedidos acima de R$ 60 pelo WhatsApp!',
                    '✂️ COMBO VIP: Cabelo + Barba + Sobrancelha com 20% OFF agendando hoje!',
                    '🎁 Use o cupom VIP10 no atendimento e ganhe um brinde especial hoje!',
                  ].map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => updateConfig('promoBannerText', preset)}
                      className="text-left text-xs p-2.5 rounded-lg bg-[#09090B] hover:bg-zinc-900 border border-zinc-800 text-zinc-300 transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STORE CONTACT & HOURS */}
        {activeTab === 'info' && (
          <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white">
                Informações do Estabelecimento & Atendimento
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Atualize o WhatsApp que recebe os pedidos, horários de atendimento e endereço.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nome do Estabelecimento
                </label>
                <input
                  type="text"
                  value={studioConfig.name}
                  onChange={(e) => updateConfig('name', e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#09090B] border border-zinc-800 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  WhatsApp Receptor de Pedidos (com DDD)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studioConfig.whatsapp}
                    onChange={(e) => {
                      updateConfig('whatsapp', e.target.value);
                      updateConfig('phone', e.target.value);
                    }}
                    placeholder="5511999999999"
                    className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-[#09090B] border border-zinc-800 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Horário de Funcionamento
                </label>
                <input
                  type="text"
                  value={studioConfig.hours}
                  onChange={(e) => updateConfig('hours', e.target.value)}
                  placeholder="Ter a Dom • 18h30 às 23h45"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#09090B] border border-zinc-800 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Endereço Completo
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studioConfig.address}
                    onChange={(e) => updateConfig('address', e.target.value)}
                    className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-[#09090B] border border-zinc-800 text-sm text-white"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Título Principal do Site (Headline)
                </label>
                <input
                  type="text"
                  value={studioConfig.headline}
                  onChange={(e) => updateConfig('headline', e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#09090B] border border-zinc-800 text-sm text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LIVE PREVIEW */}
        {activeTab === 'preview' && (
          <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">
                Prévia em Tempo Real de como seu site ficará após salvar
              </span>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={saving}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs cursor-pointer"
              >
                {saving ? 'Salvando...' : 'Confirmar e Publicar'}
              </button>
            </div>
            <iframe
              title="Prévia do Estabelecimento"
              srcDoc={livePreviewHtml}
              className="w-full h-[680px] border-0 bg-black"
            />
          </div>
        )}
      </div>
    </div>
  );
};
