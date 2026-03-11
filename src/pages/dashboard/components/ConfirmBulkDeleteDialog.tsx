import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
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

interface ConfirmBulkDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: () => void;
}

export function ConfirmBulkDeleteDialog({
  isOpen,
  onOpenChange,
  selectedCount,
  onConfirm,
}: ConfirmBulkDeleteDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
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
            {t("dashboard.confirmDeleteMultiple", { count: selectedCount })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="font-bold uppercase tracking-widest text-[10px] border-border/40">
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-destructive/20"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {t("common.remove") || "Remover Todos"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
