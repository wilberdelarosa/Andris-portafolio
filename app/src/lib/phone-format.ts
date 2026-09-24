/**
 * Formateo de telefonos para los formularios publicos.
 *
 * Se resuelve sin dependencias a proposito. `libphonenumber-js` es correcto,
 * pero su metadato mas pequeño ("min") pesa ~75 KB sin comprimir / ~28 KB en
 * gzip, y el completo pasa de 140 KB; entra en el bundle de cliente de una
 * pagina que hoy pide dos datos. Aqui no se valida operadora ni portabilidad:
 * solo se agrupa lo tecleado para que se lea, y el sitio atiende basicamente
 * a +1 (Republica Dominicana, EE. UU., Canada) y algo de Europa, que son
 * planes de numeracion estables y cortos de describir.
 *
 * Reglas que esta mascara se impone:
 *  - Nunca rechaza ni recorta digitos. Solo inserta espacios.
 *  - Acepta pegar un numero completo, con parentesis, guiones o "00" delante.
 *  - Si no reconoce el prefijo, agrupa de tres en tres, que se lee bien en
 *    casi cualquier plan nacional y no inventa una separacion falsa.
 */

/** Agrupaciones nacionales de los prefijos que este sitio ve de verdad. */
const PLANS: { code: string; groups: number[] }[] = [
  { code: "1", groups: [3, 3, 4] }, // Republica Dominicana, EE. UU., Canada
  { code: "31", groups: [1, 3, 3, 3] }, // Paises Bajos
  { code: "32", groups: [3, 2, 2, 2] }, // Belgica
  { code: "33", groups: [1, 2, 2, 2, 2] }, // Francia
  { code: "34", groups: [3, 3, 3] }, // España
  { code: "39", groups: [3, 3, 4] }, // Italia
  { code: "41", groups: [2, 3, 2, 2] }, // Suiza
  { code: "44", groups: [4, 3, 3] }, // Reino Unido
  { code: "49", groups: [4, 3, 4] }, // Alemania
  { code: "52", groups: [2, 4, 4] }, // Mexico
  { code: "54", groups: [2, 4, 4] }, // Argentina
  { code: "55", groups: [2, 5, 4] }, // Brasil
  { code: "56", groups: [1, 4, 4] }, // Chile
  { code: "57", groups: [3, 3, 4] }, // Colombia
  { code: "58", groups: [3, 7] }, // Venezuela
  { code: "351", groups: [3, 3, 3] }, // Portugal
  { code: "507", groups: [4, 4] }, // Panama
].sort((a, b) => b.code.length - a.code.length);

function chunk(digits: string, sizes: number[]): string[] {
  const parts: string[] = [];
  let rest = digits;
  for (const size of sizes) {
    if (!rest) break;
    parts.push(rest.slice(0, size));
    rest = rest.slice(size);
  }
  // Lo que sobra (un numero mas largo de lo previsto) se agrupa de tres en
  // tres en vez de descartarse: la mascara no puede perder lo que el
  // visitante escribio.
  while (rest) {
    parts.push(rest.slice(0, 3));
    rest = rest.slice(3);
  }
  return parts;
}

/** Solo los digitos, util para WhatsApp o para comparar. */
export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Agrupa lo que el visitante lleva escrito. Es idempotente: volver a pasar
 * el resultado por aqui da el mismo resultado.
 */
export function formatPhone(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  // "0034..." y "+34..." son la misma intencion.
  const international = raw.startsWith("+") || /^00\d/.test(raw);
  const digits = phoneDigits(international && raw.startsWith("00") ? raw.slice(2) : raw);
  if (!digits) return international ? "+" : "";
  if (!international) {
    // Sin prefijo no se inventa pais: se agrupa como numero nacional.
    return chunk(digits, digits.length <= 10 ? [3, 3, 4] : [3, 3, 3]).join(" ");
  }
  const plan = PLANS.find((item) => digits.startsWith(item.code));
  if (!plan) return `+${chunk(digits, []).join(" ")}`;
  const national = digits.slice(plan.code.length);
  if (!national) return `+${plan.code}`;
  return `+${plan.code} ${chunk(national, plan.groups).join(" ")}`;
}

/**
 * Reformatea conservando el cursor. Devuelve el texto y donde debe quedar el
 * caret, contado por digitos y no por caracteres: asi insertar un espacio no
 * arrastra el cursor ni deja al visitante escribiendo al reves.
 */
export function formatPhoneWithCaret(
  value: string,
  caret: number,
): { value: string; caret: number } {
  const digitsBefore = phoneDigits(value.slice(0, caret)).length;
  const formatted = formatPhone(value);
  if (digitsBefore === 0) {
    return { value: formatted, caret: formatted.startsWith("+") ? 1 : 0 };
  }
  let seen = 0;
  for (let index = 0; index < formatted.length; index += 1) {
    if (/\d/.test(formatted[index])) {
      seen += 1;
      if (seen === digitsBefore) return { value: formatted, caret: index + 1 };
    }
  }
  return { value: formatted, caret: formatted.length };
}
