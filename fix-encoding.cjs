const fs = require('fs');
const path = require('path');

const replacements = {
  'Ã§Ã£o': 'ção',
  'Ã§Ãµes': 'ções',
  'Ã¡': 'á',
  'Ã¢': 'â',
  'Ã£': 'ã',
  'Ã©': 'é',
  'Ãª': 'ê',
  'Ã­': 'í',
  'Ã³': 'ó',
  'Ãµ': 'õ',
  'Ãº': 'ú',
  'Ã§': 'ç',
  'Ã€': 'À',
  'Ã‰': 'É',
  'Ã“': 'Ó',
  'Ãš': 'Ú',
  'Ã': 'Á', // fallback for remaining Ã
  'ǭ': 'á',
  'ǜ': 'ã',
  'Ǧ': 'ê',
  'ǟ': 'ç',
  'ǽ': ' '
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Custom manual fixes for specific weird ones
    content = content.replace(/Anǭlises/g, 'Análises');
    content = content.replace(/Personalizaǜo/g, 'Personalização');
    content = content.replace(/vocǦ/g, 'você');
    content = content.replace(/Integraǟǟes/g, 'Integrações');
    content = content.replace(/Integraǟes/g, 'Integrações');
    content = content.replace(/Sǜo Paulo/g, 'São Paulo');
    content = content.replace(/Nǜo/g, 'Não');
    content = content.replace(/Ǹ/g, 'é');
    content = content.replace(/ǧ/g, 'ú');

    for (const [bad, good] of Object.entries(replacements)) {
      content = content.split(bad).join(good);
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  }
});
