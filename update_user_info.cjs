const fs = require('fs');

let code = fs.readFileSync('src/components/ui/AppPreview.tsx', 'utf8');

code = code.replace(
  '<span className="text-sm font-bold">WL</span>',
  '<span className="text-sm font-bold">Usuário Teste</span>'
);

code = code.replace(
  '<span className="text-[10px] text-white/40 font-medium tracking-wider">ADMINISTRADOR</span>',
  '<span className="text-[10px] text-white/40 font-medium tracking-wider uppercase">PLANO VITALÍCIO</span>'
);

code = code.replace(
  '<h1 className="text-5xl font-black tracking-tight mb-2">Olá, WL.</h1>',
  '<h1 className="text-5xl font-black tracking-tight mb-2">Olá, Usuário Teste.</h1>'
);

fs.writeFileSync('src/components/ui/AppPreview.tsx', code, 'utf8');
