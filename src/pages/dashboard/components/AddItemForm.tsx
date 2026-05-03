// src/pages/dashboard/components/AddItemForm.tsx
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import type { Product } from "@/api/productService";
import type { ItemPayload } from "@/api/types";
import type { ApiErrorShape } from "@/api/client";
import { PlusCircle } from "lucide-react";

interface AddItemFormProps {
  createMutation: UseMutationResult<void, ApiErrorShape, ItemPayload>;
}

export function AddItemForm({ createMutation }: AddItemFormProps) {
  const { t, i18n } = useTranslation();
  const submitLockRef = useRef(false);

  return (
    <Card className="bg-card/40 border-border/60 shadow-xl backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">
              {t("dashboard.addItem")}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              {t("dashboard.addItemDesc")}
            </CardDescription>
          </div>
          <PlusCircle className="text-primary w-5 h-5 opacity-50" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <SearchAutocomplete
            onSelectProduct={(product: Product) => {
              const internal = product.unique_name;
              if (!internal || createMutation.isPending || submitLockRef.current) return;
              submitLockRef.current = true;

              const isPT = i18n.language.toLowerCase().startsWith("pt");
              const label = isPT
                ? product.name_pt || product.name_en || internal
                : product.name_en || product.name_pt || internal;

              createMutation.mutate(
                {
                  item_name: internal,
                  display_name: label,
                },
                {
                  onSettled: () => {
                    submitLockRef.current = false;
                  },
                },
              );
            }}
          />

          {createMutation.isError && (
            <p className="text-xs text-destructive font-medium bg-destructive/10 p-2 rounded-md border border-destructive/20 animate-fade-in">
              {createMutation.error?.message || t("dashboard.errorAdding")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
