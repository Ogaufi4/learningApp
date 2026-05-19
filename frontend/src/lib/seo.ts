export const defaultSiteName = "Puolingo";
export const defaultTitle = "Learn Setswana with Puolingo";
export const defaultDescription =
  "Puolingo helps learners build Setswana vocabulary, speaking confidence, and cultural knowledge through interactive lessons and games.";

function normalizeUrl(rawUrl: string) {
  const value = rawUrl.trim();

  if (!value) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    return new URL(withProtocol);
  } catch {
    return null;
  }
}

export function getSiteUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.FRONTEND_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const normalized = normalizeUrl(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return normalizeUrl("http://localhost:3000");
}

export function getBaseUrl() {
  return getSiteUrl()?.toString().replace(/\/$/, "") ?? "http://localhost:3000";
}

export function getAbsoluteUrl(pathname = "/") {
  const baseUrl = getBaseUrl();
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return new URL(normalizedPath, `${baseUrl}/`).toString();
}
