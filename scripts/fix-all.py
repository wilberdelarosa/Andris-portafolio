import re

path = 'app/src/components/admin/admin-studio.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'\[header, \.\.\.rows\]\.join\("\n"\)', r'[header, ...rows].join("\\n")', content)
content = re.sub(r'\[header, \.\.\.rows\]\.join\("\r\n"\)', r'[header, ...rows].join("\\n")', content)
content = re.sub(r'lead\.message\.replace\(/\[\n\r;\]/g', r'lead.message.replace(/[\\n\\r;]/g', content)
content = re.sub(r'lead\.message\.replace\(/\[\r\n\r;\]/g', r'lead.message.replace(/[\\n\\r;]/g', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Success")
