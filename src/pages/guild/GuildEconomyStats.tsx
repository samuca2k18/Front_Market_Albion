// src/pages/guild/GuildEconomyStats.tsx
import { TrendingUp, TrendingDown, Scale, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { GuildEconomyTotals, GuildInfo } from "@/api/types";

function formatSilver(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString("pt-BR");
}

interface GuildEconomyStatsProps {
  guild: GuildInfo;
  totals: GuildEconomyTotals;
}

export function GuildEconomyStats({ guild, totals }: GuildEconomyStatsProps) {
  const balancePositive = totals.balance >= 0;

  const stats = [
    {
      id: "destroyed",
      label: "Silver Destruído",
      sub: "Valor dos equipamentos das vítimas",
      value: formatSilver(totals.silver_destroyed),
      icon: TrendingUp,
      color: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
      shadow: "shadow-emerald-500/10",
      border: "border-emerald-500/20",
      gradient: "from-emerald-500/5 to-transparent",
    },
    {
      id: "lost",
      label: "Silver Perdido",
      sub: "Valor dos seus equipamentos dropados",
      value: formatSilver(totals.silver_lost),
      icon: TrendingDown,
      color: "text-red-400",
      iconBg: "bg-red-500/10",
      shadow: "shadow-red-500/10",
      border: "border-red-500/20",
      gradient: "from-red-500/5 to-transparent",
    },
    {
      id: "balance",
      label: "Balanço",
      sub: balancePositive ? "Lucro líquido em prata" : "Prejuízo líquido em prata",
      value: `${balancePositive ? "+" : ""}${formatSilver(totals.balance)}`,
      icon: Scale,
      color: balancePositive ? "text-blue-400" : "text-amber-400",
      iconBg: balancePositive ? "bg-blue-500/10" : "bg-amber-500/10",
      shadow: balancePositive ? "shadow-blue-500/10" : "shadow-amber-500/10",
      border: balancePositive ? "border-blue-500/20" : "border-amber-500/20",
      gradient: balancePositive ? "from-blue-500/5 to-transparent" : "from-amber-500/5 to-transparent",
    },
    {
      id: "members",
      label: "Membros",
      sub: `${totals.members_analyzed} de ${guild.member_count} analisados`,
      value: guild.member_count.toString(),
      icon: Users,
      color: "text-primary",
      iconBg: "bg-primary/10",
      shadow: "shadow-primary/10",
      border: "border-primary/20",
      gradient: "from-primary/5 to-transparent",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.id}
            className={`bg-card/40 border ${stat.border} backdrop-blur-md shadow-xl ${stat.shadow} 
              overflow-hidden animate-fade-up`}
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <CardContent className="p-0">
              <div className={`h-full bg-gradient-to-br ${stat.gradient} p-5`}>
                <div className={`inline-flex p-2.5 rounded-xl ${stat.iconBg} mb-3`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className={`text-2xl font-black tracking-tighter ${stat.color} tabular-nums`}>
                  {stat.value}
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-foreground mt-1">
                  {stat.label}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                  {stat.sub}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
