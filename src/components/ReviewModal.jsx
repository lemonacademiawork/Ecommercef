import { useState } from "react";
import { Star, X, CheckCircle, Package } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { submitProductReview } from "../services/reviewService";

const RATING_LABELS = {
  1: "1 Star - Poor",
  2: "2 Stars - Fair",
  3: "3 Stars - Good",
  4: "4 Stars - Very Good",
  5: "5 Stars - Excellent",
};

export function ReviewModal({ isOpen, onClose, product, orderId, user, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const activeRating = hoverRating || rating;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please write a short review comment.");
      return;
    }

    setIsSubmitting(true);

    try {
      const newReview = submitProductReview({
        productId: product.id || product.productId,
        orderId: orderId || product.orderId || "",
        rating,
        comment,
        user,
        productName: product.name || product.productName,
        productImg: product.image || product.imageUrl || product.productImage,
      });

      toast.success("Thank you! Your review has been submitted.", {
        icon: "🌟",
      });

      if (onReviewSubmitted) {
        onReviewSubmitted(newReview);
      }

      // Reset & close
      setComment("");
      setRating(5);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-card rounded-3xl border border-border/80 shadow-2xl overflow-hidden p-6 sm:p-7"
          style={{ background: "#FFFDF7" }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-5 pr-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 mb-2">
              <CheckCircle className="w-3.5 h-3.5" /> Verified Purchase
            </span>
            <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>
              Write a Product Review
            </h3>
            {orderId && (
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-primary" /> Order #{orderId}
              </p>
            )}
          </div>

          {/* Product Summary */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-muted/40 border border-border/60 mb-5">
            <img
              src={product.image || product.imageUrl || product.productImage || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop&auto=format"}
              alt={product.name || product.productName}
              className="w-14 h-14 object-cover rounded-xl border border-border/60"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground truncate">
                {product.name || product.productName}
              </h4>
              {product.price && (
                <p className="text-xs font-bold text-primary mt-0.5">
                  ₹{product.price}
                </p>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Rating Stars */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Your Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-amber-400 hover:scale-115 transition-transform cursor-pointer focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= activeRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold text-amber-600 mt-1.5 h-4">
                {RATING_LABELS[activeRating]}
              </p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Review Details
              </label>
              <textarea
                rows={4}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like or dislike about this product? How was the quality, packaging, or usability?"
                className="w-full px-4 py-3 rounded-2xl border border-border/80 bg-white text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/60 resize-none shadow-inner"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #a61c9b, #d82a81)" }}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
