// src/pages/meta/BuildCostBar.tsx

interface BuildCostBarProps {
  totalCost: number;
  maxCost: number;
  rank: number;
}

function formatSilver(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString("pt-BR");
}

function getCostTier(cost: number): { label: string; color: string; bar: string } {
  if (cost >= 5_000_000) return { label: "Épico", color: "text-orange-400", bar: "from-orange-500 to-red-500" };
  if (cost >= 2_000_000) return { label: "Raro", color: "text-purple-400", bar: "from-purple-500 to-pink-500" };
  if (cost >= 800_000) return { label: "Caro", color: "text-blue-400", bar: "from-blue-500 to-cyan-500" };
  if (cost >= 300_000) return { label: "Médio", color: "text-amber-400", bar: "from-amber-500 to-yellow-400" };
  return { label: "Barato", color: "text-emerald-400", bar: "from-emerald-500 to-green-400" };
}

const RANK_COLORS = [
  "text-amber-400",   // #1 ouro
  "text-slate-300",   // #2 prata
  "text-amber-700",   // #3 bronze
];

const RANK_BG = [
  "bg-amber-500/15 border-amber-500/30",
  "bg-slate-400/10 border-slate-400/20",
  "bg-amber-700/15 border-amber-700/30",
];

export function BuildCostBar({ totalCost, maxCost, rank }: BuildCostBarProps) {
  const pct = maxCost > 0 ? Math.min((totalCost / maxCost) * 100, 100) : 0;
  const tier = getCostTier(totalCost);
  const rankColor = RANK_COLORS[rank - 1] ?? "text-white/60";
  const rankBg = RANK_BG[rank - 1] ?? "bg-white/5 border-white/10";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 px-2 py-0.5 rounded-full border text-xs font-black ${rankBg} ${rankColor}`}>
          #{rank}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-widest ${tier.color}`}>
            {tier.label}
          </span>
          <span className="text-sm font-black text-foreground tabular-nums">
            {formatSilver(totalCost)}
            <span className="text-muted-foreground font-medium text-xs ml-1">silver</span>
          </span>
        </div>
      </div>

      {/* Cost bar */}
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tier.bar} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
