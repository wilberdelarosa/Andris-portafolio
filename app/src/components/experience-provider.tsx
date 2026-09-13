"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { MotionConfig } from "motion/react";
import { dictionaries } from "@/content/copy";
import type { Locale } from "@/content/projects";

export type Theme = "light" | "dark" | "system";
interface Experience {
  locale: Locale;
  setLocale: (value: Locale) => void;
  theme: Theme;
  setTheme: (value: Theme) => void;
  /** Compatibilidad: equivale a tener guardado Melcon Paradise. */
  saved: boolean;
  toggleSaved: () => void;
  savedSlugs: string[];
  isSaved: (slug: string) => boolean;
  toggleSlug: (slug: string) => void;
  reset: () => void;
  offline: boolean;
  t: typeof dictionaries.es;
}
const Context = createContext<Experience | null>(null);
/** Unico proyecto que podia guardarse antes de que los favoritos fueran por ficha. */
const LEGACY_SLUG = "melcon-paradise";
const persist = (key: string, value: string) => {
  try {
    localStorage.setItem(`ap-${key}`, value);
  } catch {
    /* Storage may be unavailable in private browsing. */
  }
};
export function ExperienceProvider({
  children,
  initialLocale = "es",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, updateLocale] = useState<Locale>(initialLocale);
  const [theme, updateTheme] = useState<Theme>("light");
  const [savedSlugs, updateSavedSlugs] = useState<string[]>([]);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- One post-hydration synchronization with browser storage; SSR must use the supplied locale and avoid reading window. */
    // Synchronize saved browser preferences after hydration.
    try {
      const language = localStorage.getItem("ap-language");
      const appearance = localStorage.getItem("ap-theme");
      if (
        !new URLSearchParams(location.search).has("lang") &&
        (language === "es" || language === "en" || language === "fr")
      )
        updateLocale(language);
      if (
        appearance === "light" ||
        appearance === "dark" ||
        appearance === "system"
      )
        updateTheme(appearance);
      const storedSlugs = localStorage.getItem("ap-saved-slugs");
      if (storedSlugs) {
        const parsed: unknown = JSON.parse(storedSlugs);
        if (Array.isArray(parsed)) updateSavedSlugs(parsed.filter((item) => typeof item === "string"));
      } else if (localStorage.getItem("ap-saved") === "true") {
        // Migracion del favorito unico anterior, que solo podia ser Melcon.
        updateSavedSlugs([LEGACY_SLUG]);
      }
    } catch {
      /* Default preferences remain fully usable. */
    }
    const connectivity = new AbortController();
    const online = () => {
      setOffline(!navigator.onLine);
      if (navigator.onLine)
        fetch("/api/v1/health", {
          cache: "no-store",
          signal: connectivity.signal,
        })
          .then((response) => {
            if (!connectivity.signal.aborted) setOffline(!response.ok);
          })
          .catch(() => {
            if (!connectivity.signal.aborted) setOffline(true);
          });
    };
    online();
    window.addEventListener("online", online);
    window.addEventListener("offline", online);
    return () => {
      connectivity.abort();
      window.removeEventListener("online", online);
      window.removeEventListener("offline", online);
    };
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", dark ? "#0B1F3A" : "#FBF9F4");
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  const setLocale = useCallback((value: Locale) => {
    updateLocale(value);
    persist("language", value);
    const url = new URL(location.href);
    url.searchParams.set("lang", value);
    history.replaceState(null, "", url);
  }, []);
  const setTheme = useCallback((value: Theme) => {
    updateTheme(value);
    persist("theme", value);
  }, []);
  const toggleSlug = useCallback((slug: string) => {
    updateSavedSlugs((previous) => {
      const next = previous.includes(slug)
        ? previous.filter((item) => item !== slug)
        : [...previous, slug];
      persist("saved-slugs", JSON.stringify(next));
      // Se mantiene la clave antigua para no romper una sesion ya abierta.
      persist("saved", String(next.includes(LEGACY_SLUG)));
      return next;
    });
  }, []);
  const isSaved = useCallback((slug: string) => savedSlugs.includes(slug), [savedSlugs]);
  const toggleSaved = useCallback(() => toggleSlug(LEGACY_SLUG), [toggleSlug]);
  const saved = savedSlugs.includes(LEGACY_SLUG);
  const reset = () => {
    setLocale("es");
    setTheme("light");
    updateSavedSlugs([]);
    persist("saved-slugs", "[]");
    persist("saved", "false");
  };
  return (
    <Context.Provider
      value={{
        locale,
        setLocale,
        theme,
        setTheme,
        saved,
        toggleSaved,
        savedSlugs,
        isSaved,
        toggleSlug,
        reset,
        offline,
        t: dictionaries[locale],
      }}
    >
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </Context.Provider>
  );
}
export function useExperience() {
  const value = useContext(Context);
  if (!value) throw new Error("ExperienceProvider missing");
  return value;
}
