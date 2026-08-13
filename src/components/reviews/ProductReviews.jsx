import { useState, useEffect } from "react";
import { RatingSummary } from "./RatingSummary";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { ReviewImageViewer } from "./ReviewImageViewer";
import { DeleteReviewDialog } from "./DeleteReviewDialog";
import { MessageSquarePlus, ChevronDown, Loader2, Sparkles, AlertCircle, ShoppingBag } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "sonner";

export function ProductReviews({
  productId,
  productSummary = {},
  onUpdateProductSummary = () => {},
  navigate = () => {},
  user = null,
  isLoggedIn = false,
  isAdmin = false,
}) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState("latest");
  const [hasMore, setHasMore] = useState(false);
  const [totalElements, setTotalElements] = useState(0);

  // Customer Eligibility & My Review
  const [isEligible, setIsEligible] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [myReview, setMyReview] = useState(null);

  // UI Modals / Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Image Lightbox
  const [activeImage, setActiveImage] = useState(null);
  const [imageGallery, setImageGallery] = useState([]);

  // Fetch reviews whenever productId, page, or sortBy changes
  useEffect(() => {
    async function fetchReviewsData() {
      if (page === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await api.reviews.getReviews(productId, {
          page: page,
          size: 10,
          sortBy: sortBy,
        });

        if (res && res.success && res.data) {
          const content = Array.isArray(res.data) ? res.data : (res.data.content || []);
          const isLast = res.data.last ?? (content.length < 10);
          const total = res.data.totalElements ?? content.length;

          if (page === 0) {
            setReviews(content);
          } else {
            setReviews((prev) => [...prev, ...content]);
          }

          setHasMore(!isLast);
          setTotalElements(total);
        } else if (res && Array.isArray(res)) {
          setReviews(res);
          setHasMore(false);
          setTotalElements(res.length);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }

    if (productId) {
      fetchReviewsData();
    }
  }, [productId, page, sortBy]);

  // Check eligibility and my review if user is logged in
  useEffect(() => {
    async function checkUserReviewStatus() {
      if (!isLoggedIn || !productId) {
        setIsEligible(false);
        setMyReview(null);
        return;
      }

      setCheckingEligibility(true);

      try {
        // Fetch eligibility & existing review in parallel
        const [eligRes, myRevRes] = await Promise.all([
          api.reviews.checkEligibility(productId).catch(() => ({ success: false, data: false })),
          api.reviews.getMyReview(productId).catch(() => ({ success: false, data: null })),
        ]);

        if (myRevRes && myRevRes.success && myRevRes.data) {
          setMyReview(myRevRes.data);
          setIsEligible(false); // already reviewed
        } else {
          setMyReview(null);
          setIsEligible(Boolean(eligRes && eligRes.success && (eligRes.data === true || eligRes.data?.eligible === true)));
        }
      } catch (err) {
        console.error("Error checking review status:", err);
      } finally {
        setCheckingEligibility(false);
      }
    }

    checkUserReviewStatus();
  }, [isLoggedIn, productId]);

  // Refresh rating summary & review list after create/update/delete
  const refreshReviewsAndSummary = async () => {
    try {
      // Re-fetch product to get updated averageRating, reviewCount, ratingDistribution
      const prodRes = await api.products.getProduct(productId);
      if (prodRes && prodRes.success && prodRes.data) {
        onUpdateProductSummary({
          averageRating: prodRes.data.averageRating || prodRes.data.rating || 0,
          reviewCount: prodRes.data.reviewCount || prodRes.data.reviews || 0,
          ratingDistribution: prodRes.data.ratingDistribution || {},
        });
      }

      // Re-fetch my review & eligibility
      if (isLoggedIn) {
        const [eligRes, myRevRes] = await Promise.all([
          api.reviews.checkEligibility(productId).catch(() => ({ success: false, data: false })),
          api.reviews.getMyReview(productId).catch(() => ({ success: false, data: null })),
        ]);

        if (myRevRes && myRevRes.success && myRevRes.data) {
          setMyReview(myRevRes.data);
          setIsEligible(false);
        } else {
          setMyReview(null);
          setIsEligible(Boolean(eligRes && eligRes.success && (eligRes.data === true || eligRes.data?.eligible === true)));
        }
      }

      // Reset page to 0 and re-fetch reviews
      setPage(0);
      const res = await api.reviews.getReviews(productId, { page: 0, size: 10, sortBy: sortBy });
      if (res && res.success && res.data) {
        const content = Array.isArray(res.data) ? res.data : (res.data.content || []);
        setReviews(content);
        setHasMore(!res.data.last);
        setTotalElements(res.data.totalElements || content.length);
      }
    } catch (err) {
      console.error("Error refreshing reviews:", err);
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(0);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleOpenCreateForm = () => {
    setEditingReview(null);
    setFormOpen(true);
  };

  const handleOpenEditForm = (reviewObj) => {
    setEditingReview(reviewObj);
    setFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;

    setIsDeleting(true);
    try {
      const res = await api.reviews.deleteReview(reviewToDelete.id);
      if (res && (res.success || res.data === null)) {
        toast.success("Review deleted successfully.");
        setReviewToDelete(null);
        await refreshReviewsAndSummary();
      } else {
        throw new Error(res?.message || "Failed to delete review");
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      toast.error(err.message || "Failed to delete review. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenImage = (url, gallery) => {
    setActiveImage(url);
    setImageGallery(gallery);
  };

  const currentUserId = user?.id || user?.userId || null;

  return (
    <div id="customer-reviews" className="mt-14 pt-10 border-t border-border/60">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2
            className="text-2xl font-bold text-foreground flex items-center gap-2"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Customer Reviews
            {totalElements > 0 && (
              <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                {totalElements}
              </span>
            )}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verified ratings and feedback from crafters who purchased this item
          </p>
        </div>

        {/* Action Button / Review Status */}
        <div>
          {!isLoggedIn ? (
            <button
              onClick={() => navigate("login")}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-white transition-all shadow-md active:scale-95 cursor-pointer hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #a61c9b, #d82a81)",
              }}
            >
              <MessageSquarePlus className="w-4 h-4" />
              Sign in to Write a Review
            </button>
          ) : isEligible ? (
            <button
              onClick={handleOpenCreateForm}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-white transition-all shadow-md active:scale-95 cursor-pointer hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #a61c9b, #d82a81)",
              }}
            >
              <MessageSquarePlus className="w-4 h-4" />
              Write a Review
            </button>
          ) : null}
        </div>
      </div>

      {/* Rating Summary */}
      <div className="mb-8">
        <RatingSummary
          averageRating={productSummary.averageRating}
          reviewCount={productSummary.reviewCount || totalElements}
          ratingDistribution={productSummary.ratingDistribution}
        />
      </div>

      {/* Customer Review Status Banner */}
      {isLoggedIn && (
        <div className="mb-8">
          {checkingEligibility ? (
            <div className="p-4 rounded-2xl bg-card border border-border/60 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Checking review status...
            </div>
          ) : myReview ? (
            <div className="p-5 rounded-2xl bg-card border border-primary/30 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-primary" /> Your Review
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditForm(myReview)}
                    type="button"
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Edit Review
                  </button>
                  <span className="text-muted-foreground">•</span>
                  <button
                    onClick={() => setReviewToDelete(myReview)}
                    type="button"
                    className="text-xs font-semibold text-destructive hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <ReviewCard
                review={myReview}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onEdit={handleOpenEditForm}
                onDelete={setReviewToDelete}
                onOpenImage={handleOpenImage}
              />
            </div>
          ) : !isEligible ? (
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-center gap-3 text-xs text-muted-foreground">
              <ShoppingBag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>You can review this product after purchasing and receiving your order.</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Filter & Sort Bar */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-border/60">
        <h3 className="text-sm font-bold text-foreground">All Reviews</h3>

        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground hidden sm:inline">Sort by:</label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-semibold border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              <option value="latest">Latest</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="bg-card rounded-2xl border border-border/60 p-5 animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-24 h-3.5 bg-muted rounded" />
                  <div className="w-16 h-2.5 bg-muted/60 rounded" />
                </div>
              </div>
              <div className="w-20 h-3 bg-muted rounded" />
              <div className="w-full h-10 bg-muted/50 rounded-xl" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border/60 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-muted/50 text-muted-foreground flex items-center justify-center mx-auto mb-3 text-xl">
            💬
          </div>
          <h4 className="font-bold text-sm text-foreground mb-1">No reviews yet</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
            Be the first to share your experience with this craft item!
          </p>
          {isLoggedIn && isEligible && (
            <button
              onClick={handleOpenCreateForm}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-white transition-all shadow-md active:scale-95 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #a61c9b, #d82a81)",
              }}
            >
              <MessageSquarePlus className="w-4 h-4" /> Write the First Review
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <ReviewCard
              key={rev.id}
              review={rev}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onEdit={handleOpenEditForm}
              onDelete={setReviewToDelete}
              onOpenImage={handleOpenImage}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="pt-6 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                type="button"
                className="px-6 py-2.5 rounded-2xl text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    Loading reviews...
                  </>
                ) : (
                  "Load More Reviews"
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Review Submit/Edit Modal */}
      <ReviewForm
        productId={productId}
        existingReview={editingReview}
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={refreshReviewsAndSummary}
      />

      {/* Delete Confirmation Modal */}
      <DeleteReviewDialog
        isOpen={Boolean(reviewToDelete)}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setReviewToDelete(null)}
      />

      {/* Full Image Viewer Lightbox */}
      <ReviewImageViewer
        activeUrl={activeImage}
        photos={imageGallery}
        onClose={() => setActiveImage(null)}
      />
    </div>
  );
}
