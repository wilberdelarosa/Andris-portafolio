import type { Metadata, Viewport } from "next";
import { KuulaWarmup } from "@/components/kuula-warmup";
import "./globals.css";
const indexable = process.env.NEXT_PUBLIC_INDEXABLE === "true";
export const metadata: Metadata = {
  title: {
    default: "Andris Peña | Tu próximo capítulo en Punta Cana",
    template: "%s | Andris Peña",
  },
  description:
    "Portafolio independiente de Andris Peña, asesor inmobiliario. Descubre Melcon Paradise en Vista Cana, explora sus espacios y prepara tu próxima inversión.",
  applicationName: "Andris Peña",
  authors: [{ name: "Andris Peña" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  robots: { index: indexable, follow: indexable },
  icons: {
    icon: [
      { url: "/derived/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/derived/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Andris Peña",
  },
  openGraph: {
    title: "Andris Peña | Tu próximo capítulo",
    description:
      "Personas. Lugares. Nuevos comienzos. Descubre el portafolio inmobiliario de Andris Peña en Punta Cana.",
    type: "website",
    locale: "es_DO",
    images: [
      {
        url: "/derived/melcon-hero.webp",
        width: 1183,
        height: 785,
        alt: "Melcon Paradise · Vista Cana",
      },
    ],
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FBF9F4",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://kuula.co" />
        <link rel="dns-prefetch" href="https://static.kuula.io" />
        <link rel="dns-prefetch" href="https://files.kuula.io" />
        <link rel="preconnect" href="https://kuula.co" crossOrigin="" />
        <link rel="preconnect" href="https://static.kuula.io" crossOrigin="" />
        <link rel="preconnect" href="https://files.kuula.io" crossOrigin="" />
      </head>
      <body>
        <KuulaWarmup />
        {children}
      </body>
    </html>
  );
}
