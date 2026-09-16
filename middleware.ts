import { type NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE, isValidLocale, LOCALES } from "@/lib/i18n";
import { updateSession } from "@/lib/supabase/middleware";

function getPreferredLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get("app_locale")?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale;

  const accept = request.headers.get("accept-language") ?? "";
  const preferred = accept
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);

  for (const lang of preferred) {
    const base = lang.split("-")[0];
    if (isValidLocale(base)) return base;
  }

  return DEFAULT_LOCALE;
}

function pathnameHasLocale(pathname: string): boolean {
  return LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return await updateSession(request);
  }

  if (!pathnameHasLocale(pathname)) {
    const locale = getPreferredLocale(request);
    const url = request.nextUrl.clone();
    url.pathname =
      pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
    const response = NextResponse.redirect(url);
    response.cookies.set("app_locale", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  const localeFromPath = pathname.split("/")[1];
  const sessionResponse = await updateSession(request);
  if (localeFromPath && isValidLocale(localeFromPath)) {
    sessionResponse.cookies.set("app_locale", localeFromPath, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return sessionResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js)$).*)",
  ],
};
