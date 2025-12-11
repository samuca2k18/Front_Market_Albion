// src/pages/dashboard/components/AddItemForm.tsx
import { useTranslation } from "react-i18next";
import type { UseMutationResult } from "@tanstack/react-query";

import { Card } from "@/components/common/Card";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import type { Product } from "@/api/productService";
import type { ItemPayload } from "@/api/types";
import type { ApiErrorShape } from "@/api/client";

interface AddItemFormProps {
  createMutation: UseMutationResult<void, ApiErrorShape, ItemPayload>;
}

export function AddItemForm({ createMutation }: AddItemFormProps) {
  const { t, i18n } = useTranslation();

  return (
    <Card
      title={t("dashboard.addItem")}
      description={t("dashboard.addItemDesc")}
    >
      <div className="mt-3 space-y-3">
        <SearchAutocomplete
          onSelectProduct={(product: Product) => {
            const internal =
              product.unique_name ?? (product as any).UniqueName;
            if (!internal || createMutation.isPending) return;

            const isPT = i18n.language === "pt-BR";
            const label = isPT
              ? product.name_pt || product.name_en || internal
              : product.name_en || product.name_pt || internal;

            createMutation.mutate({
              item_name: internal,
              display_name: label,
            });
          }}
        />

        {createMutation.isError && (
          <p className="text-xs text-destructive mt-1">
            {createMutation.error?.message || t("dashboard.errorAdding")}
          </p>
        )}
      </div>
    </Card>
  );
}
