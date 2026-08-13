import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Tag } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { SEO } from "../components/SEO";
import { BackButton } from "../components/BackButton";

export function CartPage({
  items,
  onUpdateQuantity,
  onRemove,
  navigate,
}) {
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = appliedCoupon === "LEMON20" ? Math.round(subtotal * 0.2) : 0;
  const total = subtotal - discount;

  const handleCoupon = () => {
    if (coupon.trim().toUpperCase() === "LEMON20") {
      setAppliedCoupon("LEMON20");
      setCoupon("");
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code. Try LEMON20");
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 py-10">
      <SEO
        title="Shopping Cart"
        description="Review your selected craft supplies, DIY materials, and creative tools in your shopping cart at Lemon House before proceeding to secure checkout."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <BackButton label="Back to Shop" fallbackPath="/shop" />
        </div>
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-foreground mb-2"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Shopping Cart
          </h1>
          <p className="text-sm text-muted-foreground">
            {items.reduce((sum, item) => sum + item.quantity, 0)} items in your cart
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-card rounded-3xl border border-border/60 p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-20 h-20 bg-muted/60 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Looks like you haven't added any craft supplies to your cart yet. Explore our latest arrivals and best sellers!
            </p>
            <button
              onClick={() => navigate("shop")}
              className="px-8 py-3.5 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90 shadow-lg shadow-primary/20"
              style={{
                background: "linear-gradient(135deg, #a61c9b, #d82a81)",
              }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const itemKey = item.cartItemId || item.uniqueKey || `${item.id}-${item.variantId || ''}`;
                const cartItemId = item.cartItemId || item.uniqueKey;
                return (
                  <motion.div
                    key={itemKey}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-card rounded-2xl p-4 border border-border/60 flex flex-col sm:flex-row items-center gap-4 shadow-sm"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      className="w-24 h-24 rounded-xl object-cover flex-shrink-0 bg-muted"
                    />

                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <h3 className="font-semibold text-base text-foreground line-clamp-1 mb-1">
                        {item.name}
                      </h3>
                      {item.variantName && (
                        <p className="text-xs text-muted-foreground mb-1">
                          Option: <span className="font-medium text-foreground">{item.variantName}</span>
                        </p>
                      )}
                      <p className="text-sm font-bold text-primary mb-3 sm:mb-0">
                        ₹{item.price} each
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-border/60 rounded-xl overflow-hidden bg-muted/30">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1, cartItemId)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1, cartItemId)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <p className="font-bold text-base text-foreground">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>

                      <button
                        onClick={() => onRemove(item.id, cartItemId)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-xl hover:bg-muted"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div className="bg-card rounded-2xl border border-border/60 p-6 space-y-6 shadow-sm sticky top-24">
              <h2 className="font-bold text-lg text-foreground border-b border-border/60 pb-3">
                Order Summary
              </h2>

              {/* Coupon */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">
                  Have a Promo Code?
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="e.g. LEMON20"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <button
                    onClick={handleCoupon}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-muted hover:bg-primary hover:text-white transition-all cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-destructive mt-1.5">{couponError}</p>
                )}
                {appliedCoupon && (
                  <p className="text-xs text-emerald-600 font-medium mt-1.5">
                    ✓ LEMON20 applied — 20% off!
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 text-sm border-t border-border/60 pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount (LEMON20)</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-medium">
                    {total >= 25000 ? "FREE" : "Calculated at checkout"}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-border/60 text-foreground">
                  <span>Total</span>
                  <span className="text-primary">₹{total}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("checkout")}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-semibold text-base transition-all hover:opacity-90 shadow-lg shadow-primary/20 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #a61c9b, #d82a81)",
                }}
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate("shop")}
                className="w-full py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-center block"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
