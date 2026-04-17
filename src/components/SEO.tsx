import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

export function SEO({
  title,
  description = "Acompanhe preços, oportunidades de arbitragem e gerencie seu craft no Albion Online com o Albion Market.",
  keywords = "albion online, albion market, gold price, albion arbitrage, albion crafting",
  ogImage = "/og-image.png", // Imagem padrão (pode adicionar na pasta public depois)
}: SEOProps) {
  const finalTitle = `${title} | Albion Market`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="title" content={finalTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={finalTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
    </Helmet>
  );
}
