import { Helmet } from "react-helmet-async";

const DEFAULT_SITE_NAME = "Lemon House";
const DEFAULT_DOMAIN = "https://lemonhousecraft.in";
const DEFAULT_TITLE = "Lemon House - Rakhi Gifts, Raksha Bandhan Gifts, Handcrafted Gift Sets & Craft Supplies";
const DEFAULT_DESCRIPTION =
  "Shop unique Rakhi gifts, Rakhi gifts for brother & sister, handcrafted Rakhi gift sets, candle gifts for Rakhi, complete candle kits, silicone moulds & DIY materials at Lemon House. Fast nationwide shipping & 50,000+ happy crafters.";
const DEFAULT_KEYWORDS =
  "Rakhi gifts, Raksha Bandhan gifts, Rakhi gifts for brother, Rakhi gifts for sister, unique Rakhi gifts, Rakhi gift sets, handcrafted Rakhi gifts, candle gifts for Rakhi, Raksha Bandhan gift ideas, candle, concrete, moulds, complete candle kit, lippanart kit, readymade kits, basic bath salt, basic soap salt, texture kit, pipe kit, silicone, craft supplies, DIY materials, Lemon House";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&h=630&fit=crop";

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalUrl,
  ogType = "website",
  ogImage = DEFAULT_IMAGE,
  keywords = DEFAULT_KEYWORDS,
  noindex = false,
  schema,
}) {
  const fullTitle = title
    ? `${title} | ${DEFAULT_SITE_NAME}`
    : DEFAULT_TITLE;

  const currentUrl =
    canonicalUrl ||
    (typeof window !== "undefined" ? window.location.href : DEFAULT_DOMAIN);

  return (
    <Helmet>
      {/* Standard Meta Tags & Favicon Logo */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />
      <link rel="canonical" href={currentUrl} />
      <link rel="icon" type="image/png" href="/favicon.png" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/logo.png" />

      {/* Open Graph Tags */}
      <meta property="og:site_name" content={DEFAULT_SITE_NAME} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
