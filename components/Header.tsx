"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/I18nProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import UserMenu from "@/components/UserMenu";
import NavIcon from "@/components/NavIcon";
import { fetchSavedCount } from "@/lib/saved-service";
import { SAVED_CHANNELS_CHANGED } from "@/lib/storage";

type NavLink = {
  href: string;
  labelKey: string;
  icon: "search" | "trending" | "channels" | "saved" | "settings" | "admin";
  showCount?: boolean;
};

export default function Header() {
  const pathname = usePathname();
  const { user, isAdmin, loading } = useAuth();
  const { t } = useI18n();
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const updateCount = async () => {
      setSavedCount(await fetchSavedCount(user?.id));
    };
    updateCount();

    window.addEventListener(SAVED_CHANNELS_CHANGED, updateCount);
    window.addEventListener("storage", updateCount);

    return () => {
      window.removeEventListener(SAVED_CHANNELS_CHANGED, updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, [user?.id]);

  const links: NavLink[] = [
    { href: "/", labelKey: "nav.search", icon: "search" },
    { href: "/trending", labelKey: "nav.trending", icon: "trending" },
    { href: "/channels", labelKey: "nav.channels", icon: "channels" },
    { href: "/saved", labelKey: "nav.saved", icon: "saved", showCount: true },
    ...(isAdmin
      ? [
          { href: "/settings", labelKey: "nav.settings", icon: "settings" as const },
          { href: "/admin", labelKey: "nav.admin", icon: "admin" as const },
        ]
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

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-stone-800">{t("nav.appName")}</p>
            <p className="text-xs text-stone-500">{t("nav.appTagline")}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 rounded-2xl bg-stone-100/80 p-1 sm:flex">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={linkClass(active)}
                >
                  <NavIcon name={link.icon} />
                  {t(link.labelKey)}
                  {link.showCount && savedCount > 0 && (
                    <span
                      className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none ${
                        active
                          ? "bg-stone-800 text-white"
                          : "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {savedCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <LanguageSwitcher compact />
          {!loading && !user && (
            <Link
              href="/login"
              className="rounded-xl bg-stone-800 px-3 py-2 text-xs font-medium text-white hover:bg-stone-700"
            >
              {t("nav.login")}
            </Link>
          )}
          {!loading && user && <UserMenu />}
        </div>
      </div>

      <nav className="nav-scroll mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3 sm:hidden">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${linkClass(active, true)} bg-stone-100/80`}
            >
              <NavIcon name={link.icon} className="h-3.5 w-3.5" />
              {t(link.labelKey)}
              {link.showCount && savedCount > 0 && (
                <span
                  className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none ${
                    active
                      ? "bg-stone-800 text-white"
                      : "bg-stone-200 text-stone-600"
                  }`}
                >
                  {savedCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
