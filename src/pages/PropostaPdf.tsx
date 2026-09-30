import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export const PropostaPdf = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  
  const leadName = searchParams.get('leadName') || 'Cliente';
  const leadCategory = searchParams.get('leadCategory') || 'Segmento';
  const leadCity = searchParams.get('leadCity') || 'Sua Cidade';

  useEffect(() => {
    // Tenta abrir o diálogo de impressão assim que a página carregar
    setTimeout(() => {
      window.print();
    }, 1000);
  }, []);

  return (
    <div className="bg-white text-black min-h-screen font-sans">
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white p-12 print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b-4 border-primary pb-8 mb-12">
          <div>
            <h1 className="text-5xl font-black text-gray-900 mb-2">Proposta Comercial</h1>
            <p className="text-xl text-gray-500 font-medium">Projeto Estratégico de Posicionamento Digital</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary mb-1">
              {user?.displayName || 'GhostMarket Agency'}
            </div>
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
            <span className="text-primary">01.</span> O Desafio
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg mb-8">
            Atualmente, a <strong>{leadName}</strong> possui grande potencial em {leadCity}, mas perde vendas diárias por não ter um sistema digital próprio focado em conversão. Depender exclusivamente de indicações ou redes sociais limita o alcance e a percepção de valor da sua marca.
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-primary">02.</span> Nossa Solução
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            Desenvolveremos uma plataforma web premium, desenhada para:
          </p>
          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold mt-1 shrink-0">✓</div>
              <p className="text-gray-700 text-lg"><strong>Capturar Clientes 24/7:</strong> Um site que funciona como o seu melhor vendedor, apresentando seus serviços mesmo quando a empresa está fechada.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold mt-1 shrink-0">✓</div>
              <p className="text-gray-700 text-lg"><strong>Aumentar Autoridade:</strong> Design de altíssimo nível (Padrão Vale do Silício) que destrói a objeção de preço do seu cliente.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold mt-1 shrink-0">✓</div>
              <p className="text-gray-700 text-lg"><strong>Integração com WhatsApp:</strong> Botões flutuantes e direcionamento inteligente para a sua equipe de vendas fechar negócio rapidamente.</p>
            </li>
          </ul>
        </div>

        {/* Investimento */}
        <div className="mb-12 page-break-inside-avoid">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-primary">03.</span> Investimento
          </h3>
          <div className="bg-white border-2 border-primary/20 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-primary/5 p-6 border-b border-primary/10">
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
                <span className="text-gray-700 font-medium">Otimização SEO (Google)</span>
                <span className="text-gray-900 font-bold">Incluso</span>
              </div>
              <div className="border-t border-gray-100 mt-6 pt-6 flex justify-between items-center">
                <span className="text-gray-900 font-black text-xl">Valor Total:</span>
                <span className="text-3xl font-black text-primary">R$ 1.500,00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>Esta proposta é válida por 7 dias a partir da data de geração.</p>
          <p className="mt-2 font-bold">{user?.displayName || 'GhostMarket Agency'}</p>
        </div>

      </div>
    </div>
  );
};
