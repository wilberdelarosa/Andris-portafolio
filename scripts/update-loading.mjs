import fs from 'fs';
const path = 'app/src/components/admin/admin-studio.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldStr = '<p className="admin-empty">Comprobando la sesión…</p>';
const newStr = '<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>\\n' +
'          <div style={{ position: "relative", marginBottom: "24px" }}>\\n' +
'            <div style={{ position: "absolute", inset: -4, background: "linear-gradient(45deg, var(--color-blue), #8b5cf6)", borderRadius: "50%", filter: "blur(12px)", opacity: 0.6 }} />\\n' +
'            <img src="https://ui-avatars.com/api/?name=Andris+Pe%C3%B1a&background=0D1117&color=fff&size=128" alt="Andris Peña" style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.1)", position: "relative", zIndex: 1 }} />\\n' +
'          </div>\\n' +
'          <p style={{ color: "var(--muted)", fontSize: "15px", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" }}>\\n' +
'            <span style={{ width: "16px", height: "16px", border: "2px solid var(--muted)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />\\n' +
'            Comprobando sesión segura...\\n' +
'          </p>\\n' +
'          <style>{"@keyframes spin { 100% { transform: rotate(360deg); } }"}</style>\\n' +
'        </div>';

if (content.includes(oldStr)) {
  content = content.replace(oldStr, newStr);
  fs.writeFileSync(path, content);
  console.log("Success");
} else {
  console.log("Not found in admin-studio");
}
