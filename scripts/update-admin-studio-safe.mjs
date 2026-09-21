import fs from 'fs';
const path = 'app/src/components/admin/admin-studio.tsx';
let content = fs.readFileSync(path, 'utf8');

const loadingOld = '<p className="admin-empty">Comprobando la sesión…</p>';
const loadingNew = '<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>\\n' +
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

content = content.replace(loadingOld, loadingNew);

const startStr = 'function Dashboard({';
const endStr = '/* ---------------------------------------------------------------------------';
const endDashboardIndex = content.indexOf(endStr, content.indexOf(startStr) + 100);

let newDashboard = "function Dashboard({\\n" +
"  projects,\\n" +
"  leads,\\n" +
"  quotes,\\n" +
"  drafts,\\n" +
"  connection,\\n" +
"  go,\\n" +
"}: {\\n" +
"  projects: PropertyProject[];\\n" +
"  leads: CmsLead[];\\n" +
"  quotes: CalculatorQuote[];\\n" +
"  drafts: ProjectDraft[];\\n" +
"  connection: CmsConnection;\\n" +
"  go: (tab: Tab) => void;\\n" +
"}) {\\n" +
"  const pendingLeads = leads.filter((lead) => lead.status !== 'sent').length;\\n" +
"  \\n" +
"  return (\\n" +
"    <>\\n" +
"      {/* Cabecera Tipo App */}\\n" +
"      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--panel)', borderBottom: '1px solid var(--line)', margin: '-24px -24px 20px -24px' }}>\\n" +
"        <div>\\n" +
"          <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 600 }}>Inicio</h1>\\n" +
"          <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>Resumen de actividad</p>\\n" +
"        </div>\\n" +
"      </div>\\n" +
"\\n" +
"      {/* Accesos Directos - Horizontal Scrollable en Movil */}\\n" +
"      <h2 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', margin: '0 0 12px 0' }}>Accesos rápidos</h2>\\n" +
"      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', WebkitOverflowScrolling: 'touch' }} className='hide-scroll'>\\n" +
"        <button onClick={() => go('nuevo')} style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'var(--soft)', padding: '16px', borderRadius: '16px', border: '1px solid var(--line)', minWidth: '96px', cursor: 'pointer' }}>\\n" +
"          <div style={{ background: 'var(--text)', color: 'var(--bg)', padding: '10px', borderRadius: '12px' }}><Buildings size={20} weight='fill' /></div>\\n" +
"          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)' }}>Nuevo</span>\\n" +
"        </button>\\n" +
"        <button onClick={() => go('leads')} style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'var(--soft)', padding: '16px', borderRadius: '16px', border: '1px solid var(--line)', minWidth: '96px', cursor: 'pointer' }}>\\n" +
"          <div style={{ background: 'var(--panel)', color: 'var(--text)', padding: '10px', borderRadius: '12px', border: '1px solid var(--line)' }}><UsersThree size={20} weight='fill' /></div>\\n" +
"          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)' }}>Leads</span>\\n" +
"        </button>\\n" +
"        <button onClick={() => go('cotizaciones')} style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'var(--soft)', padding: '16px', borderRadius: '16px', border: '1px solid var(--line)', minWidth: '96px', cursor: 'pointer' }}>\\n" +
"          <div style={{ background: 'var(--panel)', color: 'var(--text)', padding: '10px', borderRadius: '12px', border: '1px solid var(--line)' }}><Calculator size={20} weight='fill' /></div>\\n" +
"          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)' }}>Cotizar</span>\\n" +
"        </button>\\n" +
"        <button onClick={() => go('diagnostico')} style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'var(--soft)', padding: '16px', borderRadius: '16px', border: '1px solid var(--line)', minWidth: '96px', cursor: 'pointer' }}>\\n" +
"          <div style={{ background: 'var(--panel)', color: 'var(--text)', padding: '10px', borderRadius: '12px', border: '1px solid var(--line)' }}><Stethoscope size={20} weight='fill' /></div>\\n" +
"          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)' }}>Salud</span>\\n" +
"        </button>\\n" +
"      </div>\\n" +
"\\n" +
"      <style>{'.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; } .app-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 20px; }'}</style>\\n" +
"\\n" +
"      {/* Grid de Estadísticas Compacto */}\\n" +
"      <div className='app-grid-2'>\\n" +
"        <div style={{ background: 'var(--panel)', padding: '16px', borderRadius: '16px', border: '1px solid var(--line)' }}>\\n" +
"          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--muted)' }}>\\n" +
"            <Buildings size={18} />\\n" +
"            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Publicados</span>\\n" +
"          </div>\\n" +
"          <strong style={{ fontSize: '28px', display: 'block', color: 'var(--text)' }}>{projects.length}</strong>\\n" +
"        </div>\\n" +
"        <div style={{ background: 'var(--panel)', padding: '16px', borderRadius: '16px', border: '1px solid var(--line)' }}>\\n" +
"          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--muted)' }}>\\n" +
"            <FileSql size={18} />\\n" +
"            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Borradores</span>\\n" +
"          </div>\\n" +
"          <strong style={{ fontSize: '28px', display: 'block', color: 'var(--text)' }}>{drafts.length}</strong>\\n" +
"        </div>\\n" +
"        <div style={{ background: 'var(--panel)', padding: '16px', borderRadius: '16px', border: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}>\\n" +
"          {pendingLeads > 0 && <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#ef4444' }} />}\\n" +
"          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--muted)' }}>\\n" +
"            <UsersThree size={18} />\\n" +
"            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Leads</span>\\n" +
"          </div>\\n" +
"          <strong style={{ fontSize: '28px', display: 'block', color: 'var(--text)' }}>{leads.length}</strong>\\n" +
"          {pendingLeads > 0 && <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 500 }}>{pendingLeads} sin leer</span>}\\n" +
"        </div>\\n" +
"        <div style={{ background: 'var(--panel)', padding: '16px', borderRadius: '16px', border: '1px solid var(--line)' }}>\\n" +
"          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--muted)' }}>\\n" +
"            <Calculator size={18} />\\n" +
"            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Cotiz.</span>\\n" +
"          </div>\\n" +
"          <strong style={{ fontSize: '28px', display: 'block', color: 'var(--text)' }}>{quotes.length}</strong>\\n" +
"        </div>\\n" +
"      </div>\\n" +
"\\n" +
"      {/* Cards de Información de la DB/API */}\\n" +
"      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>\\n" +
"        <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: '#fff', padding: '20px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>\\n" +
"          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>\\n" +
"            <h3 style={{ margin: 0, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}><Database size={18} /> Supabase CMS</h3>\\n" +
"            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>{connection.detail.includes('Memoria') ? 'OFFLINE' : 'LIVE'}</span>\\n" +
"          </div>\\n" +
"          <p style={{ fontSize: '13px', opacity: 0.8, lineHeight: 1.5, margin: '0 0 16px 0' }}>{connection.detail}</p>\\n" +
"          <button onClick={() => go('esquema')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Stethoscope size={16} /> Ver Esquemas</button>\\n" +
"        </div>\\n" +
"        \\n" +
"        <div style={{ background: 'var(--panel)', padding: '20px', borderRadius: '20px', border: '1px solid var(--line)' }}>\\n" +
"          <h3 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>API v1 Estática</h3>\\n" +
"          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>\\n" +
"            Endpoints generados en tiempo de build con tipado OpenAPI.\\n" +
"          </p>\\n" +
"          <a href='/api/v1/projects.json' target='_blank' rel='noopener noreferrer' style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--soft)', color: 'var(--text)', padding: '10px 16px', borderRadius: '12px', textDecoration: 'none', fontSize: '13px', fontWeight: 500, border: '1px solid var(--line)' }}>\\n" +
"            <ArrowSquareOut size={16} /> projects.json\\n" +
"          </a>\\n" +
"        </div>\\n" +
"      </div>\\n" +
"    </>\\n" +
"  );\\n" +
"}\\n\\n";

const startIndex = content.indexOf(startStr);
const oldSection = content.substring(startIndex, endDashboardIndex);
content = content.replace(oldSection, newDashboard);
fs.writeFileSync(path, content);
console.log("Success");
