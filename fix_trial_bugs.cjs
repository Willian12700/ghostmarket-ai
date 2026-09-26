const fs = require('fs');

// 1. Fix authStore.ts
let authCode = fs.readFileSync('src/store/authStore.ts', 'utf8');
authCode = authCode.replace("uid: string\n  photoURL?: string | null", "uid: string\n  photoURL?: string | null\n  isAnonymous?: boolean");
// Also update when user is fetched
authCode = authCode.replace(/user: {\n\s*name: firebaseUser.displayName \|\| firebaseUser.email\?.split\('@'\)\[0\] \|\| 'User',\n\s*email: firebaseUser.email \|\| '',\n\s*uid: firebaseUser.uid,\n\s*photoURL: firebaseUser.photoURL\n\s*}/g, 
`user: {
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            uid: firebaseUser.uid,
            photoURL: firebaseUser.photoURL,
            isAnonymous: firebaseUser.isAnonymous
          }`);
fs.writeFileSync('src/store/authStore.ts', authCode, 'utf8');

// 2. Fix AdminPanel.tsx (Clock import)
let adminCode = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');
if (!adminCode.includes('Clock,')) {
  adminCode = adminCode.replace('ExternalLink }', 'ExternalLink, Clock }');
}
fs.writeFileSync('src/pages/AdminPanel.tsx', adminCode, 'utf8');

// 3. Fix MainLayout.tsx
let mainLayoutCode = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');
mainLayoutCode = mainLayoutCode.replace("<SalesNotifier />\n    </div>", "<SalesNotifier />\n      {user?.isAnonymous && <TrialTimer />}\n    </div>");
fs.writeFileSync('src/layouts/MainLayout.tsx', mainLayoutCode, 'utf8');

// 4. Fix Landing.tsx (Add the button properly, and fix Clock import)
let landingCode = fs.readFileSync('src/pages/Landing.tsx', 'utf8');
// Find the "Começar Agora" button in the hero section and put the trial link below it
const heroBtn = '<Button size="lg" className="h-14 px-8 text-lg font-bold shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] transition-all hover:scale-105" onClick={() => { document.getElementById(\'pricing\')?.scrollIntoView({ behavior: \'smooth\' }) }}>\n                  <Play className="w-5 h-5 mr-2" /> \n                  Começar Agora\n                </Button>';
const replacementHeroBtn = heroBtn + `
                <div className="mt-8 flex justify-center w-full">
                  <a href="https://wa.me/5584996162332?text=Ol%C3%A1!+Estou+no+site+e+gostaria+de+um+c%C3%B3digo+de+5+minutos+para+testar+o+sistema+por+dentro." target="_blank" className="text-sm text-white/50 hover:text-white underline decoration-white/30 underline-offset-4 flex items-center gap-2 transition-colors">
                    <Clock className="w-4 h-4" /> Quer testar 5 minutos de graça no X1? Me peça um código temporário.
                  </a>
                </div>
`;
if (landingCode.includes(heroBtn)) {
  landingCode = landingCode.replace(heroBtn, replacementHeroBtn);
}
fs.writeFileSync('src/pages/Landing.tsx', landingCode, 'utf8');

