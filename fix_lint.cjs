const fs = require('fs');

// Sidebar.tsx
let sidebarContent = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
sidebarContent = sidebarContent.replace("from 'lucide-react'", ", Key } from 'lucide-react'");
fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebarContent, 'utf8');

// ActionLogs.tsx
let actionLogsContent = fs.readFileSync('src/components/admin/ActionLogs.tsx', 'utf8');
actionLogsContent = actionLogsContent.replace("import React, { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';");
actionLogsContent = actionLogsContent.replace("import { Search, Activity, Filter } from 'lucide-react';", "import { Search, Activity } from 'lucide-react';");
fs.writeFileSync('src/components/admin/ActionLogs.tsx', actionLogsContent, 'utf8');

// PartnerPanel.tsx
let partnerPanelContent = fs.readFileSync('src/pages/PartnerPanel.tsx', 'utf8');
partnerPanelContent = partnerPanelContent.replace("import React, { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';");
fs.writeFileSync('src/pages/PartnerPanel.tsx', partnerPanelContent, 'utf8');

