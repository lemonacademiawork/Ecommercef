let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://ecommerce-b-production.up.railway.app";
// Ensure the base URL ends with /api to resolve endpoints correctly
if (!API_BASE_URL.endsWith("/api") && !API_BASE_URL.endsWith("/api/")) {
  API_BASE_URL = API_BASE_URL.endsWith("/") ? `${API_BASE_URL}api` : `${API_BASE_URL}/api`;
}

// Retrieve auth token from localStorage
const getToken = () => localStorage.getItem("token");

export const mapCategoryData = (cat) => {
  if (!cat) return cat;
  const mapping = {
    "Resin Supplies": { icon: "🧪", color: "#fbeaf5", idString: "resin" },
    "Beads & Stones": { icon: "💎", color: "#E8F5E9", idString: "beads" },
    "Fabric & Threads": { icon: "🧵", color: "#FFF9C4", idString: "fabric" },
    "Embroidery": { icon: "🪡", color: "#fbeaf5", idString: "embroidery" },
    "Art Supplies": { icon: "🎨", color: "#E8F5E9", idString: "art" },
    "Acrylic Paints": { icon: "🖌️", color: "#FFF9C4", idString: "paints" },
    "Jewelry Making": { icon: "💍", color: "#fbeaf5", idString: "jewelry" },
    "Clay & Pottery": { icon: "🏺", color: "#E8F5E9", idString: "clay" },
    "Packaging": { icon: "📦", color: "#FFF9C4", idString: "packaging" },
    "DIY Kits": { icon: "🎁", color: "#fbeaf5", idString: "kits" },
  };

  const defaultMap = { icon: "🛍️", color: "#fbeaf5", idString: cat.id ? cat.id.toString() : "" };
  const matched = Object.keys(mapping).find(
    (key) =>
      cat.name?.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(cat.name?.toLowerCase())
  );
  const extra = matched ? mapping[matched] : defaultMap;

  return {
    ...cat,
    id: cat.id,
    idString: extra.idString || cat.id.toString(),
    icon: extra.icon,
    color: extra.color,
    image: cat.imageUrl || cat.image || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop&auto=format",
    count: cat.count || 0,
  };
};

export const mapProductData = (product) => {
  if (!product) return product;
  return {
    ...product,
    id: product.id,
    image: product.imageUrl || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop&auto=format",
    images: product.images || [product.imageUrl || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop&auto=format"],
    inStock: product.stock > 0,
    tags: product.tags || [],
    materials: product.materials || [],
    category: product.categoryId ? product.categoryId.toString() : product.category,
    rating: product.rating || 4.5,
    reviews: product.reviews || 0,
  };
};

// Base request helper
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

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
    throw new Error(result.message || `HTTP error! Status: ${response.status}`);
  }

  return result;
}

export const api = {
  auth: {
    register: (data) =>
      request("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    login: (email, password) =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    googleLogin: (idToken) =>
      request("/auth/google", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      }),
    getProfile: () => request("/users/profile"),
    updateProfile: (data) =>
      request("/users/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    changePassword: (oldPassword, newPassword) =>
      request("/users/change-password", {
        method: "PUT",
        body: JSON.stringify({ oldPassword, newPassword }),
      }),
  },

  products: {
    listProducts: (params = {}) => {
      const query = new URLSearchParams();
      if (params.search) query.append("search", params.search);
      if (params.categoryId) query.append("categoryId", params.categoryId);
      if (params.all !== undefined) query.append("all", params.all);
      const queryString = query.toString();
      return request(`/products${queryString ? `?${queryString}` : ""}`).then((res) => ({
        ...res,
        data: res.data ? res.data.map(mapProductData) : res.data,
      }));
    },
    searchProducts: (keyword) =>
      request(`/products/search?keyword=${encodeURIComponent(keyword)}`).then((res) => ({
        ...res,
        data: res.data ? res.data.map(mapProductData) : res.data,
      })),
    filterProducts: (minPrice, maxPrice) =>
      request(`/products/filter?minPrice=${minPrice}&maxPrice=${maxPrice}`).then((res) => ({
        ...res,
        data: res.data ? res.data.map(mapProductData) : res.data,
      })),
    getProduct: (id) =>
      request(`/products/${id}`).then((res) => ({
        ...res,
        data: mapProductData(res.data),
      })),
    getProductsByCategory: (categoryId, all = false) =>
      request(`/products/category/${categoryId}?all=${all}`).then((res) => ({
        ...res,
        data: res.data ? res.data.map(mapProductData) : res.data,
      })),
    createProduct: (data) =>
      request("/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateProduct: (id, data) =>
      request(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteProduct: (id) =>
      request(`/products/${id}`, {
        method: "DELETE",
      }),
  },

  categories: {
    listCategories: (all = false) =>
      request(`/categories?all=${all}`).then((res) => ({
        ...res,
        data: res.data ? res.data.map(mapCategoryData) : res.data,
      })),
    getCategory: (id) =>
      request(`/categories/${id}`).then((res) => ({
        ...res,
        data: mapCategoryData(res.data),
      })),
    createCategory: (data) =>
      request("/categories", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateCategory: (id, data) =>
      request(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteCategory: (id) =>
      request(`/categories/${id}`, {
        method: "DELETE",
      }),
  },

  cart: {
    getCart: () => request("/cart"),
    addToCart: (productId, quantity) =>
      request("/cart/add", {
        method: "POST",
        body: JSON.stringify({ productId, quantity }),
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
        body: JSON.stringify({ addressId, paymentMethod }),
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
    getDashboardMetrics: () => request("/admin/dashboard"),
    listAllOrders: () => request("/admin/orders"),
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
  },
};
