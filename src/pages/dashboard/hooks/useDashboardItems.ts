// src/pages/dashboard/hooks/useDashboardItems.ts
import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { createItem, listItems, deleteItem } from "@/api/items";
import type { Item, ItemPayload, MyItemPrice } from "@/api/types";
import type { ApiErrorShape } from "@/api/client";
import { splitItemName } from "../utils/itemFilters";

interface UseDashboardItemsReturn {
  trackedItems: Item[];
  createMutation: UseMutationResult<void, ApiErrorShape, ItemPayload>;
  deleteMutation: UseMutationResult<void, ApiErrorShape, number>;
  deleteMultipleMutation: UseMutationResult<void, ApiErrorShape, number[]>;
  selectedItems: Set<number>;
  isDeleting: boolean;
  handleDeleteSingle: (id: number) => void;
  handleToggleSelect: (id: number) => void;
  handleSelectAll: () => void;
  handleDeleteSelected: () => void;
}

export function useDashboardItems(
  myPricesQueryKey = ["my-items-prices"],
): UseDashboardItemsReturn {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // Itens cadastrados pelo usuário
  const itemsQuery = useQuery<Item[]>({
    queryKey: ["items"],
    queryFn: listItems,
  });

  const trackedItems = itemsQuery.data ?? [];

  // === MUTATIONS ===

  const createMutation = useMutation<void, ApiErrorShape, ItemPayload>({
    mutationFn: async (payload) => {
      await createItem(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: myPricesQueryKey });
    },
  });

  const deleteMutation = useMutation<
    void,
    ApiErrorShape,
    number,
    { previousItems: Item[]; previousPrices: MyItemPrice[] }
  >({
    mutationFn: async (id) => {
      await deleteItem(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["items"] });
      await queryClient.cancelQueries({ queryKey: myPricesQueryKey });

      const previousItems = queryClient.getQueryData<Item[]>(["items"]) ?? [];
      const previousPrices =
        queryClient.getQueryData<MyItemPrice[]>(myPricesQueryKey) ?? [];

      const removedItem = previousItems.find((it) => it.id === id);
      const removedBase = removedItem
        ? splitItemName(removedItem.item_name).base
        : null;

      queryClient.setQueryData<Item[]>(["items"], (old) =>
        (old ?? []).filter((it) => it.id !== id),
      );

      if (removedBase) {
        queryClient.setQueryData<MyItemPrice[]>(myPricesQueryKey, (old) =>
          (old ?? []).filter(
            (p) => splitItemName(p.item_name).base !== removedBase,
          ),
        );
      }

      setSelectedItems((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      return { previousItems, previousPrices };
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["items"], context.previousItems);
      }
      if (context?.previousPrices) {
        queryClient.setQueryData(myPricesQueryKey, context.previousPrices);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: myPricesQueryKey });
    },
  });

  const deleteMultipleMutation = useMutation<
    void,
    ApiErrorShape,
    number[],
    { previousItems: Item[]; previousPrices: MyItemPrice[] }
  >({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => deleteItem(id)));
    },
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ["items"] });
      await queryClient.cancelQueries({ queryKey: myPricesQueryKey });

      const previousItems = queryClient.getQueryData<Item[]>(["items"]) ?? [];
      const previousPrices =
        queryClient.getQueryData<MyItemPrice[]>(myPricesQueryKey) ?? [];

      const removedBases = previousItems
        .filter((it) => ids.includes(it.id))
        .map((it) => splitItemName(it.item_name).base);

      queryClient.setQueryData<Item[]>(["items"], (old) =>
        (old ?? []).filter((it) => !ids.includes(it.id)),
      );

      if (removedBases.length > 0) {
        queryClient.setQueryData<MyItemPrice[]>(myPricesQueryKey, (old) =>
          (old ?? []).filter(
            (p) => !removedBases.includes(splitItemName(p.item_name).base),
          ),
        );
      }

      setSelectedItems(new Set());

      return { previousItems, previousPrices };
    },
    onError: (_err, _ids, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["items"], context.previousItems);
      }
      if (context?.previousPrices) {
        queryClient.setQueryData(myPricesQueryKey, context.previousPrices);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: myPricesQueryKey });
    },
  });

  const isDeleting =
    deleteMutation.isPending || deleteMultipleMutation.isPending;

  // === HANDLERS ===

  const handleDeleteSingle = (id: number) => {
    if (deleteMutation.isPending || deleteMultipleMutation.isPending) return;

    if (confirm(t("dashboard.confirmDelete"))) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (trackedItems.length === 0) return;

    if (selectedItems.size === trackedItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(trackedItems.map((item) => item.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (
      selectedItems.size === 0 ||
      deleteMutation.isPending ||
      deleteMultipleMutation.isPending
    )
      return;

    const count = selectedItems.size;
    const message =
      count === 1
        ? t("dashboard.confirmDeleteOne")
        : t("dashboard.confirmDeleteMultiple", { count });

    if (confirm(message)) {
      const idsToDelete = Array.from(selectedItems);
      deleteMultipleMutation.mutate(idsToDelete);
    }
  };

  return {
    trackedItems,
    createMutation,
    deleteMutation,
    deleteMultipleMutation,
    selectedItems,
    isDeleting,
    handleDeleteSingle,
    handleToggleSelect,
    handleSelectAll,
    handleDeleteSelected,
  };
}
