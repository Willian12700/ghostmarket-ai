const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

const startIdx = content.indexOf('<button');
const endIdx = content.indexOf('</button>', startIdx) + '</button>'.length;

const newLogic = `<div className="flex gap-2 w-full">
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

// Wait, the first `<button` in Sidebar might NOT be the logout button!
// Let's find the specific one by using lastIndexOf from `</aside>`
const endAside = content.indexOf('</aside>');
const lastButtonStart = content.lastIndexOf('<button', endAside);
const lastButtonEnd = content.indexOf('</button>', lastButtonStart) + '</button>'.length;

if (lastButtonStart !== -1 && lastButtonEnd !== -1) {
  content = content.substring(0, lastButtonStart) + newLogic + content.substring(lastButtonEnd);
  fs.writeFileSync('src/components/layout/Sidebar.tsx', content);
  console.log("Patched Sidebar via lastIndexOf!");
} else {
  console.log("Failed to find boundaries");
}
