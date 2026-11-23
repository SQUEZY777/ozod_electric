import "server-only";

/**
 * Защита от CSRF (вдобавок к cookie SameSite=Strict): изменяющие запросы
 * принимаем только со своего же сайта. Браузеры всегда шлют Origin на POST/PUT/DELETE.
 */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return req.headers.get("sec-fetch-site") !== "cross-site";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function clientIp(req: Request) {
  return req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export function isHttps(req: Request) {
  return req.headers.get("x-forwarded-proto") === "https" || req.url.startsWith("https:");
}
