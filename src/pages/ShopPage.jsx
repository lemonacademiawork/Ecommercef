import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { SlidersHorizontal, X, ChevronDown, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProductCard } from "../components/ProductCard";
import { api } from "../services/api";
import { SEO } from "../components/SEO";
import { BackButton } from "../components/BackButton";
import { getOptimizedImageUrl } from "../utils/cloudinary";
import { filterAndRankProducts } from "../utils/search";

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
  onSearchChange,
}) {
  const location = useLocation();
  const productsGridRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingPage, setFetchingPage] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState("popular");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery || "");
  const [isSearching, setIsSearching] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(12);

  // Sync URL search params on navigation/URL change
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const catQuery = searchParams.get("category");
    const urlSearch = searchParams.get("search") || searchParams.get("q");

    if (catQuery) {
      setSelectedCategory(catQuery);
    } else if (catQuery === null && !urlSearch) {
      // If navigating directly without query params, keep existing or default to all
    }

    if (urlSearch !== null && urlSearch !== undefined) {
      setLocalSearch(urlSearch);
      if (onSearchChange) onSearchChange(urlSearch);
    }
    setCurrentPage(0);
  }, [location.search]);

  // Sync external searchQuery prop (e.g. when user types in Navbar from header)
  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== localSearch) {
      setLocalSearch(searchQuery || "");
      setCurrentPage(0);
    }
  }, [searchQuery]);

  // Clean up search debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // Load Categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const catRes = await api.categories.listCategories();
        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Load full product catalog on mount (cached in API service for fast client-side searching across complete dataset)
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        const prodRes = await api.products.listProducts({ all: true, size: 1000 });
        if (isMounted && prodRes && Array.isArray(prodRes.data)) {
          setAllProducts(prodRes.data);
        }
      } catch (err) {
        console.error("Error loading products catalog:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
          setFetchingPage(false);
        }
      }
    }
    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeCategoryObj = useMemo(() => {
    if (selectedCategory === "all") return null;
    const selStr = String(selectedCategory).toLowerCase().trim();
    return categories.find(
      (c) =>
        String(c.id).toLowerCase() === selStr ||
        String(c.name).toLowerCase() === selStr ||
        String(c.idString || "").toLowerCase() === selStr ||
        selStr.includes(String(c.name).toLowerCase()) ||
        String(c.name).toLowerCase().includes(selStr) ||
        (c.slug && String(c.slug).toLowerCase() === selStr)
    );
  }, [categories, selectedCategory]);

  const maxProductPrice = useMemo(() => {
    if (allProducts.length === 0) return 2000;
    const maxVal = Math.max(...allProducts.map((p) => p.price || 0));
    return maxVal > 2000 ? Math.ceil(maxVal / 1000) * 1000 : 2000;
  }, [allProducts]);

  const isCatSelected = (cat) => {
    if (selectedCategory === "all") return false;
    const selStr = String(selectedCategory).toLowerCase().trim();
    const catId = String(cat.id || "").toLowerCase().trim();
    const catName = String(cat.name || "").toLowerCase().trim();
    const catIdStr = String(cat.idString || "").toLowerCase().trim();
    return selStr === catId || selStr === catName || selStr === catIdStr;
  };

  // Products matching search query across entire catalog
  const searchMatchingAll = useMemo(() => {
    if (!localSearch || !localSearch.trim()) return allProducts;
    return filterAndRankProducts(allProducts, localSearch);
  }, [allProducts, localSearch]);

  // Complete catalog filtering across search, category, price, and stock
  const filtered = useMemo(() => {
    let list = [...searchMatchingAll];

    // 2. Category filtering
    if (selectedCategory !== "all") {
      const selStr = String(selectedCategory).toLowerCase().trim();
      const activeCatName = activeCategoryObj?.name ? String(activeCategoryObj.name).toLowerCase().trim() : "";
      const activeCatId = activeCategoryObj?.id ? String(activeCategoryObj.id).toLowerCase().trim() : "";

      list = list.filter((p) => {
        const pCatId = String(p.categoryId || p.category?.id || "").toLowerCase().trim();
        const pCatName = String(p.categoryName || p.category?.name || p.category || "").toLowerCase().trim();

        if (!pCatId && !pCatName) return true;

        return (
          pCatId === selStr ||
          pCatName === selStr ||
          (activeCatId && pCatId === activeCatId) ||
          (activeCatName && pCatName === activeCatName) ||
          (selStr.length > 2 && pCatName.includes(selStr)) ||
          (activeCatName && (pCatName.includes(activeCatName) || activeCatName.includes(pCatName)))
        );
      });
    }

    // 3. Price range filtering
    list = list.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // 4. Availability filtering
    if (onlyInStock) {
      list = list.filter((p) => p.inStock);
    }

    // 5. Sorting
    if (sortBy === "price-asc") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "newest") {
      list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    } else if (sortBy === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "popular" && (!localSearch || !localSearch.trim())) {
      list.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    }

    return list;
  }, [searchMatchingAll, selectedCategory, activeCategoryObj, priceRange, onlyInStock, sortBy, localSearch]);

  const totalElem = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElem / pageSize));

  // Current page items
  const paginatedProducts = useMemo(() => {
    const startIdx = currentPage * pageSize;
    return filtered.slice(startIdx, startIdx + pageSize);
  }, [filtered, currentPage, pageSize]);

  const activeFiltersCount = [
    selectedCategory !== "all",
    priceRange[0] > 0 || (priceRange[1] < 100000 && priceRange[1] < maxProductPrice),
    onlyInStock,
  ].filter(Boolean).length;

  const handleCategorySelect = (catIdOrName) => {
    setSelectedCategory(catIdOrName);
    setCurrentPage(0);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setLocalSearch(val);
    setCurrentPage(0);
    setIsSearching(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      if (onSearchChange) onSearchChange(val);
      setIsSearching(false);
    }, 250);
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    if (onSearchChange) onSearchChange("");
    setCurrentPage(0);
    setIsSearching(false);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(0);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return;
    setCurrentPage(newPage);
    if (productsGridRef.current) {
      productsGridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPageNumbers = () => {
    const total = totalPages || 1;
    const current = currentPage;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i);
    }
    const pages = [];
    pages.push(0);
    if (current > 2) {
      pages.push("...");
    }
    const start = Math.max(1, current - 1);
    const end = Math.min(total - 2, current + 1);
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }
    if (current < total - 3) {
      pages.push("...");
    }
    if (!pages.includes(total - 1)) {
      pages.push(total - 1);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading shop products...</p>
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
            onClick={() => handleCategorySelect("all")}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
              selectedCategory === "all"
                ? "bg-primary/10 text-primary font-semibold"
                : "hover:bg-muted text-foreground/70"
            }`}
          >
            All Products
            <span className="float-right text-xs text-muted-foreground">
              {allProducts.length}
            </span>
          </button>
          {categories.map((cat) => {
            const catImg = cat.imageUrl || cat.image;
            const selected = isCatSelected(cat);
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id || cat.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                  selected
                    ? "bg-primary/10 text-primary font-semibold"
                    : "hover:bg-muted text-foreground/70"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {catImg ? (
                    <img
                      src={getOptimizedImageUrl(catImg, { width: 100 })}
                      alt={cat.name}
                      loading="lazy"
                      decoding="async"
                      className="w-5 h-5 rounded-md object-cover flex-shrink-0 border border-border/50 bg-muted"
                    />
                  ) : (
                    <span className="text-base flex-shrink-0">{cat.icon || "🛍️"}</span>
                  )}
                  <span className="truncate">{cat.name}</span>
                </div>
                {cat.count !== undefined && cat.count > 0 && (
                  <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
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
            handleCategorySelect("all");
            setPriceRange([0, 100000]);
            setOnlyInStock(false);
          }}
          className="w-full py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
        >
          Reset Filters
        </button>
      )}
    </div>
  );

  const startItem = totalElem > 0 ? currentPage * pageSize + 1 : 0;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElem);

  const catName = activeCategoryObj ? activeCategoryObj.name : (selectedCategory !== "all" ? selectedCategory : "");

  let seoTitle = "Shop Rakhi Gifts, Raksha Bandhan Gifts & Craft Supplies";
  if (catName) {
    seoTitle = `${catName} - Rakhi Gifts & Craft Supplies`;
  } else if (localSearch) {
    seoTitle = `Search results for "${localSearch}"`;
  }

  let seoDescription = `Browse unique Rakhi gifts, Rakhi gifts for brother & sister, handcrafted Rakhi gift sets, candle gifts for Rakhi, and DIY materials at Lemon House. Fast nationwide delivery.`;
  if (catName) {
    seoDescription = `Explore high-quality ${catName}, unique Rakhi gifts, and Raksha Bandhan gift ideas at Lemon House. Fast nationwide delivery.`;
  }

  const rakhiKeywords = "Rakhi gifts, Raksha Bandhan gifts, Rakhi gifts for brother, Rakhi gifts for sister, unique Rakhi gifts, Rakhi gift sets, handcrafted Rakhi gifts, candle gifts for Rakhi, Raksha Bandhan gift ideas, craft supplies, DIY materials";

  const shopBreadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://lemonhousecraft.in/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shop",
        "item": "https://lemonhousecraft.in/shop"
      },
      ...(catName ? [{
        "@type": "ListItem",
        "position": 3,
        "name": catName,
        "item": `https://lemonhousecraft.in/shop?category=${encodeURIComponent(selectedCategory)}`
      }] : [])
    ]
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={rakhiKeywords}
        schema={shopBreadcrumbSchema}
      />
      {/* Header */}
      <div className="bg-card border-b border-border/60 py-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {catName ? catName : "Shop All Products"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {totalElem} products found {totalPages > 1 ? `(Page ${currentPage + 1} of ${totalPages})` : ""}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" ref={productsGridRef}>
        {/* Sort & Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          {/* Shop Page Dedicated Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={handleSearchChange}
              placeholder="Search products (e.g. Christmas Mould, Candle, Wax)..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl text-xs sm:text-sm border border-border/80 bg-card hover:bg-muted/30 focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-foreground"
            />
            {isSearching ? (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
            ) : localSearch ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-3 justify-end">
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl text-sm border border-border/60 bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer transition-all dark:text-foreground"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border border-border/60 bg-card font-medium transition-all cursor-pointer dark:text-foreground hover:bg-muted/40"
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
        </div>

        {/* Active Search & Filters Pill Bar */}
        {(localSearch || activeFiltersCount > 0) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {localSearch && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
                <Search className="w-3.5 h-3.5" />
                <span>Search: <strong>"{localSearch}"</strong> ({totalElem} found{selectedCategory !== "all" && searchMatchingAll.length > totalElem ? ` in ${catName}, ${searchMatchingAll.length} total` : ""})</span>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="hover:text-primary/70 cursor-pointer p-0.5 rounded-full hover:bg-primary/20 transition-colors"
                  title="Clear search filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {selectedCategory !== "all" && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-foreground/80 border border-border text-xs font-medium">
                <span>Category: <strong>{catName}</strong></span>
                <button
                  type="button"
                  onClick={() => handleCategorySelect("all")}
                  className="hover:text-foreground cursor-pointer p-0.5 rounded-full hover:bg-background transition-colors"
                  title="Remove category filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {localSearch && selectedCategory !== "all" && searchMatchingAll.length > totalElem && (
              <button
                type="button"
                onClick={() => handleCategorySelect("all")}
                className="text-xs px-2.5 py-1 rounded-full bg-primary/5 hover:bg-primary/15 text-primary border border-primary/20 transition-colors cursor-pointer font-medium"
              >
                View all {searchMatchingAll.length} results in All Categories
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                handleClearSearch();
                handleCategorySelect("all");
                setPriceRange([0, 100000]);
                setOnlyInStock(false);
              }}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 ml-1 cursor-pointer transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

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

          {/* Products Grid + Pagination Container */}
          <div className="flex-1 min-w-0 relative">
            {fetchingPage && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
                <div className="bg-card px-4 py-3 rounded-2xl border border-border shadow-lg flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                  <span className="text-sm font-medium">Loading products...</span>
                </div>
              </div>
            )}

            {paginatedProducts.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border border-border/60 p-6">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">
                  {localSearch
                    ? (selectedCategory !== "all" && searchMatchingAll.length > 0
                        ? `No products found for "${localSearch}" in ${catName}`
                        : `No products found matching "${localSearch}"`)
                    : "No products found"}
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                  {localSearch
                    ? (selectedCategory !== "all" && searchMatchingAll.length > 0
                        ? `We found ${searchMatchingAll.length} product${searchMatchingAll.length === 1 ? "" : "s"} matching "${localSearch}" in other categories. Click below to view all results.`
                        : "We couldn't find any products matching your search. Try checking your spelling or using more general terms like 'Christmas', 'Mould', 'Candle', 'Wax', 'Fragrance', or 'Tools'.")
                    : "Try adjusting your category or filter selections to find what you're looking for."}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {localSearch && selectedCategory !== "all" && searchMatchingAll.length > 0 && (
                    <button
                      onClick={() => handleCategorySelect("all")}
                      className="px-4 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      Search All Categories ({searchMatchingAll.length} found)
                    </button>
                  )}
                  {localSearch && (
                    <button
                      onClick={handleClearSearch}
                      className="px-4 py-2.5 bg-primary/10 text-primary border border-primary/20 text-xs font-semibold rounded-xl hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      Clear Search
                    </button>
                  )}
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={() => {
                        handleCategorySelect("all");
                        setPriceRange([0, 100000]);
                        setOnlyInStock(false);
                      }}
                      className="px-4 py-2.5 border border-border text-xs font-semibold rounded-xl hover:bg-muted transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedProducts.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                      Showing <span className="font-semibold text-foreground">{startItem}</span> – <span className="font-semibold text-foreground">{endItem}</span> of <span className="font-semibold text-foreground">{totalElem}</span> products
                    </p>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0 || fetchingPage}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border border-border/60 bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden xs:inline">Prev</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, idx) => {
                          if (page === "...") {
                            return (
                              <span key={`ellipsis-${idx}`} className="px-2 text-xs text-muted-foreground">
                                ...
                              </span>
                            );
                          }
                          const isCurrent = page === currentPage;
                          return (
                            <button
                              key={`page-${page}`}
                              onClick={() => handlePageChange(page)}
                              disabled={fetchingPage}
                              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                                isCurrent
                                  ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                                  : "bg-card border border-border/60 hover:bg-muted text-foreground/80"
                              }`}
                            >
                              {page + 1}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= (totalPages - 1) || fetchingPage}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border border-border/60 bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <span className="hidden xs:inline">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
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
                Show Products
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
