// src/pages/dashboard/components/TierFilter.tsx
import { useTranslation } from "react-i18next";
import { ALBION_TIERS } from "@/constants/albion";
import type { TierFilter } from "../utils/itemFilters";

interface TierFilterProps {
  selectedTier: TierFilter;
  onChange: (tier: TierFilter) => void;
}

export function TierFilter({ selectedTier, onChange }: TierFilterProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
        <span>{t("dashboard.tier")}</span>
        <select
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          value={String(selectedTier)}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "all") {
              onChange("all");
            } else if (value === "no-tier") {
              onChange("no-tier");
            } else {
              onChange(Number(value) as number);
            }
          }}
        >
          <option value="all">{t("dashboard.allTiers")}</option>
          <option value="no-tier">{t("dashboard.noTier")}</option>
          {ALBION_TIERS.map((tier) => (
            <option key={tier} value={tier}>
              T{tier}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
