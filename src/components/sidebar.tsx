"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Settings,
  ShieldCheck,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role?: string;
  onCloseMobile?: () => void;
}

export function Sidebar({ role = "USER", onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Laporan Harian",
      href: "/reports",
      icon: FileText,
      exact: false,
    },
    {
      label: "Kalender Absensi",
      href: "/calendar",
      icon: Calendar,
      exact: false,
    },
    {
      label: "Pengaturan & Bot",
      href: "/settings",
      icon: Settings,
      exact: false,
    },
  ];

  if (role === "ADMIN") {
    navItems.push({
      label: "Admin Panel",
      href: "/admin",
      icon: ShieldCheck,
      exact: false,
    });
  }

  return (
    <aside className="w-64 bg-canvas-deep border-r border-hairline flex flex-col h-full shrink-0">
      <div className="h-14 border-b border-hairline flex items-center px-5 gap-2.5">
        <div className="w-7 h-7 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Bot className="w-4 h-4" />
        </div>
        <span className="font-semibold text-sm text-ink-primary tracking-tight">
          MagangHub Bot
        </span>
      </div>

      <div className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary-soft text-primary border border-primary/20"
                  : "text-ink-secondary hover:text-ink-primary hover:bg-canvas-subtle"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-hairline text-[11px] text-ink-muted">
        <div className="flex items-center justify-between">
          <span>Engine Status</span>
          <span className="inline-flex items-center gap-1.5 text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Direct API Ready
          </span>
        </div>
      </div>
    </aside>
  );
}
