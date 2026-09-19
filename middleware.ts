import { type NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE, isValidLocale, LOCALES } from "@/lib/i18n";
import { updateSession } from "@/lib/supabase/middleware";

const LOCALE_COOKIE = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

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

  // Canonical English URLs: /en → /
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    const response = NextResponse.redirect(url);
    response.cookies.set("app_locale", DEFAULT_LOCALE, LOCALE_COOKIE);
    return response;
  }

  // Unprefixed paths serve English (rewrite, no redirect)
  if (!pathnameHasLocale(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/en" : `/en${pathname}`;
    const response = await updateSession(request, { rewriteTo: url });
    response.cookies.set("app_locale", DEFAULT_LOCALE, LOCALE_COOKIE);
    return response;
  }

  const localeFromPath = pathname.split("/")[1];
  const sessionResponse = await updateSession(request);
  if (localeFromPath && isValidLocale(localeFromPath)) {
    sessionResponse.cookies.set("app_locale", localeFromPath, LOCALE_COOKIE);
  }
  return sessionResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js)$).*)",
  ],
};
