"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2, ShieldAlert } from "lucide-react";

type ConfirmVariant = "destructive" | "warning" | "default";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  onConfirm: () => void;
}

const VARIANT_CONFIG: Record<
  ConfirmVariant,
  {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    buttonClass: string;
  }
> = {
  destructive: {
    icon: Trash2,
    iconBg: "bg-red-500/10 border-red-500/20",
    iconColor: "text-red-500",
    buttonClass:
      "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-500/10 border-amber-500/20",
    iconColor: "text-amber-500",
    buttonClass:
      "bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700",
  },
  default: {
    icon: ShieldAlert,
    iconBg: "bg-primary/10 border-primary/20",
    iconColor: "text-primary",
    buttonClass: "",
  },
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
}: ConfirmationDialogProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card border-border/50" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${config.iconBg}`}
            >
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div className="space-y-1.5">
              <DialogTitle className="text-lg font-semibold">
                {title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="cursor-pointer"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
            }}
            disabled={loading}
            className={`cursor-pointer ${config.buttonClass}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
