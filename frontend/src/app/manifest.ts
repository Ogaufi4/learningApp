import type { MetadataRoute } from "next";
import { defaultDescription, defaultSiteName, getAbsoluteUrl } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: defaultSiteName,
    short_name: defaultSiteName,
    description: defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#58cc02",
    icons: [
      {
        src: getAbsoluteUrl("/zebra_logo.png"),
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: getAbsoluteUrl("/logo.png"),
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
