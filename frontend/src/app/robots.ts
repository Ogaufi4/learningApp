import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/favicon.ico", "/icon", "/manifest.webmanifest"],
        disallow: [
          "/admin",
          "/login",
          "/register",
          "/learn",
          "/courses",
          "/course",
          "/lesson",
          "/leaderboard",
          "/profile",
          "/quests",
          "/puospeech",
          "/games",
          "/api",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
