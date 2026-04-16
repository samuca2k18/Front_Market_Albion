// src/pages/guild/MemberBreakdown.tsx
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MemberEconomyRow } from "@/api/types";

function formatSilver(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n > 0 ? n.toLocaleString("pt-BR") : "0";
}

interface MemberBreakdownProps {
  members: MemberEconomyRow[];
}

export function MemberBreakdown({ members }: MemberBreakdownProps) {
  const maxBalance = Math.max(...members.map((m) => Math.abs(m.balance)), 1);

  return (
    <Card className="bg-card/40 border-border/40 backdrop-blur-md shadow-xl">
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">
          Breakdown por Membro
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-2">
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum membro com dados de combate recentes.
          </p>
        ) : (
          members.map((member, idx) => {
            const pct = (Math.abs(member.balance) / maxBalance) * 100;
            const positive = member.balance >= 0;
            const Icon = positive ? ArrowUpRight : member.balance < 0 ? ArrowDownRight : Minus;

            return (
              <div
                key={member.id}
                className="group relative overflow-hidden rounded-xl border border-border/20 
                  bg-background/30 hover:bg-background/50 transition-all duration-200 animate-fade-up"
                style={{ animationDelay: `${Math.min(idx * 0.04, 0.4)}s` }}
              >
                {/* Balance fill bar */}
                <div
                  className={`absolute inset-y-0 left-0 ${positive ? "bg-emerald-500/8" : "bg-red-500/8"} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />

                <div className="relative flex items-center gap-3 px-4 py-3">
                  {/* Rank number */}
                  <span className="text-[10px] font-black text-muted-foreground/40 w-5 text-center">
                    {idx + 1}
                  </span>

                  {/* Member name + KD */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm truncate">{member.name}</span>
                      <Badge
                        variant="outline"
                        className="text-[9px] font-black px-1.5 py-0 border-border/40 text-muted-foreground"
                      >
                        {member.kills}K / {member.deaths}D
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-emerald-400/70 font-bold">
                        ↑ {formatSilver(member.silver_destroyed)} destruído
                      </span>
                      <span className="text-[10px] text-red-400/70 font-bold">
                        ↓ {formatSilver(member.silver_lost)} perdido
                      </span>
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Icon
                      className={`w-4 h-4 ${positive ? "text-emerald-400" : member.balance < 0 ? "text-red-400" : "text-muted-foreground"}`}
                    />
                    <span
                      className={`text-sm font-black tabular-nums ${
                        positive ? "text-emerald-400" : member.balance < 0 ? "text-red-400" : "text-muted-foreground"
                      }`}
                    >
                      {positive ? "+" : ""}
                      {formatSilver(member.balance)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
