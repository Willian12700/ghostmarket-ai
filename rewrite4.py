# -*- coding: utf-8 -*-
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

original_ts = open('src/pages/HostedSites.tsx', encoding='utf-8').read()
new_jsx = open('meus_sites_inner.jsx', encoding='utf-8').read()

# strip script tag
new_jsx = re.sub(r'<script>.*?</script>', '', new_jsx, flags=re.DOTALL)

# Find pre_return
match_pre = re.search(r'(.*?return\s*\(\s*)<div', original_ts, re.DOTALL)
pre_return = match_pre.group(1) if match_pre else ""

# Find post_return
match_post = re.search(r'(\s*\{/\*\s*Scanner Modal\s*\*/\}.*)', original_ts, re.DOTALL)
post_return = match_post.group(1) if match_post else ""

if not pre_return or not post_return:
    print("Could not parse original ts")
    sys.exit(1)

# Ensure post_return ends nicely for fragment
post_return = post_return.strip()[:-1] + "\n</>\n)"

grid_match = re.search(r'(<div className="grid[^"]*" id="projectsContainer">)(.*?)(\s*</div>\s*</div>\s*</div>)', new_jsx, re.DOTALL)

if not grid_match:
    print("Could not parse grid in new_jsx")
    sys.exit(1)

new_grid_before = new_jsx[:grid_match.start(2)]
new_grid_after = new_jsx[grid_match.end(2):]

mapping = '''
{sites.length === 0 && !loading ? (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Nenhum site encontrado</h3>
        <p className="text-textSecondary mb-6">Voce ainda nao possui nenhum site ou projeto criado.</p>
        <button onClick={() => navigate('/builder')} className="px-6 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold hover:bg-inverse-primary transition-all shadow-lg flex items-center gap-2">
            <span className="material-symbols-outlined">add</span> Criar meu primeiro site
        </button>
    </div>
) : loading ? (
    <div className="col-span-full flex justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">cyclone</span>
    </div>
) : (
    sites.map(site => (
        <div key={site.id} className="group flex flex-col rounded-xl bg-surface-container-low hover:bg-surface-container transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1">
            <div className="relative w-full h-48 bg-surface-container overflow-hidden">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={site.domain || "Site Preview"} src={site.domainType === "subdomain" ? "https://lh3.googleusercontent.com/aida-public/AB6AXuAJTGSIAJVF_LApqp4wWF11-_DBm8wmz7OGac41ZymY-iCiWOXyafZICKzdBpMiknln_vQaeTmGiaFRmv75Iyg3uieAGEiWC2T01PoCKKVKNR40uQB1Mk5F_3KMUL8M0OVWe1mJfSGHfoXjS5YTGW-4NXgypPyUryF8Pl7jkUzrTRuPUdqF9JrQYcrEJFxd5afn6ruJzPO4eeXqfIf5-Pj_HyQ6svFET5HpRtImyTiFppFvP2umXA5b" : "https://lh3.googleusercontent.com/aida-public/AB6AXuDIFOLchhRmdsgd7SvCteDT-l4k7M3ImVG3UKd-tpfOf8WBfOSInHfh9cqS5exs2jR2ub-0U4SR7R0w3KHSOcJ6GJ7UvZF6ScWcdbRWdzeqQPVxsiGeiQ7b_yxuHEz9nKi5q2Ma2uPOU4EEBJ5GeczEYJU5CMHKZDpe-8qtuEry4G-V-GjEwjpnQDw9_6GAhESmUpMXakIUEeHNXcjGRTnFeDn-yIUbFJkBy1cy5zJ80Em_8cKC7DOd"} />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/20 to-transparent"></div>
                
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-sm text-label-sm shadow-sm ${site.status === "published" || site.isActive ? "bg-emerald-950/80 text-emerald-400" : "bg-surface-container-highest text-on-surface-variant"}`}>
                        <span className={`w-2 h-2 rounded-full ${site.status === "published" || site.isActive ? "bg-emerald-400 animate-pulse" : "bg-outline"}`}></span>
                        {site.status === "published" || site.isActive ? "Publicado" : site.status === "generating" ? "Gerando IA" : "Rascunho"}
                    </span>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-lowest/80 text-on-surface-variant text-label-sm font-label-sm">
                        <span className="material-symbols-outlined text-[14px] text-primary">speed</span>
                        <span>99 / 100</span>
                    </div>
                </div>
                
                <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between">
                    <span className="text-label-sm font-label-sm text-on-surface-variant bg-surface-container-lowest/90 px-2 py-0.5 rounded">
                        {site.isRedirect ? "Camuflador" : "Landing Page"}
                    </span>
                    <span className="text-label-sm font-label-sm text-outline">v{site.views || 1}.0 Live</span>
                </div>
            </div>

            <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-headline-sm font-headline-sm font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                            {site.clientName || site.domain || "Projeto sem nome"}
                        </h3>
                        <div className="relative group/menu">
                            <button className="text-outline hover:text-on-surface transition-colors p-1 rounded hover:bg-surface-container-high">
                                <span className="material-symbols-outlined text-headline-sm">more_vert</span>
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg bg-surface-container-high border border-outline-variant shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 flex flex-col overflow-hidden">
                                <button onClick={() => window.open(site.domainType === "custom" ? `https://${site.domain}` : `http://${site.domain}`, '_blank')} className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined text-[18px]">open_in_new</span> Abrir
                                </button>
                                {site.isRedirect && (
                                   <button onClick={() => { navigator.clipboard.writeText(`https://${site.domain}`); alert('Copiado!'); }} className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors cursor-pointer">
                                       <span className="material-symbols-outlined text-[18px]">content_copy</span> Copiar Link
                                   </button>
                                )}
                                <button onClick={() => handleOpenScanner(site)} className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-surface-container transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined text-[18px]">radar</span> Scanner Anti-Ban
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 mb-space-sm text-body-sm font-body-sm">
                        <a className="flex items-center gap-1.5 text-secondary hover:underline truncate" href={site.domainType === "custom" ? `https://${site.domain}` : `http://${site.domain}`} target="_blank" rel="noreferrer">
                            <span className="material-symbols-outlined text-[16px]">link</span>
                            <span className="truncate">{site.domain}</span>
                        </a>
                        <div className="flex items-center gap-1.5 text-outline text-label-sm font-label-sm">
                            <span className="material-symbols-outlined text-[14px] text-emerald-400">verified</span>
                            <span>{site.domainType === "custom" ? "Dominio Proprio" : "GhostMarket Edge"}</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-space-xs p-space-xs rounded-lg bg-surface-container-lowest text-center">
                        <div className="flex flex-col py-1">
                            <span className="text-body-md font-body-md font-semibold text-on-surface">{site.views || 0}</span>
                            <span className="text-label-sm font-label-sm text-outline">Visitantes</span>
                        </div>
                        <div className="flex flex-col py-1 bg-surface-container-high/40 rounded">
                            <span className="text-body-md font-body-md font-semibold text-secondary">{Math.floor((site.views || 0) * 0.08)}</span>
                            <span className="text-label-sm font-label-sm text-outline">Leads</span>
                        </div>
                        <div className="flex flex-col py-1">
                            <span className="text-body-md font-body-md font-semibold text-emerald-400">{site.views ? "8.4%" : "0%"}</span>
                            <span className="text-label-sm font-label-sm text-outline">Conversao</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-space-xs pt-space-xs">
                    <button onClick={() => navigate(`/builder?edit=${site.id}`)} className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md hover:bg-inverse-primary transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        <span>Editar no Studio</span>
                    </button>
                    <button onClick={() => window.open(site.domainType === "custom" ? `https://${site.domain}` : `http://${site.domain}`, '_blank')} className="flex items-center justify-center w-10 h-9 rounded-lg bg-surface-container-high text-on-surface hover:text-primary transition-colors cursor-pointer" title="Ver Site em Nova Guia">
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    </button>
                    <button className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer" title="Configuracoes">
                        <span className="material-symbols-outlined text-[18px]">settings</span>
                    </button>
                </div>
            </div>
        </div>
    ))
)}
'''

new_grid_before = new_grid_before.replace('<button className="group relative flex items-center justify-center gap-space-xs px-space-lg py-2.5 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-lg hover:bg-inverse-primary transition-all duration-200 cursor-pointer">', '<button onClick={() => navigate("/builder")} className="group relative flex items-center justify-center gap-space-xs px-space-lg py-2.5 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-lg hover:bg-inverse-primary transition-all duration-200 cursor-pointer">')

action_card = '''
        <div onClick={() => navigate("/builder")} className="group relative flex flex-col justify-between p-space-lg rounded-xl bg-surface-container-low/40 hover:bg-surface-container-low transition-all duration-300 min-h-[380px] cursor-pointer overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1">
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-primary-container/20 rounded-full blur-2xl group-hover:bg-primary-container/40 transition-all duration-500"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-label-sm font-label-sm uppercase tracking-widest text-primary font-semibold">Novo Workflow</span>
            <span className="px-2 py-0.5 rounded-full bg-primary-container/30 text-secondary text-label-sm font-label-sm">
              45 Segundos
            </span>
          </div>
          <div className="flex flex-col items-center text-center my-auto py-space-md relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high group-hover:bg-primary-container flex items-center justify-center text-primary group-hover:text-on-primary-container transition-all duration-300 shadow-xl mb-space-md">
              <span className="material-symbols-outlined text-[36px] group-hover:scale-110 transition-transform">auto_awesome</span>
            </div>
            <h3 className="text-headline-sm font-headline-sm font-semibold text-on-surface group-hover:text-primary transition-colors mb-space-xs">
              Gerar Novo Site em 45s
            </h3>
            <p className="text-body-sm font-body-sm text-outline group-hover:text-on-surface-variant transition-colors max-w-xs">
              Insira o nicho ou o perfil do Instagram/Google do cliente para o Ghost Market estruturar copy, imagens e design automaticamente.
            </p>
          </div>
        </div>
'''

final_jsx = new_grid_before + mapping + action_card + new_grid_after

full_file = pre_return + "<>\n" + final_jsx + "\n" + post_return

with open('src/pages/HostedSites.tsx', 'w', encoding='utf-8') as f:
    f.write(full_file)
print("Updated HostedSites.tsx successfully!")
