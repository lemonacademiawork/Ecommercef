import { useState, useEffect } from "react";
import {
  Heart,
  ShoppingCart,
  Zap,
  Star,
  Minus,
  Plus,
  Shield,
  Truck,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { REVIEWS } from "../data";
import { ProductCard } from "../components/ProductCard";
import { api } from "../services/api";

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export function ProductDetailPage({
  productId,
  navigate,
  onAddToCart,
  wishlist,
  onToggleWishlist,
}) {
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [addedToCart, setAddedToCart] = useState(false);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loadingVariants, setLoadingVariants] = useState(false);

  const handleNextImage = () => {
    if (!product || !product.images || product.images.length <= 1) return;
    setDirection(1);
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const handlePrevImage = () => {
    if (!product || !product.images || product.images.length <= 1) return;
    setDirection(-1);
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await api.products.getProduct(productId);
        if (res.success && res.data) {
          setProduct(res.data);
          setSelectedImage(0); // reset image index

          const isVariable = Boolean(
            res.data.hasVariants || 
            res.data.has_variants || 
            (Array.isArray(res.data.variants) && res.data.variants.length > 0)
          );

          setLoadingVariants(true);
          try {
            let activeVars = [];
            if (Array.isArray(res.data.variants) && res.data.variants.length > 0) {
              activeVars = res.data.variants.filter(v => v && (v.status === "ACTIVE" || v.status === true || v.active === true || v.status === undefined || v.status === null));
            }

            if (activeVars.length === 0) {
              const varRes = await api.products.getVariants(productId);
              const rawVars = Array.isArray(varRes) ? varRes : (varRes?.data || []);
              activeVars = rawVars.filter(v => v && (v.status === "ACTIVE" || v.status === true || v.active === true || v.status === undefined || v.status === null));
            }

            if (activeVars.length === 0) {
              try {
                const adminVarRes = await api.admin.getVariants(productId);
                const rawAdminVars = Array.isArray(adminVarRes) ? adminVarRes : (adminVarRes?.data || []);
                activeVars = rawAdminVars.filter(v => v && (v.status === "ACTIVE" || v.status === true || v.active === true || v.status === undefined || v.status === null));
              } catch (adminErr) {
                console.error("Admin variant fallback check:", adminErr);
              }
            }

            setVariants(activeVars);
            if (activeVars.length > 0) {
              setSelectedVariant(activeVars[0]);
            } else {
              setSelectedVariant(null);
            }
          } catch (varErr) {
            console.error("Error loading variants:", varErr);
          } finally {
            setLoadingVariants(false);
          }

          // load related products
          const relatedRes = await api.products.listProducts();
          if (relatedRes.success && relatedRes.data) {
            const rel = relatedRes.data.filter(
              (p) => (p.category === res.data.category || p.categoryId === res.data.categoryId) && p.id !== res.data.id
            ).slice(0, 4);
            setRelated(rel);
          }
        }
      } catch (err) {
        console.error("Error loading product detail:", err);
      } finally {
        setLoading(false);
      }
    }
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedVariant?.id);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF7] p-6">
        <p className="text-lg font-semibold text-muted-foreground mb-4">Product not found</p>
        <button
          onClick={() => navigate("shop")}
          className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
          style={{ background: "linear-gradient(135deg, #a61c9b, #d82a81)" }}
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const productImages = (product && Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : [product?.image || product?.imageUrl || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop&auto=format"];

  const currentPrice = selectedVariant 
    ? (selectedVariant.discountedPrice || selectedVariant.price) 
    : product.price;

  const currentOriginalPrice = selectedVariant 
    ? (selectedVariant.discountedPrice ? selectedVariant.price : null) 
    : product.originalPrice;

  const isStockAvailable = selectedVariant 
    ? (selectedVariant.stock > 0) 
    : product.inStock;


  return (
    <div className="min-h-screen" style={{ background: "#FFFDF7" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate("shop")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </button>

        {/* Main Product */}
        <div className="grid lg:grid-cols-2 gap-10 mb-16">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-border/60 group transition-colors duration-300">
              <div className="w-full h-full relative overflow-hidden">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.img
                    key={selectedImage}
                    src={productImages[selectedImage] || productImages[0]}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
              </div>

              {/* Navigation Arrows */}
              {productImages && productImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-foreground flex items-center justify-center shadow-md transition-all z-10 hover:scale-105 cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-foreground flex items-center justify-center shadow-md transition-all z-10 hover:scale-105 cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Dots / Indicators */}
              {productImages && productImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {productImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setDirection(i > selectedImage ? 1 : -1);
                        setSelectedImage(i);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${selectedImage === i ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80"
                        }`}
                    />
                  ))}
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {product.isBestSeller && (
                  <span
                    className="px-2.5 py-1 text-xs font-semibold rounded-full text-white"
                    style={{ background: "#a61c9b" }}
                  >
                    Best Seller
                  </span>
                )}
                {product.isNew && (
                  <span
                    className="px-2.5 py-1 text-xs font-semibold rounded-full text-white"
                    style={{ background: "#2E7D32" }}
                  >
                    New
                  </span>
                )}
                {product.discount && (
                  <span
                    className="px-2.5 py-1 text-xs font-semibold rounded-full"
                    style={{ background: "#FFD54F", color: "#1a1a2e" }}
                  >
                    Save {product.discount}%
                  </span>
                )}
              </div>

              {/* Wishlist */}
              <button
                onClick={() => onToggleWishlist(product.id)}
                className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 ${wishlist.includes(product.id)
                  ? "bg-primary text-white"
                  : "bg-white/90 text-foreground hover:bg-primary hover:text-white"
                  }`}
              >
                <Heart
                  className={`w-5 h-5 ${wishlist.includes(product.id) ? "fill-current" : ""}`}
                />
              </button>
            </div>

            {/* Thumbnails */}
            {productImages && productImages.length > 1 && (
              <div className="flex gap-2">
                {productImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setDirection(i > selectedImage ? 1 : -1);
                      setSelectedImage(i);
                    }}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i
                      ? "border-primary"
                      : "border-border hover:border-primary/50"
                      }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.category && !/^[0-9a-fA-F-]{36}$/.test(product.category) && (
              <p className="text-sm text-muted-foreground capitalize mb-2">
                {product.category.replace("-", " ")}
              </p>
            )}
            <h1
              className="text-2xl sm:text-3xl font-bold mb-3 leading-tight"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(product.rating) ? "text-secondary fill-current" : "text-muted-foreground"}`}
                  />
                ))}
                <span className="text-sm font-semibold ml-1">
                  {product.rating}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.reviews} reviews)
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isStockAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
              >
                {isStockAvailable ? "✓ In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
              <span
                className="text-3xl font-bold"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                ₹{currentPrice}
              </span>
              {currentOriginalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{currentOriginalPrice}
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-full text-sm font-semibold"
                    style={{ background: "#FFD54F", color: "#1a1a2e" }}
                  >
                    Save ₹{currentOriginalPrice - currentPrice}
                  </span>
                </>
              )}
            </div>

            {/* Variants Selector */}
            {(loadingVariants || variants.length > 0 || product.hasVariants || product.has_variants) && (
              <div className="mb-6">
                <label className="text-sm font-semibold mb-2.5 block text-foreground">
                  Select Variant / Option
                </label>
                {loadingVariants ? (
                  <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                    <span>Loading options...</span>
                  </div>
                ) : variants.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v, idx) => {
                      const vTitle = v.variantName || v.name || v.title || v.sku || `Option ${idx + 1}`;
                      const vPrice = v.discountedPrice || v.price || v.variantPrice || 0;
                      const isSelected = selectedVariant?.id ? selectedVariant.id === v.id : selectedVariant === v;
                      return (
                        <button
                          key={v.id || idx}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/20 font-bold"
                              : "border-border hover:border-primary/50 text-muted-foreground bg-card"
                          }`}
                        >
                          {vTitle} <span className="font-bold text-foreground font-mono ml-1">₹{vPrice}</span>
                          {v.stock !== undefined && Number(v.stock) <= 0 && (
                            <span className="text-[10px] text-destructive block mt-0.5 font-normal">Out of Stock</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    No variants configured for this product yet.
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-5">
              <label className="text-sm font-semibold mb-2 block">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border/60 rounded-xl overflow-hidden bg-card">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  Total:{" "}
                  <strong className="text-foreground">
                    ₹{currentPrice * quantity}
                  </strong>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={!isStockAvailable}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all ${addedToCart
                  ? "bg-accent text-white"
                  : isStockAvailable
                    ? "text-white hover:opacity-90 cursor-pointer"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                style={
                  !addedToCart && isStockAvailable
                    ? {
                      background: "linear-gradient(135deg, #a61c9b, #d82a81)",
                    }
                    : {}
                }
              >
                <ShoppingCart className="w-4 h-4" />
                {addedToCart ? "✓ Added to Cart!" : "Add to Cart"}
              </motion.button>
              <button
                onClick={() => {
                  onAddToCart(product, quantity, selectedVariant?.id);
                  navigate("checkout");
                }}
                disabled={!isStockAvailable}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm border-2 transition-all ${
                  isStockAvailable
                    ? "border-primary text-primary hover:bg-primary/5 cursor-pointer"
                    : "border-muted text-muted-foreground bg-muted/20 cursor-not-allowed"
                }`}
              >
                <Zap className="w-4 h-4" /> Buy Now
              </button>
            </div>


            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Description & Specifications */}
            <div className="bg-card rounded-2xl border border-border/60 p-5 transition-colors duration-300">
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Description
                </h3>
                <p className="text-foreground/70 leading-relaxed whitespace-pre-line text-xs">
                  {product.description}
                </p>
                {(product.weight || product.length || product.breadth || product.height) && (
                  <div className="pt-4 border-t border-border/60">
                    <h4 className="font-bold text-xs mb-2 text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>
                      Product Specifications
                    </h4>
                    <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3 rounded-xl text-[10px]">
                      {product.weight ? (
                        <div>
                          <span className="text-muted-foreground block mb-0.5">Weight</span>
                          <span className="font-semibold text-foreground">{product.weight} g</span>
                        </div>
                      ) : null}
                      {product.length ? (
                        <div>
                          <span className="text-muted-foreground block mb-0.5">Length</span>
                          <span className="font-semibold text-foreground">{product.length} cm</span>
                        </div>
                      ) : null}
                      {product.breadth ? (
                        <div>
                          <span className="text-muted-foreground block mb-0.5">Breadth</span>
                          <span className="font-semibold text-foreground">{product.breadth} cm</span>
                        </div>
                      ) : null}
                      {product.height ? (
                        <div>
                          <span className="text-muted-foreground block mb-0.5">Height</span>
                          <span className="font-semibold text-foreground">{product.height} cm</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2
              className="text-2xl font-bold mb-6"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Related Products
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p) => (
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
        )}
      </div>
    </div>
  );
}
