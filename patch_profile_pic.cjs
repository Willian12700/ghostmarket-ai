const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

const target = `          canvas.toBlob(async (blob) => {
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
        img.src = event.target?.result as string
      }`;

const newLogic = `          const base64Url = canvas.toDataURL('image/jpeg', 0.8)
          
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
        img.src = event.target?.result as string
      }`;

if (content.includes("canvas.toBlob(async (blob)")) {
  content = content.replace(target, newLogic);
  fs.writeFileSync('src/pages/Settings.tsx', content);
  console.log("Patched!");
} else {
  console.log("Could not find target!");
}
