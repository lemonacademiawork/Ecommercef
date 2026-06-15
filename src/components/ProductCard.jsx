import { useState } from "react";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";

export function ProductCard({
  product,
  onNavigate,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist,
}) {
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => onNavigate(product.id)}
      className="bg-white rounded-2xl overflow-hidden border border-border cursor-pointer group shadow-sm hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isBestSeller && (
            <span
              className="px-2 py-0.5 text-xs font-semibold rounded-full text-white"
              style={{ background: "#D81B8A" }}
            >
              Best Seller
            </span>
          )}
          {product.isNew && (
            <span
              className="px-2 py-0.5 text-xs font-semibold rounded-full text-white"
              style={{ background: "#2E7D32" }}
            >
              New
            </span>
          )}
          {product.discount && (
            <span
              className="px-2 py-0.5 text-xs font-semibold rounded-full"
              style={{ background: "#FFD54F", color: "#1a1a2e" }}
            >
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.(product.id);
          }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isWishlisted
              ? "bg-primary text-white"
              : "bg-white/90 text-muted-foreground hover:bg-primary hover:text-white"
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="px-3 py-1.5 bg-foreground/80 text-white text-xs font-semibold rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-muted-foreground capitalize mb-1">
          {product.category}
        </p>
        <h3 className="text-sm font-semibold line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3 h-3 ${s <= Math.round(product.rating) ? "text-secondary fill-current" : "text-muted-foreground"}`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-base font-bold text-foreground">
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through ml-1.5">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              added
                ? "bg-accent text-white"
                : product.inStock
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {added ? (
              <>✓ Added</>
            ) : (
              <>
                <ShoppingCart className="w-3 h-3" /> Add
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
