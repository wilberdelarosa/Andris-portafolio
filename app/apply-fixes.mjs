import fs from "fs";

// 1. admin.css
let adminCss = fs.readFileSync("src/components/admin/admin.css", "utf8");
adminCss = adminCss.replace("bottom: 24px;", "bottom: 100px;");
if (!adminCss.includes(".admin-more-menu")) {
  adminCss += `
/* --- Mobile "Más" Menu --- */
.admin-more-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 12px;
  background: var(--color-ink);
  border: 1px solid var(--color-ink-soft);
  border-radius: 16px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 12px 40px rgba(11, 31, 58, 0.4);
  transform-origin: bottom right;
  animation: admin-pop-up 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  min-width: 140px;
}
@keyframes admin-pop-up {
  0% { opacity: 0; transform: scale(0.95) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
.admin-more-menu button {
  flex-direction: row !important;
  min-height: 44px !important;
  justify-content: flex-start !important;
  font-size: 13px !important;
  padding: 0 16px !important;
}
`;
}
fs.writeFileSync("src/components/admin/admin.css", adminCss);

// 2. admin-studio.tsx
let adminStudio = fs.readFileSync("src/components/admin/admin-studio.tsx", "utf8");
if (!adminStudio.includes("DotsThree")) {
  adminStudio = adminStudio.replace("Database,", "Database,\n  DotsThree,");
}
if (!adminStudio.includes("showMoreMenu")) {
  adminStudio = adminStudio.replace('const [tab, setTab] = useState<Tab>("resumen");', 'const [tab, setTab] = useState<Tab>("resumen");\n  const [showMoreMenu, setShowMoreMenu] = useState(false);');
}
if (!adminStudio.includes("TABS.slice(0, 4)")) {
  const oldNav = `<nav className="admin-tabbar" aria-label="Secciones del estudio">
        {TABS.map((item) => (
          <button
            key={item.id}
            className={item.id === tab ? "is-active" : ""}
            onClick={() => go(item.id)}
            aria-current={item.id === tab ? "page" : undefined}
          >
            <item.icon size={22} weight={item.id === tab ? "fill" : "regular"} />
            {item.label}
          </button>
        ))}
      </nav>`;
  const newNav = `<nav className="admin-tabbar" aria-label="Secciones del estudio">
        {TABS.slice(0, 4).map((item) => (
          <button
            key={item.id}
            className={item.id === tab ? "is-active" : ""}
            onClick={() => { go(item.id); setShowMoreMenu(false); }}
            aria-current={item.id === tab ? "page" : undefined}
          >
            <item.icon size={22} weight={item.id === tab ? "fill" : "regular"} />
            {item.label}
          </button>
        ))}
        <div style={{ position: "relative", display: "flex", flex: 1 }}>
          <button
            type="button"
            className={showMoreMenu || TABS.slice(4).some(t => t.id === tab) ? "is-active" : ""}
            onClick={() => setShowMoreMenu(!showMoreMenu)}
          >
            <DotsThree size={22} weight={showMoreMenu ? "fill" : "regular"} />
            Más
          </button>
          {showMoreMenu && (
            <div className="admin-more-menu">
              {TABS.slice(4).map((item) => (
                <button
                  key={item.id}
                  className={item.id === tab ? "is-active" : ""}
                  onClick={() => { go(item.id); setShowMoreMenu(false); }}
                  aria-current={item.id === tab ? "page" : undefined}
                >
                  <item.icon size={20} weight={item.id === tab ? "fill" : "regular"} />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>`;
  adminStudio = adminStudio.replace(oldNav, newNav);
}
// Fix Math.random()
adminStudio = adminStudio.replace(/Math\.floor\(Math\.random\(\) \* 500\) \+ 100/g, '152');
fs.writeFileSync("src/components/admin/admin-studio.tsx", adminStudio);

// 3. new-project-form.tsx
let npf = fs.readFileSync("src/components/admin/new-project-form.tsx", "utf8");
npf = npf.replace(/useState\(1\)/g, "useState(0)");
npf = npf.replace(/useState\(10\)/g, "useState(0)");
npf = npf.replace(/useState\(30\)/g, "useState(0)");
npf = npf.replace(/useState\(60\)/g, "useState(0)");
fs.writeFileSync("src/components/admin/new-project-form.tsx", npf);

// 4. analytics-tracker.tsx
let at = fs.readFileSync("src/components/analytics-tracker.tsx", "utf8");
at = at.replace('pathname.match(/^\\/proyectos\\/([^\\/]+)$/);', 'pathname.match(/^\\/proyectos\\/([^\\/]+)$/);'); // Wait, the original regex works! No need to change it.
fs.writeFileSync("src/components/analytics-tracker.tsx", at);

console.log("Fixes applied successfully.");
