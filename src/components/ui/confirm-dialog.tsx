"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, Info, Loader2, X } from "lucide-react";

const confirmDialogVariants = cva(
  "relative z-50 w-full max-w-md bg-canvas-subtle border rounded-md p-6 shadow-2xl space-y-4 focus:outline-none transition-all duration-150 animate-in fade-in zoom-in-95",
  {
    variants: {
      variant: {
        danger: "border-error/30",
        warning: "border-warning/30",
        default: "border-hairline",
      },
    },
    defaultVariants: {
      variant: "danger",
    },
  }
);

export interface ConfirmDialogProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof confirmDialogVariants> {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  variant = "danger",
  loading = false,
  className,
  ...props
}: ConfirmDialogProps) {
  // Handle keyboard Escape
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const renderIcon = () => {
    switch (variant) {
      case "danger":
        return (
          <div className="w-9 h-9 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0 border border-error/20">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case "warning":
        return (
          <div className="w-9 h-9 rounded-full bg-warning/10 text-warning flex items-center justify-center shrink-0 border border-warning/20">
            <AlertCircle className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Info className="w-4 h-4" />
          </div>
        );
    }
  };

  const getConfirmButtonVariant = () => {
    if (variant === "danger") return "destructive";
    if (variant === "warning") return "secondary";
    return "emerald";
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className={cn(confirmDialogVariants({ variant }), className)}
        {...props}
      >
        <div className="flex items-start gap-3.5">
          {renderIcon()}

          <div className="space-y-1.5 flex-1 min-w-0">
            <h3
              id="confirm-dialog-title"
              className="text-sm font-semibold text-ink-primary"
            >
              {title}
            </h3>
            <p
              id="confirm-dialog-description"
              className="text-xs text-ink-secondary leading-relaxed"
            >
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup dialog"
            className="text-ink-muted hover:text-ink-primary p-1 rounded-xs transition-colors shrink-0 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="h-8 px-3 text-xs"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={getConfirmButtonVariant()}
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className="h-8 px-3 text-xs gap-1.5"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
