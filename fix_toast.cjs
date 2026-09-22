const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

const oldBlock = `  const handleSaveTheme = async () => {
    if (!user?.uid) return
    setIsSavingTheme(true)
    try {
      await updateTheme(user.uid, { agencyName, primaryColor, appTheme })
      addToast('Apar\\u01E7ncia atualizada com sucesso', 'success')
    } catch (error) {
      addToast('Erro ao atualizar apar\\u01E7ncia', 'error')
    } finally {
      setIsSavingTheme(false)
    }
  }`;

// Actually let's just find "const handleSaveTheme" and replace everything until "const handleSavePassword"
const startIndex = content.indexOf('const handleSaveTheme = async () => {');
const endIndex = content.indexOf('const handleSavePassword = async () => {');

const newBlock = `  const handleSaveTheme = async () => {
    if (!user?.uid) return
    setIsSavingTheme(true)
    try {
      await updateTheme(user.uid, { agencyName, primaryColor, appTheme: appTheme || 'default' })
      addToast('Configurações atualizadas com sucesso!', 'success')
    } catch (error: any) {
      console.error(error)
      addToast('Erro: ' + error.message, 'error')
    } finally {
      setIsSavingTheme(false)
    }
  }

  `;

if (startIndex !== -1 && endIndex !== -1) {
   content = content.substring(0, startIndex) + newBlock + content.substring(endIndex);
   fs.writeFileSync('src/pages/Settings.tsx', content, 'utf8');
   console.log("Successfully replaced block.");
} else {
   console.log("Could not find block.");
}
