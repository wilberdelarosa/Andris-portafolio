import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <span>404 / ANDRIS PEÑA</span>
      <h1>Este lugar aún no está aquí.</h1>
      <p>Vuelve al portafolio para explorar los proyectos disponibles.</p>
      <Link className="button button-primary" href="/?lang=es" prefetch={false}>
        Volver al inicio
      </Link>
    </main>
  );
}
