import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowRight, Zap, Shield, BarChart3, TrendingUp, MapPin, Clock } from "lucide-react";
import { getItemImageUrl, getItemDisplayNameWithEnchantment } from "../utils/items";

const featureList = [
  {
    icon: Zap,
    title: "Monitoramento inteligente",
    description:
      "Sincronize seus itens favoritos e veja os menores preços em segundos, sem precisar abrir o game.",
  },
  {
    icon: BarChart3,
    title: "Filtros profissionais",
    description:
      "Refine por cidade, qualidade e encantamento para decidir onde comprar e onde vender.",
  },
  {
    icon: Shield,
    title: "Login seguro",
    description:
      "Autenticação JWT, sessões protegidas e integração direta com sua API backend.",
  },
];

const marketData = [
  { city: "Caerleon", item: "T8_BAG@3", price: "1.245.000" },
  { city: "Bridgewatch", item: "T6_CAPE", price: "312.400" },
  { city: "Martlock", item: "T8_ROYALCALF", price: "48.900" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero gradient overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsla(187,85%,53%,0.12),transparent)] pointer-events-none" />
      
      <main className="relative">
        {/* Hero Section */}
        <section className="relative px-4 pt-16 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8 animate-fade-up">
                {/* Chip */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
                  Albion Online • Inteligência de Mercado
                </div>

                {/* Title */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
                  Controle total dos preços do mercado
                  <span className="block text-gradient mt-2">
                    com visual profissional
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                  Consulte preços em tempo real, monitore seus itens favoritos e descubra
                  em qual cidade está o melhor retorno antes de se mover pelo mapa.
                </p>

                {/* Actions */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <Button variant="hero" size="lg" asChild>
                    <Link to="/signup">
                      Começar agora
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/dashboard">
                      Ver painel em ação
                    </Link>
                  </Button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-6">
                  {[
                    { icon: MapPin, label: "Cidades monitoradas", value: "+6" },
                    { icon: Clock, label: "Tempo de resposta", value: "~1s" },
                    { icon: TrendingUp, label: "Integração com API", value: "100%" },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="glass rounded-2xl p-4 group hover:border-primary/30 transition-colors"
                    >
                      <metric.icon className="h-4 w-4 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                        {metric.label}
                      </p>
                      <p className="text-xl font-bold text-foreground">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Content - Preview Card */}
              <div className="relative animate-fade-up" style={{ animationDelay: "0.2s" }}>
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 blur-3xl opacity-40 animate-pulse-slow" />
                <div className="relative glass rounded-3xl p-6 border-primary/20 animate-float">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-foreground">Snapshot do mercado</h3>
                    <span className="text-[10px] uppercase tracking-wider text-primary font-medium">Live</span>
                  </div>
                  
                  <div className="space-y-4">
                    {marketData.map((item, i) => (
                      <div
                        key={item.city}
                        className="group rounded-xl bg-secondary/50 p-4 hover:bg-secondary transition-colors"
                        style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium px-3 py-1 rounded-full bg-background/80 border border-border text-foreground">
                            {item.city}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={getItemImageUrl(item.item)}
                              alt={item.item}
                              loading="lazy"
                              className="h-6 w-6 object-contain rounded-md border border-border bg-background/60"
                              onError={(e) => {
                                const img = e.currentTarget;
                                if (img.getAttribute("data-fallback") !== "1") {
                                  img.setAttribute("data-fallback", "1");
                                  img.src = "https://render.albiononline.com/v1/item/T1_BAG.png";
                                }
                              }}
                            />
                            <span className="text-sm text-foreground font-medium">
                              {getItemDisplayNameWithEnchantment(item.item)}
                            </span>
                          </div>
                          <span className="text-lg font-bold text-accent">{item.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-6 text-xs text-muted-foreground text-center">
                    Dados simulados • Veja o painel real após login
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative px-4 py-24 sm:px-6 lg:px-8 border-t border-border/50">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl mb-16 animate-fade-up">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Por que usar o Market Albion Online?
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Pensado para quem leva economia de silver a sério: traders, economistas de
                guilda e jogadores que não querem perder tempo.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {featureList.map((feature, i) => (
                <div
                  key={feature.title}
                  className="group glass rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 animate-fade-up"
                  style={{ animationDelay: `${0.1 * i}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {feature.description}
                  </p>
                  <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-accent" />
                      Insight imediato dos preços
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-accent" />
                      Layout limpo e responsivo
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-accent" />
                      Integrado ao seu backend seguro
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative px-4 py-24 sm:px-6 lg:px-8 border-t border-border/50">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_100%,hsla(142,71%,45%,0.08),transparent)] pointer-events-none" />
          <div className="mx-auto max-w-3xl text-center animate-fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Pronto para dominar o mercado?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Crie sua conta gratuitamente e comece a monitorar preços como um profissional.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/signup">
                Criar minha conta
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
