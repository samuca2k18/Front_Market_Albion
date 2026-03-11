// src/pages/dashboard/components/ItemsListSection.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, BellRing, Info } from "lucide-react";

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
import { Label } from "@/components/ui/label";

import { AddPriceAlertDialog } from "./AddPriceAlertDialog";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { ConfirmBulkDeleteDialog } from "./ConfirmBulkDeleteDialog";
import { ItemAvatar } from "./ItemAvatar";

import { buildItemImageUrlFromName } from "../utils/itemFilters";

interface ItemsListSectionProps {
  trackedItems: Item[];
  selectedItems: Set<number>;
  locale: string;
  isDeleting: boolean;
  onToggleSelect: (id: number) => void;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onDeleteSingle: (id: number) => void;
  getItemDisplayName: (name: string) => string;
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
  getItemDisplayName,
}: ItemsListSectionProps) {
  const { t } = useTranslation();

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

  const allSelected = trackedItems.length > 0 && selectedItems.size === trackedItems.length;

  return (
    <Card className="bg-card/40 border-border/60 shadow-xl backdrop-blur-sm flex flex-col">
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
                const displayName = item.display_name ?? getItemDisplayName(item.item_name);
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

                      <ItemAvatar
                        src={buildItemImageUrlFromName(item.item_name)}
                        alt={item.item_name}
                        imageClassName="group-hover:scale-105"
                      />

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
      <AddPriceAlertDialog
        isOpen={!!alertModalItem}
        onOpenChange={(open) => {
          if (!open) setAlertModalItem(null);
        }}
        itemName={alertModalItem?.item.item_name || ""}
        itemDisplayName={alertModalItem?.displayName || ""}
      />

      {/* CONFIRMAR EXCLUSÃO ÚNICA */}
      <ConfirmDeleteDialog
        isOpen={!!deleteConfirmItem}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmItem(null);
        }}
        itemName={deleteConfirmItem?.name || ""}
        onConfirm={() => {
          if (deleteConfirmItem) {
            onDeleteSingle(deleteConfirmItem.id);
            setDeleteConfirmItem(null);
          }
        }}
      />

      {/* CONFIRMAR EXCLUSÃO MÚLTIPLA */}
      <ConfirmBulkDeleteDialog
        isOpen={showBulkDeleteConfirm}
        onOpenChange={setShowBulkDeleteConfirm}
        selectedCount={selectedItems.size}
        onConfirm={() => {
          onDeleteSelected();
          setShowBulkDeleteConfirm(false);
        }}
      />
    </Card>
  );
}
