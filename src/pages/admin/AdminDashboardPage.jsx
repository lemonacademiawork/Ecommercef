import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { BarChart2, Package, Users, ShoppingBag, TrendingUp, Eye } from "lucide-react";
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

const colors = ["#a61c9b", "#2E7D32", "#FFD54F", "#9c27b0", "#ff5722", "#00bcd4", "#3f51b5"];

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentOrders() {
      try {
        // Fetch ONLY orders that are PAID
        const response = await api.get('/api/admin/orders?paymentStatus=PAID&page=0&size=5&sortBy=createdAt&sortDir=desc');
        const content = response?.data?.content || response?.data || response?.content || response || [];
        const rawList = Array.isArray(content) ? content : [];
        const paidOrders = rawList.filter((order) => {
          const payStatus = String(order.paymentStatus || "").toUpperCase();
          const orderStatus = String(order.status || "").toUpperCase();
          if (payStatus === "UNPAID" || payStatus === "PENDING" || payStatus === "FAILED" || payStatus === "CANCELLED") return false;
          if (orderStatus === "PENDING" || orderStatus === "UNPAID" || orderStatus === "CANCELLED") return false;
          return true;
        });
        setRecentOrders(paidOrders.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch recent orders:', err);
      }
    }

    async function loadDashboardData() {
      setLoading(true);
      try {
        const [statsRes] = await Promise.all([
          api.admin.getDashboardMetrics(),
          fetchRecentOrders(),
        ]);

        if (statsRes && statsRes.data) {
          setStats(statsRes.data);
        } else if (statsRes) {
          setStats(statsRes);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Backend dashboard response payload values
  const totalRevenue = Number(stats.totalRevenue ?? stats.revenue ?? 0);
  const totalOrders = Number(stats.totalOrders ?? stats.ordersCount ?? 0);
  const totalUsers = Number(stats.totalUsers ?? stats.usersCount ?? 0);
  const totalProducts = Number(stats.totalProducts ?? stats.productsCount ?? 0);

  const outOfStockCount = Number(stats.outOfStockProducts ?? stats.outOfStock ?? 0);
  const lowStockCount = Number(stats.lowStockProducts ?? stats.lowStock ?? 0);
  const inStockCount = Number(stats.inStockProducts ?? stats.inStock ?? (totalProducts - outOfStockCount));

  // Monthly Analytics for Revenue Overview & Revenue vs Orders charts
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIdx = new Date().getMonth();

  const monthlyChartData = stats.monthlyAnalytics && Array.isArray(stats.monthlyAnalytics) && stats.monthlyAnalytics.length > 0
    ? stats.monthlyAnalytics.map((item) => ({
        month: item.month,
        revenue: Number(item.revenue || 0),
        orders: Number(item.orderCount || item.orders || 0),
      }))
    : months.map((m, idx) => ({
        month: m,
        revenue: idx <= currentMonthIdx ? Math.round((totalRevenue / (currentMonthIdx + 1))) : 0,
        orders: idx <= currentMonthIdx ? Math.round((totalOrders / (currentMonthIdx + 1))) : 0,
      }));

  // Stock By Category Donut Chart
  const stockByCategoryData = stats.stockByCategory && Array.isArray(stats.stockByCategory) && stats.stockByCategory.length > 0
    ? stats.stockByCategory.map((item, index) => ({
        name: item.categoryName || item.name || `Category ${index + 1}`,
        value: Number(item.productCount || item.value || 0),
        color: colors[index % colors.length],
      }))
    : [
        { name: "In Stock", value: inStockCount || 1, color: "#2E7D32" },
        { name: "Low Stock", value: lowStockCount, color: "#E65100" },
        { name: "Out of Stock", value: outOfStockCount, color: "#d32f2f" },
      ].filter((item) => item.value > 0);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm font-medium">Loading dashboard overview...</p>
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
            value: `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            change: "Live",
            color: "#a61c9b",
            bg: "#fbeaf5",
            Icon: TrendingUp,
          },
          {
            label: "Total Orders",
            value: totalOrders,
            change: "Live",
            color: "#2E7D32",
            bg: "#E8F5E9",
            Icon: ShoppingBag,
          },
          {
            label: "Customers",
            value: totalUsers,
            change: "Live",
            color: "#1565C0",
            bg: "#E3F2FD",
            Icon: Users,
          },
          {
            label: "Products",
            value: totalProducts,
            change: "Live",
            color: "#E65100",
            bg: "#FFF3E0",
            Icon: Package,
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-2xl border border-border p-5 shadow-sm"
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
        {/* Revenue Overview Area Chart */}
        <div className="bg-white rounded-2xl border border-border p-5 lg:col-span-2 min-w-0 overflow-hidden shadow-sm">
          <h2
            className="font-bold mb-4"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Revenue Overview (2026)
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyChartData}>
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
              <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, "Revenue"]} />
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

        {/* Stock by Category Donut Chart */}
        <div className="bg-white rounded-2xl border border-border p-5 min-w-0 overflow-hidden shadow-sm">
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
                  data={stockByCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stockByCategoryData.map((entry, index) => (
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
              <span className="text-xl font-bold">{totalProducts}</span>
              <span className="text-xs text-muted-foreground">Total Products</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {stockByCategoryData.slice(0, 4).map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
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
        {/* Recent Orders (Lightweight 5-item list) */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-bold text-base"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Recent Orders
            </h2>
            <button
              onClick={() => navigate("/admin/orders")}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
            >
              View All Orders <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px]">
                <tr>
                  <th className="p-2">Order ID</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Status</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      No recent orders
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/20">
                      <td className="p-2 font-semibold text-primary">#{order.id}</td>
                      <td className="p-2 text-muted-foreground">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="p-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                          {order.status || "PAID"}
                        </span>
                      </td>
                      <td className="p-2 text-right font-bold">
                        ₹{Number(order.totalAmount || order.subtotal || order.amount || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive Inventory Insights Cards */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm flex flex-col justify-between">
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
                  count: inStockCount,
                  color: "#2E7D32",
                  bg: "#E8F5E9",
                  filter: "IN_STOCK",
                },
                {
                  label: "Out of Stock",
                  count: outOfStockCount,
                  color: "#d32f2f",
                  bg: "#FFEBEE",
                  filter: "OUT_OF_STOCK",
                },
                {
                  label: "Low Stock (< 5)",
                  count: lowStockCount,
                  color: "#E65100",
                  bg: "#FFF3E0",
                  filter: "LOW_STOCK",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  onClick={() => navigate(`/admin/products?stockFilter=${s.filter}`)}
                  className="rounded-xl p-4 cursor-pointer hover:shadow-md transition-all border border-transparent hover:border-border"
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
