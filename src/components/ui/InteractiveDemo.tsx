import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

export function InteractiveDemo() {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [formData, setFormData] = useState({ name: '', niche: '', style: '' });
  const [progress, setProgress] = useState(0);

  const handleGenerate = () => {
    if (!formData.name || !formData.niche || !formData.style) return;
    setStep(1);
    
    // Simulate generation
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress > 100) currentProgress = 100;
      setProgress(Math.floor(currentProgress));
      
      if (currentProgress === 100) {
        clearInterval(interval);
        setTimeout(() => setStep(2), 500);
      }
    }, 400);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-panel/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Fake Header */}
      <div className="bg-[#0b0714] border-b border-white/5 px-4 py-3 flex items-center gap-4">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs font-medium text-white/40">app.ghostmarket.ai/creator</span>
        </div>
      </div>

      <div className="p-8 md:p-12 min-h-[400px] flex flex-col justify-center relative">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto w-full space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center mx-auto mb-4 text-primary">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white">Criar novo projeto</h3>
                <p className="text-textSecondary text-sm mt-1">Preencha os dados e deixe a IA trabalhar.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1.5 uppercase tracking-wider">Nome do Projeto</label>
                  <input
                    type="text"
                    placeholder="Ex: AutoFinanças"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1.5 uppercase tracking-wider">Nicho / Setor</label>
                  <input
                    type="text"
                    placeholder="Ex: Gestão Financeira para Clínicas"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                    value={formData.niche}
                    onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1.5 uppercase tracking-wider">Estilo Visual</label>
                  <select
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                    value={formData.style}
                    onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                  >
                    <option value="" disabled>Selecione um estilo</option>
                    <option value="modern">Moderno & Dark</option>
                    <option value="clean">Clean & Minimalista</option>
                    <option value="corporate">Corporativo Premium</option>
                  </select>
                </div>
              </div>

              <Button
                className="w-full h-12 text-base font-bold shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
                onClick={handleGenerate}
                disabled={!formData.name || !formData.niche || !formData.style}
              >
                <Sparkles className="w-4 h-4 mr-2" /> Gerar Projeto
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-md mx-auto w-full text-center space-y-8"
            >
              <div className="relative w-24 h-24 mx-auto">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="4"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="4"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * progress) / 100}
                    className="origin-center -rotate-90 transition-all duration-300 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{progress}%</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white">Criando seu projeto...</h3>
                <div className="h-6 overflow-hidden relative text-primary font-medium">
                  <motion.div
                    animate={{ y: [0, -24, -48, -72] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="flex flex-col"
                  >
                    <span className="h-6">Analisando ideia...</span>
                    <span className="h-6">Criando estrutura...</span>
                    <span className="h-6">Gerando produto...</span>
                    <span className="h-6">Otimizando...</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto w-full text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400 border border-emerald-500/20"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">Projeto Pronto!</h3>
                <p className="text-textSecondary">Sua solução {formData.name} foi gerada com sucesso e está pronta para uso.</p>
              </div>

              <div className="bg-[#0b0714] border border-white/5 rounded-xl p-4 text-left mt-6">
                <div className="flex items-center gap-3 text-sm text-white/70 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Landing Page criada
                </div>
                <div className="flex items-center gap-3 text-sm text-white/70 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Painel de Usuário gerado
                </div>
                <div className="flex items-center gap-3 text-sm text-white/70 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Checkout integrado
                </div>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Banco de dados configurado
                </div>
              </div>

              <Button
                variant="secondary"
                className="w-full mt-4"
                onClick={() => {
                  setStep(0);
                  setFormData({ name: '', niche: '', style: '' });
                  setProgress(0);
                }}
              >
                Criar outro projeto
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
