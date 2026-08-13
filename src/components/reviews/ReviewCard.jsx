import { CheckCircle2, Trash2, Edit3, User, Image as ImageIcon } from "lucide-react";
import { StarRating } from "./StarRating";

export function ReviewCard({
  review,
  currentUserId = null,
  isAdmin = false,
  onEdit = null,
  onDelete = null,
  onOpenImage = null,
}) {
  if (!review) return null;

  const isOwnReview = currentUserId && (
    String(review.user?.id) === String(currentUserId) ||
    String(review.userId) === String(currentUserId)
  );

  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  const photos = [review.photoUrl1, review.photoUrl2].filter(Boolean);

  const userName = review.user?.name || review.userName || review.user?.email?.split("@")[0] || "Verified Customer";
  const userAvatar = review.user?.profileImage || review.user?.avatar || review.avatarUrl || null;

  return (
    <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm transition-colors duration-300">
      <div className="flex items-start justify-between gap-4 mb-3">
        {/* User Info */}
        <div className="flex items-center gap-3 min-w-0">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-10 h-10 rounded-full object-cover border border-border bg-muted flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm flex-shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-sm text-foreground truncate">{userName}</h4>
              {review.verifiedPurchase && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Verified Purchase
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{formattedDate}</p>
          </div>
        </div>

        {/* Edit / Delete Buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isOwnReview && onEdit && (
            <button
              onClick={() => onEdit(review)}
              type="button"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors cursor-pointer"
              title="Edit review"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {(isOwnReview || isAdmin) && onDelete && (
            <button
              onClick={() => onDelete(review)}
              type="button"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
              title="Delete review"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Star Rating */}
      <div className="mb-3">
        <StarRating rating={review.rating} size="sm" readOnly />
      </div>

      {/* Comment Text */}
      {review.comment && (
        <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line mb-3">
          {review.comment}
        </p>
      )}

      {/* Photos */}
      {photos.length > 0 && (
        <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-border/40">
          {photos.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onOpenImage && onOpenImage(url, photos)}
              className="relative w-16 h-16 rounded-xl overflow-hidden border border-border/80 bg-muted group cursor-pointer active:scale-95 transition-all shadow-sm"
            >
              <img
                src={url}
                alt={`Review photo ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-white drop-shadow" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
