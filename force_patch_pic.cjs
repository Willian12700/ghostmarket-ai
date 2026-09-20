const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

const startIdx = content.indexOf('canvas.toBlob(async (blob) => {');
const endIdx = content.indexOf('img.src = event.target?.result as string');

if (startIdx !== -1 && endIdx !== -1) {
  const newLogic = `const base64Url = canvas.toDataURL('image/jpeg', 0.8)
          
          try {
            await updateUserProfile(name, base64Url)
            addToast('Foto de perfil atualizada!', 'success')
          } catch (error: any) {
            console.error('Erro ao salvar foto:', error)
            addToast('Erro ao salvar foto. A imagem pode ser muito grande.', 'error')
          } finally {
            setIsSavingProfile(false)
          }
        }
        `;
  
  content = content.substring(0, startIdx) + newLogic + content.substring(endIdx);
  fs.writeFileSync('src/pages/Settings.tsx', content);
  console.log("Force patched Settings.tsx!");
} else {
  console.log("Could not find boundaries.");
}
