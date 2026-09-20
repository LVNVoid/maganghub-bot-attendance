"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, User as UserIcon } from "lucide-react";

interface TopbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  onOpenMobileMenu: () => void;
}

export function Topbar({ user, onOpenMobileMenu }: TopbarProps) {
  return (
    <header className="h-14 border-b border-hairline bg-canvas px-3 sm:px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded-md hover:bg-surface text-ink-secondary hover:text-ink-primary active:scale-95"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-ink-muted truncate max-w-[140px] sm:max-w-none">
          Workspace / {user.role === "ADMIN" ? "Admin" : "Peserta"}
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 text-right">
          <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-surface border border-hairline flex items-center justify-center text-ink-primary shrink-0">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-medium text-ink-primary leading-tight truncate max-w-[150px]">
              {user.name || user.email?.split("@")[0]}
            </div>
            <div className="text-[10px] text-ink-muted leading-tight truncate max-w-[150px]">
              {user.email}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="h-9 sm:h-8 px-2.5 sm:px-3 gap-1.5 text-xs text-ink-muted hover:text-error hover:border-error/40 min-h-[40px] sm:min-h-[32px]"
          title="Keluar"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </Button>
      </div>
    </header>
  );
}
