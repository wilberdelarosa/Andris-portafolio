/**
 * Acceso al estudio CMS.
 *
 * Diseño 21st / Premium UI:
 *  - Animaciones fluidas de entrada y feedback de error (shake).
 *  - Visibilidad de contraseña (Toggle Eye).
 *  - Validaciones en tiempo real para el correo.
 */
"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Warning, CheckCircle, Eye, EyeClosed, EnvelopeSimple, LockKey } from "@phosphor-icons/react";
import { describeError, isSupabaseConfigured, signIn } from "@/lib/cms/session";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

export function LoginForm({ onSignedIn }: { onSignedIn: () => void }) {
  /**
   * El resto del panel ya respeta la preferencia del sistema (el cambio de
   * pestaña en `admin-studio.tsx`); esta pantalla se había quedado fuera y
   * seguía animando la entrada y sacudiendo la tarjeta al fallar el acceso.
   */
  const reduced = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const configured = isSupabaseConfigured();

  // Validación de email básica
  const isEmailValid = email.length > 5 && email.includes("@") && email.includes(".");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setShake(false);
    
    try {
      await signIn(email, password);
      onSignedIn();
    } catch (signInError) {
      setError(describeError(signInError));
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <motion.div
        className="admin-login-backdrop"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0 : 1 }}
      />

      <motion.div
        className="admin-login-card premium-glass"
        initial={reduced ? false : { opacity: 0, y: 20, scale: 0.95 }}
        animate={
          shake && !reduced
            ? { x: [-10, 10, -10, 10, -5, 5, 0] }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={{
          duration: reduced ? 0 : shake ? 0.4 : 0.5,
          ease: shake ? "linear" : [0.22, 1, 0.36, 1],
        }}
      >
        <div className="admin-login-header">
          <motion.div
            className="admin-brand-mark"
            initial={reduced ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={
              reduced
                ? { duration: 0 }
                : { delay: 0.2, type: "spring", stiffness: 200, damping: 15 }
            }
          >
            AP
          </motion.div>
          <motion.h2
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.3 }}
          >
            Estudio CMS
          </motion.h2>
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.4 }}
          >
            Acceso restringido a la administración del portafolio de Andris
            Peña.
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <AnimatePresence>
            {!configured && (
              <motion.div 
                className="admin-notification is-warning"
                initial={reduced ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Warning size={20} weight="fill" />
                <span>
                  Supabase no está configurado. Añade <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
                  <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> a <code>.env.local</code> y reinicia el servidor.
                </span>
              </motion.div>
            )}
            
            {error && (
              <motion.div 
                className="admin-notification is-error" 
                role="alert"
                initial={reduced ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Warning size={20} weight="fill" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            className="admin-premium-field"
            initial={reduced ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduced ? 0 : 0.5 }}
          >
            <label htmlFor="email">Correo electrónico</label>
            <div className="input-with-icon">
              <span className="input-icon left">
                <EnvelopeSimple size={18} />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="username"
                placeholder="tu@correo.com"
                disabled={!configured || loading}
              />
              <AnimatePresence>
                {isEmailValid && (
                  <motion.div 
                    className="input-icon right success"
                    initial={reduced ? false : { scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={reduced ? undefined : { scale: 0, opacity: 0 }}
                  >
                    <CheckCircle size={18} weight="fill" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div 
            className="admin-premium-field"
            initial={reduced ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduced ? 0 : 0.6 }}
          >
            <label htmlFor="password">Contraseña</label>
            <div className="input-with-icon">
              <span className="input-icon left">
                <LockKey size={18} />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                disabled={!configured || loading}
                placeholder="••••••••"
              />
              <button 
                type="button" 
                className="input-icon right toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                tabIndex={-1}
              >
                {showPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
              </button>
            </div>
          </motion.div>

          <motion.button
            type="submit"
            className="button button-primary admin-login-submit"
            disabled={loading || !configured || !isEmailValid || password.length < 3}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.7 }}
            whileHover={reduced ? undefined : { scale: 1.02 }}
            whileTap={reduced ? undefined : { scale: 0.98 }}
          >
            {loading ? (
              <motion.span 
                className="loader-spinner"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <ArrowRight size={18} />
              </motion.span>
            ) : (
              <>Ingresar al sistema <ArrowRight size={18} /></>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
