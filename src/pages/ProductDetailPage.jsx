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
  Share2,
  Copy,
  MessageCircle,
  CheckCircle,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { REVIEWS } from "../data";
import { ProductCard } from "../components/ProductCard";
import { api } from "../services/api";
import { handleShareProduct, handleWhatsAppShare, handleCopyShareLink } from "../utils/share";
import { ReviewModal } from "../components/ReviewModal";
import {
  getProductRatingSummary,
  findCustomerDeliveredOrderForProduct,
  isOrderItemReviewed,
  getOrderItemReview,
} from "../services/reviewService";


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
  user,
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

  // Reviews state
  const [reviewsSummary, setReviewsSummary] = useState(null);
  const [customerDeliveredMatch, setCustomerDeliveredMatch] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const refreshReviews = () => {
    if (!productId) return;
    const summary = getProductRatingSummary(productId);
    setReviewsSummary(summary);
  };


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

          // Load reviews summary
          refreshReviews();

          // Check if customer has a delivered order for this product
          try {
            let customerOrders = [];
            const ordersRes = await api.orders.getOrders();
            if (ordersRes && ordersRes.success && ordersRes.data) {
              customerOrders = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data.content || []);
            }
            const localOrders = JSON.parse(localStorage.getItem("localOrders") || "[]");
            const allOrders = [...localOrders, ...customerOrders];
            const match = findCustomerDeliveredOrderForProduct(productId, allOrders);
            setCustomerDeliveredMatch(match);
          } catch (e) {
            // fallback local orders
            const localOrders = JSON.parse(localStorage.getItem("localOrders") || "[]");
            const match = findCustomerDeliveredOrderForProduct(productId, localOrders);
            setCustomerDeliveredMatch(match);
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
  }, [productId, user]);

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

              {/* Share & Wishlist */}
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                <button
                  type="button"
                  onClick={() => handleShareProduct(product)}
                  title="Share Product"
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 text-foreground hover:bg-primary hover:text-white transition-all shadow-md cursor-pointer hover:scale-105"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => onToggleWishlist(product.id)}
                  title="Add to Wishlist"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer hover:scale-105 ${wishlist.includes(product.id)
                    ? "bg-primary text-white"
                    : "bg-white/90 text-foreground hover:bg-primary hover:text-white"
                    }`}
                >
                  <Heart
                    className={`w-5 h-5 ${wishlist.includes(product.id) ? "fill-current" : ""}`}
                  />
                </button>
              </div>
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
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                {product.category && !/^[0-9a-fA-F-]{36}$/.test(product.category) && (
                  <p className="text-sm text-muted-foreground capitalize mb-1">
                    {product.category.replace("-", " ")}
                  </p>
                )}
                <h1
                  className="text-2xl sm:text-3xl font-bold leading-tight"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {product.name}
                </h1>
              </div>
              <button
                type="button"
                onClick={() => handleShareProduct(product)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20 shrink-0 cursor-pointer shadow-sm"
                title="Share Product"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(reviewsSummary?.average || product.rating || 4.8) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
                  />
                ))}
                <span className="text-sm font-bold ml-1">
                  {reviewsSummary?.average || product.rating || 4.8}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({reviewsSummary?.count ?? product.reviews ?? 0} reviews)
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

            {/* Share Product Widget */}
            <div className="mb-6 p-4 rounded-2xl bg-muted/40 border border-border/60">
              <p className="text-xs font-semibold text-foreground mb-2.5 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-primary" /> Share Product with Friends:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleWhatsAppShare(product)}
                  className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-all border border-[#25D366]/30 cursor-pointer shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyShareLink(product)}
                  className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-card hover:bg-muted text-foreground transition-all border border-border cursor-pointer shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Copy Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleShareProduct(product)}
                  className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
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

        {/* Customer Reviews Section */}
        <div className="mb-16 bg-card rounded-3xl border border-border/60 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-border/60">
            <div>
              <h2
                className="text-2xl font-bold text-foreground"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Customer Reviews & Ratings
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Real feedback from verified craft buyers
              </p>
            </div>

            {/* Verified buyer prompt / action */}
            {customerDeliveredMatch && (
              <div>
                {isOrderItemReviewed(customerDeliveredMatch.order.id, product.id) ? (
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                    <CheckCircle className="w-4 h-4 text-amber-500" />
                    You reviewed this product
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(true)}
                    className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md hover:opacity-90 transition-all cursor-pointer flex items-center gap-2"
                    style={{ background: "linear-gradient(135deg, #a61c9b, #d82a81)" }}
                  >
                    <Star className="w-4 h-4 fill-white text-white" />
                    Write a Review
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Delivery Review Banner for Verified Buyers */}
          {customerDeliveredMatch && !isOrderItemReviewed(customerDeliveredMatch.order.id, product.id) && (
            <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 border border-primary/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">You purchased & received this product!</h4>
                  <p className="text-xs text-muted-foreground">Order #{customerDeliveredMatch.order.id} • Help fellow crafters by leaving a review</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all cursor-pointer"
                style={{ background: "linear-gradient(135deg, #a61c9b, #d82a81)" }}
              >
                Write Review
              </button>
            </div>
          )}

          {/* Overall Rating & Breakdown Grid */}
          <div className="grid md:grid-cols-12 gap-8 mb-10 items-center bg-muted/20 p-6 rounded-2xl border border-border/40">
            {/* Rating score summary */}
            <div className="md:col-span-4 text-center md:border-r md:border-border/60 pr-0 md:pr-6">
              <div className="text-5xl font-black text-foreground tracking-tight mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                {reviewsSummary?.average || 4.8}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${
                      s <= Math.round(reviewsSummary?.average || 4.8)
                        ? "text-amber-400 fill-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs font-medium text-muted-foreground">
                Based on {reviewsSummary?.count || 0} customer reviews
              </p>
            </div>

            {/* Rating percentage bars */}
            <div className="md:col-span-8 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const pct = reviewsSummary?.breakdown?.[star] || (star === 5 ? 85 : star === 4 ? 15 : 0);
                return (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <span className="w-12 font-semibold text-muted-foreground flex items-center gap-1">
                      {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-muted/80 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: star >= 4 ? "linear-gradient(90deg, #f59e0b, #d82a81)" : "#9ca3af",
                        }}
                      />
                    </div>
                    <span className="w-10 text-right font-medium text-muted-foreground">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review List */}
          <div className="space-y-4">
            {(!reviewsSummary?.reviews || reviewsSummary.reviews.length === 0) ? (
              <div className="text-center py-10 bg-muted/10 rounded-2xl border border-dashed border-border/80">
                <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">No reviews yet</p>
                <p className="text-xs text-muted-foreground mt-0.5">Be the first verified customer to leave a review after receiving your order!</p>
              </div>
            ) : (
              reviewsSummary.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-card p-5 rounded-2xl border border-border/60 hover:border-primary/30 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(rev.author)}`}
                        alt={rev.author}
                        className="w-10 h-10 rounded-full object-cover border border-border bg-muted"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">{rev.author}</h4>
                          {rev.verifiedPurchase && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3 text-green-600" /> Verified Buyer
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">{rev.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= (rev.rating || 5)
                              ? "text-amber-400 fill-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-foreground/80 leading-relaxed pl-13">
                    {rev.comment}
                  </p>
                </div>
              ))
            )}
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

        {/* Review Modal for Verified Buyer */}
        {customerDeliveredMatch && (
          <ReviewModal
            isOpen={reviewModalOpen}
            onClose={() => setReviewModalOpen(false)}
            product={product}
            orderId={customerDeliveredMatch.order.id}
            user={user}
            onReviewSubmitted={() => {
              refreshReviews();
            }}
          />
        )}
      </div>
    </div>
  );
}
