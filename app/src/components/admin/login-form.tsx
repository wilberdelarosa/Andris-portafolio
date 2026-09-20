/**
 * Acceso al estudio CMS.
 *
 * La version anterior traia el correo y la contrasena del administrador
 * escritos como valor inicial del formulario, de modo que la contrasena
 * viajaba dentro del bundle publico. Ahora los campos empiezan vacios y la
 * autenticacion la resuelve `src/lib/cms/session.ts`, que es quien guarda y
 * renueva la sesion.
 */
"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Warning } from "@phosphor-icons/react";
import { describeError, isSupabaseConfigured, signIn } from "@/lib/cms/session";

export function LoginForm({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
      onSignedIn();
    } catch (signInError) {
      setError(describeError(signInError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <span className="admin-brand-mark">AP</span>
          <h2>Estudio CMS</h2>
          <p>Acceso restringido a la administración del portafolio.</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {!configured && (
            <div className="admin-notification is-warning">
              <Warning size={20} weight="fill" />
              <span>
                Supabase no está configurado. Añade <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> a <code>.env.local</code> y reinicia
                el servidor.
              </span>
            </div>
          )}
          {error && (
            <div className="admin-notification is-error" role="alert">
              <Warning size={20} weight="fill" />
              <span>{error}</span>
            </div>
          )}

          <label className="admin-field">
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="username"
              placeholder="tu@correo.com"
              disabled={!configured}
            />
          </label>
          <label className="admin-field">
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              disabled={!configured}
            />
          </label>

          <button
            type="submit"
            className="button button-primary admin-login-submit"
            disabled={loading || !configured}
          >
            {loading ? "Autenticando…" : "Iniciar sesión"} <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
