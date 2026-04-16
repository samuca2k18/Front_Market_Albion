// src/pages/meta/EquipmentSlot.tsx
import type { EquipmentSlotData } from "@/api/types";

const RENDER_URL = "https://render.albiononline.com/v1/item";

const SLOT_LABELS: Record<string, string> = {
  MainHand: "Arma",
  OffHand: "Off-Hand",
  Head: "Cabeça",
  Armor: "Armadura",
  Shoes: "Botas",
  Cape: "Capa",
  Mount: "Montaria",
  Food: "Comida",
  Potion: "Poção",
};

interface EquipmentSlotProps {
  slot: string;
  item: EquipmentSlotData | null;
  size?: "sm" | "md";
}

function formatSilver(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString("pt-BR");
}

export function EquipmentSlot({ slot, item, size = "md" }: EquipmentSlotProps) {
  const label = SLOT_LABELS[slot] ?? slot;
  const imgSize = size === "sm" ? 32 : 48;
  const boxSize = size === "sm" ? "h-10 w-10" : "h-14 w-14";

  if (!item) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className={`${boxSize} rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center`}
        >
          <div className="w-4 h-4 rounded-full border border-white/10" />
        </div>
        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
          {label}
        </span>
      </div>
    );
  }

  const qualityColors: Record<number, string> = {
    1: "border-white/20",
    2: "border-amber-400/40",
    3: "border-blue-400/40",
    4: "border-purple-400/60",
    5: "border-orange-400/70",
  };
  const borderColor = qualityColors[item.quality] ?? "border-white/20";

  return (
    <div className="flex flex-col items-center gap-1 group/slot">
      <div
        className={`${boxSize} rounded-xl border-2 ${borderColor} bg-black/40 p-1.5 flex items-center justify-center 
          transition-all duration-200 group-hover/slot:scale-110 group-hover/slot:shadow-lg group-hover/slot:shadow-primary/20 cursor-pointer relative`}
        title={`${item.type} — ${item.city}`}
      >
        <img
          src={`${RENDER_URL}/${item.type}.png?size=${imgSize}&quality=${item.quality}`}
          alt={item.type}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
        {label}
      </span>
      {item.price > 0 && (
        <span className="text-[10px] font-black text-amber-400 tabular-nums leading-none">
          {formatSilver(item.price)}
        </span>
      )}
    </div>
  );
}
