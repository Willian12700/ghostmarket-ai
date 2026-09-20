const fs = require('fs');
let file = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

const regex = /const updateService = \([\s\S]*?setServices\(newS\);\s*\}/;

const replaceWith = `const updateService = (index: number, field: 'name' | 'price' | 'imageUrl' | 'uploading', value: any) => {
    const newS = [...services] as any;
    newS[index][field] = value;
    setServices(newS);
  }

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      updateService(index, 'uploading', true);
      const storageRef = ref(storage, \`products/\${Date.now()}_\${file.name.replace(/[^a-zA-Z0-9.]/g, '')}\`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      updateService(index, 'imageUrl', url);
    } catch (error) {
      console.error('Erro no upload da imagem', error);
    } finally {
      updateService(index, 'uploading', false);
    }
  }`;

file = file.replace(regex, replaceWith);

fs.writeFileSync('src/pages/PromptBuilder.tsx', file, 'utf8');
console.log('Fixed handleImageUpload injection');
