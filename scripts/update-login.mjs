import fs from 'fs';
const path = 'app/src/components/admin/login-form.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldStr = '<div className="admin-login-wrapper">';
const newStr = '<div className="admin-login-wrapper">\\n' +
'      <div style={{ position: "absolute", top: "24px", right: "24px", zIndex: 10, display: "flex", alignItems: "center", gap: "12px", background: "var(--panel)", padding: "6px 12px 6px 6px", borderRadius: "30px", border: "1px solid var(--line)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>\\n' +
'        <img src="https://ui-avatars.com/api/?name=Andris+Pe%C3%B1a&background=0D1117&color=fff&size=64" alt="Andris Peña" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />\\n' +
'        <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>Andris Peña</span>\\n' +
'      </div>';

if (content.includes(oldStr)) {
  content = content.replace(oldStr, newStr);
  fs.writeFileSync(path, content);
  console.log("Success login");
} else {
  console.log("Not found in login-form");
}
