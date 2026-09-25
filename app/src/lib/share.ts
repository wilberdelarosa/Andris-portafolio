export type ShareOutcome = "shared" | "copied" | "cancelled" | "failed";

/**
 * Usa la hoja nativa del dispositivo cuando existe y cae a portapapeles en
 * escritorio. `AbortError` es una cancelación normal del usuario, no un fallo.
 */
export async function shareOrCopy(data: ShareData): Promise<ShareOutcome> {
  if (typeof navigator === "undefined") return "failed";

  if (typeof navigator.share === "function") {
    try {
      await navigator.share(data);
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
      // Si la hoja nativa falla por una restricción del navegador, todavía
      // intentamos la alternativa explícita de copiar el enlace.
    }
  }

  if (!navigator.clipboard?.writeText || !data.url) return "failed";
  try {
    await navigator.clipboard.writeText(data.url);
    return "copied";
  } catch {
    return "failed";
  }
}
