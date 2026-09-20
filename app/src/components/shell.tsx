"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getPublishedProjects } from "@/content/projects";
import { journeyCopy } from "@/content/journey-copy";
import {
  House,
  SquaresFour,
  User,
  MapPin,
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
  InstagramLogo,
} from "@phosphor-icons/react";
import { useExperience, type Theme } from "./experience-provider";
import { Modal } from "./ui";
import "./journey.css";
import { ReadingProgress, Magnetic, JourneyScrollTracker } from "./premium-motion";
import { advisor } from "@/content/advisor";
import { InstallButton, PwaManager } from "./pwa-manager";
import { IntroCurtain } from "./intro-curtain";
import { SmoothScroll } from "./smooth-scroll";
import type { Locale } from "@/content/projects";
import { contactCopy } from "@/content/contact-copy";
import { PrivacyNotice } from "./privacy-notice";


export function Shell({
  children,
  bare = false,
}: {
  children: React.ReactNode;
  detail?: boolean;
  /** Retira el pie de pagina: para rutas donde el contenido llena la pantalla. */
  bare?: boolean;
}) {
  const { t, locale, setLocale, theme, setTheme, savedSlugs, reset, offline, hideProjectNames, setHideProjectNames } =
    useExperience();
  const pathname = usePathname();
  const j = journeyCopy[locale];
  const menuButton = useRef<HTMLButtonElement>(null);
  const navigation = [
    { path: "/", label: t.nav[0], icon: House },
    { path: "/proyectos", label: t.nav[1], icon: SquaresFour },
    { path: "/mapa", label: j.mapView, icon: MapPin },
    { path: "/sobre-mi", label: t.nav[2], icon: User },
    { path: "/calculadora", label: t.nav[3], icon: Calculator },
    { path: "/contacto", label: t.talk, icon: WhatsappLogo },
  ];
  const savedProjects = getPublishedProjects().filter((p) => savedSlugs.includes(p.slug));
  const isActive = (path: string) => path === "/" ? pathname === "/" : pathname.startsWith(path);
  const [settings, setSettings] = useState(false);
  const [favorites, setFavorites] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [menu, setMenu] = useState(false);
  const isHome = pathname === "/" || pathname === "" || pathname === "/index";
  const floatingWhatsappCopy = {
    es: {
      title: "Hablemos ahora",
      label: "Hablar por WhatsApp con Andris Peña",
      messages: [
        "Te ayudo a elegir proyecto",
        "Comparte tu presupuesto",
        "Respuesta directa y humana",
      ],
    },
    en: {
      title: "Talk now",
      label: "Talk with Andris Peña on WhatsApp",
      messages: [
        "I can help you compare",
        "Share your budget",
        "Direct human guidance",
      ],
    },
    fr: {
      title: "Parlons maintenant",
      label: "Parler avec Andris Peña sur WhatsApp",
      messages: [
        "Je vous aide à comparer",
        "Partagez votre budget",
        "Conseil direct et humain",
      ],
    },
  }[locale];
  return (
    <>
      <PwaManager />
      <ReadingProgress/>
      {isHome && <JourneyScrollTracker locale={locale} />}
      <IntroCurtain />
      <SmoothScroll />
      <a className="skip-link" href="#main-content">
        {t.skip}
      </a>
      <header className="site-header">
        <Link
          href={`/?lang=${locale}`}
          prefetch={false}
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
          {navigation.slice(0, 5).map((item) => (
            <Link key={item.path} href={`${item.path}?lang=${locale}`} prefetch={false} className={isActive(item.path) ? "active" : ""} aria-current={isActive(item.path) ? "page" : undefined}>{item.label}</Link>
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
          <Link className="header-contact" href={`/contacto?lang=${locale}`} prefetch={false}>
            {t.talk}
            <ArrowUpRight size={17} />
          </Link>
          <button
            ref={menuButton}
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
      <Modal open={menu} onOpenChange={setMenu} title={t.portfolio} className="navigation-dialog">
        <nav id="mobile-navigation" className="navigation-links" aria-label={t.portfolio}>
          {navigation.map((item) => <Link key={item.path} href={`${item.path}?lang=${locale}`} prefetch={false} onClick={() => setMenu(false)} aria-current={isActive(item.path) ? "page" : undefined}>{item.label}<ArrowUpRight size={22}/></Link>)}
          <button type="button" onClick={() => { setMenu(false); setFavorites(true); }}>{t.favorites}<Heart size={22}/></button>
        </nav>
      </Modal>
      <div className="page-shell">
        {offline && (
          <div className="offline-banner" role="status">
            {t.offline}
          </div>
        )}
        <main id="main-content" data-bare={bare ? "true" : undefined}>
          {children}
        </main>
        {bare ? null : <>
        <footer className="footer">
          <div className="footer-top">
            <span className="footer-title">{t.footerNote}</span>
            <Magnetic strength={0.3}>
              <a
                href={`/?lang=${locale}`}
                className="icon-button"
                aria-label={t.home}
              >
                <ArrowUp size={21} />
              </a>
            </Magnetic>
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
          <div className="footer-credit">
            <span>{locale === "es" ? "Desarrollado por" : locale === "fr" ? "Développé par" : "Developed by"}</span>
            <div className="footer-credit-links">
              <a href="https://viltrumtek.com" target="_blank" rel="noopener noreferrer">
                <strong>VILTRUM TEK</strong><ArrowUpRight size={14} aria-hidden="true" />
              </a>
              <a href="https://www.instagram.com/viltrumtek/" target="_blank" rel="noopener noreferrer" aria-label="Viltrum Tek Instagram">
                <InstagramLogo size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
        </footer>
        </>}
      </div>
      <nav className="mobile-dock" aria-label={t.portfolio}>
        {[0, 1, 2, 5].map((i) => {
          const item = navigation[i];
          const Icon = item.icon;
          return <Link key={item.path} href={`${item.path}?lang=${locale}`} prefetch={false} aria-current={isActive(item.path) ? "page" : undefined} className={isActive(item.path) ? "active" : ""}>
            <Icon size={22} weight={isActive(item.path) ? "fill" : "regular"}/><span>{item.label}</span>
          </Link>;
        })}
      </nav>
      <a
        className="floating-whatsapp"
        href={`https://wa.me/${advisor.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={floatingWhatsappCopy.label}
      >
        <span className="floating-whatsapp-aura" aria-hidden="true" />
        <span className="floating-whatsapp-icon" aria-hidden="true">
          <WhatsappLogo size={23} weight="fill" />
        </span>
        <span className="floating-whatsapp-copy">
          <strong>{floatingWhatsappCopy.title}</strong>
          <span className="floating-whatsapp-message" aria-hidden="true">
            {floatingWhatsappCopy.messages.map((message) => (
              <span key={message}>{message}</span>
            ))}
          </span>
        </span>
      </a>
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
          <h3>Privacidad (Modo Broker)</h3>
          <button 
            className="settings-favorite" 
            onClick={() => setHideProjectNames(!hideProjectNames)}
          >
            Ocultar nombres reales
            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
              {hideProjectNames ? "ACTIVO" : "INACTIVO"}
            </span>
          </button>
        </div>
        <div className="settings-section">
          <button
            className="settings-favorite"
            onClick={() => {
              setSettings(false);
              setFavorites(true);
            }}
          >
            <Heart size={21} weight={savedProjects.length ? "fill" : "regular"} />
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
        {savedProjects.length ? savedProjects.map((project) => (
          <Link key={project.slug} className="saved-project" onClick={() => setFavorites(false)} href={`/proyectos/${project.slug}?lang=${locale}`} prefetch={false}>
            <Image src={project.hero} alt="" width={90} height={76}/>
            <span><strong>{project.name}</strong><small>{project.location}</small></span><ArrowUpRight size={20}/>
          </Link>
        )) : <div className="saved-empty"><Heart size={32} weight="light"/><p>{j.noSaved}</p><p>{j.saveHint}</p><Link className="button button-primary" href={`/proyectos?lang=${locale}`} prefetch={false} onClick={() => setFavorites(false)}>{j.all}<ArrowUpRight size={18}/></Link></div>}
      </Modal>
      <Modal
        open={privacy}
        onOpenChange={setPrivacy}
        title={contactCopy[locale].privacyTitle}
        description={contactCopy[locale].privacySummary}
      >
        <PrivacyNotice />
      </Modal>
    </>
  );
}
