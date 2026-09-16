"use client";
import { useEffect, useState } from "react";
import { DownloadSimple } from "@phosphor-icons/react";
import { useExperience } from "./experience-provider";
interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
let installPrompt: InstallEvent | null = null;
export function PwaManager() {
  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      installPrompt = event as InstallEvent;
    };
    const installed = () => {
      installPrompt = null;
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installed);
    if ("serviceWorker" in navigator && process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister())),
        )
        .then(() =>
          "caches" in window
            ? caches
                .keys()
                .then((keys) =>
                  Promise.all(
                    keys
                      .filter((key) => key.startsWith("ap-"))
                      .map((key) => caches.delete(key)),
                  ),
                )
            : undefined,
        )
        .catch(() => {
          /* Local cleanup is best-effort; development remains usable. */
        });
    }
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then(() => navigator.serviceWorker.ready)
        .then((registration) => {
          const warm = () => {
            const resources = performance
              .getEntriesByType("resource")
              .map((entry) => entry.name);
            registration.active?.postMessage({
              type: "CACHE_PUBLIC_PAGE",
              page: location.href,
              resources,
            });
          };
          if (document.readyState === "complete") warm();
          else window.addEventListener("load", warm, { once: true });
        })
        .catch(() => {
          /* Browser may disallow installation; the website remains usable. */
        });
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  return null;
}
export function InstallButton() {
  const { t } = useExperience();
  const [help, setHelp] = useState("");
  return (
    <>
      <button
        className="button button-primary"
        onClick={async () => {
          if (
            matchMedia("(display-mode: standalone)").matches ||
            (navigator as Navigator & { standalone?: boolean }).standalone
          ) {
            setHelp(t.installed);
            return;
          }
          if (installPrompt) {
            const prompt = installPrompt;
            installPrompt = null;
            await prompt.prompt();
            const choice = await prompt.userChoice;
            setHelp(
              choice.outcome === "accepted" ? t.installed : t.installHelp,
            );
          } else setHelp(t.installHelp);
        }}
      >
        <DownloadSimple size={18} />
        {t.install}
      </button>
      {help && (
        <p className="install-help" role="status">
          {help}
        </p>
      )}
    </>
  );
}
