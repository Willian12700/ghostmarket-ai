const fs = require('fs');

// Fix Chatbots.tsx unused vars
let cFile = fs.readFileSync('src/pages/Chatbots.tsx', 'utf8');
cFile = cFile.replace("import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'", "import { Card, CardContent } from '@/components/ui/Card'");
fs.writeFileSync('src/pages/Chatbots.tsx', cFile, 'utf8');

// Fix SiteBuilder.tsx useEffect
let sFile = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

if (!sFile.includes("const q = query(collection(db, 'chatbots')")) {
  const fetchBotsCode = `
  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'chatbots'), where('userId', '==', user.uid))
      getDocs(q).then(snap => {
        const bots: any[] = []
        snap.forEach(d => bots.push({ id: d.id, ...d.data() }))
        setChatbots(bots)
      })
    }
  }, [user])
  `;
  // find useEffect(() => { \n      if (editId) {
  sFile = sFile.replace(/useEffect\(\(\) => \{\s*if \(editId\) \{/, fetchBotsCode + "\n  useEffect(() => {\n      if (editId) {");
  fs.writeFileSync('src/pages/SiteBuilder.tsx', sFile, 'utf8');
}
console.log('Fixed imports and useEffect');
