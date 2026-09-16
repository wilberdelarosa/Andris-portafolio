import type { MetadataRoute } from "next";
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Andris Peña · Portafolio inmobiliario",
    short_name: "Andris Peña",
    description:
      "Personas. Lugares. Nuevos comienzos. Portafolio inmobiliario en Punta Cana.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FBF9F4",
    theme_color: "#0B1F3A",
    lang: "es",
    orientation: "any",
    categories: ["lifestyle", "business"],
    icons: [
      {
        src: "/derived/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/derived/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/derived/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Proyectos", url: "/#proyectos" },
      { name: "Simulador", url: "/#inversion" },
      { name: "Conversemos", url: "/#contacto" },
    ],
  };
}
