"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="not-found">
      <span>ANDRIS PEÑA</span>
      <h1>Volvamos a intentarlo.</h1>
      <p>
        No pudimos cargar esta página. / Unable to load this page. / Impossible
        de charger cette page.
      </p>
      <button className="button button-primary" onClick={reset}>
        Reintentar / Retry / Réessayer
      </button>
    </main>
  );
}
