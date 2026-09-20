/**
 * Sesion del estudio CMS contra Supabase Auth.
 *
 * Antes cada componente del panel resolvia la autenticacion por su cuenta:
 * unos leian `localStorage` a mano y otros llamaban a PostgREST con la clave
 * anonima, que RLS rechaza para las tablas privadas. Este modulo es el unico
 * punto que guarda la sesion, la renueva antes de expirar y firma las
 * peticiones, para que el panel no quede "conectado" con un token muerto.
 *
 * El sitio se publica como export estatico, asi que no hay backend donde
 * esconder una `service_role`: el navegador usa la clave anonima publica y el
 * JWT del usuario, y es RLS quien decide lo que puede leer o escribir.
 */
"use client";

const SESSION_KEY = "ap-cms-session";
const LEGACY_TOKEN_KEY = "cms_auth_token";
const LEGACY_EMAIL_KEY = "cms_auth_email";
const SESSION_EVENT = "ap-cms-session";
/** Se renueva con antelacion para que ninguna peticion salga con token vencido. */
const REFRESH_MARGIN_SECONDS = 90;

export interface CmsSession {
  accessToken: string;
  refreshToken: string;
  /** Epoch en segundos. */
  expiresAt: number;
  email: string;
  userId: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/** Error con el estado HTTP, para distinguir 401 de 404 o de un fallo de red. */
export class CmsError extends Error {
  readonly status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.name = "CmsError";
    this.status = status;
  }
}

/**
 * Las variables se leen como miembro estatico para que Next las reemplace en
 * el bundle del cliente.
 */
export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url: url.replace(/\/+$/, ""), anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

function emitChange() {
  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
}

/** Avisa a todo el panel cuando se entra, se sale o caduca la sesion. */
export function onSessionChange(listener: () => void): () => void {
  const handler = () => listener();
  window.addEventListener(SESSION_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(SESSION_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function isSession(value: unknown): value is CmsSession {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.accessToken === "string" &&
    typeof row.refreshToken === "string" &&
    typeof row.expiresAt === "number" &&
    typeof row.email === "string"
  );
}

export function readSession(): CmsSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      return isSession(parsed) ? parsed : null;
    }
    // Sesion creada por la version anterior del panel: se conserva el acceso,
    // pero sin `refresh_token`, asi que morira cuando el servidor la rechace.
    const legacyToken = window.localStorage.getItem(LEGACY_TOKEN_KEY);
    const legacyEmail = window.localStorage.getItem(LEGACY_EMAIL_KEY);
    if (legacyToken && legacyEmail) {
      return {
        accessToken: legacyToken,
        refreshToken: "",
        expiresAt: 0,
        email: legacyEmail,
        userId: "",
      };
    }
    return null;
  } catch {
    return null;
  }
}

let cachedRaw: string | null = null;
let cachedSession: CmsSession | null = null;

/**
 * Instantanea estable para `useSyncExternalStore`: React exige que dos
 * llamadas seguidas devuelvan la misma referencia mientras nada cambie, y
 * `readSession()` crea un objeto nuevo en cada llamada.
 */
export function getSessionSnapshot(): CmsSession | null {
  if (typeof window === "undefined") return null;
  let raw: string;
  try {
    raw = [
      window.localStorage.getItem(SESSION_KEY),
      window.localStorage.getItem(LEGACY_TOKEN_KEY),
      window.localStorage.getItem(LEGACY_EMAIL_KEY),
    ].join("\u0000");
  } catch {
    raw = "";
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSession = readSession();
  }
  return cachedSession;
}

/**
 * El HTML se genera en build, donde no hay `localStorage`. Devolver
 * `undefined` deja distinguir "todavia no hidratado" de "sin sesion" y evita
 * que el formulario de acceso parpadee ante alguien que ya entro.
 */
export function getSessionServerSnapshot(): undefined {
  return undefined;
}

export function writeSession(session: CmsSession) {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.localStorage.removeItem(LEGACY_TOKEN_KEY);
    window.localStorage.removeItem(LEGACY_EMAIL_KEY);
  } catch {
    /* Navegacion privada: la sesion vive solo en memoria. */
  }
  emitChange();
}

export function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(LEGACY_TOKEN_KEY);
    window.localStorage.removeItem(LEGACY_EMAIL_KEY);
  } catch {
    /* Ignorado: el objetivo es justamente quedarse sin sesion. */
  }
  emitChange();
}

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  user?: { id?: string; email?: string };
  error_description?: string;
  error?: string;
  msg?: string;
  message?: string;
}

function toSession(data: TokenResponse, fallbackEmail: string): CmsSession {
  if (!data.access_token) {
    throw new CmsError("Supabase no devolvio un token de acceso.", 500);
  }
  const expiresAt =
    data.expires_at ?? Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600);
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? "",
    expiresAt,
    email: data.user?.email ?? fallbackEmail,
    userId: data.user?.id ?? "",
  };
}

async function requestToken(
  grantType: "password" | "refresh_token",
  body: Record<string, string>,
  fallbackEmail: string,
): Promise<CmsSession> {
  const config = getSupabaseConfig();
  if (!config) {
    throw new CmsError(
      "Supabase no esta configurado: faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  let response: Response;
  try {
    response = await fetch(`${config.url}/auth/v1/token?grant_type=${grantType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: config.anonKey },
      body: JSON.stringify(body),
    });
  } catch {
    throw new CmsError("No se pudo conectar con Supabase. Revisa la conexion.");
  }
  const data = (await response.json().catch(() => ({}))) as TokenResponse;
  if (!response.ok) {
    const detail = data.error_description || data.msg || data.message || data.error;
    throw new CmsError(
      grantType === "password"
        ? detail || "Correo o contrasena incorrectos."
        : detail || "La sesion expiro. Vuelve a iniciar sesion.",
      response.status,
    );
  }
  return toSession(data, fallbackEmail);
}

export async function signIn(email: string, password: string): Promise<CmsSession> {
  const clean = email.trim();
  const session = await requestToken("password", { email: clean, password }, clean);
  writeSession(session);
  return session;
}

export async function signOut(): Promise<void> {
  const config = getSupabaseConfig();
  const session = readSession();
  // Se revoca en el servidor cuando se puede, pero la sesion local se borra igual.
  if (config && session?.accessToken) {
    try {
      await fetch(`${config.url}/auth/v1/logout`, {
        method: "POST",
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
    } catch {
      /* Sin red tambien se cierra la sesion en este dispositivo. */
    }
  }
  clearSession();
}

let refreshInFlight: Promise<CmsSession | null> | null = null;

/** Devuelve un token vigente, renovandolo si esta a punto de expirar. */
export async function getAccessToken(): Promise<string | null> {
  const session = readSession();
  if (!session) return null;
  const now = Math.floor(Date.now() / 1000);
  if (session.expiresAt - REFRESH_MARGIN_SECONDS > now) {
    return session.accessToken;
  }
  if (!session.refreshToken) {
    // Sesion heredada sin refresh: se usa hasta que el servidor la rechace.
    return session.expiresAt === 0 ? session.accessToken : null;
  }
  // Varias peticiones simultaneas comparten una unica renovacion.
  refreshInFlight ??= requestToken(
    "refresh_token",
    { refresh_token: session.refreshToken },
    session.email,
  )
    .then((next) => {
      writeSession(next);
      return next;
    })
    .catch(() => {
      clearSession();
      return null;
    })
    .finally(() => {
      refreshInFlight = null;
    });
  const refreshed = await refreshInFlight;
  return refreshed?.accessToken ?? null;
}

export interface CmsFetchOptions extends RequestInit {
  /** `true` permite responder con la clave anonima cuando no hay sesion. */
  allowAnonymous?: boolean;
}

/**
 * Peticion firmada a Supabase. `path` es relativo a la raiz del proyecto,
 * por ejemplo `rest/v1/categories?select=name`.
 *
 * Si el servidor responde 401 con un token que creiamos vigente, se renueva
 * una vez y se reintenta; si tampoco asi, se cierra la sesion para que el
 * panel vuelva al acceso en lugar de fallar en silencio.
 */
export async function cmsFetch(
  path: string,
  options: CmsFetchOptions = {},
): Promise<Response> {
  const config = getSupabaseConfig();
  if (!config) {
    throw new CmsError("Supabase no esta configurado en este despliegue.");
  }
  const { allowAnonymous = false, ...init } = options;

  const send = async (token: string | null) => {
    const headers = new Headers(init.headers);
    headers.set("apikey", config.anonKey);
    headers.set("Authorization", `Bearer ${token ?? config.anonKey}`);
    try {
      return await fetch(`${config.url}/${path.replace(/^\/+/, "")}`, {
        ...init,
        headers,
        cache: "no-store",
      });
    } catch {
      throw new CmsError("No se pudo conectar con Supabase.");
    }
  };

  const token = await getAccessToken();
  if (!token && !allowAnonymous) {
    clearSession();
    throw new CmsError("La sesion expiro. Vuelve a iniciar sesion.", 401);
  }

  const response = await send(token);
  if (response.status !== 401 || !token) return response;

  // El token era invalido pese a su fecha: un unico reintento tras renovar.
  const session = readSession();
  if (!session?.refreshToken) {
    clearSession();
    return response;
  }
  try {
    const renewed = await requestToken(
      "refresh_token",
      { refresh_token: session.refreshToken },
      session.email,
    );
    writeSession(renewed);
    return await send(renewed.accessToken);
  } catch {
    clearSession();
    return response;
  }
}

/** Mensaje legible para la interfaz a partir de cualquier error capturado. */
export function describeError(error: unknown): string {
  if (error instanceof CmsError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocurrio un error inesperado.";
}

/** Lee el cuerpo de error de PostgREST o de Storage, que no comparten formato. */
export async function readErrorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  if (body && typeof body === "object") {
    const row = body as Record<string, unknown>;
    for (const key of ["message", "error_description", "msg", "error", "hint"]) {
      const value = row[key];
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  return `Supabase respondio ${response.status}.`;
}
