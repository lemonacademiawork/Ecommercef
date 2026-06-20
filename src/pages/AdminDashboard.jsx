import { useState, useEffect } from "react";
import {
  BarChart2,
  Package,
  Users,
  ShoppingBag,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ChevronDown,
  X,
  Upload,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { api } from "../services/api";
import { toast } from "sonner";

const salesData = [
  { month: "Jan", revenue: 42000, orders: 134 },
  { month: "Feb", revenue: 38000, orders: 118 },
  { month: "Mar", revenue: 65000, orders: 201 },
  { month: "Apr", revenue: 71000, orders: 225 },
  { month: "May", revenue: 58000, orders: 183 },
  { month: "Jun", revenue: 89000, orders: 267 },
];

const categoryData = [
  { name: "Resin", value: 124, color: "#a61c9b" },
  { name: "Beads", value: 89, color: "#2E7D32" },
  { name: "Art", value: 183, color: "#FFD54F" },
  { name: "Fabric", value: 215, color: "#9c27b0" },
  { name: "Jewelry", value: 144, color: "#ff5722" },
];

const statusColors = {
  Processing: "bg-yellow-100 text-yellow-700",
  Shipped: "bg-blue-100 text-blue-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
};

export function AdminDashboard() {
  const [section, setSection] = useState("dashboard");
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    active: true,
    categoryId: "",
  });

  const loadAdminData = async () => {
    try {
      const [metricRes, prodRes, orderRes, catRes] = await Promise.all([
        api.admin.getDashboardMetrics(),
        api.products.listProducts({ all: true }),
        api.admin.listAllOrders(),
        api.categories.listCategories({ all: true }),
      ]);
      if (metricRes.success && metricRes.data) {
        setMetrics(metricRes.data);
      }
      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data);
      }
      if (orderRes.success && orderRes.data) {
        setOrders(orderRes.data);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
        if (catRes.data.length > 0) {
          setProductForm((prev) => ({ ...prev, categoryId: catRes.data[0].id }));
        }
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        imageUrl: productForm.imageUrl,
        active: productForm.active,
        categoryId: Number(productForm.categoryId),
      };

      let res;
      if (editProduct) {
        res = await api.products.updateProduct(editProduct.id, payload);
      } else {
        res = await api.products.createProduct(payload);
      }

      if (res.success) {
        toast.success(editProduct ? "Product updated successfully!" : "Product created successfully!");
        setShowProductForm(false);
        setEditProduct(null);
        setProductForm({
          name: "",
          description: "",
          price: "",
          stock: "",
          imageUrl: "",
          active: true,
          categoryId: categories[0]?.id || "",
        });
        loadAdminData();
      }
    } catch (err) {
      toast.error("Failed to save product: " + err.message);
    }
  };

  const handleEditProductClick = (product) => {
    setEditProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock || 0,
      imageUrl: product.imageUrl || product.image || "",
      active: product.active !== undefined ? product.active : true,
      categoryId: product.categoryId || (categories[0]?.id || ""),
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await api.products.deleteProduct(id);
      if (res.success) {
        toast.success("Product deleted successfully!");
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      toast.error("Failed to delete product: " + err.message);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.admin.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      toast.loading("Uploading product image...");
      const res = await api.admin.uploadImage(file);
      toast.dismiss();
      if (res.success && res.data) {
        setProductForm((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
        toast.success("Image uploaded successfully!");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Image upload failed: " + err.message);
    }
  };

  const navItems = [
    { key: "dashboard", label: "Dashboard", Icon: BarChart2 },
    { key: "products", label: "Products", Icon: Package },
    { key: "orders", label: "Orders", Icon: ShoppingBag },
    { key: "analytics", label: "Analytics", Icon: TrendingUp },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f8f9fc" }}>
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 min-h-screen bg-white border-r border-border">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                style={{
                  background: "linear-gradient(135deg, #a61c9b, #d82a81)",
                }}
              >
                🍋
              </div>
              <span
                className="font-bold text-sm"
                style={{ fontFamily: "Poppins, sans-serif", color: "#a61c9b" }}
              >
                LemonHouse
              </span>
            </div>
            <span className="text-xs text-muted-foreground mt-0.5 block">
              Admin Panel
            </span>
          </div>
          <nav className="p-3">
            {navItems.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setSection(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all ${
                  section === key
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 p-6 overflow-auto">
          {/* Dashboard */}
          {section === "dashboard" && (
            <div className="space-y-6">
              <h1
                className="text-2xl font-bold"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Dashboard Overview
              </h1>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Revenue",
                    value: `₹${(metrics.totalRevenue || 0).toLocaleString()}`,
                    change: "Live",
                    color: "#a61c9b",
                    bg: "#fbeaf5",
                    Icon: TrendingUp,
                  },
                  {
                    label: "Total Orders",
                    value: metrics.totalOrders || 0,
                    change: "Live",
                    color: "#2E7D32",
                    bg: "#E8F5E9",
                    Icon: ShoppingBag,
                  },
                  {
                    label: "Customers",
                    value: metrics.totalUsers || 0,
                    change: "Live",
                    color: "#1565C0",
                    bg: "#E3F2FD",
                    Icon: Users,
                  },
                  {
                    label: "Products",
                    value: metrics.totalProducts || 0,
                    change: "Live",
                    color: "#E65100",
                    bg: "#FFF3E0",
                    Icon: Package,
                  },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="bg-white rounded-2xl border border-border p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: kpi.bg }}
                      >
                        <kpi.Icon
                          className="w-4 h-4"
                          style={{ color: kpi.color }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-accent">
                        {kpi.change}
                      </span>
                    </div>
                    <p
                      className="text-2xl font-bold"
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        color: kpi.color,
                      }}
                    >
                      {kpi.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {kpi.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Revenue Chart */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <h2
                  className="font-bold mb-4"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Revenue Overview (2026)
                </h2>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient
                        id="revenueGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#a61c9b"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#a61c9b"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#a61c9b"
                      strokeWidth={2}
                      fill="url(#revenueGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Orders Chart + Recent */}
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-border p-5">
                  <h2
                    className="font-bold mb-4"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Orders by Month
                  </h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="orders"
                        fill="#2E7D32"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl border border-border p-5">
                  <h2
                    className="font-bold mb-4"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Recent Orders
                  </h2>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <p className="font-medium">#{order.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{order.total || order.amount}</p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          {section === "products" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1
                  className="text-2xl font-bold"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Products
                </h1>
                <button
                  onClick={() => {
                    setEditProduct(null);
                    setProductForm({
                      name: "",
                      description: "",
                      price: "",
                      stock: "",
                      imageUrl: "",
                      active: true,
                      categoryId: categories[0]?.id || "",
                    });
                    setShowProductForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #a61c9b, #d82a81)",
                  }}
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              {showProductForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-border shadow-2xl overflow-y-auto max-h-[90vh]">
                    <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {editProduct ? "Edit Product" : "Add New Product"}
                    </h2>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Product Name</label>
                        <input
                          type="text"
                          required
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Description</label>
                        <textarea
                          required
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-border text-sm h-20 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Price (₹)</label>
                          <input
                            type="number"
                            required
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Stock</label>
                          <input
                            type="number"
                            required
                            value={productForm.stock}
                            onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Category</label>
                        <select
                          value={productForm.categoryId}
                          onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Product Image</label>
                        <div className="flex gap-3 items-center">
                          <input
                            type="text"
                            placeholder="Image URL"
                            value={productForm.imageUrl}
                            onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-xl border border-border text-sm"
                          />
                          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:bg-muted text-xs font-semibold cursor-pointer">
                            <Upload className="w-3.5 h-3.5" /> Upload
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {productForm.imageUrl && (
                          <img
                            src={productForm.imageUrl}
                            alt="preview"
                            className="w-16 h-16 object-cover rounded-lg mt-2 border border-border"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="active"
                          checked={productForm.active}
                          onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })}
                        />
                        <label htmlFor="active" className="text-xs font-semibold cursor-pointer">Active (Visible in Shop)</label>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowProductForm(false);
                            setEditProduct(null);
                          }}
                          className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                          style={{ background: "linear-gradient(135deg, #a61c9b, #d82a81)" }}
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead style={{ background: "#f8f9fc" }}>
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                          Product
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                          Category
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                          Price
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                          Stock
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                          Status
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {products.map((product) => (
                        <tr
                          key={product.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.imageUrl || product.image}
                                alt={product.name}
                                className="w-9 h-9 rounded-lg object-cover bg-muted flex-shrink-0"
                              />
                              <span className="font-medium line-clamp-1 max-w-xs">
                                {product.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 capitalize text-muted-foreground">
                            {categories.find((c) => c.id === product.categoryId)?.name || product.category || "—"}
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            ₹{product.price}
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            {product.stock || 0}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                            >
                              {product.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditProductClick(product)}
                                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Orders */}
          {section === "orders" && (
            <div>
              <h1
                className="text-2xl font-bold mb-6"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Orders Management
              </h1>
              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead style={{ background: "#f8f9fc" }}>
                      <tr>
                        {[
                          "Order ID",
                          "Date",
                          "ItemsCount",
                          "Total",
                          "Status",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3 font-semibold">
                            #{order.id}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.date}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {order.items?.length || order.items || 0}
                          </td>
                          <td className="px-4 py-3 font-bold">
                            ₹{order.total || order.amount}
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative inline-block">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className={`text-xs font-medium pl-2 pr-6 py-1 rounded-full border-0 cursor-pointer appearance-none ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}
                              >
                                {[
                                  "Processing",
                                  "Shipped",
                                  "Delivered",
                                  "Cancelled",
                                ].map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Analytics */}
          {section === "analytics" && (
            <div className="space-y-6">
              <h1
                className="text-2xl font-bold"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Analytics
              </h1>
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-border p-5">
                  <h2
                    className="font-bold mb-4"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Sales by Category
                  </h2>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categoryData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl border border-border p-5">
                  <h2
                    className="font-bold mb-4"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Revenue vs Orders
                  </h2>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip />
                      <Bar
                        yAxisId="left"
                        dataKey="revenue"
                        fill="#a61c9b"
                        radius={[4, 4, 0, 0]}
                        opacity={0.8}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="orders"
                        fill="#2E7D32"
                        radius={[4, 4, 0, 0]}
                        opacity={0.8}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Inventory */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <h2
                  className="font-bold mb-4"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Inventory Insights
                </h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    {
                      label: "In Stock",
                      count: products.filter((p) => p.stock > 0).length,
                      color: "#2E7D32",
                      bg: "#E8F5E9",
                    },
                    {
                      label: "Out of Stock",
                      count: products.filter((p) => p.stock <= 0).length,
                      color: "#d32f2f",
                      bg: "#FFEBEE",
                    },
                    {
                      label: "Low Stock (< 5)",
                      count: products.filter((p) => p.stock > 0 && p.stock < 5).length,
                      color: "#E65100",
                      bg: "#FFF3E0",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl p-4"
                      style={{ background: s.bg }}
                    >
                      <p
                        className="text-2xl font-bold"
                        style={{
                          color: s.color,
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        {s.count}
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{ color: s.color }}
                      >
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
