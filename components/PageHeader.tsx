import type { ReactNode } from "react";
import NavIcon from "@/components/NavIcon";

type PageIcon = "search" | "trending" | "channels" | "saved" | "settings" | "admin";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: PageIcon;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  actions,
  children,
  className = "mb-8",
}: PageHeaderProps) {
  return (
    <section className={className}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-stone-600">
          <NavIcon name={icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h1 className="min-w-0 text-3xl font-semibold text-stone-800">{title}</h1>
            {actions}
          </div>
          {subtitle && <p className="mt-2 text-stone-500">{subtitle}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}
