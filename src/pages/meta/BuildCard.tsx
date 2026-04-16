// src/pages/meta/BuildCard.tsx
import { useState } from "react";
import { ChevronDown, Sword, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MetaBuild } from "@/api/types";
import { EquipmentSlot } from "./EquipmentSlot";
import { BuildCostBar } from "./BuildCostBar";

const EQUIPMENT_LAYOUT = [
  ["Head",  "Armor",   "Shoes"],
  ["MainHand", "OffHand", "Cape"],
  ["Mount", "Food",    "Potion"],
] as const;

type SlotKey = "MainHand" | "OffHand" | "Head" | "Armor" | "Shoes" | "Cape" | "Mount" | "Food" | "Potion";

function getTimeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function formatFame(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString("pt-BR");
}

interface BuildCardProps {
  build: MetaBuild;
  maxCost: number;
  animationDelay?: number;
}

export function BuildCard({ build, maxCost, animationDelay = 0 }: BuildCardProps) {
  const [showKills, setShowKills] = useState(false);

  // Parse weapon name from signature for display
  const weaponId = build.signature.split("|")[0] ?? build.signature;
  const weaponDisplay = weaponId
    .replace(/^T\d+_/, "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <Card
      className="group overflow-hidden bg-card/40 border border-border/40 hover:border-primary/30 
        hover:bg-card/60 transition-all duration-300 shadow-xl backdrop-blur-sm animate-fade-up"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/20">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                #{build.rank} — {weaponDisplay}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[9px] font-black uppercase px-1.5 py-0 border-primary/30 text-primary">
                  <Sword className="w-2.5 h-2.5 mr-1" />
                  {build.frequency}× no meta
                </Badge>
                <Badge variant="outline" className="text-[9px] font-black uppercase px-1.5 py-0 border-border/40 text-muted-foreground">
                  IP ~{build.avg_ip.toLocaleString()}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Grid */}
        <div className="px-5 py-4">
          <div className="grid grid-cols-3 gap-3 place-items-center max-w-xs mx-auto">
            {EQUIPMENT_LAYOUT.flat().map((slot) => (
              <EquipmentSlot
                key={slot}
                slot={slot}
                item={build.equipment[slot as SlotKey]}
                size="md"
              />
            ))}
          </div>
        </div>

        {/* Cost Bar */}
        <div className="px-5 pb-4">
          <BuildCostBar
            totalCost={build.total_cost}
            maxCost={maxCost}
            rank={build.rank}
          />
        </div>

        {/* Kill Samples toggle */}
        {build.kills_sample.length > 0 && (
          <div className="border-t border-border/20">
            <button
              onClick={() => setShowKills(!showKills)}
              className="w-full flex items-center justify-between px-5 py-2.5 text-xs 
                font-black uppercase tracking-widest text-muted-foreground hover:text-foreground 
                transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Kills recentes ({build.kills_sample.length})
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${showKills ? "rotate-180" : ""}`}
              />
            </button>

            {showKills && (
              <div className="px-5 pb-4 space-y-2 animate-fade-up">
                {build.kills_sample.map((kill, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-background/40 
                      rounded-xl px-3 py-2 border border-border/20"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-black text-primary">{kill.killer_name}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-destructive/80 font-bold">{kill.victim_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-black text-xs tabular-nums">
                        {formatFame(kill.fame)}
                      </span>
                      <span className="text-muted-foreground text-[10px]">
                        {kill.timestamp ? getTimeAgo(kill.timestamp) : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
