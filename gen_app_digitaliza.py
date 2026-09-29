import codecs

with codecs.open('src/App.tsx', 'r', 'utf-8') as f:
    content = f.read()

import_statement = "import { DigitalizaCRM } from '@/pages/DigitalizaCRM'\n"
if "DigitalizaCRM" not in content:
    content = content.replace("import { Contracts }", import_statement + "import { Contracts }")

route_statement = '<Route path="/digitaliza-crm" element={<DigitalizaCRM />} />\n'
if "/digitaliza-crm" not in content:
    content = content.replace('<Route path="/contracts"', route_statement + '              <Route path="/contracts"')

with codecs.open('src/App.tsx', 'w', 'utf-8') as f:
    f.write(content)
