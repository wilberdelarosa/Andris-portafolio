import type { Metadata } from "next";
import { AdminStudio } from "@/components/admin/admin-studio";

export const metadata: Metadata = {
  title: "Estudio CMS",
  description:
    "Estudio de contenido del portafolio de Andris Peña: proyectos, leads, cotizaciones y esquema de base de datos.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminStudio />;
}
