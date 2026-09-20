const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// Add MessageCircle to imports
content = content.replace(
  "from 'lucide-react'",
  ", MessageCircle } from 'lucide-react'"
);
// fix potential double closing brace if the original was } from 'lucide-react'
content = content.replace("} , MessageCircle }", ", MessageCircle }");

const target = `            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-textSecondary hover:bg-panelHover hover:text-error transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>`;

const newLogic = `            <div className="flex gap-2 w-full">
              <a
                href="https://wa.me/5584996162332?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20no%20GhostMarket%20AI"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-textSecondary hover:bg-panelHover hover:text-white transition-colors border border-border/30 bg-background"
                title="Suporte no WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-success" />
                <span className="truncate">Suporte</span>
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-textSecondary hover:bg-panelHover hover:text-error transition-colors border border-border/30 bg-background"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
                <span className="truncate">Sair</span>
              </button>
            </div>`;

if (content.includes("onClick={handleLogout}")) {
  content = content.replace(target, newLogic);
  fs.writeFileSync('src/components/layout/Sidebar.tsx', content);
  console.log("Patched Sidebar!");
} else {
  console.log("Not found.");
}
