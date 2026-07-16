import { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal, X, ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProductCard } from "../components/ProductCard";
import { api } from "../services/api";

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export function ShopPage({
  navigate,
  onAddToCart,
  wishlist,
  onToggleWishlist,
  searchQuery,
}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState("popular");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const maxProductPrice = useMemo(() => {
    if (products.length === 0) return 2000;
    const maxVal = Math.max(...products.map((p) => p.price || 0));
    return maxVal > 2000 ? Math.ceil(maxVal / 1000) * 1000 : 2000;
  }, [products]);

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
        console.error("Error loading shop data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];

    if (localSearch) {
      const q = localSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category?.toLowerCase()?.includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== "all") {
      list = list.filter(
        (p) =>
          p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          p.categoryId?.toString()?.toLowerCase() === selectedCategory.toString()?.toLowerCase() ||
          p.category?.toString()?.toLowerCase() === selectedCategory.toString()?.toLowerCase()
      );
    }
    list = list.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );
    if (onlyInStock) list = list.filter((p) => p.inStock);

    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        list.sort(
          (a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0)
        );
    }

    return list;
  }, [products, localSearch, selectedCategory, priceRange, sortBy, onlyInStock]);

  const activeFiltersCount = [
    selectedCategory !== "all",
    priceRange[0] > 0 || (priceRange[1] < 100000 && priceRange[1] < maxProductPrice),
    onlyInStock,
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading products...</p>
        </div>
      </div>
    );
  }

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3 text-sm">Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
              selectedCategory === "all"
                ? "bg-primary/10 text-primary font-semibold"
                : "hover:bg-muted text-foreground/70"
            }`}
          >
            All Products
            <span className="float-right text-xs text-muted-foreground">
              {products.length}
            </span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                selectedCategory === cat.id
                  ? "bg-primary/10 text-primary font-semibold"
                  : "hover:bg-muted text-foreground/70"
              }`}
            >
              {cat.icon} {cat.name}
               <span className="float-right text-xs text-muted-foreground">
                {products.filter(p => p.category?.toLowerCase() === cat.idString?.toLowerCase() || p.categoryId?.toString()?.toLowerCase() === cat.id?.toString()?.toLowerCase()).length || cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3 text-sm">Price Range</h3>
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={maxProductPrice}
            value={priceRange[1] > maxProductPrice ? maxProductPrice : priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], Number(e.target.value)])
            }
            className="w-full accent-primary"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹0</span>
            <span className="font-semibold text-foreground">
              ₹{priceRange[1] > maxProductPrice ? maxProductPrice : priceRange[1]}
            </span>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="font-semibold mb-3 text-sm">Availability</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(e) => setOnlyInStock(e.target.checked)}
            className="accent-primary w-4 h-4"
          />

          <span className="text-sm">In Stock Only</span>
        </label>
      </div>

      {/* Reset */}
      {activeFiltersCount > 0 && (
        <button
          onClick={() => {
            setSelectedCategory("all");
            setPriceRange([0, 2000]);
            setOnlyInStock(false);
          }}
          className="w-full py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
        >
          Reset Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <div className="bg-card border-b border-border/60 py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Shop All Products
          </h1>
          <p className="text-muted-foreground text-sm">
            {filtered.length} products found
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Sort bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-border/60 bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all dark:text-foreground"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl text-sm border border-border/60 bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer transition-all dark:text-foreground"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border border-border/60 bg-card font-medium transition-all cursor-pointer dark:text-foreground"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-card rounded-2xl border border-border/60 p-5 sticky top-24 transition-colors duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="font-bold"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Filters
                </h2>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your filters or search query.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <ProductCard
                      product={product}
                      onNavigate={(id) => navigate("product", id)}
                      onAddToCart={onAddToCart}
                      isWishlisted={wishlist.includes(product.id)}
                      onToggleWishlist={onToggleWishlist}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setFiltersOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-card z-50 overflow-y-auto p-5 shadow-2xl transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-5">
                <h2
                  className="font-bold text-lg"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Filters
                </h2>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterPanel />
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full mt-6 py-3 rounded-2xl text-white font-semibold text-sm"
                style={{
                  background: "linear-gradient(135deg, #a61c9b, #d82a81)",
                }}
              >
                Show {filtered.length} Products
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
