const fs = require('fs');
let prompt = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

const regex = /features:\s*\{\s*auth:\s*true,\s*database:\s*true,\s*payments:\s*false,\s*api:\s*true,\s*dashboard:\s*true,\s*ai:\s*false\s*\}/;

const newFeatures = `features: {
        auth: true,
        database: true,
        payments: false,
        api: true,
        dashboard: true,
        ai: false,
        catalog: false,
        pix: false,
        delivery: false
      }`;

prompt = prompt.replace(regex, newFeatures);

fs.writeFileSync('src/pages/PromptBuilder.tsx', prompt, 'utf8');
console.log("Injected features into formData state");
