const fs = require('fs');

// 1. Fix Sidebar Package import
let sidebar = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace("import { LayoutDashboard, Package", "import { LayoutDashboard, Package } from 'lucide-react'\n// ");
sidebar = sidebar.replace(/import \{ LayoutDashboard, Package[\s\S]*?\n\/\//, "import { LayoutDashboard, Package");

if (!sidebar.includes('Package,')) {
    sidebar = sidebar.replace("import { LayoutDashboard,", "import { LayoutDashboard, Package,");
}
fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar, 'utf8');

// 2. Fix Products imports
let products = fs.readFileSync('src/pages/Products.tsx', 'utf8');
products = products.replace("ExternalLink, ", "");
products = products.replace("ArrowRight, ", "");
products = products.replace(", ArrowRight", "");
fs.writeFileSync('src/pages/Products.tsx', products, 'utf8');
