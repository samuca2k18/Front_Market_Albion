// src/pages/LandingPage.tsx
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import {
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  TrendingUp,
  MapPin,
  Clock,
  Star,
  Sparkles,
  Sword,
  Database,
  Coins,
  TrendingDown,
} from "lucide-react";
import { getItemImageUrl, getItemDisplayNameWithEnchantment } from "../utils/items";
import { fetchGoldPrices, fetchAlbionPrices } from "../api/albion";

const featureList = [
  {
    icon: Zap,
    title: "Monitoramento inteligente",
    description:
      "Sincronize seus itens favoritos e veja os menores preços em segundos, sem precisar abrir o game.",
    bullets: [
      "Visão imediata do mercado",
      "Interface 100% responsiva",
      "Dados protegidos e seguros",
    ],
  },
  {
    icon: BarChart3,
    title: "Filtros profissionais",
    description:
      "Refine por cidade, qualidade e encantamento para decidir onde comprar e onde vender.",
    bullets: [
      "Análise em tempo real",
      "Histórico de preços",
      "Comparação entre cidades",
    ],
  },
  {
    icon: Shield,
    title: "Login seguro",
    description:
      "Autenticação JWT, sessões protegidas e integração direta com sua API backend.",
    bullets: [
      "Criptografia end-to-end",
      "Alertas de preço",
      "Killboard integrado",
    ],
  },
];

const HERO_PREVIEW_ITEMS = ["T8_BAG", "T6_CAPE", "T8_ROYALCALF"];

// Gold ticker at the top
function GoldTicker() {
  const { data } = useQuery({
    queryKey: ["gold-ticker"],
    queryFn: () => fetchGoldPrices("europe"),
    refetchInterval: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 2,
  });

  if (!data?.current) return null;

  const isUp = data.variation > 0;

  return (
    <div className="w-full overflow-hidden border-b border-border/30 bg-card/40 backdrop-blur-md">
      <div className="flex items-center gap-10 py-2.5 px-4 animate-marquee whitespace-nowrap">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-10 shrink-0">
            <div className="flex items-center gap-2.5">
              <Coins className="w-4 h-4 text-amber-400/80" />
              <span className="text-xs font-semibold text-muted-foreground">
                Gold
              </span>
              <span className="text-sm font-bold text-amber-300">
                {data.current!.price.toLocaleString("pt-BR")}
              </span>
              <span
                className={`text-xs font-medium flex items-center gap-1 ${
                  isUp ? "text-emerald-400/90" : "text-red-400/90"
                }`}
              >
                {isUp ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {isUp ? "+" : ""}
                {data.variation}
              </span>
            </div>
            <div className="h-4 w-px bg-border/30" />
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground/60" />
              <span className="text-xs font-medium text-muted-foreground/70">
                6 Cidades
              </span>
            </div>
            <div className="h-4 w-px bg-border/30" />
            <div className="flex items-center gap-2">
              <Sword className="w-3.5 h-3.5 text-muted-foreground/60" />
              <span className="text-xs font-medium text-muted-foreground/70">
                Killboard
              </span>
            </div>
            <div className="h-4 w-px bg-border/30" />
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-muted-foreground/60" />
              <span className="text-xs font-medium text-muted-foreground/70">
                Database
              </span>
            </div>
            <div className="h-4 w-px bg-border/30" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingPage() {
  const { data: pricesData } = useQuery({
    queryKey: ["landing-preview-prices"],
    queryFn: () => fetchAlbionPrices(HERO_PREVIEW_ITEMS, undefined, undefined, "europe"),
    staleTime: 1000 * 60 * 5,
  });

  const previewItems = HERO_PREVIEW_ITEMS.map((itemName) => {
    // Find the cheapest active price for this item across cities
    const itemEntries = (pricesData?.all_data || []).filter(
      (entry: any) => entry.item_id === itemName && entry.sell_price_min > 0
    );
    
    if (itemEntries.length > 0) {
      const cheapest = itemEntries.reduce((prev: any, curr: any) => 
        prev.sell_price_min < curr.sell_price_min ? prev : curr
      );
      return {
        city: cheapest.city,
        item: itemName,
        price: cheapest.sell_price_min.toLocaleString("pt-BR"),
        trend: "Live", // Without history we can't show trend here easily, but "Live" works
      };
    }
    
    // Fallback if no data or loading
    return {
      city: "Carregando...",
      item: itemName,
      price: "---",
      trend: "---",
    };
  });
  return (
    <div className="min-h-screen bg-background overflow-hidden selection:bg-primary/20">
      {/* Hero gradient overlay - more subtle */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_-10%,hsla(160,50%,45%,0.08),transparent)] pointer-events-none" />

      {/* Gold ticker */}
      <GoldTicker />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative px-4 pt-16 pb-20 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-up">
              {/* Chip */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/8 text-primary text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Albion Online Market Intelligence
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-balance">
                Domine a economia de{" "}
                <span className="text-gradient">Albion</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
                Consulte preços em tempo real, monitore seus itens favoritos e descubra
                as melhores rotas de arbitragem antes de se mover pelo mapa.
              </p>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  size="lg"
                  className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/15 group transition-all"
                  asChild
                >
                  <Link to="/signup">
                    Começar agora
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 rounded-xl border-border/50 bg-card/50 backdrop-blur-sm font-semibold hover:bg-card/80 transition-all"
                  asChild
                >
                  <Link to="/items">Item Database</Link>
                </Button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-6">
                {[
                  { icon: MapPin, label: "Cidades", value: "+6" },
                  { icon: Clock, label: "Update", value: "~2s" },
                  { icon: TrendingUp, label: "Precisão", value: "99%" },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="bg-card/50 border border-border/40 backdrop-blur-sm rounded-xl p-4 group hover:border-border/60 hover:bg-card/70 transition-all"
                  >
                    <metric.icon className="h-4 w-4 text-primary/70 mb-2 group-hover:text-primary transition-colors" />
                    <p className="text-[11px] font-medium text-muted-foreground/70 mb-0.5">
                      {metric.label}
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Preview Card */}
            <div
              className="relative animate-fade-up max-w-[480px] lg:max-w-none mx-auto lg:mx-0"
              style={{ animationDelay: "0.15s" }}
            >
              <div className="absolute -inset-8 bg-gradient-to-br from-primary/15 via-transparent to-accent/10 blur-3xl opacity-50" />
              <Card className="surface-panel relative rounded-2xl p-6 animate-float">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Snapshot do mercado
                    </h3>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/25 text-[10px] font-medium px-2"
                  >
                    Live
                  </Badge>
                </div>

                <div className="space-y-3">
                  {previewItems.map((item, i) => (
                    <div
                      key={`${item.item}-${i}`}
                      className="group flex items-center justify-between rounded-xl bg-background/50 border border-border/30 p-3.5 hover:bg-background/70 hover:border-border/50 transition-all"
                      style={{ animationDelay: `${0.25 + i * 0.08}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-card/80 p-1.5 rounded-lg border border-border/30 group-hover:border-border/50 transition-colors">
                          <img
                            src={getItemImageUrl(item.item)}
                            alt={item.item}
                            className="h-7 w-7 object-contain"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-medium text-muted-foreground/70">
                            {item.city}
                          </span>
                          <span className="text-sm font-semibold text-foreground truncate max-w-[140px]">
                            {getItemDisplayNameWithEnchantment(item.item)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-base font-bold text-primary">
                          {item.price}
                        </span>
                        <span
                          className={`text-[10px] font-medium ${
                            item.trend.startsWith("+")
                              ? "text-emerald-400/90"
                              : item.trend.startsWith("-")
                                ? "text-rose-400/90"
                                : "text-muted-foreground/60"
                          }`}
                        >
                          {item.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-border/20 flex items-center justify-center gap-2">
                  <Star className="w-3.5 h-3.5 text-amber-400/80 fill-amber-400/80" />
                  <p className="text-xs font-medium text-muted-foreground/50">
                    Dados da Albion Data Project
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative px-4 py-24 sm:px-6 lg:px-8 border-t border-border/20 bg-card/30">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-xl mb-14 animate-fade-up">
              <Badge
                variant="outline"
                className="border-primary/25 text-primary font-medium text-xs mb-4 px-3 py-1"
              >
                Funcionalidades
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight text-balance">
                Por que usar o Market Tool?
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Pensado para quem leva economia de silver a sério: traders, economistas de
                guilda e jogadores competitivos em busca de eficiência total.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {featureList.map((feature, i) => (
                <Card
                  key={feature.title}
                  className="group bg-card/60 border-border/40 rounded-xl p-6 hover:border-border/60 hover:bg-card/80 transition-all animate-fade-up"
                  style={{ animationDelay: `${0.08 * i}s` }}
                >
                  <CardContent className="p-0 space-y-5">
                    <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors border border-primary/15">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {feature.description}
                      </p>
                    </div>
                    <ul className="space-y-2.5 pt-1 text-xs text-muted-foreground/70">
                      {feature.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-primary/60" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative px-4 py-28 sm:px-6 lg:px-8 border-t border-border/20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,hsla(160,50%,45%,0.06),transparent)] pointer-events-none" />
          <div className="mx-auto max-w-2xl text-center relative z-10 animate-fade-up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-balance">
              Pronto para <span className="text-primary">dominar o mercado?</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
              Crie sua conta gratuitamente e comece a monitorar preços como um
              profissional agora mesmo.
            </p>
            <Button
              size="lg"
              className="h-13 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 group"
              asChild
            >
              <Link to="/signup">
                Criar minha conta
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-border/20 text-center">
        <p className="text-xs font-medium text-muted-foreground/50">
          © {new Date().getFullYear()} Albion Market Tool
        </p>
      </footer>
    </div>
  );
}
