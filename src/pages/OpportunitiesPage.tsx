// src/pages/OpportunitiesPage.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchArbitrageOpportunities } from "@/api/albion";
import { useRegion } from "@/context/RegionContext";
import {
    TrendingUp,
    ArrowRight,
    MapPin,
    Clock,
    Search,
    Filter,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    Loader2
} from "lucide-react";
import { getItemDisplayNameWithEnchantment } from "@/utils/itemNameMapper";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";

export function OpportunitiesPage() {
    const { t, i18n } = useTranslation();
    const { region } = useRegion();
    const [tax, setTax] = useState(0.08);
    const [minProfit, setMinProfit] = useState(0);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["arbitrage-opportunities", region, tax],
        queryFn: () => fetchArbitrageOpportunities(region, tax),
        refetchInterval: 1000 * 60 * 5, // 5 min
    });

    const getQualityName = (q: number) => {
        const names: Record<number, string> = {
            1: t("quality.normal"),
            2: t("quality.good"),
            3: t("quality.outstanding"),
            4: t("quality.excellent"),
            5: t("quality.masterpiece"),
        };
        return names[q] || names[1];
    };

    const locale = i18n.language.startsWith("pt") ? "pt-BR" : "en-US";
    const filteredData = data?.filter(opt => opt.profit >= minProfit) || [];

    const getTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return t("common.now") || "agora";
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    return (
        <div className="bg-background min-h-screen">
            <SEO title={t("navigation.opportunities")} />
            <div className="app-container py-12">
                {/* Modern Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-4 rounded-3xl shadow-lg shadow-primary/15 border border-primary/20">
                                <TrendingUp className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black tracking-tighter uppercase leading-none mb-1">
                                    {t("opportunities.title")}
                                </h1>
                                <p className="text-muted-foreground font-medium max-w-md">
                                    {t("opportunities.subtitle")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Card className="bg-card/40 border-border/40 backdrop-blur-md p-2 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-1">
                            <Button
                                variant={tax === 0.08 ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setTax(0.08)}
                                className="rounded-xl text-[10px] font-black uppercase tracking-widest h-9"
                            >
                                8% (Normal)
                            </Button>
                            <Button
                                variant={tax === 0.04 ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setTax(0.04)}
                                className="rounded-xl text-[10px] font-black uppercase tracking-widest h-9"
                            >
                                4% (Premium)
                            </Button>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <aside className="lg:col-span-1 space-y-6">
                        <Card className="bg-card/40 border-border/40 backdrop-blur-md shadow-lg rounded-2xl">
                            <CardHeader className="pb-3 border-b border-border/20">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Filter size={14} className="text-primary" />
                                    {t("common.filters") || "Filtros"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                                        Lucro Mínimo (Silver)
                                    </Label>
                                    <div className="relative group">
                                        <Input
                                            type="number"
                                            value={minProfit}
                                            onChange={(e) => setMinProfit(Number(e.target.value))}
                                            placeholder="Ex: 50.000"
                                            className="h-11 bg-background/40 border-border/40 group-focus-within:border-primary/50 transition-colors pl-9 font-bold"
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary/60 transition-colors">
                                            $
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3 animate-pulse">
                                    <AlertCircle size={16} className="text-primary mt-0.5 shrink-0" />
                                    <p className="text-[11px] leading-relaxed font-medium text-primary/80">
                                        Os preços são baseados em dados de usuários. Verifique no jogo antes de realizar grandes transportes.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Main Content Area */}
                    <main className="lg:col-span-3">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-32 opacity-50">
                                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                                <p className="text-sm font-black uppercase tracking-widest animate-pulse">Calculando rotas comerciais...</p>
                            </div>
                        ) : isError ? (
                            <div className="flex flex-col items-center justify-center py-20 px-6 rounded-3xl border-2 border-dashed border-destructive/20 bg-destructive/5 text-center shadow-inner">
                                <AlertCircle className="w-16 h-16 text-destructive/40 mb-4" />
                                <h3 className="text-xl font-black tracking-tight mb-2 uppercase text-destructive/80">Erro na Análise</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm">Não foi possível conectar ao servidor de dados para calcular as arbitragens.</p>
                                <Button variant="destructive" onClick={() => refetch()} className="font-bold uppercase tracking-widest shadow-lg shadow-destructive/20">
                                    Tentar Novamente
                                </Button>
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 px-6 rounded-3xl border-2 border-dashed border-border/20 bg-card/20 text-center">
                                <Search className="w-16 h-16 text-muted-foreground/20 mb-4" />
                                <h3 className="text-xl font-black tracking-tight uppercase mb-2">Sem oportunidades no momento</h3>
                                <p className="text-muted-foreground max-w-xs">{t("opportunities.emptyMessage") || "Tente diminuir o filtro de lucro ou adicione mais itens ao seu rastreador."}</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
                                {filteredData.map((opt, idx) => {
                                    const profitIsGood = opt.roi > 30;
                                    return (
                                        <Card key={`${opt.item_id}-${idx}`} className="group relative overflow-hidden bg-card/40 border-border/60 hover:border-primary/40 hover:bg-card/70 transition-all duration-300 shadow-xl backdrop-blur-sm">
                                            {profitIsGood && (
                                                <div className="absolute top-0 right-0 p-1 pointer-events-none z-10">
                                                    <div className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-widest shadow-lg">Premium Route</div>
                                                </div>
                                            )}

                                            <CardHeader className="pb-4">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="space-y-1 min-w-0">
                                                        <CardTitle className="text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
                                                            {getItemDisplayNameWithEnchantment(opt.item_id)}
                                                        </CardTitle>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-mono font-medium text-muted-foreground/60">{opt.item_id}</span>
                                                            <Badge variant="outline" className="text-[9px] font-black h-4 px-1.5 border-border/40 uppercase">
                                                                ROI {opt.roi}%
                                                            </Badge>
                                                            <Badge
                                                                className={`text-[9px] font-black h-4 px-1.5 border-0 text-white uppercase shadow-sm`}
                                                                style={{ backgroundColor: opt.quality === 5 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.3)' }}
                                                            >
                                                                {getQualityName(opt.quality)}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="bg-background/40 p-2 rounded-xl border border-border/20 group-hover:scale-110 transition-transform">
                                                        <img
                                                            src={`https://render.albiononline.com/v1/item/${encodeURIComponent(opt.item_id)}.png?size=48`}
                                                            alt={opt.item_id}
                                                            className="w-10 h-10 object-contain"
                                                            onError={(e) => { e.currentTarget.src = "https://render.albiononline.com/v1/item/T1_BAG.png"; }}
                                                        />
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-6">
                                                <div className="relative flex items-center justify-between gap-2 py-4 px-3 rounded-2xl bg-background/30 border border-border/20 shadow-inner">
                                                    {/* Buy Station */}
                                                    <div className="flex flex-col items-center text-center gap-1 z-10 flex-1">
                                                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full mb-1">Comprar</span>
                                                        <div className="flex items-center gap-1.5 text-xs font-black tracking-tighter">
                                                            <MapPin size={12} className="text-muted-foreground" />
                                                            {opt.buy_from}
                                                        </div>
                                                        <div className="text-sm font-black text-foreground">
                                                            {opt.buy_price.toLocaleString(locale)} <span className="text-[10px] opacity-40 uppercase">Ag</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground/60 uppercase">
                                                            <Clock size={10} /> {getTimeAgo(opt.buy_date)}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-center justify-center opacity-20 z-0">
                                                        <ArrowRight size={24} className="text-primary animate-pulse" />
                                                    </div>

                                                    {/* Sell Station */}
                                                    <div className="flex flex-col items-center text-center gap-1 z-10 flex-1">
                                                        <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full mb-1">Vender</span>
                                                        <div className="flex items-center gap-1.5 text-xs font-black tracking-tighter">
                                                            <MapPin size={12} className="text-muted-foreground" />
                                                            {opt.sell_at}
                                                        </div>
                                                        <div className="text-sm font-black text-foreground">
                                                            {opt.sell_price.toLocaleString(locale)} <span className="text-[10px] opacity-40 uppercase">Ag</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground/60 uppercase">
                                                            <Clock size={10} /> {getTimeAgo(opt.sell_date)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Lucro Líquido Estimado</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl font-black tracking-tighter text-emerald-400">
                                                                +{opt.profit.toLocaleString(locale)}
                                                            </span>
                                                            <Badge variant="outline" className="text-primary p-0 space-x-1 border-0">
                                                                <CheckCircle2 size={12} />
                                                                <span className="text-[9px] font-black uppercase tracking-widest">Calculado</span>
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border/40 hover:bg-primary/10 hover:border-primary/40 text-primary transition-all shadow-sm">
                                                        <ArrowUpRight size={18} />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
