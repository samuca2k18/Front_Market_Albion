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
    <div className="w-full overflow-hidden border-b border-border/10 bg-card/20 backdrop-blur-sm">
      <div className="flex items-center gap-8 py-2 px-4 animate-marquee whitespace-nowrap">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-8 shrink-0">
            <div className="flex items-center gap-2">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Gold
              </span>
              <span className="text-sm font-black text-amber-400">
                {data.current!.price.toLocaleString("pt-BR")}
              </span>
              <span
                className={`text-[10px] font-bold flex items-center gap-0.5 ${
                  isUp ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {isUp ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {isUp ? "+" : ""}
                {data.variation}
              </span>
            </div>
            <div className="h-3 w-px bg-border/20" />
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-primary/60" />
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                6 Cidades • 3 Regiões
              </span>
            </div>
            <div className="h-3 w-px bg-border/20" />
            <div className="flex items-center gap-2">
              <Sword className="w-3 h-3 text-red-400/60" />
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                Killboard Live
              </span>
            </div>
            <div className="h-3 w-px bg-border/20" />
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3 text-blue-400/60" />
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                Item Database
              </span>
            </div>
            <div className="h-3 w-px bg-border/20" />
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
    <div className="min-h-screen bg-background overflow-hidden selection:bg-primary/30 noise-overlay">
      {/* Hero gradient overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsla(187,85%,53%,0.15),transparent)] pointer-events-none" />

      {/* Gold ticker */}
      <GoldTicker />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative px-4 pt-20 pb-24 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
            {/* Left Content */}
            <div className="space-y-10 animate-fade-up">
              {/* Chip */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-primary/30 bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase shadow-lg shadow-primary/5">
                <Sparkles className="w-3 h-3 animate-pulse" />
                Albion Online • Inteligência de Mercado
              </div>

              {/* Title */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tighter">
                Domine a economia de{" "}
                <span className="text-gradient">Albion</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed font-medium">
                Consulte preços em tempo real, monitore seus itens favoritos e descubra
                as melhores rotas de arbitragem antes de se mover pelo mapa.
              </p>

              {/* Actions */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Button
                  size="lg"
                  className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/20 group transition-all"
                  asChild
                >
                  <Link to="/signup">
                    Começar agora
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 rounded-2xl border-border/40 bg-background/40 backdrop-blur-md font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                  asChild
                >
                  <Link to="/items">Item Database</Link>
                </Button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                {[
                  { icon: MapPin, label: "Cidades", value: "+6" },
                  { icon: Clock, label: "Update", value: "~2s" },
                  { icon: TrendingUp, label: "Precisão", value: "99%" },
                ].map((metric) => (
                  <Card
                    key={metric.label}
                    className="bg-card/30 border-border/40 backdrop-blur-md rounded-2xl p-4 group hover:border-primary/40 transition-all shadow-lg hover:shadow-xl hover:shadow-primary/5"
                  >
                    <metric.icon className="h-4 w-4 text-primary/60 mb-2 group-hover:text-primary group-hover:scale-110 transition-all" />
                    <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">
                      {metric.label}
                    </p>
                    <p className="text-xl font-black text-foreground tracking-tighter">
                      {metric.value}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Content - Preview Card */}
            <div
              className="relative animate-fade-up max-w-[500px] lg:max-w-none mx-auto lg:mx-0"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-transparent to-accent/30 blur-[100px] opacity-40 animate-pulse-slow" />
              <Card className="surface-panel relative rounded-[32px] p-8 animate-float">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground">
                      Snapshot do mercado
                    </h3>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-tighter px-2"
                  >
                    Live Update
                  </Badge>
                </div>

                <div className="space-y-4">
                  {previewItems.map((item, i) => (
                    <div
                      key={`${item.item}-${i}`}
                      className="group flex flex-col gap-3 rounded-2xl bg-background/40 border border-border/20 p-4 hover:bg-background/60 hover:border-primary/30 transition-all duration-300"
                      style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-black/40 p-1.5 rounded-xl border border-border/20 group-hover:scale-110 transition-transform">
                            <img
                              src={getItemImageUrl(item.item)}
                              alt={item.item}
                              className="h-8 w-8 object-contain"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                              {item.city}
                            </span>
                            <span className="text-sm font-black tracking-tight text-foreground truncate max-w-[120px]">
                              {getItemDisplayNameWithEnchantment(item.item)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-black text-primary tracking-tighter leading-none">
                            {item.price}
                          </span>
                          <span
                            className={`text-[9px] font-bold ${
                              item.trend.startsWith("+")
                                ? "text-emerald-400"
                                : item.trend.startsWith("-")
                                  ? "text-rose-400"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {item.trend}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-border/10 flex items-center justify-center gap-2">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40">
                    Dados Reais da Albion Data Project
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative px-4 py-32 sm:px-6 lg:px-8 border-t border-border/10 bg-muted/10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl mb-20 animate-fade-up">
              <Badge
                variant="outline"
                className="border-primary/30 text-primary uppercase font-black text-[9px] tracking-widest mb-4 px-3 py-1"
              >
                Funcionalidades
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-black mb-6 tracking-tighter">
                Por que usar o Market Tool?
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                Pensado para quem leva economia de silver a sério: traders, economistas de
                guilda e jogadores competitivos em busca de eficiência total.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {featureList.map((feature, i) => (
                <Card
                  key={feature.title}
                  className="group surface-panel rounded-3xl p-8 hover:border-primary/40 hover:bg-card/40 transition-all duration-300 animate-fade-up border shadow-xl hover:shadow-2xl hover:shadow-primary/5"
                  style={{ animationDelay: `${0.1 * i}s` }}
                >
                  <CardContent className="p-0 space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all group-hover:scale-110 border border-primary/20">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black mb-3 text-foreground tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                        {feature.description}
                      </p>
                    </div>
                    <ul className="space-y-3 pt-2 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                      {feature.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-primary" />
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
        <section className="relative px-4 py-40 sm:px-6 lg:px-8 border-t border-border/10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_100%,hsla(187,85%,53%,0.1),transparent)] pointer-events-none" />
          <div className="mx-auto max-w-3xl text-center relative z-10 animate-fade-up">
            <h2 className="text-5xl sm:text-6xl font-black mb-8 tracking-tighter uppercase whitespace-nowrap">
              Pronto para <span className="text-primary italic">Dominar?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto font-medium">
              Crie sua conta gratuitamente e comece a monitorar preços como um
              profissional agora mesmo.
            </p>
            <Button
              size="lg"
              className="h-16 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-2xl shadow-primary/30 group text-lg"
              asChild
            >
              <Link to="/signup">
                Criar minha conta
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-border/10 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
          © {new Date().getFullYear()} Albion Market Tool • Built with shadcn/ui & Lucid
        </p>
      </footer>
    </div>
  );
}
