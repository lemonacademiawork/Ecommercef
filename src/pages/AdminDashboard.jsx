import { useState } from "react";
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
import { PRODUCTS, ORDERS } from "../data";

const salesData = [
  { month: "Jan", revenue: 42000, orders: 134 },
  { month: "Feb", revenue: 38000, orders: 118 },
  { month: "Mar", revenue: 65000, orders: 201 },
  { month: "Apr", revenue: 71000, orders: 225 },
  { month: "May", revenue: 58000, orders: 183 },
  { month: "Jun", revenue: 89000, orders: 267 },
];

const categoryData = [
  { name: "Resin", value: 124, color: "#D81B8A" },
  { name: "Beads", value: 89, color: "#2E7D32" },
  { name: "Art", value: 183, color: "#FFD54F" },
  { name: "Fabric", value: 215, color: "#9c27b0" },
  { name: "Jewelry", value: 144, color: "#ff5722" },
];

const mockCustomers = [
  {
    name: "Priya Sharma",
    email: "priya@example.com",
    orders: 12,
    spent: "₹14,823",
    city: "Bengaluru",
    joined: "Jan 2024",
  },
  {
    name: "Meera Patel",
    email: "meera@example.com",
    orders: 8,
    spent: "₹9,245",
    city: "Mumbai",
    joined: "Mar 2024",
  },
  {
    name: "Ananya Krishnan",
    email: "ananya@example.com",
    orders: 15,
    spent: "₹18,610",
    city: "Chennai",
    joined: "Nov 2023",
  },
  {
    name: "Sneha Nair",
    email: "sneha@example.com",
    orders: 6,
    spent: "₹6,890",
    city: "Kochi",
    joined: "Apr 2024",
  },
  {
    name: "Divya Rao",
    email: "divya@example.com",
    orders: 21,
    spent: "₹27,340",
    city: "Hyderabad",
    joined: "Oct 2023",
  },
];

const statusColors = {
  Processing: "bg-yellow-100 text-yellow-700",
  Shipped: "bg-blue-100 text-blue-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
};

export function AdminDashboard() {
  const [section, setSection] = useState("dashboard");

  const navItems = [
    { key: "dashboard", label: "Dashboard", Icon: BarChart2 },
    { key: "products", label: "Products", Icon: Package },
    { key: "orders", label: "Orders", Icon: ShoppingBag },
    { key: "customers", label: "Customers", Icon: Users },
    { key: "analytics", label: "Analytics", Icon: TrendingUp },
  ];

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
                  background: "linear-gradient(135deg, #D81B8A, #e91ea0)",
                }}
              >
                🍋
              </div>
              <span
                className="font-bold text-sm"
                style={{ fontFamily: "Poppins, sans-serif", color: "#D81B8A" }}
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
                    value: "₹3,63,000",
                    change: "+18.2%",
                    color: "#D81B8A",
                    bg: "#FCE4EC",
                    Icon: TrendingUp,
                  },
                  {
                    label: "Total Orders",
                    value: "1,128",
                    change: "+12.4%",
                    color: "#2E7D32",
                    bg: "#E8F5E9",
                    Icon: ShoppingBag,
                  },
                  {
                    label: "Customers",
                    value: "50,248",
                    change: "+8.7%",
                    color: "#1565C0",
                    bg: "#E3F2FD",
                    Icon: Users,
                  },
                  {
                    label: "Products",
                    value: "1,097",
                    change: "+5.1%",
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
                          stopColor="#D81B8A"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#D81B8A"
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
                      stroke="#D81B8A"
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
                    {ORDERS.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <p className="font-medium">#{order.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{order.total}</p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}
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
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{
                    background: "linear-gradient(135deg, #D81B8A, #e91ea0)",
                  }}
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
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
                          Rating
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                          Stock
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {PRODUCTS.map((product) => (
                        <tr
                          key={product.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-9 h-9 rounded-lg object-cover bg-muted flex-shrink-0"
                              />
                              <span className="font-medium line-clamp-1 max-w-xs">
                                {product.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 capitalize text-muted-foreground">
                            {product.category}
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            ₹{product.price}
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1">
                              ⭐ {product.rating}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                            >
                              {product.inStock ? "In Stock" : "Out of Stock"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-destructive">
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
                          "Customer",
                          "Items",
                          "Total",
                          "Status",
                          "Tracking",
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
                      {[
                        ...ORDERS,
                        ...ORDERS.map((o) => ({
                          ...o,
                          id: o.id + "B",
                          status: "Processing",
                        })),
                      ].map((order, i) => (
                        <tr
                          key={i}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3 font-semibold">
                            #{order.id}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {order.date}
                          </td>
                          <td className="px-4 py-3">Priya Sharma</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {order.items}
                          </td>
                          <td className="px-4 py-3 font-bold">
                            ₹{order.total}
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative inline-block">
                              <select
                                defaultValue={order.status}
                                className={`text-xs font-medium pl-2 pr-6 py-1 rounded-full border-0 cursor-pointer appearance-none ${statusColors[order.status]}`}
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
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {order.trackingNumber || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Customers */}
          {section === "customers" && (
            <div>
              <h1
                className="text-2xl font-bold mb-6"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Customer Database
              </h1>
              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead style={{ background: "#f8f9fc" }}>
                      <tr>
                        {[
                          "Customer",
                          "Email",
                          "City",
                          "Orders",
                          "Total Spent",
                          "Joined",
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
                      {mockCustomers.map((c) => (
                        <tr
                          key={c.email}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                                style={{
                                  background: "#FCE4EC",
                                  color: "#D81B8A",
                                }}
                              >
                                {c.name[0]}
                              </div>
                              <span className="font-medium">{c.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {c.email}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {c.city}
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            {c.orders}
                          </td>
                          <td className="px-4 py-3 font-bold text-primary">
                            {c.spent}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {c.joined}
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
                        fill="#D81B8A"
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
                      count: PRODUCTS.filter((p) => p.inStock).length,
                      color: "#2E7D32",
                      bg: "#E8F5E9",
                    },
                    {
                      label: "Out of Stock",
                      count: PRODUCTS.filter((p) => !p.inStock).length,
                      color: "#d32f2f",
                      bg: "#FFEBEE",
                    },
                    {
                      label: "Low Stock (< 5)",
                      count: 3,
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
