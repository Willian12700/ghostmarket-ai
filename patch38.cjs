const fs = require('fs');

let st = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

// Remove states
st = st.replace(/const \[freeAccessEmail, setFreeAccessEmail\] = useState\(''\)\s*const \[isGrantingAccess, setIsGrantingAccess\] = useState\(false\)/, '');

// Remove handleGrantFreeAccess
st = st.replace(/const handleGrantFreeAccess = async \(\) => \{[\s\S]*?finally \{\s*setIsGrantingAccess\(false\)\s*\}\s*\}/, '');

// Remove the Admin Card inside {user?.email === 'willrandrier@gmail.com' && ( ... )}
// The block is:
/*
        {user?.email === 'willrandrier@gmail.com' && (
          <>
            <Card className="border-primary/50 shadow-[0_0_15px_rgba(139,92,246,0.15)] bg-gradient-to-br from-panel to-primary/5">
              ...
            </Card>
*/
// Wait! If there's another <Card> inside the admin block (like Tema do Sistema), I MUST NOT REMOVE Tema do Sistema.
// Looking at the output, the admin block is:
/*
{user?.email === 'willrandrier@gmail.com' && (
          <>
            <Card className="border-primary/50 shadow-[0_0_15px_rgba(139,92,246,0.15)] bg-gradient-to-br from-panel to-primary/5">
              ... Admin Card Content ...
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-primary" />
                  Tema do Sistema
                </CardTitle>
...
*/

// I will only remove the FIRST Card inside the admin block.
const adminCardRegex = /<Card className="border-primary\/50 shadow-\[0_0_15px_rgba\(139,92,246,0\.15\)\] bg-gradient-to-br from-panel to-primary\/5\">[\s\S]*?Liberar Acesso Free[\s\S]*?<\/Card>/;
st = st.replace(adminCardRegex, '');

fs.writeFileSync('src/pages/Settings.tsx', st);
