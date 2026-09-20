const fs = require('fs');

let prompt = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

// Fix encodings
prompt = prompt.replace(/Descri[^\x00-\x7F]+o/g, 'Descrição');
prompt = prompt.replace(/aplic[^\x00-\x7F]+o/g, 'aplicação');
prompt = prompt.replace(/cat[^\x00-\x7F]+logo/g, 'catálogo');
prompt = prompt.replace(/convers[^\x00-\x7F]+o/g, 'conversão');
prompt = prompt.replace(/p[^\x00-\x7F]+blico/g, 'público');
prompt = prompt.replace(/Informa[^\x00-\x7F]+es/g, 'Informações');
prompt = prompt.replace(/avalia[^\x00-\x7F]+es/g, 'avaliações');
prompt = prompt.replace(/VIS[^\x00-\x7F]+O/g, 'VISÃO');
prompt = prompt.replace(/N[^\x00-\x7F]+o/g, 'Não');
prompt = prompt.replace(/Configura[^\x00-\x7F]+es/g, 'Configurações');

// Insert new states and imports
prompt = prompt.replace("import { useState } from 'react'", "import { useState, useEffect } from 'react'\nimport { doc, onSnapshot } from 'firebase/firestore'\nimport { db } from '@/config/firebase'");
if (!prompt.includes("useEffect")) {
  prompt = prompt.replace("import { useToastStore } from '@/store/toastStore'", "import { useToastStore } from '@/store/toastStore'\nimport { useState, useEffect } from 'react'\nimport { doc, onSnapshot } from 'firebase/firestore'\nimport { db } from '@/config/firebase'");
}

const targetState = `  const [formData, setFormData] = useState({`;
const newStates = `  const [availableNiches, setAvailableNiches] = useState<string[]>([
    'SaaS / Tecnologia',
    'E-commerce / Lojas Virtuais',
    'Saúde e Bem-estar (Médicos/Estética)',
    'Finanças / Investimentos',
    'Imobiliária / Corretores',
    'Educação / Cursos Online (EAD)',
    'Restaurante / Delivery',
    'Agência de Marketing / Serviços'
  ]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'global_settings', 'niches'), (snap) => {
      if (snap.exists() && snap.data().list) {
        setAvailableNiches(snap.data().list);
      }
    });
    return () => unsub();
  }, []);

  const [formData, setFormData] = useState({`;

prompt = prompt.replace(targetState, newStates);

// Replace hardcoded select
const hardcodedSelect = `<select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.niche}
                    onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                  >
                    <option>SaaS / Tecnologia</option>
                    <option>E-commerce / Lojas Virtuais</option>
                    <option>Sade e Bem-estar (Mdicos/Esttica)</option>
                    <option>Finanas / Investimentos</option>
                    <option>Imobiliria / Corretores</option>
                    <option>Educao / Cursos Online (EAD)</option>
                    <option>Restaurante / Delivery</option>
                    <option>Agncia de Marketing / Servios</option>
                    <option>Outro</option>
                  </select>`;

const newSelect = `<select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.niche}
                    onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                  >
                    {availableNiches.map(n => <option key={n} value={n}>{n}</option>)}
                    <option value="Outro">Outro</option>
                  </select>`;

const selectIndex = prompt.indexOf('onChange={(e) => setFormData({ ...formData, niche: e.target.value })}');
if (selectIndex !== -1) {
  // Regex to replace the select
  prompt = prompt.replace(/<select[\s\S]*?onChange=\{\(e\) => setFormData\(\{ \.\.\.formData, niche: e\.target\.value \}\)\}[\s\S]*?<\/select>/, newSelect);
}

fs.writeFileSync('src/pages/PromptBuilder.tsx', prompt, 'utf8');
console.log('Patched PromptBuilder');
