/**
 * Helper utility to optimize Cloudinary and third-party image URLs for delivery.
 * Injects transformation parameters (f_auto, q_auto, width, crop) into Cloudinary URLs.
 */

export function getOptimizedImageUrl(url, options = {}) {
  if (!url || typeof url !== "string") {
    return url || "";
  }

  // Handle preset shortcut (string or number)
  let opts = options;
  if (typeof options === "string" || typeof options === "number") {
    const sizeMap = {
      icon: 100,
      tiny: 100,
      thumb: 200,
      small: 300,
      card: 500,
      medium: 500,
      main: 800,
      detail: 800,
      large: 1000,
      full: 1200,
    };
    const num = typeof options === "number" ? options : (sizeMap[options] || 500);
    opts = { width: num };
  }

  const {
    width,
    height,
    crop = "limit",
    quality = "auto",
    format = "auto",
  } = opts;

  // 1. Cloudinary URLs
  if (url.includes("res.cloudinary.com") || url.includes("cloudinary.com")) {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex !== -1) {
      const prefix = url.substring(0, uploadIndex + 8); // includes '/upload/'
      const rest = url.substring(uploadIndex + 8);

      // Build transformation string
      const transforms = [];
      if (format) transforms.push(`f_${format}`);
      if (quality) transforms.push(`q_${quality}`);
      if (width) transforms.push(`w_${width}`);
      if (height) transforms.push(`h_${height}`);
      if (crop && (width || height)) transforms.push(`c_${crop}`);

      const transformStr = transforms.join(",");

      // Check if `rest` already starts with a version string (e.g. v1234567...)
      const versionMatch = rest.match(/^(v\d+\/.*)/);
      if (versionMatch) {
        // No existing transformations before version
        return `${prefix}${transformStr}/${rest}`;
      }

      // If existing transformations exist before v\d+/
      const matchWithVersion = rest.match(/^([^/]+)\/(v\d+\/.*)/);
      if (matchWithVersion) {
        const versionAndPath = matchWithVersion[2];
        return `${prefix}${transformStr}/${versionAndPath}`;
      }

      // If no version string, check if first segment looks like transformations (contains _ or ,)
      const parts = rest.split("/");
      if (parts.length > 1 && (parts[0].includes("_") || parts[0].includes(","))) {
        parts[0] = transformStr;
        return `${prefix}${parts.join("/")}`;
      }

      // Default: prepend transformation string
      return `${prefix}${transformStr}/${rest}`;
    }
  }

  // 2. Unsplash URLs
  if (url.includes("images.unsplash.com")) {
    try {
      const parsed = new URL(url);
      if (width) parsed.searchParams.set("w", width.toString());
      if (height) parsed.searchParams.set("h", height.toString());
      if (format) parsed.searchParams.set("auto", format === "auto" ? "format" : format);
      if (quality && quality !== "auto") parsed.searchParams.set("q", quality.toString());
      return parsed.toString();
    } catch (e) {
      return url;
    }
  }

  return url;
}
