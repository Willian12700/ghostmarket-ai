const fs = require('fs');
let settings = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

const startIndex = settings.indexOf('const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {');
const endIndex = settings.indexOf('const handleSaveProfile = async () => {');

if (startIndex !== -1 && endIndex !== -1) {
  const newHandlePhotoUpload = `const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.uid) return
    
    if (!file.type.startsWith('image/')) {
      addToast('Por favor, selecione uma imagem válida.', 'error')
      return
    }

    setIsSavingProfile(true)
    try {
      const storageRef = ref(storage, \`logos/\${user.uid}_profile_\${Date.now()}.jpg\`)
      await uploadBytes(storageRef, file)
      const downloadUrl = await getDownloadURL(storageRef)

      await updateUserProfile(name, downloadUrl)
      addToast('Foto de perfil atualizada!', 'success')
    } catch (error: any) {
      console.error('Erro no uploadBytes:', error)
      addToast('Erro ao enviar foto para o servidor.', 'error')
    } finally {
      setIsSavingProfile(false)
    }
  }

  `;

  settings = settings.substring(0, startIndex) + newHandlePhotoUpload + settings.substring(endIndex);
  fs.writeFileSync('src/pages/Settings.tsx', settings);
}
