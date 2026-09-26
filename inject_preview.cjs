const fs = require('fs');

let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

if (!code.includes('import { AppPreview }')) {
  code = code.replace(
    "import { AnimatedMockup } from '@/components/ui/AnimatedMockup'",
    "import { AnimatedMockup } from '@/components/ui/AnimatedMockup'\nimport { AppPreview } from '@/components/ui/AppPreview'"
  );
}

const previewSection = `
        {/* App Preview Section */}
        <section className="pt-24 pb-12 px-6 relative border-t border-border bg-background">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">POR DENTRO DA MÁQUINA</h2>
              <p className="text-textSecondary max-w-2xl mx-auto mb-12">Um ecossistema com design premium, focado em velocidade e conversão. Desenvolvido para você gerenciar clientes, criar sites e faturar no mesmo dia.</p>
              <AppPreview />
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}`;

if (!code.includes('POR DENTRO DA MÁQUINA')) {
  code = code.replace('{/* Pricing Section */}', previewSection);
}

fs.writeFileSync('src/pages/Landing.tsx', code, 'utf8');
