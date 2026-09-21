import fs from 'fs';
const path = 'app/src/components/admin/admin-studio.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/\\.join\\("\\r?\\n"\\)/, '.join("\\\\n")');
content = content.replace(/\\.join\\("\\n"\\)/, '.join("\\\\n")');

fs.writeFileSync(path, content);
console.log("Success");
