const fs = require('fs');
let code = fs.readFileSync('src/pages/HostedSites.tsx', 'utf8');

// Also make sure Calendar is imported
if (!code.includes('Calendar')) {
  code = code.replace('Power } from', 'Power, Calendar } from');
}

const startString = 'const filteredSites = sites.filter';
const startIndex = code.indexOf(startString);

const endString = '{isScannerModalOpen && scanningSite && (';
const endIndex = code.indexOf(endString);

if (startIndex === -1 || endIndex === -1) {
  console.log('Could not find markers');
  process.exit(1);
}

const newReturn = `const filteredSites = sites.filter(s => s.domain?.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0b0714] p-8 font-sans selection:bg-primary/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Meus Sites Hospedados</h1>
            <p className="text-textSecondary">Gerencie suas Landing Pages e funis ativos na GhostMarket.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsRedirectModalOpen(true)} className="h-11 px-5 rounded-xl border border-[#261f36] bg-[#130e1d] text-textSecondary hover:bg-[#1a1425] hover:text-white transition-all shadow-sm">
              <Link2 className="w-4 h-4 mr-2" /> Camuflar Link
            </Button>
            <Button onClick={() => navigate('/builder')} className="h-11 px-5 rounded-xl bg-gradient-to-r from-primary to-indigo-500 hover:from-primaryLight hover:to-indigo-400 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] font-bold transition-all hover:scale-105 active:scale-95">
              <Plus className="w-4 h-4 mr-2" /> Hospedar Novo Site
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#130e1d] border border-[#261f36] rounded-2xl p-6 relative flex flex-col justify-between shadow-xl overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] pointer-events-none group-hover:bg-primary/20 transition-all" />
            <div className="flex justify-between items-start relative z-10">
              <p className="text-xs text-textSecondary font-bold tracking-widest mb-2 uppercase">Total de Sites Ativos</p>
              <div className="w-10 h-10 rounded-xl border border-primary/20 bg-[#0b0714] flex items-center justify-center text-primary shadow-inner">
                <Globe className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-5xl font-black text-white mt-2 mb-6 relative z-10">{sites.length}</h3>
            <div className="flex items-center gap-3 relative z-10">
              <span className="bg-primary/10 border border-primary/20 text-[#a78bfa] text-xs font-bold px-3 py-1.5 rounded-full">+2 este mês</span>
              <span className="text-xs text-textSecondary">Capacidade da conta: 10 sites</span>
            </div>
          </div>

          <div className="bg-[#130e1d] border border-[#261f36] rounded-2xl p-6 relative flex flex-col justify-between shadow-xl overflow-hidden group hover:border-emerald-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex justify-between items-start relative z-10">
              <p className="text-xs text-textSecondary font-bold tracking-widest mb-2 uppercase">Total de Acessos (Tráfego)</p>
              <div className="w-10 h-10 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center text-emerald-400 shadow-inner">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-5xl font-black text-emerald-400 mt-2 mb-6 relative z-10">{sites.reduce((acc, site) => acc + (site.views || 0), 0)}</h3>
            <div className="flex items-center gap-3 relative z-10">
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full">+18.4% vs semana anterior</span>
              <span className="text-xs text-textSecondary">Taxa de conversão 8.2%</span>
            </div>
          </div>
        </div>

        {/* Search Bar & Sites count */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 mb-6">
          <div className="relative w-full md:w-[350px]">
            <Search className="w-4 h-4 text-textSecondary absolute left-4 top-1/2 -translate-y-1/2" />
            <Input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Buscar por domínio..." 
              className="pl-11 bg-[#130e1d] border-[#261f36] h-11 rounded-xl focus:border-primary/50 text-white placeholder:text-textSecondary shadow-sm" 
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            <span className="text-sm font-bold text-white">{sites.length}</span>
            <span className="text-sm text-textSecondary">sites no ar</span>
          </div>
        </div>

        {/* Empty / Loading State */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-textSecondary">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            Carregando seus sites...
          </div>
        ) : filteredSites.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center bg-[#130e1d] border border-[#261f36] rounded-2xl">
            <div className="w-20 h-20 bg-[#0b0714] border border-[#261f36] text-primary rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Globe className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhum site encontrado</h3>
            <p className="text-textSecondary mb-6 max-w-md mx-auto">Você ainda não possui nenhum site hospedado ou não encontramos resultados para sua busca.</p>
            <Button onClick={() => navigate('/builder')} className="bg-primary hover:bg-primaryLight text-white rounded-xl shadow-lg">
              Hospedar meu primeiro site
            </Button>
          </div>
        ) : (
          /* Grid of Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredSites.map(site => (
                <motion.div 
                  key={site.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#130e1d] border border-[#261f36] rounded-2xl p-6 hover:border-[#3b3054] transition-all group flex flex-col shadow-lg relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-3">
                      {site.isRedirect ? (
                        <div className="w-11 h-11 rounded-xl border border-[#261f36] bg-[#0b0714] flex items-center justify-center text-primary shadow-inner" title="Link Camuflado">
                          <Globe className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-xl border border-[#261f36] bg-[#0b0714] flex items-center justify-center text-primary shadow-inner" title="Landing Page Hospedada">
                          <Globe className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 bg-[#0b0714] border border-[#261f36] rounded-lg px-2.5 py-1.5 shadow-inner">
                        <Eye className="w-3.5 h-3.5 text-textSecondary" />
                        <span className="text-xs font-bold text-white">{site.views || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      <button onClick={() => handleToggleStatus(site.id, site.isActive !== false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-colors" title={site.isActive !== false ? 'Desativar Site' : 'Ativar Site'}>
                        <Power className="w-4 h-4" />
                      </button>
                      <button onClick={() => {
                        const url = \`\${window.location.origin}/report/\${site.id}\`;
                        navigator.clipboard.writeText(url);
                        addToast('Link do relatório copiado!', 'success');
                        window.open(url, '_blank');
                      }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#261f36] text-textSecondary hover:text-white transition-colors" title="Estatísticas">
                        <BarChart className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleOpenScanner(site)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#261f36] text-textSecondary hover:text-white transition-colors" title="Auto-Healing Scanner">
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                      <button onClick={() => navigate(\`/builder?edit=\${site.id}\`)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#261f36] text-textSecondary hover:text-white transition-colors" title="Editar / Ver">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(site.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-textSecondary hover:text-red-400 transition-colors" title="Apagar Site">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className={\`inline-flex items-center gap-2 border text-[10px] font-bold px-2.5 py-1 rounded-full mb-4 \${site.isActive !== false ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-500'}\`}>
                      <div className={\`w-1.5 h-1.5 rounded-full \${site.isActive !== false ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}\`} /> {site.isActive !== false ? 'Site Ativado' : 'Site Desativado'}
                    </div>
                    <h4 className="text-xl font-bold text-white mb-1.5 truncate">{site.domain || site.id}</h4>
                    <div className="flex items-center">
                      <a href={site.domain.startsWith('http') ? site.domain : \`https://\${site.domain}\`} target="_blank" rel="noopener noreferrer" className="text-sm text-textSecondary font-mono truncate hover:text-primary transition-colors flex items-center">
                        {site.domain.startsWith('http') ? site.domain : \`https://ghostmarket-ai.vercel.app/s/\${site.id}\`} <ExternalLink className="w-3 h-3 ml-2 shrink-0 opacity-50" />
                      </a>
                    </div>
                  </div>

                  <div className="mt-auto pt-5 border-t border-[#261f36] flex items-center justify-between">
                    <div className="bg-[#0b0714] border border-[#261f36] px-3 py-1.5 rounded-lg text-xs text-textSecondary font-medium shadow-inner">
                      {site.domainType === 'subdomain' ? 'Link Gratuito' : 'Domínio Próprio'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-textSecondary font-medium">
                      <Calendar className="w-3.5 h-3.5 opacity-50" />
                      <span>{new Date(site.publishedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        `;

code = code.substring(0, startIndex) + newReturn + code.substring(endIndex);

// fix duplicated AnimatePresence
code = code.replace('<AnimatePresence>\r\n        \r\n      <AnimatePresence>', '<AnimatePresence>');
code = code.replace('<AnimatePresence>\n        \n      <AnimatePresence>', '<AnimatePresence>');
code = code.replace('<AnimatePresence>\n          \n        <AnimatePresence>', '<AnimatePresence>');
code = code.replace('<AnimatePresence>\r\n          \r\n        <AnimatePresence>', '<AnimatePresence>');

fs.writeFileSync('src/pages/HostedSites.tsx', code);
console.log('Update applied');
