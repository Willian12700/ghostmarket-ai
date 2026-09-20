const fs = require('fs');

let settings = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

// Find the start and end of handlePhotoUpload
const startIndex = settings.indexOf('const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {');

// The function ends before `const handleSaveProfile`
const endIndex = settings.indexOf('const handleSaveProfile = async () => {');

if (startIndex !== -1 && endIndex !== -1) {
  const newHandlePhotoUpload = `const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.uid) return
    
    if (!file.type.startsWith('image/')) {
      addToast('Por favor, selecione uma imagem válida.', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 200
        const MAX_HEIGHT = 200
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8)

        try {
          setIsSavingProfile(true)
          const storageRef = ref(storage, \`profile_pics/\${user.uid}_\${Date.now()}.jpg\`)
          await uploadString(storageRef, compressedBase64, 'data_url')
          const downloadUrl = await getDownloadURL(storageRef)

          await updateUserProfile(name, downloadUrl)
          addToast('Foto de perfil atualizada!', 'success')
        } catch (error: any) {
          console.error(error)
          addToast('Erro ao enviar foto.', 'error')
        } finally {
          setIsSavingProfile(false)
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  `;

  settings = settings.substring(0, startIndex) + newHandlePhotoUpload + settings.substring(endIndex);
  fs.writeFileSync('src/pages/Settings.tsx', settings);
} else {
  console.log('Could not find boundaries');
}
