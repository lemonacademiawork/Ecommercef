import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Tag,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

export function CartSidebar({
  isOpen,
  onClose,
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
  const shipping = subtotal > 499 ? 0 : 49;
  const total = subtotal - discount + shipping;

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
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2
                  className="font-bold text-lg"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  My Cart
                </h2>
                <p className="text-xs text-muted-foreground">
                  {items.reduce((s, i) => s + i.quantity, 0)} items
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <h3 className="font-semibold mb-1">Your cart is empty</h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    Add some amazing craft supplies!
                  </p>
                  <button
                    onClick={() => {
                      navigate("shop");
                      onClose();
                    }}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{
                      background: "linear-gradient(135deg, #a61c9b, #d82a81)",
                    }}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    exit={{ opacity: 0, x: 50 }}
                    className="flex gap-3 bg-muted/30 rounded-2xl p-3"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-muted"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold line-clamp-2 leading-snug mb-1">
                        {item.name}
                      </p>
                      <p className="text-sm font-bold text-primary">
                        ₹{item.price * item.quantity}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-border rounded-lg bg-white overflow-hidden">
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.id, item.quantity - 1, item.cartItemId)
                            }
                            className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.id, item.quantity + 1, item.cartItemId)
                            }
                            className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => onRemove(item.id, item.cartItemId)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-5 space-y-3">
                {/* Coupon */}
                <div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-xl text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <button
                      onClick={handleCoupon}
                      className="px-3 py-2 rounded-xl text-sm font-semibold bg-muted hover:bg-primary hover:text-white transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-destructive mt-1">
                      {couponError}
                    </p>
                  )}
                  {appliedCoupon && (
                    <p className="text-xs text-accent mt-1">
                      ✓ LEMON20 applied — 20% off!
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-accent">
                      <span>Discount (LEMON20)</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-accent">Free</span>
                      ) : (
                        `₹${shipping}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigate("checkout");
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #a61c9b, #d82a81)",
                  }}
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    navigate("shop");
                    onClose();
                  }}
                  className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
