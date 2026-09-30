import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Settings2, Printer, Image as ImageIcon, Palette, DollarSign, User, Briefcase, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const PropostaPdf = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  
  // Estados editáveis da proposta
  const [leadName, setLeadName] = useState(searchParams.get('leadName') || 'Cliente Exemplo');
  const [leadCategory, setLeadCategory] = useState(searchParams.get('leadCategory') || 'Restaurante');
  const [leadCity, setLeadCity] = useState(searchParams.get('leadCity') || 'São Paulo');
  const [valorTotal, setValorTotal] = useState('1.500,00');
  const [corPrimaria, setCorPrimaria] = useState('#8b5cf6'); // Violeta GhostMarket
  const [agencyName, setAgencyName] = useState(user?.name || 'Sua Agência');
  const [logoUrl, setLogoUrl] = useState('');
  const [prazoValidade, setPrazoValidade] = useState('7');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans flex">
      
      {/* Editor Sidebar (Hidden in Print) */}
      <div className="w-80 bg-white border-r border-gray-200 shadow-xl h-screen sticky top-0 overflow-y-auto p-6 print:hidden z-50 flex flex-col">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
          <Settings2 className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-gray-800">Editor de Proposta</h2>
        </div>

        <div className="space-y-5 flex-1">
          {/* Valor */}
          <div>
            <label className="text-sm font-bold text-gray-600 flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4" /> Valor do Projeto
            </label>
            <Input 
              value={valorTotal} 
              onChange={e => setValorTotal(e.target.value)} 
              className="bg-gray-50 border-gray-300 text-gray-900"
              placeholder="Ex: 1.500,00"
            />
          </div>

          {/* Cor Principal */}
          <div>
            <label className="text-sm font-bold text-gray-600 flex items-center gap-2 mb-1">
              <Palette className="w-4 h-4" /> Cor Tema (Hex)
            </label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={corPrimaria} 
                onChange={e => setCorPrimaria(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0 p-0"
              />
              <Input 
                value={corPrimaria} 
                onChange={e => setCorPrimaria(e.target.value)} 
                className="bg-gray-50 border-gray-300 text-gray-900 flex-1 uppercase"
              />
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Dados do Cliente</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 flex items-center gap-2 mb-1">
                  <User className="w-3 h-3" /> Nome da Empresa
                </label>
                <Input value={leadName} onChange={e => setLeadName(e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900 h-9" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 flex items-center gap-2 mb-1">
                  <Briefcase className="w-3 h-3" /> Segmento
                </label>
                <Input value={leadCategory} onChange={e => setLeadCategory(e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900 h-9" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 flex items-center gap-2 mb-1">
                  <MapPin className="w-3 h-3" /> Cidade
                </label>
                <Input value={leadCity} onChange={e => setLeadCity(e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900 h-9" />
              </div>
            </div>
          </div>

          {/* Dados da Agência */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Sua Agência</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 flex items-center gap-2 mb-1">
                  Nome da Agência
                </label>
                <Input value={agencyName} onChange={e => setAgencyName(e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900 h-9" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 flex items-center gap-2 mb-1">
                  <ImageIcon className="w-3 h-3" /> Link da Logo (Opcional)
                </label>
                <Input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." className="bg-gray-50 border-gray-300 text-gray-900 h-9" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 flex items-center gap-2 mb-1">
                  Prazo de Validade (Dias)
                </label>
                <Input value={prazoValidade} onChange={e => setPrazoValidade(e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900 h-9" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <Button onClick={handlePrint} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg shadow-xl shadow-blue-600/20">
            <Printer className="w-5 h-5 mr-2" />
            Salvar / Imprimir PDF
          </Button>
          <p className="text-[10px] text-gray-400 text-center mt-3">Dica: No menu de impressão, desmarque "Cabeçalhos e rodapés" e ative "Gráficos de plano de fundo".</p>
        </div>
      </div>

      {/* A4 Paper Container */}
      <div className="flex-1 flex justify-center py-10 print:py-0 bg-gray-100 print:bg-white">
        <div className="w-[210mm] min-h-[297mm] bg-white p-12 print:p-0 shadow-2xl print:shadow-none text-black relative">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b-4 pb-8 mb-12" style={{ borderColor: corPrimaria }}>
            <div>
              <h1 className="text-5xl font-black text-gray-900 mb-2">Proposta Comercial</h1>
              <p className="text-xl text-gray-500 font-medium">Projeto Estratégico de Posicionamento Digital</p>
            </div>
            <div className="text-right flex flex-col items-end">
              {logoUrl ? (
                <img src={logoUrl} alt={agencyName} className="max-h-16 mb-2 object-contain" />
              ) : (
                <div className="text-2xl font-bold mb-1" style={{ color: corPrimaria }}>
                  {agencyName}
                </div>
              )}
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Cliente Info */}
          <div className="bg-gray-50 p-6 rounded-xl mb-12 border border-gray-100">
            <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">Apresentado para:</p>
            <h2 className="text-3xl font-black text-gray-800 mb-2">{leadName}</h2>
            <p className="text-gray-600 font-medium">{leadCategory} • {leadCity}</p>
          </div>

          {/* Problema / Solução */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span style={{ color: corPrimaria }}>01.</span> O Desafio
            </h3>
            <p className="text-gray-700 leading-relaxed text-lg mb-8">
              Atualmente, a <strong style={{ color: corPrimaria }}>{leadName}</strong> possui grande potencial em {leadCity}, mas perde vendas diárias por não ter um sistema digital próprio focado em conversão. Depender exclusivamente de indicações ou redes sociais limita o alcance e a percepção de valor da sua marca.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span style={{ color: corPrimaria }}>02.</span> Nossa Solução
            </h3>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              Desenvolveremos uma plataforma web premium, desenhada para:
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold mt-1 shrink-0" style={{ backgroundColor: `${corPrimaria}20`, color: corPrimaria }}>✓</div>
                <p className="text-gray-700 text-lg"><strong>Capturar Clientes 24/7:</strong> Um site que funciona como o seu melhor vendedor, apresentando seus serviços mesmo quando a empresa está fechada.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold mt-1 shrink-0" style={{ backgroundColor: `${corPrimaria}20`, color: corPrimaria }}>✓</div>
                <p className="text-gray-700 text-lg"><strong>Aumentar Autoridade:</strong> Design de altíssimo nível (Padrão Vale do Silício) que destrói a objeção de preço do seu cliente.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold mt-1 shrink-0" style={{ backgroundColor: `${corPrimaria}20`, color: corPrimaria }}>✓</div>
                <p className="text-gray-700 text-lg"><strong>Integração com WhatsApp:</strong> Botões flutuantes e direcionamento inteligente para a sua equipe de vendas fechar negócio rapidamente.</p>
              </li>
            </ul>
          </div>

          {/* Investimento */}
          <div className="mb-12 page-break-inside-avoid">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span style={{ color: corPrimaria }}>03.</span> Investimento
            </h3>
            <div className="bg-white border-2 rounded-2xl overflow-hidden shadow-sm" style={{ borderColor: `${corPrimaria}40` }}>
              <div className="p-6 border-b" style={{ backgroundColor: `${corPrimaria}0D`, borderColor: `${corPrimaria}20` }}>
                <h4 className="text-xl font-bold text-gray-900">Plataforma de Alta Conversão</h4>
                <p className="text-gray-500">Desenvolvimento, Design e Otimização para {leadCategory}</p>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700 font-medium">Design UI/UX Premium</span>
                  <span className="text-gray-900 font-bold">Incluso</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700 font-medium">Desenvolvimento Web Responsivo</span>
                  <span className="text-gray-900 font-bold">Incluso</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700 font-medium">Otimização SEO Básica (Google)</span>
                  <span className="text-gray-900 font-bold">Incluso</span>
                </div>
                <div className="border-t border-gray-100 mt-6 pt-6 flex justify-between items-center">
                  <span className="text-gray-900 font-black text-xl">Valor Total:</span>
                  <span className="text-4xl font-black" style={{ color: corPrimaria }}>R$ {valorTotal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>Esta proposta é válida por {prazoValidade} dias a partir da data de geração.</p>
            <p className="mt-2 font-bold">{agencyName}</p>
          </div>

        </div>
      </div>
    </div>
  );
};
