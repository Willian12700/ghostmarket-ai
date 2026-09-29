import codecs
import re

with codecs.open('src/components/layout/Sidebar.tsx', 'r', 'utf-8') as f:
    content = f.read()

# Remove all DIGITALIZA_EMAILS blocks
pattern = r"\s*const DIGITALIZA_EMAILS = \[[\s\S]*?\]\s*if \(user\?\.email && DIGITALIZA_EMAILS\.includes\(user\.email\.toLowerCase\(\)\)\) \{\s*menuGroups\.push\(\{\s*label: 'Digitaliza Comercial',.*?\]\s*\}\)\s*\}"

content = re.sub(pattern, "", content)

# Inject just one instance
replacement = '''
  const DIGITALIZA_EMAILS = [
    'oliveiramirandaisaac@gmail.com',
    'josehenrique9373@gmail.com',
    'kaios8252@gmail.com',
    'daviizcl.0003@gmail.com',
    'el6084905@gmail.com',
    'adrianodeoliveiracarneiro13@gmail.com',
    'caioqsilva09@gmail.com',
    'willrandrier@gmail.com'
  ]

  if (user?.email && DIGITALIZA_EMAILS.includes(user.email.toLowerCase())) {
    menuGroups.push({
      label: 'Digitaliza Comercial',
      items: [
        { to: '/digitaliza-crm', icon: Users, label: 'CRM Compartilhado', badge: 'PRO' },
      ]
    })
  }
'''

content = re.sub(r'(?=\s*// Automatically expand group if a child is active)', replacement, content, count=1)

with codecs.open('src/components/layout/Sidebar.tsx', 'w', 'utf-8') as f:
    f.write(content)
