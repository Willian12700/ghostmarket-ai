const fs = require('fs');

const files = [
  'src/pages/tiktok/AdCopy.tsx',
  'src/pages/tiktok/PersonaGenerator.tsx',
  'src/pages/tiktok/ViralScripts.tsx'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/setGeneratedCopy\('Ops, o servidor de IA est.*? Tente novamente.\r?\n/g, "setGeneratedCopy('Ops, o servidor de IA está sobrecarregado no momento. Tente novamente.')\n");
  c = c.replace(/setGeneratedPersona\('Ops, o servidor de IA est.*? Tente novamente.\r?\n/g, "setGeneratedPersona('Ops, o servidor de IA está sobrecarregado no momento. Tente novamente.')\n");
  c = c.replace(/setGeneratedScript\('Ops, o servidor de IA est.*? Tente novamente.\r?\n/g, "setGeneratedScript('Ops, o servidor de IA está sobrecarregado no momento. Tente novamente.')\n");
  fs.writeFileSync(f, c);
});
