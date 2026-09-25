"use client";

import images from "./generated-responsive-images.json";

/** Serve prebuilt WebP widths; static exports do not have Next's image API. */
export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  const entry = images[src as keyof typeof images];
  if (!entry) return src;
  return entry.variants.find((variant) => variant.width >= width)?.src ?? src;
}
