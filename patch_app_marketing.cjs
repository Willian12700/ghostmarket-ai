const fs = require('fs');

// 1. App.tsx
let appStr = fs.readFileSync('src/App.tsx', 'utf8');
if (!appStr.includes('VslGenerator')) {
  const imports = `import { VslGenerator } from '@/pages/marketing/VslGenerator'
import { PlrGenerator } from '@/pages/marketing/PlrGenerator'
import { AdsGenerator } from '@/pages/marketing/AdsGenerator'
import { EmailFunnel } from '@/pages/marketing/EmailFunnel'
`;
  appStr = appStr.replace("import { Chatbots } from '@/pages/Chatbots'", "import { Chatbots } from '@/pages/Chatbots'\n" + imports);
  
  const routes = `
              {/* Marketing Routes */}
              <Route path="/marketing/vsl" element={<VslGenerator />} />
              <Route path="/marketing/plr" element={<PlrGenerator />} />
              <Route path="/marketing/ads" element={<AdsGenerator />} />
              <Route path="/marketing/emails" element={<EmailFunnel />} />
`;
  appStr = appStr.replace('<Route path="/tiktok/ads" element={<AdCopy />} />', '<Route path="/tiktok/ads" element={<AdCopy />} />' + routes);
  fs.writeFileSync('src/App.tsx', appStr, 'utf8');
}

// 2. Sidebar.tsx
let sideStr = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
if (!sideStr.includes('/marketing/vsl')) {
  // Check if Target icon is imported
  if (!sideStr.includes('Target,')) {
    sideStr = sideStr.replace("Users, Video, TrendingUp", "Users, Video, TrendingUp, Target, Mail, Megaphone, BookOpen");
  }
  
  const marketingGroup = `
      {
        label: 'Marketing Digital',
        items: [
          { to: '/marketing/vsl', icon: Video, label: 'Fábrica de VSLs' },
          { to: '/marketing/plr', icon: BookOpen, label: 'Máquina de PLR / E-books' },
          { to: '/marketing/ads', icon: Megaphone, label: 'Gerador de Anúncios' },
          { to: '/marketing/emails', icon: Mail, label: 'Funil de E-mail' }
        ]
      },`;
      
  sideStr = sideStr.replace("{ to: '/tiktok/ads', icon: TrendingUp, label: 'Copy para Anúncios' }\n        ]\n      },", "{ to: '/tiktok/ads', icon: TrendingUp, label: 'Copy para Anúncios' }\n        ]\n      }," + marketingGroup);
  fs.writeFileSync('src/components/layout/Sidebar.tsx', sideStr, 'utf8');
}

console.log('Added marketing routes to App and Sidebar');
