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
import { REVIEWS } from "../data";
import { ProductCard } from "../components/ProductCard";
import { api } from "../services/api";

export function LandingPage({
  navigate,
  onAddToCart,
  wishlist,
  onToggleWishlist,
}) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.products.listProducts(),
          api.categories.listCategories(),
        ]);
        if (prodRes.success && prodRes.data) {
          setProducts(prodRes.data);
        }
        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
      } catch (err) {
        console.error("Error loading landing page data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featuredProducts = products.filter((p) => p.isBestSeller).slice(0, 4);
  const newArrivals = products.filter((p) => p.isNew).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #fff0f8 0%, #FFFDF7 50%, #f0faf0 100%)",
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
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5"
                style={{ fontFamily: "Poppins, sans-serif", color: "#1a1a2e" }}
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
                  onClick={() =>
                    document
                      .getElementById("categories")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-base border-2 border-primary/30 text-primary hover:border-primary hover:bg-primary/5 transition-all"
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

            {/* Hero Image Grid */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="hidden lg:grid grid-cols-2 gap-3"
            >
              {[
                {
                  src: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop&auto=format",
                  alt: "Art supplies",
                  span: "row-span-2",
                },
                {
                  src: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=200&fit=crop&auto=format",
                  alt: "Beads",
                  span: "",
                },
                {
                  src: "https://images.unsplash.com/photo-1617721710888-aef4d0fd1e6b?w=300&h=200&fit=crop&auto=format",
                  alt: "Embroidery",
                  span: "",
                },
              ].map((img, i) => (
                <div
                  key={i}
                  className={`${img.span} rounded-2xl overflow-hidden bg-muted`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-border bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                Icon: Truck,
                label: "Free Delivery",
                sub: "On orders above ₹499",
              },
              {
                Icon: Shield,
                label: "Secure Payments",
                sub: "100% safe & encrypted",
              },
              {
                Icon: RefreshCw,
                label: "Easy Returns",
                sub: "7-day return policy",
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
        className="py-16"
        style={{ background: "#FFFDF7" }}
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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.slice(0, 10).map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate("shop")}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-border bg-white hover:border-primary hover:shadow-md transition-all group"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: cat.color }}
                >
                  {cat.icon}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {cat.count} items
                  </p>
                </div>
              </motion.button>
            ))}
          </div>

        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 bg-white">
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

      {/* Banner */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl overflow-hidden relative p-8 sm:p-12"
            style={{ background: "linear-gradient(135deg, #2E7D32, #388e3c)" }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, white 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
            </div>
            <div className="relative z-10 max-w-lg">
              <span className="text-white/70 text-sm font-medium uppercase tracking-wider">
                Limited Time Offer
              </span>
              <h3
                className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-3"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Complete Resin Starter Kit
              </h3>
              <p className="text-white/80 mb-6">
                Get everything you need to start your resin art journey at 28%
                off. Limited stock available!
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("product", "p9")}
                  className="px-6 py-3 rounded-2xl bg-white font-semibold text-sm transition-all hover:bg-secondary"
                  style={{ color: "#2E7D32" }}
                >
                  Shop Now – ₹1,299
                </button>
                <span className="text-white/60 text-sm line-through">
                  ₹1,799
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-1 h-6 rounded-full inline-block"
                  style={{ background: "#2E7D32" }}
                />
                <span className="text-sm font-semibold text-accent">
                  Fresh Arrivals
                </span>
              </div>
              <h2
                className="text-3xl font-bold"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                New This Week
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivals.map((p) => (
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

      {/* Reviews */}
      <section className="py-16" style={{ background: "#fff0f8" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              What Crafters Are Saying
            </h2>
            <p className="text-muted-foreground">
              Join thousands of happy customers
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="w-5 h-5 text-secondary fill-current"
                  />
                ))}
              </div>
              <span className="font-bold">4.9</span>
              <span className="text-muted-foreground text-sm">
                from 12,400+ reviews
              </span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REVIEWS.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-5 border border-border shadow-sm"
              >
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= review.rating ? "text-secondary fill-current" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                  "{review.comment}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={review.avatar}
                    alt={review.author}
                    className="w-9 h-9 rounded-full object-cover bg-muted"
                  />
                  <div>
                    <p className="text-sm font-semibold">{review.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {review.date}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-video rounded-3xl overflow-hidden bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=500&fit=crop&auto=format"
                  alt="Craft studio"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-border">
                <div
                  className="text-2xl font-bold"
                  style={{
                    color: "#a61c9b",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  5+ Years
                </div>
                <div className="text-xs text-muted-foreground">
                  Crafting happiness
                </div>
              </div>
            </div>
            <div>
              <span className="text-sm font-semibold text-primary">
                Our Story
              </span>
              <h2
                className="text-3xl font-bold mt-2 mb-4"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Born from a Passion for Crafting
              </h2>
              <p className="text-foreground/70 leading-relaxed mb-4">
                Lemon House started in 2020 in a small Bengaluru apartment, born
                from founder Priya's frustration with finding quality craft
                supplies in India. What started as a hobby became a mission: to
                make premium creative materials accessible to every crafter.
              </p>
              <p className="text-foreground/70 leading-relaxed mb-6">
                Today we serve 50,000+ crafters across 200+ cities, curating
                only the best materials from trusted manufacturers worldwide.
                Every product is tested by our in-house craft team before it
                reaches you.
              </p>
              <button
                onClick={() => navigate("about")}
                className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
              >
                Read our full story <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
