import { REVIEWS } from "../data";

const REVIEWS_STORAGE_KEY = "lemon_product_reviews";

// Helper to get all custom reviews from localStorage
export const getCustomReviews = () => {
  try {
    const data = localStorage.getItem(REVIEWS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Failed to load reviews from localStorage:", err);
    return [];
  }
};

// Helper to save custom reviews to localStorage
export const saveCustomReviews = (reviews) => {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch (err) {
    console.error("Failed to save reviews to localStorage:", err);
  }
};

/**
 * Get all reviews for a specific product ID
 * Combines initial static sample reviews with customer-submitted reviews from localStorage
 */
export const getReviewsForProduct = (productId) => {
  const customReviews = getCustomReviews();
  const productCustomReviews = customReviews.filter(
    (r) => String(r.productId) === String(productId)
  );

  // Default sample reviews mapping for fallback items
  const initialSampleReviews = (REVIEWS || []).map((r, index) => ({
    id: `sample-${index}`,
    productId: productId, // apply as generic samples for demo if needed
    author: r.author,
    avatar: r.avatar,
    rating: r.rating || 5,
    comment: r.comment,
    date: r.date || "1 week ago",
    verifiedPurchase: true,
    isSample: true,
  }));

  // Filter sample reviews if product has custom reviews or combine
  const combined = [...productCustomReviews];
  
  // If product has no user reviews yet, provide sample reviews mapped to product context
  if (combined.length === 0) {
    return initialSampleReviews.slice(0, 3);
  }

  return combined;
};

/**
 * Submit a new review for a product from a delivered order
 */
export const submitProductReview = ({ productId, orderId, rating, comment, user, productName, productImg }) => {
  const customReviews = getCustomReviews();

  const newReview = {
    id: `rev-${Date.now()}`,
    productId: String(productId),
    orderId: String(orderId || ""),
    userId: user?.id || user?.email || "anonymous",
    author: user?.name || user?.fullName || "Verified Customer",
    avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || "Customer")}`,
    rating: Number(rating) || 5,
    comment: comment.trim(),
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    verifiedPurchase: true,
    productName: productName || "",
    productImg: productImg || "",
    createdAt: new Date().toISOString(),
  };

  const updatedReviews = [newReview, ...customReviews];
  saveCustomReviews(updatedReviews);
  return newReview;
};

/**
 * Check if a specific item in an order has already been reviewed
 */
export const isOrderItemReviewed = (orderId, productId) => {
  if (!orderId || !productId) return false;
  const customReviews = getCustomReviews();
  return customReviews.some(
    (r) => String(r.orderId) === String(orderId) && String(r.productId) === String(productId)
  );
};

/**
 * Get review submitted for a specific order & product item if exists
 */
export const getOrderItemReview = (orderId, productId) => {
  if (!orderId || !productId) return null;
  const customReviews = getCustomReviews();
  return customReviews.find(
    (r) => String(r.orderId) === String(orderId) && String(r.productId) === String(productId)
  ) || null;
};

/**
 * Calculate average rating and breakdown for a product
 */
export const getProductRatingSummary = (productId) => {
  const reviews = getReviewsForProduct(productId);
  if (reviews.length === 0) {
    return {
      average: 4.8,
      count: 0,
      breakdown: { 5: 100, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const total = reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
  const average = Number((total / reviews.length).toFixed(1));

  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
    counts[star] = (counts[star] || 0) + 1;
  });

  const breakdown = {};
  Object.keys(counts).forEach((star) => {
    breakdown[star] = Math.round((counts[star] / reviews.length) * 100);
  });

  return {
    average,
    count: reviews.length,
    breakdown,
    reviews,
  };
};

/**
 * Find if customer has any delivered order containing the product
 */
export const findCustomerDeliveredOrderForProduct = (productId, orders = []) => {
  if (!productId || !orders || orders.length === 0) return null;

  for (const order of orders) {
    const status = (order.status || order.orderStatus || "").toLowerCase();
    if (status === "delivered") {
      const items = order.items || order.orderItems || [];
      const match = items.find((item) => {
        const itemPid = item.productId || item.product?.id || item.id;
        return String(itemPid) === String(productId);
      });
      if (match) {
        return { order, item: match };
      }
    }
  }

  return null;
};
