import codecs

with codecs.open('src/components/layout/Sidebar.tsx', 'r', 'utf-8') as f:
    content = f.read()

# We will just split by "const DIGITALIZA_EMAILS" and rebuild the file
parts = content.split('  const DIGITALIZA_EMAILS = [')

# parts[0] has everything before the first block
# the last block we can identify where it ends
# The block ends after "  }" (closing the if user?.email)
# Actually, let's just use regular expressions without fancy stuff.
import re
clean_content = re.sub(r'\s*const DIGITALIZA_EMAILS = \[\s*[\s\S]*?CRM Compartilhado.*?\n\s*\]\n\s*\}\)\n\s*\}', '', content)

inject = '''
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

final_content = clean_content.replace('// Automatically expand group', inject + '\n  // Automatically expand group')

with codecs.open('src/components/layout/Sidebar.tsx', 'w', 'utf-8') as f:
    f.write(final_content)
