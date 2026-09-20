const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

// Fix handleLogoUpload
const startLogo = content.indexOf('const handleLogoUpload = async');
const endLogo = content.indexOf('const handlePhotoUpload =');

if (startLogo !== -1 && endLogo !== -1) {
const newLogoLogic = `const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.uid) return

    if (!file.type.startsWith('image/')) {
      addToast('Por favor, selecione uma imagem válida.', 'error')
      return
    }

    setIsUploadingLogo(true)

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = async () => {
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

        const base64Url = canvas.toDataURL('image/jpeg', 0.8)
        
        try {
          await updateTheme(user.uid, { logoUrl: base64Url })
          addToast('Logo atualizada com sucesso', 'success')
        } catch (error) {
          addToast('Erro ao fazer upload da logo. A imagem pode ser muito grande.', 'error')
          console.error(error)
        } finally {
          setIsUploadingLogo(false)
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  `;

  content = content.substring(0, startLogo) + newLogoLogic + content.substring(endLogo);
}

// Fix missing async in handlePhotoUpload
content = content.replace("img.onload = () => {\n          const canvas = document.createElement('canvas')", "img.onload = async () => {\n          const canvas = document.createElement('canvas')");

fs.writeFileSync('src/pages/Settings.tsx', content);
