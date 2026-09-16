"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/I18nProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import UserMenu from "@/components/UserMenu";
import NavIcon from "@/components/NavIcon";
import { fetchLikedCount, LIKES_CHANGED } from "@/lib/likes-service";
import { stripLocale, useLocalePath } from "@/lib/use-locale-path";

type NavLink = {
  href: string;
  labelKey: string;
  icon: "search" | "trending" | "channels" | "saved" | "settings" | "admin";
  showCount?: boolean;
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const pathWithoutLocale = stripLocale(pathname);
  const lp = useLocalePath();
  const { user, isAdmin, loading } = useAuth();
  const { t } = useI18n();
  const [likedCount, setLikedCount] = useState(0);
  const showBack = pathWithoutLocale.startsWith("/channel/");

  useEffect(() => {
    const updateCount = async () => {
      setLikedCount(await fetchLikedCount(user?.id));
    };
    updateCount();

    window.addEventListener(LIKES_CHANGED, updateCount);
    window.addEventListener("storage", updateCount);

    return () => {
      window.removeEventListener(LIKES_CHANGED, updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, [user?.id]);

  const links: NavLink[] = [
    { href: "/", labelKey: "nav.search", icon: "search" },
    { href: "/trending", labelKey: "nav.trending", icon: "trending" },
    { href: "/channels", labelKey: "nav.channels", icon: "channels" },
    { href: "/saved", labelKey: "nav.saved", icon: "saved", showCount: true },
    ...(isAdmin
      ? [{ href: "/admin", labelKey: "nav.admin", icon: "admin" as const }]
      : []),
  ];

  const linkClass = (active: boolean, mobile = false) =>
    `flex shrink-0 items-center gap-1.5 rounded-xl transition-colors ${
      mobile ? "snap-start px-3 py-2 text-xs" : "px-3 py-2 text-sm"
    } ${
      active
        ? "bg-white text-stone-800 shadow-sm"
        : "text-stone-500 hover:text-stone-700"
    }`;

  const isActive = (href: string) =>
    href === "/"
      ? pathWithoutLocale === "/"
      : pathWithoutLocale === href || pathWithoutLocale.startsWith(`${href}/`);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(lp("/"));
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/95 sm:bg-white/70 sm:backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              aria-label={t("nav.back")}
              title={t("nav.back")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5 rtl:rotate-180"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          <Link href={lp("/")} className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </span>
            <p className="truncate text-sm font-semibold text-stone-800">
              {t("nav.appName")}
            </p>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <nav className="hidden items-center gap-1 rounded-2xl bg-stone-100/80 p-1 sm:flex">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={lp(link.href)}
                  className={linkClass(active)}
                >
                  <NavIcon name={link.icon} />
                  {t(link.labelKey)}
                  {link.showCount && likedCount > 0 && (
                    <span
                      className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none ${
                        active
                          ? "bg-stone-800 text-white"
                          : "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {likedCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <LanguageSwitcher />
          {!loading && !user && (
            <Link
              href={lp("/login")}
              aria-label={t("nav.login")}
              title={t("nav.login")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-stone-800 text-white transition-colors hover:bg-stone-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </Link>
          )}
          {!loading && user && <UserMenu />}
        </div>
      </div>

      <nav className="nav-scroll mx-auto flex max-w-6xl gap-1 overflow-x-auto overflow-y-hidden pb-3 pe-4 ps-6 sm:hidden">
        <span className="w-1 shrink-0" aria-hidden />
        {links.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={lp(link.href)}
              className={`${linkClass(active, true)} bg-stone-100/80`}
            >
              <NavIcon name={link.icon} className="h-3.5 w-3.5" />
              {t(link.labelKey)}
              {link.showCount && likedCount > 0 && (
                <span
                  className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none ${
                    active
                      ? "bg-stone-800 text-white"
                      : "bg-stone-200 text-stone-600"
                  }`}
                >
                  {likedCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
