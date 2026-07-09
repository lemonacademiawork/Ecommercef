import { useState, useEffect } from "react";
import { BarChart2, Package, Users, ShoppingBag, TrendingUp } from "lucide-react";
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
import { api } from "../../services/api";

const getOrderTotal = (order) => {
  const amount = Number(order?.totalAmount || order?.total || order?.amount || 0);
  if (amount === 0) return 0;
  return amount > 499 ? amount : amount + 49;
};

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

const colors = ["#a61c9b", "#2E7D32", "#FFD54F", "#9c27b0", "#ff5722", "#00bcd4", "#3f51b5"];

export function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metricRes, prodRes, catRes, orderRes] = await Promise.all([
        api.admin.getDashboardMetrics(),
        api.products.listProducts({ all: true }),
        api.categories.listCategories(true),
        api.admin.listAllOrders(),
      ]);
      if (metricRes.success && metricRes.data) {
        setMetrics(metricRes.data);
      }
      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
      if (orderRes.success && orderRes.data) {
        setOrders(orderRes.data);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const dynamicCategoryData = categories.length > 0
    ? categories.map((cat, i) => ({
        name: cat.name,
        value: products.filter((p) => p.categoryId === cat.id).length || 0,
        color: colors[i % colors.length],
      })).filter((item) => item.value > 0)
    : categoryData;

  const displayYear = orders.length > 0
    ? Math.max(...orders.map(o => {
        const d = o.createdAt ? new Date(o.createdAt) : (o.date ? new Date(o.date) : null);
        return d ? d.getFullYear() : 2026;
      }))
    : 2026;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dynamicSalesData = months.map((m) => ({ month: m, revenue: 0, orders: 0 }));

  let calculatedTotalRevenue = 0;
  let calculatedTotalOrders = 0;

  orders.forEach((order) => {
    // Exclude cancelled orders from dashboard metrics
    if (order.status === "Cancelled") return;

    const date = order.createdAt ? new Date(order.createdAt) : (order.date ? new Date(order.date) : null);
    if (date && date.getFullYear() === displayYear) {
      const monthIdx = date.getMonth();
      if (monthIdx >= 0 && monthIdx < 12) {
        const amount = getOrderTotal(order);
        dynamicSalesData[monthIdx].revenue += amount;
        dynamicSalesData[monthIdx].orders += 1;
        calculatedTotalRevenue += amount;
        calculatedTotalOrders += 1;
      }
    }
  });

  const chartData = dynamicSalesData;

  const finalPieData = dynamicCategoryData.length > 0 
    ? dynamicCategoryData 
    : categories.map((cat, i) => ({
        name: cat.name,
        value: 1,
        color: colors[i % colors.length],
      }));

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading overview metrics...</p>
        </div>
      </div>
    );
  }

  return (
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
            value: `₹${calculatedTotalRevenue.toLocaleString()}`,
            change: "Live",
            color: "#a61c9b",
            bg: "#fbeaf5",
            Icon: TrendingUp,
          },
          {
            label: "Total Orders",
            value: calculatedTotalOrders,
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-border p-5 lg:col-span-2 min-w-0 overflow-hidden">
          <h2
            className="font-bold mb-4"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Revenue Overview ({displayYear})
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="#888" fontSize={11} />
              <YAxis stroke="#888" fontSize={11} />
              <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#a61c9b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Categories Pie Chart */}
        <div className="bg-white rounded-2xl border border-border p-5 min-w-0 overflow-hidden">
          <h2
            className="font-bold mb-4"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Stock by Category
          </h2>
          <div className="h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {finalPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Products"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-xl font-bold">{products.length}</span>
              <span className="text-xs text-muted-foreground">Total Products</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {finalPieData.slice(0, 4).map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="truncate text-muted-foreground">
                  {entry.name} ({entry.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Orders Bar Chart */}
        <div className="bg-white rounded-2xl border border-border p-5 min-w-0 overflow-hidden">
          <h2
            className="font-bold mb-4"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Revenue vs Orders
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
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

        {/* Inventory Insights */}
        <div className="bg-white rounded-2xl border border-border p-5 flex flex-col justify-between">
          <div>
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
      </div>
    </div>
  );
}
