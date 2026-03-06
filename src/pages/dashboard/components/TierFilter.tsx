// src/pages/dashboard/components/TierFilter.tsx
import { useTranslation } from "react-i18next";
import { ALBION_TIERS } from "@/constants/albion";
import type { TierFilter as TierFilterType } from "../utils/itemFilters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

interface TierFilterProps {
  selectedTier: TierFilterType;
  onChange: (tier: TierFilterType) => void;
}

export function TierFilter({ selectedTier, onChange }: TierFilterProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 mb-6 bg-background/20 p-2 rounded-xl border border-border/40 w-fit">
      <div className="flex items-center gap-2 pl-2 border-r border-border/40 pr-3 mr-1">
        <Filter className="w-3.5 h-3.5 text-primary opacity-70" />
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
          {t("dashboard.tier")}
        </span>
      </div>

      <Select
        value={String(selectedTier)}
        onValueChange={(value) => {
          if (value === "all") {
            onChange("all");
          } else if (value === "no-tier") {
            onChange("no-tier");
          } else {
            onChange(Number(value) as number);
          }
        }}
      >
        <SelectTrigger className="w-[180px] h-9 bg-background/40 border-border/20 focus:ring-primary/40 text-xs font-bold">
          <SelectValue placeholder={t("dashboard.allTiers")} />
        </SelectTrigger>
        <SelectContent className="bg-card border-border/60">
          <SelectItem value="all" className="text-xs font-medium cursor-pointer">{t("dashboard.allTiers")}</SelectItem>
          <SelectItem value="no-tier" className="text-xs font-medium cursor-pointer">{t("dashboard.noTier")}</SelectItem>
          {ALBION_TIERS.map((tier) => (
            <SelectItem key={tier} value={String(tier)} className="text-xs font-medium cursor-pointer">
              Tier {tier}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
