const fs = require('fs');

let st = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

// The block to remove is exactly the "Liberar Acesso Free" code
const oldAdminBlock = `{user?.email === 'willrandrier@gmail.com' && (
          <>
            <Card className="border-primary/50 shadow-[0_0_15px_rgba(139,92,246,0.15)] bg-gradient-to-br from-panel to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <UserCheck className="w-5 h-5" />
                  Liberar Acesso Free (Somente Admin)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-textSecondary">
                    Insira o email de um usuário para liberar acesso total à plataforma GhostMarket sem necessidade de assinatura.
                  </p>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Input 
                        label="E-mail do Usuário" 
                        placeholder="email@exemplo.com"
                        value={freeAccessEmail}
                        onChange={(e) => setFreeAccessEmail(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleGrantFreeAccess}
                      disabled={isGrantingAccess || !freeAccessEmail}
                      className="w-48"
                    >
                      {isGrantingAccess ? 'Liberando...' : 'Liberar Acesso Free'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}`;

// I'll just use regex to remove it safely just in case there's slight formatting differences.
const regex = /\{user\?.email === 'willrandrier@gmail.com' && \([\s\S]*?Liberar Acesso Free[\s\S]*?\}\)/g;
st = st.replace(regex, '');

// also remove `const [freeAccessEmail` and `handleGrantFreeAccess`
st = st.replace(/const \[freeAccessEmail[\s\S]*?setIsGrantingAccess\(false\)\s*\}\s*\}/, '');

fs.writeFileSync('src/pages/Settings.tsx', st);
