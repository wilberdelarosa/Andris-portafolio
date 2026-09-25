"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowSquareOut,
  ArrowClockwise,
  Buildings,
  CaretUp,
  CaretLeft,
  CaretRight,
  Calculator,
  CircleNotch,
  Database,
  DotsThree,
  DownloadSimple,
  EnvelopeSimple,
  Eye,
  FileSql,
  MagnifyingGlass,
  PencilSimple,
  PlusCircle,
  Phone,
  SignOut,
  SquaresFour,
  Stethoscope,
  SlidersHorizontal,
  Tag,
  Trash,
  UsersThree,
  Warning,
  WhatsappLogo,
  X,
} from "@phosphor-icons/react";
import "./admin.css";
import { NewProjectForm } from "./new-project-form";
import { NotificationCenter } from "./notification-center";
import { LoginForm } from "./login-form";
import { DiagnosticsPanel } from "./diagnostics-panel";
import { CategoryManager } from "./category-manager";
import { AdminToastProvider, useAdminToast } from "./admin-toast";
import { SiteSettingsPanel } from "./site-settings-panel";

import { getContentRepository } from "@/lib/cms/repository";
import { deleteAllLeads, deleteLead, listLeads, markLeadRead } from "@/lib/cms/lead-writer";
import {
  clearQuotes,
  deleteQuote,
  listQuotes,
  type EditorQuote,
} from "@/lib/cms/quote-writer";
import {
  deleteProject,
  getProjectStats,
  listEditorProjects,
  loadProjectForEdit,
  type EditorProjectRow,
  type ProjectFormValues,
  type ProjectPublicStatus,
  type ProjectStats,
} from "@/lib/cms/project-writer";
import { PropertyCategorySelect } from "./property-category-select";
import {
  describeError,
  getSessionServerSnapshot,
  getSessionSnapshot,
  onSessionChange,
  signOut,
} from "@/lib/cms/session";
import type { CmsLead, CmsConnection } from "@/lib/cms/types";

type Tab =
  | "resumen"
  | "proyectos"
  | "categorias"
  | "leads"
  | "cotizaciones"
  | "esquema"
  | "configuracion"
  | "diagnostico";

/**
 * «Añadir proyecto» ya no es una pestaña: es un botón dentro de Proyectos, y
 * el mismo formulario sirve para editar. Con una pestaña menos, las cuatro
 * primeras —que son las que caben en la barra inferior del móvil— quedan
 * siendo justo el trabajo diario (resumen, catálogo, leads, categorías) y el
 * menú «Más» se lleva lo ocasional.
 */
const TABS: { id: Tab; label: string; icon: typeof SquaresFour }[] = [
  { id: "resumen", label: "Resumen", icon: SquaresFour },
  { id: "proyectos", label: "Proyectos", icon: Buildings },
  { id: "leads", label: "Leads", icon: UsersThree },
  { id: "categorias", label: "Categorías", icon: Tag },
  { id: "cotizaciones", label: "Cotizaciones", icon: Calculator },
  { id: "esquema", label: "Esquema", icon: Database },
  { id: "configuracion", label: "Configuración", icon: SlidersHorizontal },
  { id: "diagnostico", label: "Diagnóstico", icon: Stethoscope },
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
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [leads, setLeads] = useState<CmsLead[]>([]);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<EditorQuote[]>([]);
  const [quotesError, setQuotesError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  /** Cambia en cada alta, edición o borrado para reconsultar lo dependiente. */
  const [revision, setRevision] = useState(0);
  const connection: CmsConnection = useMemo(
    () => getContentRepository().connection(),
    [],
  );
  /**
   * La sesion se lee del almacen externo antes de activar las consultas del
   * panel, para que leads y cotizaciones no intenten cargar antes del login.
   */
  const session = useSyncExternalStore(
    onSessionChange,
    getSessionSnapshot,
    getSessionServerSnapshot,
  );

  /**
   * Leads, cotizaciones y cifras salen de Supabase, no de `localStorage`.
   * El estado se fija dentro del callback de cada promesa —nunca de forma
   * síncrona en el cuerpo del efecto—, que es lo que exige el linter y lo que
   * evita renders encadenados.
   */
  useEffect(() => {
    let cancelled = false;
    if (connection.provider !== "supabase" || !session) return;

    void listLeads()
      .then((rows) => {
        if (cancelled) return;
        setLeads(rows);
        setLeadsError(null);
      })
      .catch((error: unknown) => {
        if (!cancelled) setLeadsError(describeError(error));
      });

    void listQuotes()
      .then((rows) => {
        if (cancelled) return;
        setQuotes(rows);
        setQuotesError(null);
      })
      .catch((error: unknown) => {
        if (!cancelled) setQuotesError(describeError(error));
      });

    void getProjectStats()
      .then((next) => {
        if (!cancelled) setStats(next);
      })
      .catch(() => {
        // El resumen muestra «—» en vez de un cero inventado: la pestaña
        // Proyectos, que es donde se trabaja, informa del error con detalle.
        if (!cancelled) setStats(null);
      });

    return () => {
      cancelled = true;
    };
  }, [connection.provider, revision, session]);

  useEffect(() => {
    if (connection.provider !== "supabase" || !session) return;
    let cancelled = false;
    const refreshLeads = () => {
      if (document.visibilityState !== "visible") return;
      void listLeads()
        .then((rows) => {
          if (!cancelled) {
            setLeads(rows);
            setLeadsError(null);
          }
        })
        .catch(() => {
          // Keep the last known list visible during a temporary network issue.
        });
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshLeads();
    };
    const interval = window.setInterval(refreshLeads, 30_000);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [connection.provider, session]);

  useEffect(() => {
    const syncTab = () => {
      const hash = location.hash.replace("#", "") as Tab;
      if (TABS.some((item) => item.id === hash)) setTab(hash);
    };
    syncTab();
    window.addEventListener("hashchange", syncTab);
    return () => window.removeEventListener("hashchange", syncTab);
  }, []);

  const refresh = () => setRevision((value) => value + 1);

  const go = (next: Tab) => {
    setTab(next);
    history.replaceState(null, "", `#${next}`);
  };

  const active = TABS.find((item) => item.id === tab) ?? TABS[0];

  if (session === undefined) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-loading" role="status">
          <span className="admin-brand-mark">AP</span>
          <p>
            <CircleNotch size={16} className="spin" aria-hidden />
            Comprobando sesión segura…
          </p>
        </div>
      </div>
    );
  }

  if (session === null) {
    // `useSyncExternalStore` vuelve a leer al entrar, no hace falta avisar.
    return <LoginForm onSignedIn={() => undefined} />;
  }

  return (
    <AdminToastProvider>
      <AdminStudioShell
        active={active}
        connection={connection}
        go={go}
        leads={leads}
        leadsError={leadsError}
        quotes={quotes}
        quotesError={quotesError}
        reduced={reduced}
        refresh={refresh}
        revision={revision}
        session={session}
        showMoreMenu={showMoreMenu}
        setShowMoreMenu={setShowMoreMenu}
        stats={stats}
        tab={tab}
      />
    </AdminToastProvider>
  );
}

function AdminStudioShell({
  active,
  connection,
  go,
  leads,
  leadsError,
  quotes,
  quotesError,
  reduced,
  refresh,
  revision,
  session,
  showMoreMenu,
  setShowMoreMenu,
  stats,
  tab,
}: {
  active: { id: Tab; label: string; icon: typeof SquaresFour };
  connection: CmsConnection;
  go: (next: Tab) => void;
  leads: CmsLead[];
  leadsError: string | null;
  quotes: EditorQuote[];
  quotesError: string | null;
  reduced: boolean | null;
  refresh: () => void;
  revision: number;
  session: NonNullable<ReturnType<typeof getSessionSnapshot>>;
  showMoreMenu: boolean;
  setShowMoreMenu: (value: boolean) => void;
  stats: ProjectStats | null;
  tab: Tab;
}) {
  const unreadLeads = leads.reduce((count, lead) => count + (lead.readAt ? 0 : 1), 0);
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
              {item.id === "leads" && unreadLeads > 0 && (
                <span className="admin-unread-count" aria-label={`${unreadLeads} leads sin leer`}>
                  {unreadLeads > 99 ? "99+" : unreadLeads}
                </span>
              )}
            </button>
          ))}
          <button className="admin-nav-logout" onClick={() => void signOut()}>
            <SignOut size={20} />
            Cerrar sesión
          </button>
        </nav>
        <div className="admin-side-foot">
          <p className="admin-session-email" title={session.email}>
            {session.email}
          </p>
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
        <span className="admin-topbar-actions">
          <Link href="/">
            Sitio <ArrowSquareOut size={15} />
          </Link>
          <button type="button" onClick={() => void signOut()} aria-label="Cerrar sesión">
            <SignOut size={16} />
          </button>
        </span>
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
                  stats={stats}
                  leads={leads}
                  quotes={quotes}
                  connection={connection}
                  go={go}
                />
              )}
              {tab === "proyectos" && (
                <ProjectsPanel revision={revision} onChanged={refresh} />
              )}
              {tab === "categorias" && <CategoryManager />}
              {tab === "leads" && (
                <LeadsPanel leads={leads} error={leadsError} onChanged={refresh} />
              )}
              {tab === "cotizaciones" && (
                <QuotesPanel quotes={quotes} error={quotesError} onChanged={refresh} />
              )}
              {tab === "esquema" && <SchemaPanel />}
              {tab === "configuracion" && <SiteSettingsPanel />}
              {tab === "diagnostico" && <DiagnosticsPanel />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <nav className="admin-tabbar" aria-label="Secciones del estudio">
        {TABS.slice(0, 4).map((item) => (
          <button
            key={item.id}
            className={item.id === tab ? "is-active" : ""}
            onClick={() => { go(item.id); setShowMoreMenu(false); }}
            aria-current={item.id === tab ? "page" : undefined}
          >
            <item.icon size={22} weight={item.id === tab ? "fill" : "regular"} />
            {item.label}
            {item.id === "leads" && unreadLeads > 0 && (
              <span className="admin-unread-count" aria-label={`${unreadLeads} leads sin leer`}>
                {unreadLeads > 99 ? "99+" : unreadLeads}
              </span>
            )}
          </button>
        ))}
        <div style={{ position: "relative", display: "flex", flex: 1 }}>
          <button
            type="button"
            className={showMoreMenu || TABS.slice(4).some((t) => t.id === tab) ? "is-active" : ""}
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
  stats,
  leads,
  quotes,
  connection,
  go,
}: {
  /** `null` mientras carga o si Supabase no respondió: se pinta «—», no un 0. */
  stats: ProjectStats | null;
  leads: CmsLead[];
  quotes: EditorQuote[];
  connection: CmsConnection;
  go: (tab: Tab) => void;
}) {
  const pendingLeads = leads.filter((lead) => lead.status !== "sent").length;
  const pendingPrices = stats?.pendingPrice ?? 0;
  const count = (value: number | undefined) =>
    value === undefined ? "—" : String(value);

  return (
    <>
      {/*
        Cabecera tipo app: va a sangre contra los bordes del área de contenido,
        como el rediseño de CMS que ya existía. El chip de conexión vive aquí
        porque la barra lateral (donde también se lee) no existe bajo 760px.
      */}
      <div className="admin-app-head">
        <div>
          <h1>Inicio</h1>
          <p>Resumen de actividad</p>
        </div>
        <span className={connection.provider === "supabase" ? "chip ok" : "chip neutral"}>
          <i />
          {connection.provider === "supabase" ? "Supabase" : "Local"}
        </span>
      </div>

      {/*
        Cifras reales del catálogo y de la bandeja. No hay métricas de tráfico
        aquí a propósito: el tracker las registra pero `analytics_events` aún
        no deja leerlas al editor, y poner un número inventado sería peor que
        no poner ninguno.
      */}
      <div className="admin-app-stats">
        <div className="admin-app-stat">
          <div className="admin-app-stat-head">
            <span>Proyectos</span>
            <Buildings size={16} />
          </div>
          <strong>{count(stats?.total)}</strong>
        </div>
        <div className="admin-app-stat">
          <div className="admin-app-stat-head">
            <span>Leads nuevos</span>
            <UsersThree size={16} />
          </div>
          <strong>{pendingLeads}</strong>
        </div>
        <div className="admin-app-stat">
          <div className="admin-app-stat-head">
            <span>Cotizaciones</span>
            <Calculator size={16} />
          </div>
          <strong>{quotes.length}</strong>
        </div>
        <div className="admin-app-stat">
          <div className="admin-app-stat-head">
            <span>Borradores</span>
            <PencilSimple size={16} />
          </div>
          <strong>{count(stats?.drafts)}</strong>
        </div>
      </div>

      {pendingPrices > 0 && (
        <p className="admin-banner" role="status">
          <Tag size={18} />
          {pendingPrices === 1
            ? "1 proyecto tiene el precio por confirmar."
            : `${pendingPrices} proyectos tienen el precio por confirmar.`}
          <button type="button" className="admin-banner-link" onClick={() => go("proyectos")}>
            Revisar en Proyectos
          </button>
        </p>
      )}

      <div className="admin-app-card">
        <div className="admin-app-card-head">
          <h2>Catálogo</h2>
          <button className="button button-outline" onClick={() => go("proyectos")}>
            <Buildings size={16} /> Gestionar
          </button>
        </div>
        <dl className="admin-summary-list">
          <div>
            <dt>Publicados</dt>
            <dd>{count(stats?.published)}</dd>
          </div>
          <div>
            <dt>Borradores</dt>
            <dd>{count(stats?.drafts)}</dd>
          </div>
          <div>
            <dt>Precio por confirmar</dt>
            <dd>{count(stats?.pendingPrice)}</dd>
          </div>
        </dl>
        {stats === null && (
          <p className="field-hint" role="status">
            Aún no se pudieron leer las cifras del catálogo. Abre Proyectos
            para ver el detalle del error.
          </p>
        )}
      </div>

      <div className="admin-app-card">
        <div className="admin-app-card-head">
          <h2>Leads recientes</h2>
          <button className="button button-outline" onClick={() => go("leads")}>
            <UsersThree size={16} /> Ver todos
          </button>
        </div>
        {leads.length === 0 ? (
          <div className="admin-empty">
            <UsersThree size={30} />
            Aún no hay leads. Aparecen cuando alguien prepara una consulta en
            /contacto.
          </div>
        ) : (
          <div className="admin-card-list">
            {leads.slice(0, 3).map((lead) => (
              <article key={lead.id} className="admin-lead-card">
                <div className="row">
                  <strong>{lead.name}</strong>
                  <LeadStatusChip status={lead.status} />
                </div>
                <div className="row">
                  <span>{lead.project}</span>
                  <small>{dateTime.format(new Date(lead.createdAt))}</small>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
/* ---------------------------------------------------------------------------
   Proyectos: listado, alta y edición en un solo flujo

   Antes eran dos pestañas («Proyectos» y «Añadir proyecto») que no se
   hablaban: el listado solo dejaba tocar cuatro campos comerciales y los
   guardaba en `localStorage`, así que «editar» no cambiaba nada en la base, y
   el alta vivía aparte. Ahora hay una sola pantalla con tres modos —lista,
   alta y edición— y los tres escriben en Supabase.
--------------------------------------------------------------------------- */

const PAGE_SIZE = 12;

const STATUS_CHIP: Record<
  ProjectPublicStatus,
  { label: string; className: string }
> = {
  published: { label: "Publicado", className: "ok" },
  draft: { label: "Borrador", className: "info" },
  review: { label: "En revisión", className: "pending" },
  archived: { label: "Archivado", className: "neutral" },
};

type PanelMode =
  | { kind: "list" }
  | { kind: "create" }
  | { kind: "edit"; project: ProjectFormValues };

function ProjectsPanel({
  revision,
  onChanged,
}: {
  /** Cambia cuando otra parte del panel toca proyectos; fuerza recarga. */
  revision: number;
  onChanged: () => void;
}) {
  const { notify } = useAdminToast();
  const [mode, setMode] = useState<PanelMode>({ kind: "list" });

  const [search, setSearch] = useState("");
  /** Término ya «asentado»: solo con este se consulta, no con cada tecla. */
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState<ProjectPublicStatus | "">("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(0);

  const [localRevision, setLocalRevision] = useState(0);

  /**
   * Resultado de la última consulta, etiquetado con la consulta que lo
   * produjo. Guardar la etiqueta permite deducir `loading` comparándola con
   * la consulta actual, en vez de un `setLoading(true)` dentro del efecto
   * —que encadena renders y el linter rechaza con razón—. De paso, la tabla
   * anterior sigue en pantalla mientras llega la nueva página en lugar de
   * parpadear a vacío.
   */
  const queryKey = JSON.stringify([
    appliedSearch,
    status,
    categoryId,
    page,
    revision,
    localRevision,
  ]);
  const [result, setResult] = useState<{
    key: string;
    rows: EditorProjectRow[];
    total: number;
    error: string | null;
  } | null>(null);

  const rows = result?.rows ?? [];
  const total = result?.total ?? 0;
  const error = result?.error ?? null;
  const loading = result?.key !== queryKey;

  /** Id en espera de confirmación de borrado; `null` si no hay ninguno. */
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(
    null,
  );

  /**
   * Búsqueda con retardo: se espera a que el editor deje de teclear antes de
   * consultar. Sin esto cada letra dispararía una petición a PostgREST.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearch(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    listEditorProjects({
      search: appliedSearch,
      status,
      categoryId,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    })
      .then((page) => {
        if (!cancelled) {
          setResult({ key: queryKey, rows: page.rows, total: page.total, error: null });
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setResult({ key: queryKey, rows: [], total: 0, error: describeError(cause) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [queryKey, appliedSearch, status, categoryId, page]);

  const reload = () => setLocalRevision((value) => value + 1);

  const openEditor = async (row: EditorProjectRow) => {
    setBusyId(row.id);
    setNotice(null);
    try {
      const project = await loadProjectForEdit(row.id);
      setMode({ kind: "edit", project });
    } catch (cause) {
      notify({ tone: "error", message: `No se pudo abrir «${row.name}» para editar: ${describeError(cause)}` });
      setNotice({
        tone: "error",
        text: `No se pudo abrir «${row.name}» para editar: ${describeError(cause)}`,
      });
    } finally {
      setBusyId(null);
    }
  };

  const removeProject = async (row: EditorProjectRow) => {
    setBusyId(row.id);
    setNotice(null);
    try {
      await deleteProject(row.id);
      setConfirmDelete(null);
      setNotice({
        tone: "ok",
        text: `«${row.name}» se eliminó de Supabase junto con su ficha completa.`,
      });
      notify({ tone: "success", message: `«${row.name}» se eliminó correctamente.` });
      // Si la página se queda vacía al borrar el último elemento, se retrocede.
      if (rows.length === 1 && page > 0) setPage(page - 1);
      else reload();
      onChanged();
    } catch (cause) {
      notify({ tone: "error", message: `No se pudo eliminar «${row.name}»: ${describeError(cause)}` });
      setNotice({
        tone: "error",
        text: `No se pudo eliminar «${row.name}»: ${describeError(cause)}`,
      });
    } finally {
      setBusyId(null);
    }
  };

  const afterSave = () => {
    setMode({ kind: "list" });
    reload();
    onChanged();
  };

  if (mode.kind === "create") {
    return (
      <NewProjectForm onSaved={afterSave} onCancel={() => setMode({ kind: "list" })} />
    );
  }

  if (mode.kind === "edit") {
    return (
      <NewProjectForm
        // Remontar por proyecto: el formulario inicializa su estado desde
        // `initial` en el primer render, así que cambiar de proyecto sin
        // remontar dejaría los campos del anterior.
        key={mode.project.id}
        initial={mode.project}
        onSaved={afterSave}
        onCancel={() => setMode({ kind: "list" })}
      />
    );
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtering = Boolean(appliedSearch.trim() || status || categoryId);

  return (
    <>
      <div className="admin-page-head">
        <p className="kicker">Contenido</p>
        <h1>Proyectos</h1>
        <p>
          Todo el catálogo vive en Supabase. Aquí se añaden, se editan y se
          retiran proyectos; los campos sin evidencia se publican como «por
          confirmar», nunca como un cero.
        </p>
      </div>

      <div className="admin-card">
        <div className="admin-toolbar">
          <div className="admin-search">
            <MagnifyingGlass size={17} aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre o slug…"
              aria-label="Buscar proyectos"
            />
          </div>
          <label className="admin-field admin-toolbar-field">
            Estado
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as ProjectPublicStatus | "");
                setPage(0);
              }}
            >
              <option value="">Todos</option>
              <option value="published">Publicados</option>
              <option value="draft">Borradores</option>
              <option value="review">En revisión</option>
              <option value="archived">Archivados</option>
            </select>
          </label>
          <div className="admin-toolbar-field">
            <PropertyCategorySelect
              label="Categoría"
              placeholder="Todas"
              required={false}
              value={categoryId}
              onChange={(nextId) => {
                setCategoryId(nextId);
                setPage(0);
              }}
            />
          </div>
          <button
            className="button button-primary admin-toolbar-cta"
            onClick={() => setMode({ kind: "create" })}
          >
            <PlusCircle size={17} /> Añadir proyecto
          </button>
        </div>

        {notice && (
          <div
            className={`admin-notification is-${notice.tone === "ok" ? "success" : "error"}`}
            role="status"
          >
            <span>{notice.text}</span>
          </div>
        )}

        {error && (
          <div className="admin-empty admin-empty--error" role="alert">
            <Warning size={26} />
            <span>No se pudo leer el catálogo desde Supabase: {error}</span>
            <button type="button" className="button button-outline" onClick={reload}>
              <ArrowClockwise size={15} /> Reintentar
            </button>
          </div>
        )}

        {loading && rows.length === 0 && (
          <div className="admin-empty" role="status">
            <CircleNotch size={26} className="spin" />
            Cargando proyectos…
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="admin-empty">
            <Buildings size={30} />
            {filtering
              ? "Ningún proyecto coincide con la búsqueda o los filtros."
              : "Todavía no hay proyectos. Empieza por «Añadir proyecto»."}
          </div>
        )}

        {rows.length > 0 && (
          <div className="admin-project-list">
            {rows.map((row) => {
              const chip = STATUS_CHIP[row.status];
              const pendingDelete = confirmDelete === row.id;
              return (
                <article key={row.id} className="admin-project-row">
                  {row.hero ? (
                    <Image
                      src={row.hero}
                      alt=""
                      width={74}
                      height={56}
                      className="admin-project-thumb"
                      unoptimized
                    />
                  ) : (
                    <span className="admin-project-thumb admin-project-thumb--empty">
                      <Buildings size={20} />
                    </span>
                  )}
                  <div className="meta">
                    <strong>{row.name}</strong>
                    <small>{row.location || "Ubicación por confirmar"}</small>
                    <span className="chips">
                      <span className={`chip ${chip.className}`}>
                        <i />
                        {chip.label}
                      </span>
                      {row.categoryLabel && (
                        <span className="chip neutral">
                          <i />
                          {row.categoryLabel}
                        </span>
                      )}
                      <span className={`chip ${row.priceStatus === "confirmed" ? "ok" : "pending"}`}>
                        <i />
                        {row.priceStatus === "confirmed" && row.priceFrom !== null
                          ? `Desde ${money.format(row.priceFrom)}`
                          : "Precio por confirmar"}
                      </span>
                    </span>
                  </div>
                  <div className="admin-row-actions">
                    {pendingDelete ? (
                      <>
                        <button
                          className="button button-outline admin-danger-btn"
                          disabled={busyId === row.id}
                          onClick={() => void removeProject(row)}
                        >
                          <Trash size={15} />
                          {busyId === row.id ? "Eliminando…" : "Confirmar borrado"}
                        </button>
                        <button
                          className="button button-outline"
                          onClick={() => setConfirmDelete(null)}
                        >
                          <X size={15} /> Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="button button-outline"
                          disabled={busyId === row.id}
                          onClick={() => void openEditor(row)}
                        >
                          <PencilSimple size={15} />
                          {busyId === row.id ? "Abriendo…" : "Editar"}
                        </button>
                        <button
                          className="icon-action danger"
                          aria-label={`Eliminar ${row.name}`}
                          onClick={() => setConfirmDelete(row.id)}
                        >
                          <Trash size={17} />
                        </button>
                      </>
                    )}
                  </div>
                  {pendingDelete && (
                    <p className="admin-row-warning" role="alert">
                      Se borrará «{row.name}» y toda su ficha (traducciones,
                      galería, amenidades, precios y plan de pago). Los leads y
                      las cotizaciones que lo citaban se conservan, pero se
                      quedan sin proyecto asociado. No se puede deshacer.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {total > PAGE_SIZE && (
          <nav className="admin-pagination" aria-label="Páginas de proyectos">
            <button
              className="button button-outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 0 || loading}
            >
              <CaretLeft size={15} /> Anterior
            </button>
            <span className="admin-pagination-label">
              Página {page + 1} de {pageCount} · {total} proyectos
            </span>
            <button
              className="button button-outline"
              onClick={() => setPage(page + 1)}
              disabled={page + 1 >= pageCount || loading}
            >
              Siguiente <CaretRight size={15} />
            </button>
          </nav>
        )}
      </div>
    </>
  );
}


/* ---------------------------------------------------------------------------
   Leads
--------------------------------------------------------------------------- */
function safeLeadSourceUrl(value?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value, "https://andrispenarealty.com");
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function getWhatsAppNumber(phone: string): string | null {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) return digits;
  if (trimmed.startsWith("00")) return digits.replace(/^00/, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits;
  if (digits.length === 10 && /^(809|829|849)/.test(digits)) return `1${digits}`;
  return null;
}

function LeadsPanel({
  leads,
  error,
  onChanged,
}: {
  leads: CmsLead[];
  error: string | null;
  onChanged: () => void;
}) {
  const { notify } = useAdminToast();
  const [confirmClear, setConfirmClear] = useState(false);
  const [busy, setBusy] = useState(false);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  /**
   * El error del borrado se muestra aquí mismo. Antes el panel borraba contra
   * `localStorage`, que nunca falla, así que no había nada que informar; ahora
   * la operación va a la red y puede rechazarse.
   */
  const [actionError, setActionError] = useState<string | null>(null);

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setActionError(null);
    try {
      await task();
      notify({ tone: "success", message: "La operación sobre los leads se completó correctamente." });
      onChanged();
    } catch (cause) {
      setActionError(describeError(cause));
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = () => {
    const header = "fecha;visto;nombre;email;telefono;pais;presupuesto;plazo;proyecto;interes;canal;estado;mensaje;pagina";
    const rows = leads.map((lead) =>
      [
        lead.createdAt, lead.readAt ? "sí" : "no", lead.name, lead.email, lead.phone, lead.country,
        lead.budget, lead.timeframe, lead.project, lead.interest,
        lead.channel, lead.status,
        lead.message.replace(/[\n;]/g, " "),
        lead.pageUrl ?? "",
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

  const toggleLead = async (lead: CmsLead) => {
    const opening = expandedLeadId !== lead.id;
    setExpandedLeadId(opening ? lead.id : null);
    setActionError(null);
    if (!opening || lead.readAt) return;
    try {
      await markLeadRead(lead.id);
      onChanged();
    } catch (cause) {
      setActionError(describeError(cause));
    }
  };

  const leadMessage = (lead: CmsLead) =>
    `Hola ${lead.name}, soy Andris Peña. Recibí tu consulta${lead.project ? ` sobre ${lead.project}` : ""}. ¿Cómo puedo ayudarte?`;

  return (
    <>
      <div className="admin-page-head">
        <p className="kicker">Conversaciones</p>
        <h1>Leads</h1>
        <p>
          Cada consulta enviada desde el formulario de contacto queda
          registrada en Supabase, con su canal y estado de entrega. La bandeja
          se actualiza automáticamente cada 30 segundos.
        </p>
      </div>

      <div className="admin-card">
        <div className="admin-actions" style={{ marginTop: 0, marginBottom: leads.length ? 14 : 0 }}>
          <button className="button button-outline" onClick={onChanged}>
            <ArrowClockwise size={16} /> Actualizar
          </button>
          <button className="button button-outline" onClick={exportCsv} disabled={!leads.length}>
            <DownloadSimple size={16} /> Exportar CSV
          </button>
          {leads.length > 0 &&
            (confirmClear ? (
              <>
                <button
                  className="button button-outline admin-danger-btn"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      await deleteAllLeads();
                      setConfirmClear(false);
                    })
                  }
                >
                  <Trash size={16} />
                  {busy ? "Vaciando…" : "Confirmar vaciado"}
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

        {confirmClear && (
          <p className="admin-row-warning" role="alert">
            Se borrarán los {leads.length} leads de la base de datos, no solo
            de esta pantalla. Exporta el CSV antes si necesitas conservarlos.
          </p>
        )}

        {error && (
          <div className="admin-empty admin-empty--error" role="alert">
            <Warning size={26} />
            <span>No se pudo leer la bandeja desde Supabase: {error}</span>
            <button type="button" className="button button-outline" onClick={onChanged}>
              <ArrowClockwise size={15} /> Reintentar
            </button>
          </div>
        )}
        {actionError && (
          <p className="admin-error-text" role="alert">
            No se pudo completar la acción: {actionError}
          </p>
        )}

        {!error &&
          (leads.length === 0 ? (
            <div className="admin-empty">
              <UsersThree size={30} />
              La bandeja está vacía. Los leads aparecen cuando alguien prepara
              una consulta en /contacto.
            </div>
          ) : (
          <>
            <div className="admin-leads-list">
              {leads.map((lead) => {
                const sourceUrl = safeLeadSourceUrl(lead.pageUrl);
                const phoneDigits = lead.phone.replace(/\D/g, "");
                const whatsappNumber = getWhatsAppNumber(lead.phone);
                return (
                <article key={lead.id} className={`admin-lead-card${lead.readAt ? "" : " is-unread"}`}>
                  <div className="admin-lead-card-head">
                    <div className="admin-lead-person">
                      {!lead.readAt && <span className="admin-lead-unread-dot" aria-label="Nuevo sin leer" />}
                      <strong>{lead.name || "Consulta sin nombre"}</strong>
                    </div>
                    <LeadStatusChip status={lead.status} />
                  </div>
                  <div className="admin-lead-meta">
                    <span>{lead.project || "Consulta general"}</span>
                    <time dateTime={lead.createdAt}>{dateTime.format(new Date(lead.createdAt))}</time>
                  </div>
                  <div className="admin-lead-summary">
                    {lead.email && <a href={`mailto:${encodeURIComponent(lead.email)}`}>{lead.email}</a>}
                    {phoneDigits && <a href={`tel:${lead.phone.replace(/[^+\d]/g, "")}`}>{lead.phone}</a>}
                    {!lead.email && !lead.phone && <span>Sin datos de contacto</span>}
                  </div>
                  <div className="admin-lead-actions">
                    <button
                      type="button"
                      className="button button-outline admin-lead-details-toggle"
                      aria-expanded={expandedLeadId === lead.id}
                      aria-controls={`lead-details-${lead.id}`}
                      onClick={() => void toggleLead(lead)}
                    >
                      {expandedLeadId === lead.id ? <CaretUp size={17} /> : <Eye size={17} />}
                      {expandedLeadId === lead.id ? "Ocultar detalles" : "Ver detalles"}
                    </button>
                    {whatsappNumber && (
                      <a
                        className="button admin-lead-contact whatsapp"
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(leadMessage(lead))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <WhatsappLogo size={18} /> WhatsApp
                      </a>
                    )}
                    {lead.email && (
                      <a
                        className="button admin-lead-contact"
                        href={`mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent("Seguimiento a tu consulta")}&body=${encodeURIComponent(leadMessage(lead))}`}
                      >
                        <EnvelopeSimple size={17} /> Correo
                      </a>
                    )}
                    {phoneDigits && (
                      <a className="admin-lead-call" href={`tel:${lead.phone.replace(/[^+\d]/g, "")}`} aria-label={`Llamar a ${lead.name}`}>
                        <Phone size={18} />
                      </a>
                    )}
                    <button
                      className="icon-action danger"
                      aria-label={`Eliminar lead de ${lead.name}`}
                      disabled={busy}
                      onClick={() => void run(() => deleteLead(lead.id))}
                    >
                      <Trash size={17} />
                    </button>
                  </div>
                  {expandedLeadId === lead.id && (
                    <div className="admin-lead-details" id={`lead-details-${lead.id}`}>
                      <dl>
                        <div><dt>Correo electrónico</dt><dd>{lead.email || "—"}</dd></div>
                        <div><dt>Teléfono</dt><dd>{lead.phone || "—"}</dd></div>
                        <div><dt>País de residencia</dt><dd>{lead.country || "—"}</dd></div>
                        <div><dt>Presupuesto</dt><dd>{lead.budget || "—"}</dd></div>
                        <div><dt>Plazo de adquisición</dt><dd>{lead.timeframe || "—"}</dd></div>
                        <div><dt>Proyecto</dt><dd>{lead.project || "Consulta general"}</dd></div>
                        <div><dt>Interés</dt><dd>{lead.interest || "—"}</dd></div>
                        <div><dt>Canal de origen</dt><dd>{lead.channel === "whatsapp" ? "WhatsApp" : lead.channel === "email" ? "Correo" : "Resumen de consulta"}</dd></div>
                        <div><dt>Estado de entrega</dt><dd><LeadStatusChip status={lead.status} /></dd></div>
                        <div><dt>Recibido</dt><dd>{dateTime.format(new Date(lead.createdAt))}</dd></div>
                        {sourceUrl && <div className="admin-lead-page"><dt>Página de origen</dt><dd><a href={sourceUrl} target="_blank" rel="noopener noreferrer">Abrir página <ArrowSquareOut size={14} /></a></dd></div>}
                      </dl>
                      <div className="admin-lead-message">
                        <span>Mensaje del prospecto</span>
                        <p>{lead.message || "No dejó un mensaje adicional."}</p>
                      </div>
                    </div>
                  )}
                </article>
                );
              })}
            </div>
          </>
          ))}
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
  error,
  onChanged,
}: {
  quotes: EditorQuote[];
  error: string | null;
  onChanged: () => void;
}) {
  const { notify } = useAdminToast();
  const [confirmClear, setConfirmClear] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // El nombre viene resuelto por la propia consulta: sin proyecto asociado,
  // la cotización es de verdad un escenario libre.
  const nameOf = (quote: EditorQuote) => quote.projectName ?? "Escenario libre";

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setActionError(null);
    try {
      await task();
      notify({ tone: "success", message: "La operación sobre las cotizaciones se completó correctamente." });
      onChanged();
    } catch (cause) {
      setActionError(describeError(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="admin-page-head">
        <p className="kicker">Simulador</p>
        <h1>Cotizaciones PDF</h1>
        <p>
          Registro en Supabase de los escenarios descargados desde la
          calculadora: valor, plan y cuota estimada en el momento de la
          descarga.
        </p>
      </div>

      <div className="admin-card">
        {quotes.length > 0 && (
          <div className="admin-actions" style={{ marginTop: 0, marginBottom: 14 }}>
            {confirmClear ? (
              <>
                <button
                  className="button button-outline admin-danger-btn"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      await clearQuotes();
                      setConfirmClear(false);
                    })
                  }
                >
                  <Trash size={16} />
                  {busy ? "Vaciando…" : "Confirmar vaciado"}
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
        {confirmClear && (
          <p className="admin-row-warning" role="alert">
            Se borrarán las {quotes.length} cotizaciones de la base de datos,
            no solo de esta pantalla. No se puede deshacer.
          </p>
        )}
        {error && (
          <div className="admin-empty admin-empty--error" role="alert">
            <Warning size={26} />
            <span>No se pudo leer el registro desde Supabase: {error}</span>
            <button type="button" className="button button-outline" onClick={onChanged}>
              <ArrowClockwise size={15} /> Reintentar
            </button>
          </div>
        )}
        {actionError && (
          <p className="admin-error-text" role="alert">
            No se pudo completar el borrado: {actionError}
          </p>
        )}
        {!error &&
          (quotes.length === 0 ? (
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
                    <th style={{ textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((quote) => (
                    <tr key={quote.id}>
                      <td className="num">{dateTime.format(new Date(quote.createdAt))}</td>
                      <td className="strong">{nameOf(quote)}</td>
                      <td className="num">{money.format(quote.price)}</td>
                      <td className="num">
                        {quote.signingPercent}/{quote.constructionPercent}/{quote.deliveryPercent}
                      </td>
                      <td className="num strong">{moneyExact.format(quote.monthly)}</td>
                      <td className="num">{quote.months}</td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            className="icon-action danger"
                            aria-label={`Eliminar cotización de ${nameOf(quote)}`}
                            disabled={busy}
                            onClick={() => void run(() => deleteQuote(quote.id))}
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
              {quotes.map((quote) => (
                <article key={quote.id} className="admin-lead-card">
                  <div className="row">
                    <strong>{nameOf(quote)}</strong>
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
                  <div className="row">
                    <small>{quote.months} meses · {quote.locale.toUpperCase()}</small>
                    <button
                      className="icon-action danger"
                      aria-label={`Eliminar cotización de ${nameOf(quote)}`}
                      disabled={busy}
                      onClick={() => void run(() => deleteQuote(quote.id))}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
          ))}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------------
   Esquema SQL y migración
--------------------------------------------------------------------------- */
/** Debe coincidir con `supabase/migrations/`, que es lo que se copia a public/cms. */
const MIGRATIONS = [
  { file: "0001_cms_core.sql", title: "0001 — núcleo CMS", detail: "18 tablas · RLS · vista api_projects_v1" },
  { file: "0002_allow_mixed_unit_types.sql", title: "0002 — tipologías mixtas", detail: "relaja el check de unit types" },
  { file: "0003_notifications.sql", title: "0003 — avisos", detail: "tabla notifications · lectura autenticada" },
  { file: "0004_storage_bucket.sql", title: "0004 — bucket de imágenes", detail: "necesaria para subir fotos" },
  { file: "0005_categories_and_tags.sql", title: "0005 — catálogo de etiquetas", detail: "sugerencias de amenidades y tipologías" },
  { file: "0006_cms_studio_access.sql", title: "0006 — permisos del estudio", detail: "necesaria para crear proyectos y ver leads" },
  { file: "0007_property_categories_and_amenity_groups.sql", title: "0007 — catálogo de amenidades", detail: "categorías y grupos reutilizables" },
  { file: "0008_api_projects_v1_property_category.sql", title: "0008 — API por categoría", detail: "categoría pública de cada proyecto" },
  { file: "0009_api_projects_v1_bedrooms_fix.sql", title: "0009 — API con habitaciones", detail: "tipologías y habitaciones públicas" },
  { file: "0010_api_projects_v1_bathrooms.sql", title: "0010 — rangos de baños", detail: "mínimo y máximo por tipología" },
  { file: "0011_site_visibility_settings.sql", title: "0011 — visibilidad pública", detail: "nombres públicos controlados desde el CMS" },
];

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
          <h2>Migraciones</h2>
          <div className="api-endpoints">
            {MIGRATIONS.map((item) => (
              <a key={item.file} href={`/cms/migrations/${item.file}`} download>
                <span>
                  <FileSql size={17} style={{ verticalAlign: -3 }} /> {item.title}
                </span>
                <code>{item.detail}</code>
              </a>
            ))}
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
            <li>Aplicar las migraciones <strong>en orden</strong> en el editor SQL de Supabase, o con <code className="code-line">supabase db push</code>.</li>
            <li>Crear el usuario administrador en Authentication y añadir su fila en <code className="code-line">cms_profiles</code> con rol <code className="code-line">admin</code>.</li>
            <li>Configurar <code className="code-line">NEXT_PUBLIC_SUPABASE_URL</code> y <code className="code-line">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en el despliegue.</li>
            <li>Abrir <strong>Diagnóstico</strong> en este panel: ahí se comprueba pieza por pieza qué quedó activo.</li>
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
