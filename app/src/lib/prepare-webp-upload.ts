const MAX_EDGE = 2000;
const MAX_OUTPUT_BYTES = 8 * 1024 * 1024;

/** Normalize CMS uploads before sending them to Storage. The source file stays untouched. */
export async function prepareWebpUpload(file: File): Promise<Blob> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Selecciona una imagen JPG, PNG o WebP.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("No se pudo abrir la imagen. Selecciona otro archivo.");
  }

  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (file.type === "image/webp" && scale === 1 && file.size <= 1_000_000) {
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo preparar la imagen en este navegador.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const webp = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.82),
    );
    if (!webp || webp.type !== "image/webp") {
      throw new Error("Este navegador no pudo convertir la imagen a WebP.");
    }
    if (webp.size > MAX_OUTPUT_BYTES) {
      throw new Error("La imagen WebP supera 8 MB. Selecciona una imagen más pequeña.");
    }
    return webp;
  } finally {
    bitmap.close();
  }
}
