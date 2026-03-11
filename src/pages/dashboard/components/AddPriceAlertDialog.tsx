import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddPriceAlertDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemDisplayName: string;
}

export function AddPriceAlertDialog({
  isOpen,
  onOpenChange,
  itemName,
  itemDisplayName,
}: AddPriceAlertDialogProps) {
  const { t } = useTranslation();
  const [alertPriceInput, setAlertPriceInput] = useState("");
  const [alertError, setAlertError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAlertPriceInput("");
      setAlertError(null);
    }
  }, [isOpen]);

  const handleConfirmAlert = () => {
    const raw = alertPriceInput.trim();
    if (!raw) {
      setAlertError(t("dashboard.invalidAlertPrice") as string);
      return;
    }

    const value = Number(raw.replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      setAlertError(t("dashboard.invalidAlertPrice") as string);
      return;
    }

    const event = new CustomEvent("dashboard:add-alert", {
      detail: {
        itemName: itemName,
        displayName: itemDisplayName,
        targetPrice: value,
      },
    });
    window.dispatchEvent(event);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border/60 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black tracking-tight">
            {t("dashboard.alertModalTitle")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium pt-2">
            {t("dashboard.alertModalDescription", {
              item: itemDisplayName,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label
              htmlFor="price"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              {t("dashboard.alertModalPriceLabel")}
            </Label>
            <Input
              id="price"
              type="text"
              inputMode="decimal"
              value={alertPriceInput}
              onChange={(e) => {
                setAlertPriceInput(e.target.value);
                if (alertError) setAlertError(null);
              }}
              placeholder={(t("dashboard.alertModalPricePlaceholder") as string) || "150.000"}
              className="bg-background/50 border-border/40 focus:ring-primary/40 focus:border-primary/60 font-mono"
            />
            {alertError && (
              <p className="text-[11px] font-bold text-destructive animate-pulse mt-1">
                {alertError}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="font-bold uppercase tracking-widest text-[10px]"
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleConfirmAlert}
            className="bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
          >
            {t("dashboard.alertModalConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
