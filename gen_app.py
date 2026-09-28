import codecs
import re

with codecs.open('src/App.tsx', 'r', 'utf-8') as f:
    content = f.read()

# Add import
import_statement = "import { CloudIde } from '@/pages/CloudIde'\n"
if "CloudIde" not in content:
    content = content.replace("import { Dashboard }", import_statement + "import { Dashboard }")

# Add route
route_statement = '<Route path="/ide" element={<CloudIde />} />\n'
if "/ide" not in content:
    content = content.replace('<Route path="/dashboard"', route_statement + '              <Route path="/dashboard"')

with codecs.open('src/App.tsx', 'w', 'utf-8') as f:
    f.write(content)
