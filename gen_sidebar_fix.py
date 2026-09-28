import codecs

with codecs.open('src/components/layout/Sidebar.tsx', 'r', 'utf-8') as f:
    content = f.read()

ide_item = "        { to: '/ide', icon: Code, label: 'Ghost IDE (BETA)' },\n"
if "Ghost IDE" not in content:
    content = content.replace("        { to: '/builder', icon: LayoutTemplate, label: 'Hospedar Novo Site' },\n", ide_item + "        { to: '/builder', icon: LayoutTemplate, label: 'Hospedar Novo Site' },\n")

with codecs.open('src/components/layout/Sidebar.tsx', 'w', 'utf-8') as f:
    f.write(content)
