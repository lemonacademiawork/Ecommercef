let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://ecommerce-b-production-70b5.up.railway.app";
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

  return {
    ...cat,
    id: cat.id,
    idString: extra.idString || cat.id.toString(),
    icon: extra.icon,
    color: extra.color,
    image: cat.imageUrl || cat.image || extra.image || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop&auto=format",
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
    listCategories: (all = false) => {
      const showAll = typeof all === "object" && all !== null ? !!all.all : !!all;
      return request(`/categories?all=${showAll}`).then((res) => ({
        ...res,
        data: res.data ? res.data.map(mapCategoryData) : res.data,
      }));
    },
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
    createOrder: (addressId) =>
      request("/orders", {
        method: "POST",
        body: JSON.stringify(typeof addressId === "object" ? addressId : { addressId }),
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
    getDashboardMetrics: () => request("/admin/dashboard"),
    listAllUsers: () => request("/admin/users"),
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
