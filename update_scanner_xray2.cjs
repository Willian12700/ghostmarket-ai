const fs = require('fs');

let code = fs.readFileSync('src/pages/Scanner.tsx', 'utf8');

// Update imports
code = code.replace(
  "import { Search, MapPin, Phone, Smartphone, Filter, ShieldAlert, Check, Plus, MessageSquare, Globe as GlobeIcon, Star, Sparkles, X } from 'lucide-react'",
  "import { Search, MapPin, Phone, Smartphone, Filter, ShieldAlert, Check, Plus, MessageSquare, Globe as GlobeIcon, Star, Sparkles, X, Building2, SearchCode, AlertTriangle, AtSign } from 'lucide-react'"
);

// Add the Deep Investigation section to the X-Ray Modal
const xrayReplacement = `                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-5">
                    <h5 className="font-bold text-primary flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4" />
                      Argumento de Venda Sugerido:
                    </h5>
                    <p className="text-sm text-white leading-relaxed">
                      {!xrayLead.website && xrayLead.rating >= 4 ? (
                        <>\`Olha só: a \${xrayLead.name}\` tem uma nota altíssima no Google (\${xrayLead.rating} estrelas)! Isso prova que o serviço/produto deles é excelente. A fraqueza? Eles não têm um site ou sistema de vendas online.\\n\\n**O seu Pitch:** "Oi! Vocês são muito bem avaliados, mas estão perdendo dinheiro no boca a boca digital porque os clientes procuram o site de vocês no Google para comprar/agendar e não acham nada. Deixa eu montar uma página focada em conversão pra vocês e dobrar essas avaliações!"</>
                      ) : !xrayLead.website ? (
                        <>\`A \${xrayLead.name}\` não tem site e a presença digital é fraca.\\n\\n**O seu Pitch:** "Oi! Percebi que vocês ainda dependem 100% de indicações ou do Instagram. Posso criar uma plataforma que funciona 24h vendendo por vocês, passando muito mais credibilidade e profissionalismo."</>
                      ) : (
                        <>\`A \${xrayLead.name}\` já tem um site. O objetivo aqui é vender um RE-DESIGN ou automação.\\n\\n**O seu Pitch:** "Oi! Vi o site de vocês e achei bacana, mas notei que a tecnologia é um pouco antiga. Com as IAs atuais, conseguimos fazer um sistema que atende os clientes sozinho, muito mais rápido. Topa uma avaliação gratuita?"</>
                      )}
                    </p>
                  </div>

                  <div className="bg-[#130e1d] border border-[#261f36] rounded-xl p-5 mt-4 shadow-inner">
                    <h5 className="font-bold text-white flex items-center gap-2 mb-4">
                      <SearchCode className="w-5 h-5 text-accent" />
                      Dossiê do Closer (Investigação Profunda)
                    </h5>
                    <p className="text-xs text-textSecondary mb-4">Essas ferramentas buscam informações públicas ocultas (CNPJ, nome dos sócios, reclamações e registros) baseadas no nome do local.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <a href={\`https://casadosdados.com.br/cnpj?q=\${encodeURIComponent(xrayLead.name + ' ' + xrayLead.city)}\`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-[#0b0714] border border-[#261f36] hover:border-primary/50 hover:bg-primary/5 transition-all rounded-lg text-sm text-gray-300">
                        <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="truncate">Puxar CNPJ e Sócios</span>
                      </a>
                      
                      {xrayLead.website && (
                        <a href={\`https://registro.br/tecnologia/ferramentas/whois/?search=\${new URL(xrayLead.website.startsWith('http') ? xrayLead.website : 'https://' + xrayLead.website).hostname}\`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-[#0b0714] border border-[#261f36] hover:border-primary/50 hover:bg-primary/5 transition-all rounded-lg text-sm text-gray-300">
                          <GlobeIcon className="w-4 h-4 text-green-400 shrink-0" />
                          <span className="truncate">Dono do Domínio (Whois)</span>
                        </a>
                      )}

                      <a href={\`https://www.reclameaqui.com.br/busca/?q=\${encodeURIComponent(xrayLead.name)}\`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-[#0b0714] border border-[#261f36] hover:border-primary/50 hover:bg-primary/5 transition-all rounded-lg text-sm text-gray-300">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <span className="truncate">Ver Reclamações (Dores)</span>
                      </a>
                      
                      <a href={\`https://www.google.com/search?q=site:instagram.com+\${encodeURIComponent(xrayLead.name + ' ' + xrayLead.city)}\`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-[#0b0714] border border-[#261f36] hover:border-primary/50 hover:bg-primary/5 transition-all rounded-lg text-sm text-gray-300">
                        <AtSign className="w-4 h-4 text-pink-500 shrink-0" />
                        <span className="truncate">Achar Insta Oculto</span>
                      </a>
                    </div>
                  </div>`;

// Apply the regex replacement carefully since it's a large block
code = code.replace(
  /<div className="bg-primary\/10 border border-primary\/20 rounded-xl p-5">[\s\S]*?<\/div>/,
  xrayReplacement
);

fs.writeFileSync('src/pages/Scanner.tsx', code, 'utf8');
