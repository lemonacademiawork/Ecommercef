let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.lemonhousecraft.in";

// Ensure the base URL ends with /api to resolve endpoints correctly
if (!API_BASE_URL.endsWith("/api") && !API_BASE_URL.endsWith("/api/")) {
  API_BASE_URL = API_BASE_URL.endsWith("/") ? `${API_BASE_URL}api` : `${API_BASE_URL}/api`;
}

// Retrieve auth token from localStorage
const getToken = () => localStorage.getItem("token");

export const mapCategoryData = (cat) => {
  if (!cat) return cat;
  const mapping = {
    "Resin Supplies": { 
      icon: "🧪", 
      color: "#fbeaf5", 
      idString: "resin",
      image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400&h=300&fit=crop&auto=format"
    },
    "Beads & Stones": { 
      icon: "💎", 
      color: "#E8F5E9", 
      idString: "beads",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=300&fit=crop&auto=format"
    },
    "Fabric & Threads": { 
      icon: "🧵", 
      color: "#FFF9C4", 
      idString: "fabric",
      image: "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=300&fit=crop&auto=format"
    },
    "Embroidery": { 
      icon: "🪡", 
      color: "#fbeaf5", 
      idString: "embroidery",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop&auto=format"
    },
    "Art Supplies": { 
      icon: "🎨", 
      color: "#E8F5E9", 
      idString: "art",
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop&auto=format"
    },
    "Acrylic Paints": { 
      icon: "🖌️", 
      color: "#FFF9C4", 
      idString: "paints",
      image: "https://images.unsplash.com/photo-1526743977-0e9e24b98dcc?w=400&h=300&fit=crop&auto=format"
    },
    "Jewelry Making": { 
      icon: "💍", 
      color: "#fbeaf5", 
      idString: "jewelry",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=300&fit=crop&auto=format"
    },
    "Clay & Pottery": { 
      icon: "🏺", 
      color: "#E8F5E9", 
      idString: "clay",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=300&fit=crop&auto=format"
    },
    "Packaging": { 
      icon: "📦", 
      color: "#FFF9C4", 
      idString: "packaging",
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=300&fit=crop&auto=format"
    },
    "DIY Kits": { 
      icon: "🎁", 
      color: "#fbeaf5", 
      idString: "kits",
      image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400&h=300&fit=crop&auto=format"
    },
  };

  const defaultMap = { icon: "🛍️", color: "#fbeaf5", idString: cat.id ? cat.id.toString() : "" };
  const matched = Object.keys(mapping).find(
    (key) =>
      cat.name?.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(cat.name?.toLowerCase())
  );
  const extra = matched ? mapping[matched] : defaultMap;
  const categoryImage = cat.imageUrl || cat.image || (extra.image !== "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop&auto=format" ? extra.image : null);

  return {
    ...cat,
    id: cat.id,
    idString: extra.idString || cat.id.toString(),
    icon: extra.icon || "🛍️",
    color: extra.color,
    imageUrl: categoryImage || cat.imageUrl || cat.image,
    image: categoryImage || cat.imageUrl || cat.image || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop&auto=format",
    count: cat.count || 0,
  };
};

export const mapProductData = (product) => {
  if (!product) return product;
  
  let desc = product.description || "";
  let parsedImages = [];

  // Extract images from description if present
  const match = desc.match(/\[IMAGES:([\s\S]*?)\]/);
  if (match) {
    parsedImages = match[1].split(",").map(img => img.trim()).filter(Boolean);
    // Remove the metadata from the description
    desc = desc.replace(/\[IMAGES:[\s\S]*?\]/, "").trim();
  }

  // Fallback to product.images if it exists
  if (parsedImages.length === 0 && product.images) {
    if (Array.isArray(product.images)) {
      parsedImages = product.images;
    } else if (typeof product.images === "string") {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) {
          parsedImages = parsed;
        } else {
          parsedImages = product.images.split(",").map((s) => s.trim());
        }
      } catch (err) {
        parsedImages = product.images.split(",").map((s) => s.trim());
      }
    }
  }

  // Filter out any empty strings
  parsedImages = parsedImages.filter(img => img && img.trim() !== "");

  if (parsedImages.length === 0) {
    parsedImages = [product.imageUrl || product.image || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop&auto=format"];
  }

  return {
    ...product,
    id: product.id,
    description: desc,
    image: product.imageUrl || parsedImages[0] || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop&auto=format",
    images: parsedImages,
    subcategoryId: product.subcategoryId || product.sub_category_id || null,
    subcategory: product.subcategory || product.subCategory || null,
    brand: product.brand || "",
    shortDescription: product.shortDescription || "",
    metaTitle: product.metaTitle || "",
    metaDescription: product.metaDescription || "",
    metaKeywords: product.metaKeywords || "",
    hasVariants: Boolean(product.hasVariants || product.has_variants || (Array.isArray(product.variants) && product.variants.length > 0)),
    variants: Array.isArray(product.variants) ? product.variants : [],
    inStock: product.stock > 0,
    tags: product.tags || [],
    materials: product.materials || [],
    category: typeof product.category === "object" ? (product.category?.name || product.category?.id) : (product.categoryName || product.category || (product.categoryId ? product.categoryId.toString() : "")),
    categoryId: product.categoryId || (typeof product.category === "object" ? product.category?.id : null),
    categoryName: product.categoryName || (typeof product.category === "object" ? product.category?.name : (typeof product.category === "string" ? product.category : "")),
    rating: product.rating || 4.5,
    reviews: product.reviews || 0,
  };
};

export const mapProductDataArray = (data) => {
  if (!data) return [];
  let arr = [];
  if (Array.isArray(data)) {
    arr = data;
  } else if (data && Array.isArray(data.content)) {
    arr = data.content;
  } else if (data && Array.isArray(data.items)) {
    arr = data.items;
  }
  return arr.map(mapProductData);
};

// Base request helper
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  // Strip leading /api if present to avoid duplicate /api/api in URL
  const cleanEndpoint = endpoint.startsWith("/api/") ? endpoint.slice(4) : endpoint;

  // Set Authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Set Content-Type default unless it's FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, config);

  // Read response as json
  let result;
  try {
    result = await response.json();
  } catch (err) {
    result = {
      success: response.ok,
      message: response.statusText,
      data: null,
    };
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("auth");
      
      const currentPath = window.location.pathname;
      if (currentPath.startsWith("/admin")) {
        if (currentPath !== "/admin/login") {
          window.location.href = "/admin/login";
        }
      } else {
        if (currentPath !== "/login" && currentPath !== "/") {
          window.location.href = "/login";
        }
      }
    }

    let errMsg = result.message || result.error || result.data || `HTTP error! Status: ${response.status}`;
    if (typeof errMsg === "object") {
      try {
        errMsg = JSON.stringify(errMsg);
      } catch (e) {
        errMsg = `HTTP error! Status: ${response.status}`;
      }
    }
    throw new Error(errMsg);
  }

  return result;
}

// --- Client-Side Cache & In-Flight Request Deduplicator ---
const queryCache = new Map();
const inFlightRequests = new Map();
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const clearApiCache = () => {
  queryCache.clear();
  inFlightRequests.clear();
};

/**
 * Cached Request Helper:
 * 1. Checks queryCache for fresh responses (< staleTime)
 * 2. Deduplicates concurrent in-flight requests for identical URLs
 */
export async function cachedRequest(endpoint, staleTime = DEFAULT_STALE_TIME) {
  const now = Date.now();
  const cached = queryCache.get(endpoint);

  if (cached && now - cached.timestamp < staleTime) {
    return Promise.resolve(cached.data);
  }

  if (inFlightRequests.has(endpoint)) {
    return inFlightRequests.get(endpoint);
  }

  const requestPromise = request(endpoint)
    .then((res) => {
      queryCache.set(endpoint, { data: res, timestamp: Date.now() });
      inFlightRequests.delete(endpoint);
      return res;
    })
    .catch((err) => {
      inFlightRequests.delete(endpoint);
      throw err;
    });

  inFlightRequests.set(endpoint, requestPromise);
  return requestPromise;
}

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { method: "GET", ...options }),
  auth: {
    register: (data) =>
      request("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    login: (email, password) =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier: email, email, password }),
      }),
    googleLogin: (idToken) =>
      request("/auth/google", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      }),
    sendOtp: (phone) =>
      request("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ phone }),
      }),
    verifyOtp: (phone, otp) =>
      request("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone, otp }),
      }),
    resendOtp: (phone) =>
      request("/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ phone }),
      }),
    getProfile: () => request("/users/profile"),
    updateProfile: (data) =>
      request("/users/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    changePassword: (currentPassword, newPassword) =>
      request("/users/change-password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
  },

  products: {
    listProducts: (params = {}) => {
      const query = new URLSearchParams();
      if (params.search) query.append("search", params.search);
      if (params.categoryId) query.append("categoryId", params.categoryId);
      if (params.all !== undefined) query.append("all", params.all);
      
      const page = params.page !== undefined ? params.page : 0;
      const size = params.size !== undefined 
        ? params.size 
        : (params.limit !== undefined 
            ? params.limit 
            : (params.pageSize !== undefined ? params.pageSize : (params.all ? 1000 : 12)));

      query.append("page", page);
      query.append("size", size);

      if (params.sortBy) query.append("sortBy", params.sortBy);
      if (params.sortDir) query.append("sortDir", params.sortDir);
      
      const queryString = query.toString();
      const endpoint = `/products${queryString ? `?${queryString}` : ""}`;

      return cachedRequest(endpoint, 5 * 60 * 1000).then((res) => ({
        ...res,
        data: mapProductDataArray(res.data),
        pagination: res.data && typeof res.data === "object" && !Array.isArray(res.data) ? {
          pageNumber: res.data.pageNumber ?? page,
          pageSize: res.data.pageSize ?? size,
          totalElements: res.data.totalElements ?? (Array.isArray(res.data.content) ? res.data.content.length : 0),
          totalPages: res.data.totalPages ?? 1,
          last: res.data.last ?? true,
        } : null,
      }));
    },
    batchGetCategoryProducts: async (categoryIds = []) => {
      if (!categoryIds || categoryIds.length === 0) return { success: true, data: {} };

      const idsQuery = categoryIds.join(",");
      const batchEndpoint = `/products?categoryIds=${encodeURIComponent(idsQuery)}`;

      try {
        // 1. Single Batched Request (GET /products?categoryIds=id1,id2,id3...)
        const res = await cachedRequest(batchEndpoint, 5 * 60 * 1000);
        if (res && res.success && res.data) {
          return res;
        }
      } catch (e) {
        // Fallback if backend batch endpoint is not present
      }

      // 2. Fallback: Deduplicated cached requests (1 roundtrip per unique ID, cached & deduplicated)
      const results = await Promise.all(
        categoryIds.map((id) =>
          api.products.listProducts({ categoryId: id, size: 12 }).catch(() => ({ data: [] }))
        )
      );

      const mappedMap = {};
      categoryIds.forEach((id, index) => {
        mappedMap[id] = results[index]?.data || [];
      });

      return {
        success: true,
        data: mappedMap,
      };
    },
    searchProducts: (keyword) =>
      cachedRequest(`/products/search?keyword=${encodeURIComponent(keyword)}`).then((res) => ({
        ...res,
        data: mapProductDataArray(res.data),
      })),
    filterProducts: (minPrice, maxPrice) =>
      cachedRequest(`/products/filter?minPrice=${minPrice}&maxPrice=${maxPrice}`).then((res) => ({
        ...res,
        data: mapProductDataArray(res.data),
      })),
    getProduct: (id) =>
      cachedRequest(`/products/${id}`).then((res) => {
        const rawProduct = res?.data || (res && res.id ? res : null);
        return {
          ...res,
          success: res?.success !== undefined ? res.success : Boolean(rawProduct),
          data: mapProductData(rawProduct),
        };
      }).catch((err) => {
        console.error(`Error in getProduct API for ${id}:`, err);
        return { success: false, data: null };
      }),
    getVariants: (id) =>
      cachedRequest(`/products/${id}/variants`).then((res) => {
        const dataList = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : (res && Array.isArray(res.content) ? res.content : []));
        return {
          success: true,
          data: dataList,
        };
      }).catch((err) => {
        console.error("Error in getVariants API:", err);
        return { success: false, data: [] };
      }),
    getProductsByCategory: (categoryId, all = false) =>
      cachedRequest(`/products/category/${categoryId}?all=${all}`).then((res) => ({
        ...res,
        data: mapProductDataArray(res.data),
      })),
    createProduct: (data) => {
      clearApiCache();
      return request("/products", {
        method: "POST",
        body: JSON.stringify(data),
      }).then((res) => ({
        success: true,
        data: res.data || res,
      }));
    },
    updateProduct: (id, data) => {
      clearApiCache();
      return request(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }).then((res) => ({
        success: true,
        data: res.data || res,
      }));
    },
    deleteProduct: (id) => {
      clearApiCache();
      return request(`/products/${id}`, {
        method: "DELETE",
      });
    },
  },

  reviews: {
    getReviews: (productId, params = {}) => {
      const query = new URLSearchParams();
      if (params.page !== undefined) query.append("page", params.page);
      if (params.size !== undefined) query.append("size", params.size || 10);
      if (params.sortBy) query.append("sortBy", params.sortBy);
      const qStr = query.toString();
      return request(`/products/${productId}/reviews${qStr ? `?${qStr}` : ""}`);
    },
    checkEligibility: (productId) =>
      request(`/products/${productId}/reviews/can-review`),
    getMyReview: (productId) =>
      request(`/products/${productId}/reviews/me`),
    createReview: (productId, formData) => {
      clearApiCache();
      return request(`/products/${productId}/reviews`, {
        method: "POST",
        body: formData,
      });
    },
    updateReview: (reviewId, formData) => {
      clearApiCache();
      return request(`/reviews/${reviewId}`, {
        method: "PUT",
        body: formData,
      });
    },
    deleteReview: (reviewId) => {
      clearApiCache();
      return request(`/reviews/${reviewId}`, {
        method: "DELETE",
      });
    },
  },

  categories: {
    listCategories: (all = false, search = "") => {
      const showAll = typeof all === "object" && all !== null ? !!all.all : !!all;
      // When a search term is provided use request() (bypass cache) for fresh results
      const query = new URLSearchParams();
      query.append("all", showAll);
      if (search && search.trim()) query.append("search", search.trim());
      const endpoint = `/categories?${query.toString()}`;

      const fetcher = search && search.trim()
        ? request(endpoint)
        : cachedRequest(endpoint, 5 * 60 * 1000);

      return fetcher.then((res) => {
        if (!res.data || !Array.isArray(res.data)) {
          return res;
        }

        const mappedCategories = res.data.map((cat) =>
          mapCategoryData({
            ...cat,
            count: cat.count || cat.productCount || 0,
          })
        );

        return {
          ...res,
          data: mappedCategories,
        };
      });
    },
    getCategory: (id) =>
      cachedRequest(`/categories/${id}`).then((res) => ({
        ...res,
        data: mapCategoryData(res.data),
      })),
    createCategory: (data) => {
      clearApiCache();
      return request("/categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    updateCategory: (id, data) => {
      clearApiCache();
      return request(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    deleteCategory: (id) => {
      clearApiCache();
      return request(`/categories/${id}`, {
        method: "DELETE",
      });
    },
    listSubcategories: (categoryId) =>
      cachedRequest(`/categories/${categoryId}/subcategories`).then((res) => ({
        success: true,
        data: Array.isArray(res) ? res : (res?.data || []),
      })).catch(() => ({ success: true, data: [] })),
  },

  cart: {
    getCart: () => request("/cart"),
    addToCart: (productId, quantity, variantId = null) =>
      request("/cart/add", {
        method: "POST",
        body: JSON.stringify({ productId, quantity, variantId }),
      }),
    updateCartItem: (cartItemId, quantity) =>
      request("/cart/update", {
        method: "PUT",
        body: JSON.stringify({ cartItemId, quantity }),
      }),
    removeCartItem: (cartItemId) =>
      request(`/cart/remove/${cartItemId}`, {
        method: "DELETE",
      }),
    clearCart: () =>
      request("/cart/clear", {
        method: "DELETE",
      }),
  },

  orders: {
    createOrder: (addressId, paymentMethod) =>
      request("/orders", {
        method: "POST",
        body: JSON.stringify(typeof addressId === "object" ? addressId : { addressId, paymentMethod }),
      }),
    getOrders: () => request("/orders"),
    getOrderDetails: (id) => request(`/orders/${id}`),
  },

  addresses: {
    listAddresses: () => request("/addresses"),
    addAddress: (data) =>
      request("/addresses", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateAddress: (id, data) =>
      request(`/addresses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteAddress: (id) =>
      request(`/addresses/${id}`, {
        method: "DELETE",
      }),
    setDefaultAddress: (id) =>
      request(`/addresses/${id}/default`, {
        method: "PUT",
      }),
  },

  admin: {
    login: (email, password) =>
      request("/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    // Fresh (non-cached) paginated product list for admin management
    listProducts: (params = {}) => {
      const query = new URLSearchParams();
      query.append("all", "true");
      query.append("page", params.page !== undefined ? params.page : 0);
      query.append("size", params.size !== undefined ? params.size : 10);
      if (params.sortBy) query.append("sortBy", params.sortBy);
      if (params.sortDir) query.append("sortDir", params.sortDir);
      if (params.search) query.append("search", params.search);
      if (params.categoryId) query.append("categoryId", params.categoryId);
      if (params.stockFilter) query.append("stockFilter", params.stockFilter);
      return request(`/products?${query.toString()}`).then((res) => ({
        ...res,
        data: res.data,
        pagination: res.data && typeof res.data === "object" && !Array.isArray(res.data) ? {
          pageNumber: res.data.pageNumber ?? 0,
          pageSize: res.data.pageSize ?? 10,
          totalElements: res.data.totalElements ?? 0,
          totalPages: res.data.totalPages ?? 1,
          last: res.data.last ?? true,
          content: res.data.content ?? [],
        } : null,
      }));
    },
    // Create product using multipart/form-data with automatic JSON fallback if server expects JSON
    createProduct: async (formData, jsonFallback = null) => {
      clearApiCache();
      try {
        return await request("/admin/products", {
          method: "POST",
          body: formData,
        });
      } catch (err) {
        if (jsonFallback && (err.message?.includes("400") || err.message?.includes("Bad Request") || err.message?.includes("Content-Type") || err.message?.includes("Status: 400"))) {
          console.warn("FormData POST failed with 400. Retrying with JSON payload...", err);
          return await request("/admin/products", {
            method: "POST",
            body: JSON.stringify(jsonFallback),
          });
        }
        throw err;
      }
    },
    // Update product using multipart/form-data with automatic JSON fallback
    updateProduct: async (id, formData, jsonFallback = null) => {
      clearApiCache();
      try {
        return await request(`/admin/products/${id}`, {
          method: "PUT",
          body: formData,
        });
      } catch (err) {
        if (jsonFallback && (err.message?.includes("400") || err.message?.includes("Bad Request") || err.message?.includes("Content-Type") || err.message?.includes("Status: 400"))) {
          console.warn("FormData PUT failed with 400. Retrying with JSON payload...", err);
          return await request(`/admin/products/${id}`, {
            method: "PUT",
            body: JSON.stringify(jsonFallback),
          });
        }
        throw err;
      }
    },
    // Delete product (admin endpoint)
    deleteProduct: (id) => {
      clearApiCache();
      return request(`/admin/products/${id}`, {
        method: "DELETE",
      });
    },
    getDashboardMetrics: () => request("/admin/dashboard"),
    listAllUsers: (params = {}) => {
      const query = new URLSearchParams();
      query.append("page", params.page !== undefined ? params.page : 0);
      query.append("size", params.size !== undefined ? params.size : 1000);
      if (params.sortBy) query.append("sortBy", params.sortBy);
      if (params.sortDir) query.append("sortDir", params.sortDir);
      if (params.search && params.search.trim()) query.append("search", params.search.trim());
      const qs = query.toString();
      return request(`/admin/users${qs ? `?${qs}` : ""}`);
    },
    listAllOrders: (params = {}) => {
      const query = new URLSearchParams();
      query.append("page", params.page !== undefined ? params.page : 0);
      query.append("size", params.size !== undefined ? params.size : 1000);
      if (params.paymentStatus) query.append("paymentStatus", params.paymentStatus);
      if (params.status) query.append("status", params.status);
      if (params.sortBy) query.append("sortBy", params.sortBy);
      if (params.sortDir) query.append("sortDir", params.sortDir);
      if (params.search && params.search.trim()) query.append("search", params.search.trim());
      const qs = query.toString();
      return request(`/admin/orders${qs ? `?${qs}` : ""}`);
    },
    getOrderDetails: (id) => request(`/admin/orders/${id}`),
    updateOrderStatus: (id, status) =>
      request(`/admin/orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    uploadImage: (file) => {
      const formData = new FormData();
      formData.append("image", file);
      return request("/admin/products/upload-image", {
        method: "POST",
        body: formData,
      });
    },
    // Payment management
    approvePayment: (orderId) =>
      request(`/admin/payments/${orderId}/approve`, {
        method: "PUT",
      }),
    rejectPayment: (orderId) =>
      request(`/admin/payments/${orderId}/reject`, {
        method: "PUT",
      }),
    getPaymentDetails: (orderId) => request(`/admin/payments/${orderId}`),
    getPendingPayments: (params = {}) => {
      const query = new URLSearchParams();
      query.append("page", params.page !== undefined ? params.page : 0);
      query.append("size", params.size !== undefined ? params.size : 1000);
      if (params.sortBy) query.append("sortBy", params.sortBy);
      if (params.sortDir) query.append("sortDir", params.sortDir);
      const qs = query.toString();
      return request(`/admin/payments/pending${qs ? `?${qs}` : ""}`);
    },
    // Variant management
    getVariants: (productId) =>
      request(`/admin/products/${productId}/variants`).then((res) => {
        const dataList = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : (res && Array.isArray(res.content) ? res.content : []));
        return {
          success: true,
          data: dataList,
        };
      }).catch((err) => {
        console.error("Error in admin.getVariants API:", err);
        return { success: false, data: [] };
      }),
    addVariant: (productId, data) =>
      request(`/admin/products/${productId}/variants`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateVariant: (id, data) =>
      request(`/admin/variants/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteVariant: (id) =>
      request(`/admin/variants/${id}`, {
        method: "DELETE",
      }),
  },

  shipping: {
    trackCustomer: (tracking) => request(`/shipping/track/${tracking}`),
    trackAdmin: (tracking) => request(`/admin/shipping/track/${tracking}`),
    bookShipment: (orderId) =>
      request("/admin/shipping/book", {
        method: "POST",
        body: JSON.stringify({ orderId }),
      }),
    cancelShipment: (orderId) =>
      request("/admin/shipping/cancel", {
        method: "POST",
        body: JSON.stringify({ orderId }),
      }),
    getEstimate: (data) =>
      request("/admin/shipping/estimate", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getCustomerEstimate: (data) =>
      request("/shipping/estimate", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    generateLabel: (orderId) => request(`/admin/shipping/label/${orderId}`),
    savePickupAddress: (data) =>
      request("/admin/shipping/pickup/address", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    schedulePickup: (orderId) =>
      request(`/admin/shipping/pickup/request/${orderId}`, {
        method: "POST",
      }),
  },

  payments: {
    getQrDetails: () => request("/payments/qr"),
    createRazorpayOrder: (params) => {
      let orderId = null;
      let amount = null;
      let currency = "INR";
      let receipt = null;

      if (typeof params === "string" || typeof params === "number") {
        orderId = params;
      } else if (params && typeof params === "object") {
        orderId = params.orderId || params.id;
        amount = params.amount;
        currency = params.currency || "INR";
        receipt = params.receipt;
      }

      const query = new URLSearchParams();
      if (orderId) query.append("orderId", orderId);
      if (amount !== undefined && amount !== null) query.append("amount", amount);
      if (currency) query.append("currency", currency);
      if (receipt) query.append("receipt", receipt);

      return request(`/payments/razorpay/create-order?${query.toString()}`, {
        method: "POST",
      });
    },
    verifyRazorpayPayment: (paymentDetails) =>
      request("/payments/razorpay/verify", {
        method: "POST",
        body: JSON.stringify(paymentDetails),
      }),
    submitQrPayment: (orderId, paymentScreenshot, transactionId = null) => {
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("paymentScreenshot", paymentScreenshot);
      if (transactionId) {
        formData.append("transactionId", transactionId);
      }
      return request("/payments/qr/submit", {
        method: "POST",
        body: formData,
      });
    },
  },
};
