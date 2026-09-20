"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowSquareOut,
  Buildings,
  Calculator,
  CheckCircle,
  Database,
  DownloadSimple,
  FileSql,
  SquaresFour,
  Trash,
  UploadSimple,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import "./admin.css";
import { NewProjectForm } from "./new-project-form";
import { NotificationCenter } from "./notification-center";

import { getPublishedProjects, type PropertyProject } from "@/content/projects";
import { getContentRepository } from "@/lib/cms/repository";
import {
  draftsStore,
  leadsStore,
  onCmsChange,
  quotesStore,
} from "@/lib/cms/local-store";
import type {
  CalculatorQuote,
  CmsLead,
  CmsConnection,
  ProjectDraft,
} from "@/lib/cms/types";

type Tab = "resumen" | "proyectos" | "nuevo" | "leads" | "cotizaciones" | "esquema";

const TABS: { id: Tab; label: string; icon: typeof SquaresFour }[] = [
  { id: "resumen", label: "Resumen", icon: SquaresFour },
  { id: "proyectos", label: "Proyectos", icon: Buildings },
  { id: "nuevo", label: "Añadir Proyecto", icon: Buildings },
  { id: "leads", label: "Leads", icon: UsersThree },
  { id: "cotizaciones", label: "Cotizaciones", icon: Calculator },
  { id: "esquema", label: "Esquema", icon: Database },
];

const money = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const moneyExact = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});
const dateTime = new Intl.DateTimeFormat("es-DO", {
  dateStyle: "medium",
  timeStyle: "short",
});

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob(["﻿" + content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function AdminStudio() {
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<Tab>("resumen");
  const [leads, setLeads] = useState<CmsLead[]>([]);
  const [quotes, setQuotes] = useState<CalculatorQuote[]>([]);
  const [drafts, setDrafts] = useState<ProjectDraft[]>([]);
  const projects = useMemo(() => getPublishedProjects(), []);
  const connection: CmsConnection = useMemo(
    () => getContentRepository().connection(),
    [],
  );

  useEffect(() => {
    const load = () => {
      setLeads(leadsStore.list());
      setQuotes(quotesStore.list());
      setDrafts(draftsStore.list());
    };
    const syncTab = () => {
      const hash = location.hash.replace("#", "") as Tab;
      if (TABS.some((item) => item.id === hash)) setTab(hash);
    };
    load();
    syncTab();
    const unsubscribe = onCmsChange(load);
    window.addEventListener("hashchange", syncTab);
    return () => {
      unsubscribe();
      window.removeEventListener("hashchange", syncTab);
    };
  }, []);

  const go = (next: Tab) => {
    setTab(next);
    history.replaceState(null, "", `#${next}`);
  };

  const active = TABS.find((item) => item.id === tab) ?? TABS[0];

  return (
    <div className="admin-shell">
      {/* Barra lateral de escritorio */}
      <aside className="admin-side">
        <div className="admin-brand">
          <span className="admin-brand-mark">AP</span>
          <div>
            <strong>Andris Peña</strong>
            <small>Estudio CMS</small>
          </div>
        </div>
        <nav className="admin-nav" aria-label="Secciones del estudio">
          {TABS.map((item) => (
            <button
              key={item.id}
              className={item.id === tab ? "is-active" : ""}
              onClick={() => go(item.id)}
              aria-current={item.id === tab ? "page" : undefined}
            >
              <item.icon size={20} weight={item.id === tab ? "fill" : "regular"} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="admin-side-foot">
          <p className="admin-env">
            <i />
            {connection.provider === "supabase"
              ? "Supabase conectado"
              : "Modo estudio local"}
          </p>
          <Link href="/" className="admin-nav-link">
            <ArrowSquareOut size={18} /> Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Barra superior y pestañas de móvil */}
      <header className="admin-topbar">
        <strong>
          <span className="admin-brand-mark">AP</span> Estudio CMS
        </strong>
        <Link href="/">
          Sitio <ArrowSquareOut size={15} />
        </Link>
      </header>

      <main className="admin-main">
        <div className="admin-main-inner">
          <NotificationCenter />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              className="admin-tab-panel"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {tab === "resumen" && (
                <Dashboard
                  projects={projects}
                  leads={leads}
                  quotes={quotes}
                  drafts={drafts}
                  connection={connection}
                  go={go}
                />
              )}
              {tab === "proyectos" && (
                <ProjectsPanel projects={projects} drafts={drafts} />
              )}
              {tab === "nuevo" && <NewProjectForm />}
              {tab === "leads" && <LeadsPanel leads={leads} />}
              {tab === "cotizaciones" && <QuotesPanel quotes={quotes} projects={projects} />}
              {tab === "esquema" && <SchemaPanel />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <nav className="admin-tabbar" aria-label="Secciones del estudio">
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
      </nav>
      <span className="sr-only" aria-live="polite">
        {active.label}
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Resumen
--------------------------------------------------------------------------- */
function Dashboard({
  projects,
  leads,
  quotes,
  drafts,
  connection,
  go,
}: {
  projects: PropertyProject[];
  leads: CmsLead[];
  quotes: CalculatorQuote[];
  drafts: ProjectDraft[];
  connection: CmsConnection;
  go: (tab: Tab) => void;
}) {
  const pendingLeads = leads.filter((lead) => lead.status !== "sent").length;
  return (
    <>
      <div className="admin-page-head">
        <p className="kicker">Panel de control</p>
        <h1>Todo el contenido, en un solo lugar.</h1>
        <p>
          Proyectos, leads y cotizaciones del portafolio. Hoy funcionan sobre el
          contenido estático verificado; la migración a Supabase está preparada
          y documentada.
        </p>
      </div>

      <div className="admin-grid stats">
        <div className="admin-card stat-card">
          <span className="stat-icon"><Buildings size={20} /></span>
          <strong>{projects.length}</strong>
          <span>Proyectos publicados</span>
        </div>
        <div className="admin-card stat-card">
          <span className="stat-icon"><FileSql size={20} /></span>
          <strong>{drafts.length}</strong>
          <span>Borradores editoriales</span>
        </div>
        <div className="admin-card stat-card">
          <span className="stat-icon"><UsersThree size={20} /></span>
          <strong>{leads.length}</strong>
          <span>{pendingLeads ? `${pendingLeads} por gestionar` : "Leads registrados"}</span>
        </div>
        <div className="admin-card stat-card">
          <span className="stat-icon"><Calculator size={20} /></span>
          <strong>{quotes.length}</strong>
          <span>Cotizaciones PDF</span>
        </div>
      </div>

      <div className="admin-grid" style={{ marginTop: 16, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <div className="admin-card dark pad-lg">
          <h2>Conexión del CMS</h2>
          <p>{connection.detail}</p>
          <div className="admin-actions">
            <button className="button button-sand" onClick={() => go("esquema")}>
              <Database size={17} /> Ver esquema SQL
            </button>
          </div>
        </div>
        <div className="admin-card pad-lg">
          <h2>API v1 del portafolio</h2>
          <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.7 }}>
            El API estática se regenera en cada build desde el mismo repositorio
            de contenido. Contrato documentado en OpenAPI.
          </p>
          <div className="admin-actions">
            <a className="button button-outline" href="/api/v1/projects.json" target="_blank" rel="noopener noreferrer">
              <ArrowSquareOut size={16} /> projects.json
            </a>
            <a className="button button-outline" href="/api/v1/openapi.json" target="_blank" rel="noopener noreferrer">
              <ArrowSquareOut size={16} /> OpenAPI
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------------
   Proyectos + editor de borradores
--------------------------------------------------------------------------- */
function ProjectsPanel({
  projects,
  drafts,
}: {
  projects: PropertyProject[];
  drafts: ProjectDraft[];
}) {
  const [selected, setSelected] = useState(projects[0]?.slug ?? "");
  const project = projects.find((item) => item.slug === selected) ?? null;
  const draft = drafts.find((item) => item.projectId === selected) ?? null;
  const importRef = useRef<HTMLInputElement>(null);

  const exportDrafts = () =>
    downloadFile(
      "andris-cms-borradores.json",
      JSON.stringify(drafts, null, 2),
      "application/json",
    );

  const importDrafts = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!Array.isArray(parsed)) throw new Error("formato");
      for (const item of parsed as ProjectDraft[]) {
        if (item && typeof item.projectId === "string" && item.fields) {
          draftsStore.save({
            projectId: item.projectId,
            fields: item.fields,
            notes: typeof item.notes === "string" ? item.notes : "",
          });
        }
      }
    } catch {
      window.alert("El archivo no es un JSON de borradores válido.");
    }
  };

  return (
    <>
      <div className="admin-page-head">
        <p className="kicker">Contenido</p>
        <h1>Proyectos</h1>
        <p>
          Edita los datos comerciales como borrador local. Nada se publica sin
          evidencia: los campos pendientes se mantienen “por confirmar”.
        </p>
      </div>

      <div className="admin-projects">
        <div className="admin-project-list" role="listbox" aria-label="Proyectos">
          {projects.map((item) => {
            const hasDraft = drafts.some((d) => d.projectId === item.slug);
            return (
              <button
                key={item.slug}
                role="option"
                aria-selected={item.slug === selected}
                className={`admin-project-item${item.slug === selected ? " is-active" : ""}`}
                onClick={() => setSelected(item.slug)}
              >
                <Image
                  src={item.hero}
                  alt=""
                  width={74}
                  height={56}
                  className="admin-project-thumb"
                />
                <span className="meta">
                  <strong>{item.name}</strong>
                  <small>{item.location}</small>
                  <span className="chips">
                    <span className="chip ok"><i />Publicado</span>
                    {item.price.status === "pending" && (
                      <span className="chip pending"><i />Precio pendiente</span>
                    )}
                    {hasDraft && (
                      <span className="chip info"><i />Borrador</span>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
          <div className="admin-actions">
            <button className="button button-outline" onClick={exportDrafts}>
              <DownloadSimple size={16} /> Exportar borradores
            </button>
            <button className="button button-outline" onClick={() => importRef.current?.click()}>
              <UploadSimple size={16} /> Importar
            </button>
            <input
              ref={importRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importDrafts(file);
                event.target.value = "";
              }}
            />
          </div>
        </div>

        {project ? (
          <ProjectEditor key={`${project.slug}-${draft?.updatedAt ?? "base"}`} project={project} draft={draft} />
        ) : (
          <div className="admin-empty">Selecciona un proyecto</div>
        )}
      </div>
    </>
  );
}

function ProjectEditor({
  project,
  draft,
}: {
  project: PropertyProject;
  draft: ProjectDraft | null;
}) {
  const f = draft?.fields ?? {};
  const [priceFrom, setPriceFrom] = useState(
    String(f.priceFrom ?? project.price.from ?? ""),
  );
  const [priceTo, setPriceTo] = useState(
    String(f.priceTo ?? project.price.to ?? ""),
  );
  const [priceStatus, setPriceStatus] = useState<"confirmed" | "pending">(
    f.priceStatus ?? project.price.status,
  );
  const [reservation, setReservation] = useState(
    String(f.reservationAmount ?? project.reservation.amount ?? ""),
  );
  const [deliveryLabel, setDeliveryLabel] = useState(
    f.deliveryLabelEs ?? project.delivery.label.es,
  );
  const [deliveryYear, setDeliveryYear] = useState(
    String(f.deliveryYear ?? project.delivery.year ?? ""),
  );
  const [notes, setNotes] = useState(draft?.notes ?? "");
  const [saved, setSaved] = useState(false);

  const toNumber = (value: string): number | null => {
    const parsed = Number(value);
    return value.trim() !== "" && Number.isFinite(parsed) ? parsed : null;
  };

  const save = () => {
    draftsStore.save({
      projectId: project.slug,
      notes,
      fields: {
        priceFrom: toNumber(priceFrom),
        priceTo: toNumber(priceTo),
        priceStatus,
        reservationAmount: toNumber(reservation),
        deliveryLabelEs: deliveryLabel,
        deliveryYear: toNumber(deliveryYear),
        status: project.status,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  return (
    <div className="admin-card pad-lg admin-editor">
      <div className="admin-editor-head">
        <h2>{project.name}</h2>
        {draft && (
          <span className="chip info">
            <i />
            {dateTime.format(new Date(draft.updatedAt))}
          </span>
        )}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <div className="admin-field-row">
          <label className="admin-field">
            Precio desde (USD)
            <input
              type="number"
              min="0"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              placeholder="Por confirmar"
            />
          </label>
          <label className="admin-field">
            Precio hasta (USD)
            <input
              type="number"
              min="0"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              placeholder="Por confirmar"
            />
          </label>
        </div>
        <div className="admin-field-row">
          <label className="admin-field">
            Estado del precio
            <select
              value={priceStatus}
              onChange={(e) => setPriceStatus(e.target.value as "confirmed" | "pending")}
            >
              <option value="pending">Pendiente de confirmar</option>
              <option value="confirmed">Confirmado</option>
            </select>
          </label>
          <label className="admin-field">
            Reserva (USD)
            <input
              type="number"
              min="0"
              value={reservation}
              onChange={(e) => setReservation(e.target.value)}
              placeholder="Por confirmar"
            />
          </label>
        </div>
        <div className="admin-field-row">
          <label className="admin-field">
            Entrega (texto público, ES)
            <input
              value={deliveryLabel}
              onChange={(e) => setDeliveryLabel(e.target.value)}
            />
          </label>
          <label className="admin-field">
            Año de entrega
            <input
              type="number"
              min="2025"
              max="2035"
              value={deliveryYear}
              onChange={(e) => setDeliveryYear(e.target.value)}
              placeholder="Según fase"
            />
          </label>
        </div>
        <label className="admin-field">
          Notas editoriales (no públicas)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Fuente de la cifra, fecha de la llamada, pendientes…"
          />
        </label>
        <p className="admin-editor-note">
          El borrador se guarda en este dispositivo y viaja a Supabase al
          migrar. Para publicarlo hoy, traslada los valores verificados a{" "}
          <code className="code-line">src/content/projects.ts</code> con su
          fuente.
        </p>
        <div className="admin-actions">
          <button className="button button-primary" type="submit">
            {saved ? <CheckCircle size={18} weight="fill" /> : null}
            {saved ? "Borrador guardado" : "Guardar borrador"}
          </button>
          {draft && (
            <button
              type="button"
              className="button button-outline"
              onClick={() => draftsStore.remove(project.slug)}
            >
              <Trash size={16} /> Descartar borrador
            </button>
          )}
          <button
            type="button"
            className="button button-outline"
            style={{ color: "var(--color-red, #ef4444)", borderColor: "var(--color-red, #ef4444)" }}
            onClick={() => {
              if (confirm("¿Estás seguro de limpiar el borrador local de este proyecto?")) {
                draftsStore.remove(project.slug);
                window.location.reload();
              }
            }}
          >
            <Trash size={16} /> Limpiar borrador local
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Leads
--------------------------------------------------------------------------- */
function LeadsPanel({ leads }: { leads: CmsLead[] }) {
  const [confirmClear, setConfirmClear] = useState(false);

  const exportCsv = () => {
    const header = "fecha;nombre;email;telefono;pais;presupuesto;plazo;proyecto;interes;canal;estado;mensaje";
    const rows = leads.map((lead) =>
      [
        lead.createdAt, lead.name, lead.email, lead.phone, lead.country,
        lead.budget, lead.timeframe, lead.project, lead.interest,
        lead.channel, lead.status,
        lead.message.replace(/[\n;]/g, " "),
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(";"),
    );
    downloadFile(
      "andris-cms-leads.csv",
      [header, ...rows].join("\n"),
      "text/csv;charset=utf-8",
    );
  };

  return (
    <>
      <div className="admin-page-head">
        <p className="kicker">Conversaciones</p>
        <h1>Leads</h1>
        <p>
          Cada consulta preparada en el formulario de contacto queda registrada
          aquí, con su canal y estado de entrega.
        </p>
      </div>

      <div className="admin-card">
        <div className="admin-actions" style={{ marginTop: 0, marginBottom: leads.length ? 14 : 0 }}>
          <button className="button button-outline" onClick={exportCsv} disabled={!leads.length}>
            <DownloadSimple size={16} /> Exportar CSV
          </button>
          {leads.length > 0 &&
            (confirmClear ? (
              <>
                <button
                  className="button button-outline"
                  onClick={() => {
                    leadsStore.clear();
                    setConfirmClear(false);
                  }}
                >
                  <Trash size={16} /> Confirmar vaciado
                </button>
                <button className="button button-outline" onClick={() => setConfirmClear(false)}>
                  <X size={16} /> Cancelar
                </button>
              </>
            ) : (
              <button className="button button-outline" onClick={() => setConfirmClear(true)}>
                <Trash size={16} /> Vaciar bandeja
              </button>
            ))}
        </div>

        {leads.length === 0 ? (
          <div className="admin-empty">
            <UsersThree size={30} />
            La bandeja está vacía. Los leads aparecen cuando alguien prepara
            una consulta en /contacto.
          </div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Nombre</th>
                    <th>Proyecto</th>
                    <th>Contacto</th>
                    <th>Estado</th>
                    <th style={{ textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="num">{dateTime.format(new Date(lead.createdAt))}</td>
                      <td className="strong">{lead.name}</td>
                      <td>{lead.project}</td>
                      <td>
                        {lead.email}
                        <br />
                        <small style={{ color: "var(--muted)" }}>{lead.phone}</small>
                      </td>
                      <td>
                        <LeadStatusChip status={lead.status} />
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            className="icon-action danger"
                            aria-label={`Eliminar lead de ${lead.name}`}
                            onClick={() => leadsStore.remove(lead.id)}
                          >
                            <Trash size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="admin-list-cards">
              {leads.map((lead) => (
                <article key={lead.id} className="admin-lead-card">
                  <div className="row">
                    <strong>{lead.name}</strong>
                    <LeadStatusChip status={lead.status} />
                  </div>
                  <div className="row">
                    <span>{lead.project}</span>
                    <small>{dateTime.format(new Date(lead.createdAt))}</small>
                  </div>
                  <div className="row">
                    <small>{lead.email} · {lead.phone}</small>
                    <button
                      className="icon-action danger"
                      aria-label={`Eliminar lead de ${lead.name}`}
                      onClick={() => leadsStore.remove(lead.id)}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function LeadStatusChip({ status }: { status: CmsLead["status"] }) {
  const map = {
    prepared: { label: "Preparado", className: "info" },
    sent: { label: "Enviado", className: "ok" },
    failed: { label: "Falló webhook", className: "pending" },
  } as const;
  const item = map[status];
  return (
    <span className={`chip ${item.className}`}>
      <i />
      {item.label}
    </span>
  );
}

/* ---------------------------------------------------------------------------
   Cotizaciones de la calculadora
--------------------------------------------------------------------------- */
function QuotesPanel({
  quotes,
  projects,
}: {
  quotes: CalculatorQuote[];
  projects: PropertyProject[];
}) {
  const [confirmClear, setConfirmClear] = useState(false);
  const nameOf = (slug: string | null) =>
    projects.find((item) => item.slug === slug)?.name ?? "Escenario libre";

  return (
    <>
      <div className="admin-page-head">
        <p className="kicker">Simulador</p>
        <h1>Cotizaciones PDF</h1>
        <p>
          Registro de escenarios descargados desde la calculadora: valor, plan
          y cuota estimada en el momento de la descarga.
        </p>
      </div>

      <div className="admin-card">
        {quotes.length > 0 && (
          <div className="admin-actions" style={{ marginTop: 0, marginBottom: 14 }}>
            {confirmClear ? (
              <>
                <button
                  className="button button-outline"
                  onClick={() => {
                    quotesStore.clear();
                    setConfirmClear(false);
                  }}
                >
                  <Trash size={16} /> Confirmar vaciado
                </button>
                <button className="button button-outline" onClick={() => setConfirmClear(false)}>
                  <X size={16} /> Cancelar
                </button>
              </>
            ) : (
              <button className="button button-outline" onClick={() => setConfirmClear(true)}>
                <Trash size={16} /> Vaciar registro
              </button>
            )}
          </div>
        )}
        {quotes.length === 0 ? (
          <div className="admin-empty">
            <Calculator size={30} />
            Aún no hay cotizaciones. Se registran al descargar el PDF en
            /calculadora.
          </div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Proyecto</th>
                    <th className="num">Valor</th>
                    <th className="num">Plan</th>
                    <th className="num">Cuota</th>
                    <th className="num">Meses</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((quote) => (
                    <tr key={quote.id}>
                      <td className="num">{dateTime.format(new Date(quote.createdAt))}</td>
                      <td className="strong">{nameOf(quote.projectSlug)}</td>
                      <td className="num">{money.format(quote.price)}</td>
                      <td className="num">
                        {quote.signingPercent}/{quote.constructionPercent}/{quote.deliveryPercent}
                      </td>
                      <td className="num strong">{moneyExact.format(quote.monthly)}</td>
                      <td className="num">{quote.months}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="admin-list-cards">
              {quotes.map((quote) => (
                <article key={quote.id} className="admin-lead-card">
                  <div className="row">
                    <strong>{nameOf(quote.projectSlug)}</strong>
                    <span className="chip info"><i />PDF</span>
                  </div>
                  <div className="row">
                    <span>{money.format(quote.price)} · {quote.signingPercent}/{quote.constructionPercent}/{quote.deliveryPercent}</span>
                    <small>{quote.months} meses</small>
                  </div>
                  <div className="row">
                    <strong>{moneyExact.format(quote.monthly)} /mes</strong>
                    <small>{dateTime.format(new Date(quote.createdAt))}</small>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------------
   Esquema SQL y migración
--------------------------------------------------------------------------- */
function SchemaPanel() {
  return (
    <>
      <div className="admin-page-head">
        <p className="kicker">Base de datos</p>
        <h1>Esquema SQL · Supabase</h1>
        <p>
          Migración PostgreSQL lista para aplicar cuando existan las
          credenciales: contenido con evidencia editorial, leads, cotizaciones,
          RLS y la vista pública que alimenta el API.
        </p>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <div className="admin-card pad-lg">
          <h2>Descargas</h2>
          <div className="api-endpoints">
            <a href="/cms/migrations/0001_cms_core.sql" download>
              <span><FileSql size={17} style={{ verticalAlign: -3 }} /> Migración 0001 — núcleo CMS</span>
              <code>24 tablas · RLS · vista api_projects_v1</code>
            </a>
            <a href="/cms/seed.sql" download>
              <span><FileSql size={17} style={{ verticalAlign: -3 }} /> Seed — 3 proyectos verificados</span>
              <code>idempotente</code>
            </a>
            <a href="/api/v1/openapi.json" target="_blank" rel="noopener noreferrer">
              <span><ArrowSquareOut size={16} style={{ verticalAlign: -3 }} /> Contrato OpenAPI del API v1</span>
              <code>3 endpoints</code>
            </a>
          </div>
        </div>

        <div className="admin-card pad-lg">
          <h2>Activación con credenciales</h2>
          <ol className="schema-steps">
            <li>Crear el proyecto en Supabase y aplicar la migración y el seed.</li>
            <li>Crear el usuario administrador y registrarlo en <code className="code-line">cms_profiles</code>.</li>
            <li>Configurar <code className="code-line">NEXT_PUBLIC_SUPABASE_URL</code> y <code className="code-line">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en el despliegue.</li>
            <li>Verificar que este panel muestre “Supabase conectado”.</li>
          </ol>
        </div>
      </div>

      <div className="admin-card pad-lg" style={{ marginTop: 16 }}>
        <h2>API v1 publicada</h2>
        <div className="api-endpoints">
          <a href="/api/v1/health.json" target="_blank" rel="noopener noreferrer">
            <span>Estado del API</span>
            <code>GET /api/v1/health.json</code>
          </a>
          <a href="/api/v1/projects.json" target="_blank" rel="noopener noreferrer">
            <span>Índice de proyectos</span>
            <code>GET /api/v1/projects.json</code>
          </a>
          <a href="/api/v1/projects/melcon-paradise.json" target="_blank" rel="noopener noreferrer">
            <span>Ficha de ejemplo</span>
            <code>GET /api/v1/projects/&#123;slug&#125;.json</code>
          </a>
        </div>
      </div>
    </>
  );
}
