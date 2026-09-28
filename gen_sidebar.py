import codecs

with codecs.open('src/components/layout/Sidebar.tsx', 'r', 'utf-8') as f:
    content = f.read()

ide_link = "      { title: 'Ghost IDE (BETA)', path: '/ide', icon: Code, badge: 'NOVO', isActive: location.pathname === '/ide' },\n"
if "/ide" not in content:
    content = content.replace("      { title: 'Hospedar Site'", ide_link + "      { title: 'Hospedar Site'")

with codecs.open('src/components/layout/Sidebar.tsx', 'w', 'utf-8') as f:
    f.write(content)
