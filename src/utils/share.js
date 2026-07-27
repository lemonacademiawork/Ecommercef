import { toast } from "sonner";

/**
 * Handles product sharing using the native Web Share API with a fallback to clipboard copying.
 * Uses the backend social media preview & redirect endpoint.
 * 
 * @param {Object} product - Product object containing id, name, and optional description
 */
export const handleShareProduct = async (product) => {
  if (!product || !product.id) {
    toast.error("Product information unavailable for sharing.");
    return;
  }

  // The backend preview & redirect URL
  const backendShareUrl = `https://api.lemonhousecraft.in/api/products/share/${product.id}`;
  
  const cleanDescription = product.description
    ? product.description.replace(/<[^>]*>/g, "").substring(0, 100) + "..."
    : `Check out ${product.name}!`;

  const shareData = {
    title: product.name,
    text: cleanDescription,
    url: backendShareUrl,
  };

  // Try to use native Web Share API (supported on mobile / modern browsers)
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      toast.success("Product shared successfully!");
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error sharing product:", err);
      }
    }
  } else {
    // Fallback: Copy link to clipboard
    try {
      await navigator.clipboard.writeText(backendShareUrl);
      toast.success("Product share link copied to clipboard!");
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      toast.error("Failed to copy share link.");
    }
  }
};
