const fs = require('fs');

let landingCode = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

const trialLink = `
                <div className="mt-8 flex justify-center w-full">
                  <a href="https://wa.me/5584996162332?text=Ol%C3%A1!+Estou+no+site+e+gostaria+de+um+c%C3%B3digo+de+5+minutos+para+testar+o+sistema+por+dentro." target="_blank" className="text-sm text-white/50 hover:text-white underline decoration-white/30 underline-offset-4 flex items-center gap-2 transition-colors">
                    Quer testar 5 minutos de graça no X1? Me peça um código temporário.
                  </a>
                </div>
`;

// Inject before "Os Primeiros 10"
const target = `<div className="mt-20 border-t border-white/5 pt-16">`;
if (landingCode.includes(target) && !landingCode.includes("Quer testar 5 minutos")) {
  landingCode = landingCode.replace(target, trialLink + "\n        " + target);
  fs.writeFileSync('src/pages/Landing.tsx', landingCode, 'utf8');
}

