"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  House,
  SquaresFour,
  User,
  Calculator,
  ArrowUpRight,
  Sun,
  Moon,
  SlidersHorizontal,
  Heart,
  GlobeHemisphereWest,
  WhatsappLogo,
  EnvelopeSimple,
  ArrowUp,
  X,
  List,
} from "@phosphor-icons/react";
import { useExperience, type Theme } from "./experience-provider";
import { Modal } from "./ui";
import { advisor } from "@/content/advisor";
import { InstallButton, PwaManager } from "./pwa-manager";
import type { Locale } from "@/content/projects";

const sections = ["inicio", "proyectos", "sobre-mi", "inversion", "contacto"];
const icons = [House, SquaresFour, User, Calculator, WhatsappLogo];
export function Shell({
  children,
  detail = false,
}: {
  children: React.ReactNode;
  detail?: boolean;
}) {
  const { t, locale, setLocale, theme, setTheme, saved, reset, offline } =
    useExperience();
  const [active, setActive] = useState(detail ? "proyectos" : "inicio");
  const [settings, setSettings] = useState(false);
  const [favorites, setFavorites] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-10% 0px -65% 0px", threshold: 0 },
    );
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);
  const href = (section: string) =>
    detail ? `/?lang=${locale}#${section}` : `#${section}`;
  return (
    <>
      <PwaManager />
      <a className="skip-link" href="#main-content">
        {t.skip}
      </a>
      <header className="site-header">
        <Link
          href={`/?lang=${locale}`}
          className="brand"
          aria-label="Andris Peña"
        >
          <span className="brand-symbol">
            <Image
              className="logo-light"
              src="/derived/logo-navy.webp"
              alt=""
              width={40}
              height={44}
              priority
              unoptimized
            />
            <Image
              className="logo-dark"
              src="/derived/logo-white.webp"
              alt=""
              width={40}
              height={44}
              priority
              unoptimized
            />
          </span>
          <span className="brand-copy">
            <strong>Andris Peña</strong>
            <small>{t.role}</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label={t.portfolio}>
          {sections.slice(0, 4).map((section, index) => (
            <a
              key={section}
              href={href(section)}
              className={active === section ? "active" : ""}
              aria-current={active === section ? "location" : undefined}
            >
              {t.nav[index]}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <label className="language-control">
            <GlobeHemisphereWest size={17} aria-hidden="true" />
            <span className="sr-only">{t.language}</span>
            <select
              value={locale}
              onChange={(event) => setLocale(event.target.value as Locale)}
            >
              <option value="es">ES</option>
              <option value="en">EN</option>
              <option value="fr">FR</option>
            </select>
          </label>
          <button
            className="icon-button desktop-theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={t.themeToggle}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            className="icon-button header-settings"
            onClick={() => setSettings(true)}
            aria-label={t.settings}
          >
            <SlidersHorizontal size={20} />
          </button>
          <a className="header-contact" href={href("contacto")}>
            {t.talk}
            <ArrowUpRight size={17} />
          </a>
          <button
            className="icon-button mobile-menu"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? t.close : t.portfolio}
            aria-expanded={menu}
            aria-controls="mobile-navigation"
          >
            {menu ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
      </header>
      {menu && (
        <nav
          id="mobile-navigation"
          className="mobile-expanded-nav"
          aria-label={t.portfolio}
          onKeyDown={(event) => {
            if (event.key === "Escape") setMenu(false);
          }}
        >
          {sections.map((section, index) => (
            <a
              key={section}
              onClick={() => setMenu(false)}
              href={href(section)}
              aria-current={active === section ? "location" : undefined}
            >
              {t.nav[index]}
              <ArrowUpRight size={19} />
            </a>
          ))}
        </nav>
      )}
      <div className="page-shell">
        {offline && (
          <div className="offline-banner" role="status">
            {t.offline}
          </div>
        )}
        <main id="main-content">{children}</main>
        <footer className="footer">
          <div className="footer-top">
            <span className="footer-title">{t.footerNote}</span>
            <a
              href={href("inicio")}
              className="icon-button"
              aria-label={t.home}
            >
              <ArrowUp size={21} />
            </a>
          </div>
          <div className="footer-contacts">
            <a href={`mailto:${advisor.email}`}>
              <EnvelopeSimple size={17} />
              {advisor.email}
            </a>
            <a
              href={`https://wa.me/${advisor.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsappLogo size={18} />
              {advisor.phone}
            </a>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} Andris Peña. {t.independent}
            </span>
            <button onClick={() => setPrivacy(true)}>{t.privacy}</button>
            <button onClick={() => setSettings(true)}>{t.settings}</button>
          </div>
        </footer>
      </div>
      <nav className="mobile-dock" aria-label={t.portfolio}>
        {[0, 1, 3, 4].map((i) => {
          const Icon = icons[i];
          return (
            <a
              key={sections[i]}
              href={href(sections[i])}
              aria-current={active === sections[i] ? "location" : undefined}
              className={active === sections[i] ? "active" : ""}
            >
              <Icon
                size={22}
                weight={active === sections[i] ? "fill" : "regular"}
              />
              <span>{t.nav[i]}</span>
            </a>
          );
        })}
      </nav>
      <Modal open={settings} onOpenChange={setSettings} title={t.settings}>
        <div className="settings-section">
          <h3>{t.appearance}</h3>
          <div className="segmented-control">
            {(["light", "dark", "system"] as Theme[]).map((value) => (
              <button
                key={value}
                aria-pressed={theme === value}
                onClick={() => setTheme(value)}
              >
                {t[value]}
              </button>
            ))}
          </div>
        </div>
        <div className="settings-section">
          <h3>{t.language}</h3>
          <div className="language-options">
            {(["es", "en", "fr"] as Locale[]).map((language, index) => (
              <button
                key={language}
                aria-pressed={locale === language}
                onClick={() => setLocale(language)}
              >
                {["Español", "English", "Français"][index]}
                <span>{language.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="settings-section">
          <button
            className="settings-favorite"
            onClick={() => {
              setSettings(false);
              setFavorites(true);
            }}
          >
            <Heart size={21} weight={saved ? "fill" : "regular"} />
            <span>{t.favorites}</span>
            <ArrowUpRight size={19} />
          </button>
        </div>
        <div className="settings-section">
          <h3>{t.installText}</h3>
          <InstallButton />
        </div>
        <button className="text-button" onClick={reset}>
          {t.clearPreferences}
        </button>
      </Modal>
      <Modal open={favorites} onOpenChange={setFavorites} title={t.favorites}>
        {saved ? (
          <Link
            className="saved-project"
            onClick={() => setFavorites(false)}
            href={`/proyectos/melcon-paradise?lang=${locale}`}
          >
            <Image
              src="/derived/melcon-hero-small.webp"
              alt="Melcon Paradise"
              width={110}
              height={80}
            />
            <span>
              <strong>Melcon Paradise</strong>
              <small>Vista Cana · Punta Cana</small>
            </span>
            <ArrowUpRight size={20} />
          </Link>
        ) : (
          <p>{t.savedEmpty}</p>
        )}
      </Modal>
      <Modal
        open={privacy}
        onOpenChange={setPrivacy}
        title={t.privacy}
        description={t.privacyText}
      >
        <span />
      </Modal>
    </>
  );
}
