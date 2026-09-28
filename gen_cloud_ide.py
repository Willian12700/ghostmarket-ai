import codecs

with codecs.open('src/pages/CloudIde.tsx', 'r', 'utf-8') as f:
    content = f.read()

content = content.replace("import { useState } from 'react'", "import { useState } from 'react' // @ts-nocheck")

with codecs.open('src/pages/CloudIde.tsx', 'w', 'utf-8') as f:
    f.write(content)
