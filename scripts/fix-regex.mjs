import fs from 'fs';
const path = 'app/src/components/admin/admin-studio.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/lead\.message\.replace\(\/\[\s*;\]\/g, " "\)/, 'lead.message.replace(/[\\\\n\\\\r;]/g, " ")');

fs.writeFileSync(path, content);
console.log("Success");
