import { useState } from "react";
import { Heart, ShoppingCart, Zap, Star, ChevronLeft, ChevronRight, Minus, Plus, Shield, Truck, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PRODUCTS, REVIEWS, Product } from "../data";
import { ProductCard } from "./ProductCard";

type Page = 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'dashboard' | 'admin' | 'login' | 'register' | 'about' | 'contact';

type ProductDetailProps = {
  productId: string;
  navigate: (page: Page, productId?: string) => void;
  onAddToCart: (product: Product, qty?: number) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
};

export function ProductDetailPage({ productId, navigate, onAddToCart, wishlist, onToggleWishlist }: ProductDetailProps) {
  const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'materials' | 'reviews'>('description');
  const [addedToCart, setAddedToCart] = useState(false);

  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: '#FFFDF7' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('shop')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </button>

        {/* Main Product */}
        <div className="grid lg:grid-cols-2 gap-10 mb-16">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-border group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={product.images[selectedImage] || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.isBestSeller && (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full text-white" style={{ background: '#D81B8A' }}>Best Seller</span>
                )}
                {product.isNew && (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full text-white" style={{ background: '#2E7D32' }}>New</span>
                )}
                {product.discount && (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full" style={{ background: '#FFD54F', color: '#1a1a2e' }}>
                    Save {product.discount}%
                  </span>
                )}
              </div>

              {/* Wishlist */}
              <button
                onClick={() => onToggleWishlist(product.id)}
                className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  wishlist.includes(product.id) ? 'bg-primary text-white' : 'bg-white/90 text-foreground hover:bg-primary hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-primary' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-sm text-muted-foreground capitalize mb-2">{product.category.replace('-', ' ')}</p>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'text-secondary fill-current' : 'text-muted-foreground'}`} />
                ))}
                <span className="text-sm font-semibold ml-1">{product.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {product.inStock ? '✓ In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
              <span className="text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>₹{product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice}</span>
                  <span className="px-2.5 py-1 rounded-full text-sm font-semibold" style={{ background: '#FFD54F', color: '#1a1a2e' }}>
                    Save ₹{product.originalPrice - product.price}
                  </span>
                </>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-5">
              <label className="text-sm font-semibold mb-2 block">Quantity</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">Total: <strong className="text-foreground">₹{product.price * quantity}</strong></span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all ${
                  addedToCart ? 'bg-accent text-white' : 'text-white hover:opacity-90'
                }`}
                style={!addedToCart ? { background: 'linear-gradient(135deg, #D81B8A, #e91ea0)' } : {}}
              >
                <ShoppingCart className="w-4 h-4" />
                {addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
              </motion.button>
              <button
                onClick={() => { onAddToCart(product, quantity); navigate('checkout'); }}
                disabled={!product.inStock}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm border-2 border-primary text-primary hover:bg-primary/5 transition-all"
              >
                <Zap className="w-4 h-4" /> Buy Now
              </button>
            </div>

            {/* Delivery Info */}
            <div className="space-y-2.5 mb-6 bg-white rounded-2xl border border-border p-4">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Free delivery on orders above <strong>₹499</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                <span>7-day easy returns & exchange</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden mb-12">
          <div className="flex border-b border-border">
            {(['description', 'materials', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold capitalize transition-all relative ${
                  activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'reviews' ? `Reviews (${product.reviews})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <p className="text-foreground/70 leading-relaxed">{product.description}</p>
            )}
            {activeTab === 'materials' && (
              <ul className="space-y-2">
                {product.materials.map((m, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {m}
                  </li>
                ))}
              </ul>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-5">
                {REVIEWS.slice(0, 3).map(review => (
                  <div key={review.id} className="flex gap-4 pb-5 border-b border-border last:border-0">
                    <img src={review.avatar} alt={review.author} className="w-10 h-10 rounded-full object-cover flex-shrink-0 bg-muted" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{review.author}</span>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                      <div className="flex mb-2">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-secondary fill-current' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-foreground/70">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onNavigate={(id) => navigate('product', id)}
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
