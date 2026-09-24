import fs from 'fs';
const path = 'app/src/app/layout.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('`nimport { AnalyticsTracker }', '\\nimport { AnalyticsTracker }');
content = content.replace('`n        <AnalyticsTracker />', '\\n        <AnalyticsTracker />');

fs.writeFileSync(path, content);
console.log("Success");
