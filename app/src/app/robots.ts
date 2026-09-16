import type { MetadataRoute } from "next";
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      ...(process.env.NEXT_PUBLIC_INDEXABLE === "true"
        ? { allow: "/", disallow: "/api/" }
        : { disallow: "/" }),
    },
  };
}
