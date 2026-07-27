import { toast } from "sonner";

/**
 * Returns the backend social media preview & redirect URL for a given product ID.
 * @param {string|number} productId 
 * @returns {string}
 */
export const getBackendShareUrl = (productId) => {
  return `https://api.lemonhousecraft.in/api/products/share/${productId}`;
};

/**
 * Handles product sharing using the native Web Share API with a fallback to clipboard copying.
 * Uses the backend social media preview & redirect endpoint.
 * 
 * @param {Object} product - Product object containing id, name, and optional description
 */
export const handleShareProduct = async (product) => {
  if (!product || (product.id === undefined && product.id === null)) {
    toast.error("Product information unavailable for sharing.");
    return;
  }

  const backendShareUrl = getBackendShareUrl(product.id);
  
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
    handleCopyShareLink(product);
  }
};

/**
 * Opens WhatsApp directly with the product share URL.
 * @param {Object} product 
 */
export const handleWhatsAppShare = (product) => {
  if (!product || !product.id) return;
  const backendShareUrl = getBackendShareUrl(product.id);
  const text = encodeURIComponent(`Check out ${product.name} on Lemon House Craft: ${backendShareUrl}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
};

/**
 * Copies the backend share URL to the user's clipboard.
 * @param {Object} product 
 */
export const handleCopyShareLink = async (product) => {
  if (!product || !product.id) return;
  const backendShareUrl = getBackendShareUrl(product.id);
  try {
    await navigator.clipboard.writeText(backendShareUrl);
    toast.success("Product share link copied to clipboard!");
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    toast.error("Failed to copy share link.");
  }
};
