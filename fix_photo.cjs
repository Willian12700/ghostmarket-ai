const fs = require('fs');

let settings = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

const startIndex = settings.indexOf('const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {');
const endIndex = settings.indexOf('const handleSaveProfile = async () => {');

if (startIndex !== -1 && endIndex !== -1) {
  const newHandlePhotoUpload = `const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.uid) return
    
    if (!file.type.startsWith('image/')) {
      addToast('Por favor, selecione uma imagem válida.', 'error')
      return
    }

    setIsSavingProfile(true)

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 256
        const MAX_HEIGHT = 256
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

        canvas.toBlob(async (blob) => {
          if (!blob) {
            setIsSavingProfile(false)
            addToast('Erro ao processar imagem.', 'error')
            return
          }

          try {
            const storageRef = ref(storage, \`logos/\${user.uid}_profile_\${Date.now()}.jpg\`)
            await uploadBytes(storageRef, blob)
            const downloadUrl = await getDownloadURL(storageRef)

            await updateUserProfile(name, downloadUrl)
            addToast('Foto de perfil atualizada!', 'success')
          } catch (error: any) {
            console.error('Erro no uploadBytes:', error)
            addToast('Erro ao enviar foto para o servidor.', 'error')
          } finally {
            setIsSavingProfile(false)
          }
        }, 'image/jpeg', 0.8)
      }
      img.onerror = () => {
        setIsSavingProfile(false)
        addToast('Erro ao ler a imagem.', 'error')
      }
      img.src = event.target?.result as string
    }
    reader.onerror = () => {
      setIsSavingProfile(false)
      addToast('Erro no leitor de arquivos.', 'error')
    }
    reader.readAsDataURL(file)
  }

  `;

  settings = settings.substring(0, startIndex) + newHandlePhotoUpload + settings.substring(endIndex);
  fs.writeFileSync('src/pages/Settings.tsx', settings);
}
