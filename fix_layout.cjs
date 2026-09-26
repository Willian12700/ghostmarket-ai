const fs = require('fs');

// Fix MainLayout.tsx
let mainLayoutCode = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');
// Find the end of the return statement in MainLayout
mainLayoutCode = mainLayoutCode.replace("<ToastContainer />\n      <SalesNotifier />\n    </div>", "<ToastContainer />\n      <SalesNotifier />\n      {user?.isAnonymous && <TrialTimer />}\n    </div>");
fs.writeFileSync('src/layouts/MainLayout.tsx', mainLayoutCode, 'utf8');

// Fix Landing.tsx (remove unused Clock if I failed to add the trial button)
let landingCode = fs.readFileSync('src/pages/Landing.tsx', 'utf8');
// Remove Clock from lucide-react import
landingCode = landingCode.replace(", Clock} from \"lucide-react\"", "} from \"lucide-react\"");
landingCode = landingCode.replace(", Clock} from 'lucide-react'", "} from 'lucide-react'");
// Let's also try to add the trial button manually at the right spot
const heroBtn = "Começar Agora\n                </Button>";
const replacementHeroBtn = heroBtn + `
                <div className="mt-8 flex justify-center w-full">
                  <a href="https://wa.me/5584996162332?text=Ol%C3%A1!+Estou+no+site+e+gostaria+de+um+c%C3%B3digo+de+5+minutos+para+testar+o+sistema+por+dentro." target="_blank" className="text-sm text-white/50 hover:text-white underline decoration-white/30 underline-offset-4 flex items-center gap-2 transition-colors">
                    Quer testar 5 minutos de graça no X1? Me peça um código temporário.
                  </a>
                </div>
`;
if (landingCode.includes(heroBtn) && !landingCode.includes("Quer testar 5 minutos")) {
  landingCode = landingCode.replace(heroBtn, replacementHeroBtn);
}
fs.writeFileSync('src/pages/Landing.tsx', landingCode, 'utf8');
