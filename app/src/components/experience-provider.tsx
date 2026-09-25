"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { MotionConfig } from "motion/react";
import { dictionaries } from "@/content/copy";
import type { Locale } from "@/content/projects";
import { getPublicProjectNamesVisible, SITE_SETTINGS_EVENT } from "@/lib/site-settings";

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
  hideProjectNames: boolean;
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
  const [publicProjectNamesVisible, setPublicProjectNamesVisible] = useState<boolean | null>(null);
  useLayoutEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- One post-hydration synchronization with browser storage; SSR must use the supplied locale and avoid reading window. */
    // Synchronize saved browser preferences after hydration.
    try {
      const queryLanguage = new URLSearchParams(location.search).get("lang");
      const language = localStorage.getItem("ap-language");
      const appearance = localStorage.getItem("ap-theme");
      if (queryLanguage === "es" || queryLanguage === "en" || queryLanguage === "fr")
        updateLocale(queryLanguage);
      else if (language === "es" || language === "en" || language === "fr")
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
    const online = () => {
      setOffline(!navigator.onLine);
    };
    online();
    window.addEventListener("online", online);
    window.addEventListener("offline", online);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", online);
    };
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    let cancelled = false;
    const loadVisibility = () => {
      void getPublicProjectNamesVisible().then((visible) => {
        if (!cancelled) setPublicProjectNamesVisible(visible);
      });
    };
    loadVisibility();
    window.addEventListener(SITE_SETTINGS_EVENT, loadVisibility);
    return () => {
      cancelled = true;
      window.removeEventListener(SITE_SETTINGS_EVENT, loadVisibility);
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  useEffect(() => {
    // Exposes completion of client hydration to the browser smoke test before
    // it begins interacting with controlled inputs and dialogs.
    document.documentElement.dataset.experienceReady = "true";
  }, []);
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
  const hideProjectNames = publicProjectNamesVisible === false;
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
        hideProjectNames,
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
