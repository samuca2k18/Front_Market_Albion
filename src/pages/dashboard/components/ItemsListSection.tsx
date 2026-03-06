// src/pages/dashboard/components/ItemsListSection.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, BellRing, Info, ImageOff, AlertTriangle } from "lucide-react";

import type { Item } from "@/api/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  getItemDisplayNameWithEnchantment,
  getItemDisplayNameWithEnchantmentAsync,
} from "@/utils/itemNameMapper";
import { splitItemName, buildItemImageUrlFromName } from "../utils/itemFilters";

interface ItemsListSectionProps {
  trackedItems: Item[];
  selectedItems: Set<number>;
  locale: string;
  isDeleting: boolean;
  onToggleSelect: (id: number) => void;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onDeleteSingle: (id: number) => void;
}

export function ItemsListSection({
  trackedItems,
  selectedItems,
  locale,
  isDeleting,
  onToggleSelect,
  onSelectAll,
  onDeleteSelected,
  onDeleteSingle,
}: ItemsListSectionProps) {
  const { t, i18n } = useTranslation();
  const [displayNames, setDisplayNames] = useState<Record<number, string>>({});

  // Modais
  const [alertModalItem, setAlertModalItem] = useState<{
    item: Item;
    displayName: string;
  } | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const [alertPriceInput, setAlertPriceInput] = useState("");
  const [alertError, setAlertError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveNames() {
      if (trackedItems.length === 0) {
        setDisplayNames({});
        return;
      }

      const entries = await Promise.all(
        trackedItems.map(async (item) => {
          const baseName = item.item_name;
          try {
            if (item.display_name) {
              return [item.id, item.display_name] as const;
            }

            const name = await getItemDisplayNameWithEnchantmentAsync(
              baseName,
              i18n.language as "pt-BR" | "en-US",
            );
            return [item.id, name] as const;
          } catch {
            const { base, enchant } = splitItemName(baseName);
            const fallback = getItemDisplayNameWithEnchantment(base);
            const finalName = enchant ? `${fallback} @${enchant}` : fallback;
            return [item.id, finalName] as const;
          }
        }),
      );

      if (!cancelled) {
        setDisplayNames(Object.fromEntries(entries));
      }
    }

    void resolveNames();
    return () => {
      cancelled = true;
    };
  }, [trackedItems, i18n.language]);

  const closeAlertModal = () => {
    setAlertModalItem(null);
    setAlertPriceInput("");
    setAlertError(null);
  };

  const handleConfirmAlert = () => {
    if (!alertModalItem) return;

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
        itemName: alertModalItem.item.item_name,
        displayName: alertModalItem.displayName,
        targetPrice: value,
      },
    });
    window.dispatchEvent(event);
    closeAlertModal();
  };

  const allSelected = trackedItems.length > 0 && selectedItems.size === trackedItems.length;

  return (
    <Card className="bg-card/40 border-border/60 shadow-xl backdrop-blur-sm flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">
              {t("dashboard.registeredItems")}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              {t("dashboard.registeredItemsDesc")}
            </CardDescription>
          </div>
          <BellRing className="text-primary w-5 h-5 opacity-50" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        {trackedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 rounded-xl border border-dashed border-border/40 bg-background/20 text-center animate-pulse">
            <Info className="w-8 h-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              {t("dashboard.noItemsYet")}
            </p>
            <p className="text-[11px] text-muted-foreground/60 mt-1 uppercase tracking-widest">
              {t("dashboard.addFirstItemHint")}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-transparent z-10 py-1">
              <div className="flex items-center gap-2 group cursor-pointer" onClick={onSelectAll}>
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                  className="border-border/60 group-hover:border-primary/60 transition-colors"
                />
                <Label
                  htmlFor="select-all"
                  className="text-xs font-bold text-muted-foreground uppercase tracking-widest cursor-pointer group-hover:text-primary/80 transition-colors"
                >
                  {allSelected ? t("dashboard.deselectAll") : t("dashboard.selectAll")}
                </Label>
              </div>

              {selectedItems.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-destructive/20 animate-fade-in"
                >
                  {isDeleting ? t("dashboard.removing") : t("dashboard.removeSelected", { count: selectedItems.size })}
                </Button>
              )}
            </div>

            <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar max-h-[450px]">
              {trackedItems.map((item) => {
                const { base } = splitItemName(item.item_name);
                const displayName = displayNames[item.id] ?? item.display_name ?? getItemDisplayNameWithEnchantment(base);
                const isSelected = selectedItems.has(item.id);

                return (
                  <div
                    key={item.id}
                    className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${isSelected
                        ? "border-primary/50 bg-primary/10 shadow-inner"
                        : "border-border/40 bg-background/40 hover:bg-background/80 hover:border-border/80"
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect(item.id)}
                        className="border-border/40"
                      />

                      <div className="relative">
                        <img
                          src={buildItemImageUrlFromName(item.item_name)}
                          alt={item.item_name}
                          className="h-10 w-10 rounded-lg bg-black/40 border border-border/20 group-hover:scale-105 transition-transform"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                          }}
                        />
                        <div className="fallback-icon hidden absolute inset-0 flex items-center justify-center bg-muted rounded-lg border border-border/20">
                          <ImageOff className="w-5 h-5 text-muted-foreground/30" />
                        </div>
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold tracking-tight truncate max-w-[120px] sm:max-w-none">
                          {displayName}
                        </span>
                        <span className="text-[10px] font-mono font-medium text-muted-foreground/50 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.item_name}
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter mt-0.5">
                          {item.created_at && `${t("dashboard.addedAt")} ${new Date(item.created_at).toLocaleDateString(locale)}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-primary/70 hover:text-primary hover:bg-primary/10"
                        onClick={() => {
                          setAlertModalItem({ item, displayName });
                          setAlertPriceInput("");
                          setAlertError(null);
                        }}
                        title={t("dashboard.addPriceAlert")}
                      >
                        <BellRing className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteConfirmItem({ id: item.id, name: displayName })}
                        disabled={isDeleting}
                        title={t("dashboard.removeItem")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>

      {/* ADICIONAR ALERTA DIALOG */}
      <Dialog open={!!alertModalItem} onOpenChange={(open) => !open && closeAlertModal()}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border/60 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">{t("dashboard.alertModalTitle")}</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium pt-2">
              {t("dashboard.alertModalDescription", {
                item: alertModalItem?.displayName,
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="price" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
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
            <Button variant="ghost" onClick={closeAlertModal} className="font-bold uppercase tracking-widest text-[10px]">
              {t("common.cancel")}
            </Button>
            <Button onClick={handleConfirmAlert} className="bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
              {t("dashboard.alertModalConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRMAR EXCLUSÃO ÚNICA */}
      <AlertDialog open={!!deleteConfirmItem} onOpenChange={(open) => !open && setDeleteConfirmItem(null)}>
        <AlertDialogContent className="bg-card border-border/60 backdrop-blur-xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle size={20} />
              </div>
              <AlertDialogTitle className="text-xl font-black tracking-tight">
                {t("dashboard.confirmDeleteTitle") || "Remover Item?"}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-muted-foreground font-medium">
              {t("dashboard.confirmDeleteDescription", { item: deleteConfirmItem?.name }) ||
                `Você tem certeza que deseja parar de rastrear o item "${deleteConfirmItem?.name}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="font-bold uppercase tracking-widest text-[10px] border-border/40">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-destructive/20"
              onClick={() => {
                if (deleteConfirmItem) {
                  onDeleteSingle(deleteConfirmItem.id);
                  setDeleteConfirmItem(null);
                }
              }}
            >
              {t("common.remove") || "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONFIRMAR EXCLUSÃO MÚLTIPLA */}
      <AlertDialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <AlertDialogContent className="bg-card border-border/60 backdrop-blur-xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-destructive/10 text-destructive">
                <Trash2 size={20} />
              </div>
              <AlertDialogTitle className="text-xl font-black tracking-tight">
                {t("dashboard.confirmDeleteMultipleTitle") || "Remover selecionados?"}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-muted-foreground font-medium">
              {t("dashboard.confirmDeleteMultiple", { count: selectedItems.size })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="font-bold uppercase tracking-widest text-[10px] border-border/40">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-destructive/20"
              onClick={() => {
                onDeleteSelected();
                setShowBulkDeleteConfirm(false);
              }}
            >
              {t("common.remove") || "Remover Todos"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
