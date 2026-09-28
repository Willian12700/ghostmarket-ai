import codecs

with codecs.open('src/pages/CloudIde.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

badge = '''<span className="text-xs font-bold text-white bg-warning/20 border border-warning/30 px-2 py-0.5 rounded ml-2 uppercase">EM DESENVOLVIMENTO (EM BREVE)</span>'''

content = content.replace("meu-saas-premium</span>", "meu-saas-premium</span>" + badge)

with codecs.open('src/pages/CloudIde.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
