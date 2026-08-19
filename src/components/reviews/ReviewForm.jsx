import { useState, useEffect } from "react";
import { X, Upload, Trash2, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { StarRating } from "./StarRating";
import { toast } from "sonner";
import { api } from "../../services/api";
import { getOptimizedImageUrl } from "../../utils/cloudinary";

export function ReviewForm({
  productId,
  existingReview = null,
  isOpen = false,
  onClose = () => {},
  onSuccess = () => {},
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [retainedImages, setRetainedImages] = useState([]); // Existing URLs user keeps
  const [newFiles, setNewFiles] = useState([]); // File objects for new images
  const [previews, setPreviews] = useState([]); // Object URLs for new image previews
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isEditing = Boolean(existingReview && existingReview.id);

  // Populate form if editing
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setComment(existingReview.comment || "");
      const existingPhotos = [existingReview.photoUrl1, existingReview.photoUrl2].filter(Boolean);
      setRetainedImages(existingPhotos);
      setNewFiles([]);
      setPreviews([]);
    } else {
      setRating(5);
      setComment("");
      setRetainedImages([]);
      setNewFiles([]);
      setPreviews([]);
    }
    setErrorMsg("");
  }, [existingReview, isOpen]);

  if (!isOpen) return null;

  const totalImageCount = retainedImages.length + newFiles.length;

  const handleImageSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    if (totalImageCount + selected.length > 2) {
      toast.error("You can upload a maximum of 2 photos.");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    const validSelected = [];
    const newPreviewUrls = [];

    for (const file of selected) {
      if (!validTypes.includes(file.type.toLowerCase())) {
        toast.error(`"${file.name}" is invalid. Please upload JPG, PNG, or WEBP images.`);
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`"${file.name}" exceeds 5MB limit.`);
        continue;
      }
      validSelected.push(file);
      newPreviewUrls.push(URL.createObjectURL(file));
    }

    setNewFiles((prev) => [...prev, ...validSelected]);
    setPreviews((prev) => [...prev, ...newPreviewUrls]);
    e.target.value = "";
  };

  const handleRemoveRetained = (index) => {
    setRetainedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    if (previews[index]) {
      URL.revokeObjectURL(previews[index]);
    }
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5 stars.");
      return;
    }
    if (comment.length > 1000) {
      toast.error("Review comment cannot exceed 1000 characters.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("rating", rating);
      if (comment.trim()) {
        formData.append("comment", comment.trim());
      }

      if (isEditing) {
        // Pass retainedImages repeated
        retainedImages.forEach((imgUrl) => {
          formData.append("retainedImages", imgUrl);
        });
      }

      // Pass new images repeated
      newFiles.forEach((file) => {
        formData.append("images", file);
      });

      let res;
      if (isEditing) {
        res = await api.reviews.updateReview(existingReview.id, formData);
      } else {
        res = await api.reviews.createReview(productId, formData);
      }

      if (res && (res.success || res.data || res.id)) {
        toast.success(isEditing ? "Review updated successfully!" : "Review submitted successfully!");
        onSuccess(res.data || res);
        onClose();
      } else {
        throw new Error(res?.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      const msg = err.message || "Failed to submit review. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>
              {isEditing ? "Edit Your Review" : "Write a Review"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Rating Selection */}
          <div className="text-center py-2 bg-muted/20 rounded-2xl border border-border/40">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              How would you rate this product?
            </label>
            <StarRating
              rating={rating}
              onChange={setRating}
              size="lg"
              className="justify-center"
            />
            <p className="text-xs font-semibold text-primary mt-1.5">
              {rating === 5 ? "Excellent 🌟" : rating === 4 ? "Very Good 👍" : rating === 3 ? "Average 😐" : rating === 2 ? "Poor 👎" : "Terrible 😞"}
            </p>
          </div>

          {/* Comment */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-foreground">
                Tell us what you think <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <span className={`text-[11px] font-mono ${comment.length > 1000 ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                {comment.length} / 1000
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={1000}
              placeholder="What did you like or dislike about this craft product? Share details to help other crafters..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3.5 rounded-2xl text-xs border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-foreground">
                Add Photos <span className="text-muted-foreground font-normal">(Max 2 photos, JPG/PNG/WEBP &lt; 5MB)</span>
              </label>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {totalImageCount} / 2 photos
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Existing retained images */}
              {retainedImages.map((imgUrl, idx) => (
                <div key={`retained-${idx}`} className="relative w-20 h-20 rounded-2xl overflow-hidden border border-border bg-muted shadow-sm group">
                  <img src={getOptimizedImageUrl(imgUrl, { width: 200 })} alt="Retained preview" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveRetained(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-destructive text-white rounded-full transition-colors cursor-pointer"
                    title="Remove photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded font-mono">
                    Saved
                  </span>
                </div>
              ))}

              {/* New File Previews */}
              {previews.map((previewUrl, idx) => (
                <div key={`new-${idx}`} className="relative w-20 h-20 rounded-2xl overflow-hidden border border-primary/40 bg-muted shadow-sm group">
                  <img src={previewUrl} alt="New upload preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewFile(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-destructive text-white rounded-full transition-colors cursor-pointer"
                    title="Remove photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-1 left-1 text-[9px] bg-primary text-white px-1.5 py-0.5 rounded font-mono">
                    New
                  </span>
                </div>
              ))}

              {/* Add Photo Button */}
              {totalImageCount < 2 && (
                <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/30 hover:bg-muted flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 text-muted-foreground hover:text-primary">
                  <Upload className="w-5 h-5" />
                  <span className="text-[10px] font-semibold">Upload</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple={totalImageCount === 0}
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-border hover:bg-muted text-foreground transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #a61c9b, #d82a81)",
              }}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditing ? "Saving..." : "Submitting..."}
                </>
              ) : (
                isEditing ? "Save Changes" : "Submit Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
