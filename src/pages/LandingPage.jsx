import { useState, useEffect } from "react";
import {
  ArrowRight,
  Star,
  Shield,
  Truck,
  RefreshCw,
  Headphones,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { ProductCard } from "../components/ProductCard";
import { api } from "../services/api";
import heroCollageImg from "../assets/hero_collage.jpg";
import { SEO } from "../components/SEO";
import { getOptimizedImageUrl } from "../utils/cloudinary";

export function LandingPage({
  navigate,
  onAddToCart,
  wishlist,
  onToggleWishlist,
}) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    // Fetch categories immediately & independently for instant section display
    api.categories.listCategories()
      .then((catRes) => {
        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
      })
      .catch((err) => console.error("Error loading landing categories:", err))
      .finally(() => setCategoriesLoading(false));

    // Fetch all products independently
    api.products.listProducts({ all: true, size: 200 })
      .then((prodRes) => {
        if (prodRes.success && prodRes.data) {
          setProducts(prodRes.data);
        }
      })
      .catch((err) => console.error("Error loading landing products:", err))
      .finally(() => setProductsLoading(false));
  }, []);

  const getCategoryNameString = (p) => {
    if (!p) return "";
    if (typeof p.categoryName === "string" && p.categoryName) return p.categoryName;
    if (typeof p.category === "string" && p.category) return p.category;
    if (typeof p.category === "object" && p.category !== null) {
      return p.category.name || p.category.title || p.category.label || "";
    }
    return "";
  };

  const getSubcategoryNameString = (p) => {
    if (!p) return "";
    if (typeof p.subcategory === "string" && p.subcategory) return p.subcategory;
    if (typeof p.subCategory === "string" && p.subCategory) return p.subCategory;
    if (typeof p.subcategory === "object" && p.subcategory !== null) {
      return p.subcategory.name || p.subcategory.title || "";
    }
    if (typeof p.subCategory === "object" && p.subCategory !== null) {
      return p.subCategory.name || p.subCategory.title || "";
    }
    return "";
  };

  const isWatchProduct = (p) => {
    if (!p) return false;
    const catName = getCategoryNameString(p).toLowerCase();
    const name = String(p.name || p.title || "").toLowerCase();
    const sub = getSubcategoryNameString(p).toLowerCase();
    return (
      catName.includes("watch") ||
      name.includes("watch") ||
      sub.includes("watch")
    );
  };

  const isReadymadeKit = (p) => {
    if (!p || isWatchProduct(p)) return false;
    const catName = getCategoryNameString(p).toLowerCase();
    const sub = getSubcategoryNameString(p).toLowerCase();
    const name = String(p.name || p.title || "").toLowerCase();
    const desc = String(p.description || "").toLowerCase();
    const tags = Array.isArray(p.tags) ? p.tags.join(" ").toLowerCase() : String(p.tags || "").toLowerCase();

    return (
      catName.includes("kit") ||
      catName.includes("readymade") ||
      catName.includes("ready made") ||
      catName.includes("ready-made") ||
      catName.includes("diy") ||
      sub.includes("kit") ||
      sub.includes("readymade") ||
      sub.includes("ready made") ||
      sub.includes("ready-made") ||
      sub.includes("diy") ||
      name.includes("kit") ||
      name.includes("readymade") ||
      name.includes("ready made") ||
      name.includes("ready-made") ||
      name.includes("diy") ||
      name.includes("flower") ||
      name.includes("chenille") ||
      name.includes("stem") ||
      name.includes("cleaner") ||
      name.includes("bouquet") ||
      name.includes("making") ||
      desc.includes("readymade") ||
      desc.includes("ready made") ||
      desc.includes("ready-made") ||
      desc.includes("kit") ||
      desc.includes("diy") ||
      tags.includes("kit") ||
      tags.includes("readymade") ||
      tags.includes("ready made") ||
      tags.includes("ready-made") ||
      tags.includes("diy")
    );
  };

  // Best Sellers section on Home Page shows exclusively ALL ReadyMade Kits
  const featuredProducts = products.filter((p) => !isWatchProduct(p) && isReadymadeKit(p));
  const newArrivals = products.filter((p) => p.isNew).slice(0, 4);

  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Lemon House",
    "url": "https://lemonhousecraft.in",
    "description": "Premium craft supplies, DIY materials, and creative essentials delivered to your doorstep.",
    "publisher": {
      "@type": "Organization",
      "name": "Lemon House",
      "logo": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop"
    }
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Lemon House - Handcrafted Products, Handmade Gifts, Scented Candles & Home Décor"
        description="Discover handcrafted products, handmade gifts, scented candles, soy candles, luxury candle gift sets, aesthetic home décor, and unique gifts for Rakhi, birthdays & anniversaries at Lemon House. Fast nationwide shipping."
        keywords="handcrafted products, handmade gifts, artisan crafts, Indian handicrafts, scented candles, soy candles, decorative candles, luxury candles, candle gift sets, thoughtful gifts, unique gifts, premium gifts, personalized gifts, gift ideas, home décor, aesthetic décor, handmade home décor, room décor, Rakhi gifts, Raksha Bandhan gifts, birthday gifts, anniversary gifts, wedding gifts, festive gifts, Rakhi gifts for brother, Rakhi gifts for sister, unique Rakhi gifts, Rakhi gift sets, handcrafted Rakhi gifts, candle gifts for Rakhi, Raksha Bandhan gift ideas, complete candle kit, lippanart kit, readymade kits, silicone moulds, craft supplies, DIY materials, Lemon House"
        schema={homeSchema}
      />
      {/* Hero Section */}
      <section
        className="relative overflow-hidden transition-colors duration-300"
        style={{
          background:
            "var(--hero-gradient)",
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "#a61c9b" }}
        />
        <div
          className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-15 blur-3xl"
          style={{ background: "#FFD54F" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-5"
                style={{ background: "#fbeaf5", color: "#a61c9b" }}
              >
                <Sparkles className="w-4 h-4" /> New arrivals every week
              </div>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5 text-foreground"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Everything You Need To{" "}
                <span style={{ color: "#a61c9b" }}>Create Something</span>{" "}
                <span style={{ color: "#2E7D32" }}>Beautiful</span>
              </h1>
              <p className="text-lg text-foreground/60 mb-8 leading-relaxed max-w-lg">
                Premium craft supplies, DIY materials, and creative essentials
                delivered to your doorstep. Join 50,000+ crafters who trust
                Lemon House.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("shop")}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-semibold text-base transition-all hover:opacity-90 hover:gap-3 shadow-lg shadow-primary/25"
                  style={{
                    background: "linear-gradient(135deg, #a61c9b, #d82a81)",
                  }}
                >
                  Shop Now <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const catElem = document.getElementById("categories");
                    if (catElem) {
                      catElem.scrollIntoView({ behavior: "smooth", block: "start" });
                    } else {
                      window.location.hash = "#categories";
                    }
                  }}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-base border-2 border-primary/30 text-primary hover:border-primary hover:bg-primary/5 transition-all cursor-pointer active:scale-95 relative z-10"
                >
                  Explore Categories
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-10">
                {[
                  { label: "Products", value: "1,000+" },
                  { label: "Happy Crafters", value: "50K+" },
                  { label: "Cities", value: "200+" },
                ].map((s) => (
                  <div key={s.label}>
                    <div
                      className="text-2xl font-bold text-foreground"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {s.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hero Image Collage */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="hidden lg:block w-full max-w-lg justify-self-center rounded-3xl overflow-hidden"
            >
              <img
                src={getOptimizedImageUrl(heroCollageImg, { width: 800 })}
                alt="Lemon House Crafts Collage"
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-border/40 bg-card py-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                Icon: Truck,
                label: "Free Delivery",
                sub: "On orders above ₹25000",
              },
              {
                Icon: Shield,
                label: "Secure Payments",
                sub: "100% safe & encrypted",
              },

              {
                Icon: Headphones,
                label: "24/7 Support",
                sub: "Dedicated craft experts",
              },
            ].map(({ Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#fbeaf5" }}
                >
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="py-16 bg-background transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2
                className="text-3xl font-bold"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Shop by Category
              </h2>
              <p className="text-muted-foreground mt-1">
                Find exactly what you need for your next project
              </p>
            </div>
            <button
              onClick={() => navigate("shop")}
              className="hidden sm:flex items-center gap-1 text-primary font-semibold text-sm hover:gap-2 transition-all"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop/Tablet Categories Grid */}
          {categoriesLoading ? (
            <div className="hidden sm:grid grid-cols-3 lg:grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-border/60 bg-white dark:bg-zinc-900 animate-pulse"
                >
                  <div className="w-12 h-12 rounded-2xl bg-muted" />
                  <div className="w-20 h-4 bg-muted rounded-md mt-1" />
                  <div className="w-12 h-3 bg-muted/60 rounded-md mt-0.5" />
                </div>
              ))}
            </div>
          ) : (
            <div className="hidden sm:grid grid-cols-3 lg:grid-cols-5 gap-3">
              {categories.slice(0, 10).map((cat, i) => (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate("shop", cat.name || cat.id)}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-border bg-white dark:bg-zinc-900 hover:border-primary hover:shadow-md transition-all group cursor-pointer"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl overflow-hidden bg-muted"
                    style={{ background: cat.color }}
                  >
                    {(cat.imageUrl || cat.image) ? (
                      <img
                        src={getOptimizedImageUrl(cat.imageUrl || cat.image, { width: 150 })}
                        alt={cat.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      cat.icon || "🛍️"
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors">
                      {cat.name}
                    </p>

                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Mobile Categories Swiper */}
          {categoriesLoading ? (
            <div className="flex sm:hidden gap-3 overflow-x-auto pb-3 snap-x -mx-4 px-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-border/60 bg-white dark:bg-zinc-900 animate-pulse flex-shrink-0"
                >
                  <div className="w-8 h-8 rounded-xl bg-muted" />
                  <div className="w-16 h-3 bg-muted rounded-md" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex sm:hidden gap-3 overflow-x-auto pb-3 snap-x -mx-4 px-4">
              {categories.slice(0, 10).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate("shop", cat.name || cat.id)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-border bg-white dark:bg-zinc-900 snap-center flex-shrink-0 cursor-pointer"
                >
                  <span
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-lg overflow-hidden bg-muted"
                    style={{ background: cat.color }}
                  >
                    {(cat.imageUrl || cat.image) ? (
                      <img
                        src={getOptimizedImageUrl(cat.imageUrl || cat.image, { width: 150 })}
                        alt={cat.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      cat.icon || "🛍️"
                    )}
                  </span>
                  <span className="text-xs font-semibold text-foreground leading-none">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 bg-card transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-1 h-6 rounded-full inline-block"
                  style={{ background: "#a61c9b" }}
                />
                <span className="text-sm font-semibold text-primary">
                  Trending
                </span>
              </div>
              <h2
                className="text-3xl font-bold"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Best Sellers
              </h2>
            </div>
            <button
              onClick={() => navigate("shop")}
              className="hidden sm:flex items-center gap-1 text-primary font-semibold text-sm hover:gap-2 transition-all"
            >
              See all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onNavigate={(id) => navigate("product", id)}
                onAddToCart={onAddToCart}
                isWishlisted={wishlist.includes(p.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </div>
      </section>




    </div>
  );
}
