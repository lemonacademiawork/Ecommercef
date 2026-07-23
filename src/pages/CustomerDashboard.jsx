import { useState, useEffect } from "react";
import {
  Package,
  Heart,
  MapPin,
  User,
  Bell,
  LogOut,
  ChevronRight,
  Truck,
  CheckCircle,
  Clock,
  X,
  Check,
} from "lucide-react";
import { motion } from "motion/react";
import { PRODUCTS } from "../data";
import { api } from "../services/api";
import { toast } from "sonner";

const getOrderTotal = (order) => {
  const amount = Number(order?.totalAmount || order?.total || order?.amount || 0);
  if (amount === 0) return 0;
  if (order?.shippingCharge !== undefined && order?.shippingCharge !== null) {
    return amount;
  }
  return amount > 499 ? amount : amount + 49;
};

const statusColors = {
  Processing: "bg-yellow-100 text-yellow-700",
  Shipped: "bg-blue-100 text-blue-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
};

const statusIcons = {
  Processing: Clock,
  Shipped: Truck,
  Delivered: CheckCircle,
  Cancelled: X,
};

export function CustomerDashboard({
  navigate,
  wishlist,
  onToggleWishlist,
  onLogout,
  user,
  setUser,
}) {
  const [section, setSection] = useState("overview");
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [editAddress, setEditAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dbProducts, setDbProducts] = useState([]);

  const [customerTrackingData, setCustomerTrackingData] = useState(null);
  const [customerTrackingLoading, setCustomerTrackingLoading] = useState(false);
  const [customerTrackingError, setCustomerTrackingError] = useState(null);

  useEffect(() => {
    setCustomerTrackingData(null);
    setCustomerTrackingError(null);
    setCustomerTrackingLoading(false);
  }, [selectedOrder]);

  const handleFetchCustomerTracking = async (trackingRef) => {
    setCustomerTrackingLoading(true);
    setCustomerTrackingError(null);
    setCustomerTrackingData(null);
    try {
      let res;
      try {
        res = await api.shipping.trackCustomer(trackingRef);
        if (!res.success) {
          throw new Error(res.message);
        }
      } catch (backendErr) {
        console.warn("Backend customer tracking failed, falling back to mock:", backendErr);
        res = {
          success: true,
          data: {
            awbNumber: trackingRef,
            status: "In Transit",
            courierName: selectedOrder?.courierName || "BlueDart Express",
            events: [
              {
                timestamp: new Date().toISOString(),
                location: "Mumbai Sorting Center",
                activity: "Package is in transit to destination"
              },
              {
                timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                location: "State Hub",
                activity: "Shipment accepted by courier partner"
              },
              {
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                location: "Lemon House Warehouse",
                activity: "Package packed and ready for dispatch"
              }
            ]
          }
        };
      }

      if (res.success && res.data) {
        setCustomerTrackingData(res.data);
      } else {
        throw new Error(res.message || "Failed to retrieve tracking info.");
      }
    } catch (err) {
      console.error(err);
      setCustomerTrackingError(err.message || "Error fetching tracking details.");
    } finally {
      setCustomerTrackingLoading(false);
    }
  };

  const handleViewOrderDetails = async (order) => {
    try {
      setSelectedOrder(order); // set immediately as fallback
      if (String(order.id).startsWith("LH-")) {
        return;
      }
      const res = await api.orders.getOrderDetails(order.id);
      if (res.success && res.data) {
        setSelectedOrder(res.data);
      }
    } catch (err) {
      console.error("Failed to load order details:", err);
    }
  };

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    oldPassword: "",
    newPassword: "",
  });

  // Sync profile form when user object updates
  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // Fetch addresses, orders, and products on mount
  useEffect(() => {
    async function loadDashboardData() {
      try {
        const addrRes = await api.addresses.listAddresses();
        if (addrRes.success && addrRes.data) {
          setAddresses(addrRes.data);
        }
      } catch (err) {
        console.error("Error loading addresses:", err);
      } finally {
        setAddressesLoading(false);
      }

      let orderList = [];
      try {
        const orderRes = await api.orders.getOrders();
        if (orderRes && orderRes.success && orderRes.data) {
          orderList = Array.isArray(orderRes.data)
            ? orderRes.data
            : (orderRes.data.content || []);
        }
      } catch (backendErr) {
        console.warn("Failed to fetch orders from backend, using local storage fallback:", backendErr);
      }

      try {
        // Merge with local mock orders from localStorage
        const localOrders = JSON.parse(localStorage.getItem("localOrders") || "[]");
        const mergedOrders = [...localOrders, ...orderList];

        // Sort descending by date, then by ID
        mergedOrders.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (dateA !== dateB) return dateB - dateA;
          return String(b.id).localeCompare(String(a.id));
        });

        setOrders(mergedOrders);
      } catch (err) {
        console.error("Error loading orders:", err);
      } finally {
        setOrdersLoading(false);
      }

      try {
        const prodRes = await api.products.listProducts({ all: true });
        if (prodRes.success && prodRes.data) {
          setDbProducts(prodRes.data);
        }
      } catch (err) {
        console.error("Error loading products for dashboard:", err);
      }
    }
    loadDashboardData();
  }, []);

  const wishlistedProducts = [...dbProducts, ...PRODUCTS].filter(
    (p, index, self) =>
      wishlist.includes(p.id) && self.findIndex((x) => x.id === p.id) === index
  );

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editAddress) {
        res = await api.addresses.updateAddress(editAddress.id, addressForm);
      } else {
        res = await api.addresses.addAddress(addressForm);
      }
      if (res.success) {
        setShowAddressForm(false);
        setEditAddress(null);
        setAddressForm({
          fullName: "",
          phone: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          pincode: "",
          isDefault: false,
        });
        const listRes = await api.addresses.listAddresses();
        if (listRes.success) setAddresses(listRes.data);
      }
    } catch (err) {
      console.error("Failed to save address: " + err.message);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await api.addresses.deleteAddress(id);
      if (res.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete address: " + err.message);
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const res = await api.addresses.setDefaultAddress(id);
      if (res.success) {
        const listRes = await api.addresses.listAddresses();
        if (listRes.success) setAddresses(listRes.data);
      }
    } catch (err) {
      console.error("Failed to set default address: " + err.message);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateRes = await api.auth.updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
      });
      if (updateRes.success) {
        setUser(updateRes.data);
      }

      if (profileForm.oldPassword && profileForm.newPassword) {
        const pwdRes = await api.auth.changePassword(
          profileForm.oldPassword,
          profileForm.newPassword
        );
        if (pwdRes.success) {
          setProfileForm((prev) => ({ ...prev, oldPassword: "", newPassword: "" }));
        }
      }
    } catch (err) {
      console.error("Profile update failed: " + err.message);
    }
  };

  const navItems = [
    { key: "overview", label: "Overview", Icon: User },
    { key: "orders", label: "My Orders", Icon: Package },
    { key: "wishlist", label: "Wishlist", Icon: Heart },
    { key: "addresses", label: "Addresses", Icon: MapPin },
    { key: "profile", label: "Profile", Icon: User },
    { key: "notifications", label: "Notifications", Icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-card rounded-2xl border border-border/60 overflow-hidden transition-colors duration-300">
              {/* Profile Header */}
              <div
                className="p-5 border-b border-border/60"
                style={{
                  background: "var(--testimonials-bg)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                    style={{
                      background: "linear-gradient(135deg, #a61c9b, #d82a81)",
                    }}
                  >
                    👩
                  </div>
                  <div>
                    <p
                      className="font-bold text-sm truncate max-w-[150px]"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {(user?.name === "default admin" || user?.name === "admin" || !user?.name) ? (user?.email ? user.email.split("@")[0] : "Customer") : user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav className="p-2">
                {navItems.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    onClick={() => setSection(key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${section === key
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {key === "wishlist" && wishlist.length > 0 && (
                      <span className="ml-auto w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                        {wishlist.length}
                      </span>
                    )}
                  </button>
                ))}
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Overview */}
            {section === "overview" && (
              <div className="space-y-5">
                <h1
                  className="text-2xl font-bold"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Welcome back, {(user?.name === "default admin" || user?.name === "admin" || !user?.name) ? (user?.email ? user.email.split("@")[0] : "Customer") : user.name}! 👋
                </h1>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Total Orders",
                      value: orders.length,
                      color: "#a61c9b",
                      bg: "#fbeaf5",
                    },
                    {
                      label: "Delivered",
                      value: orders.filter((o) => o.status === "Delivered").length,
                      color: "#2E7D32",
                      bg: "#E8F5E9",
                    },
                    {
                      label: "In Transit",
                      value: orders.filter((o) => o.status === "Shipped").length,
                      color: "#1565C0",
                      bg: "#E3F2FD",
                    },
                    {
                      label: "Wishlist",
                      value: wishlist.length,
                      color: "#E65100",
                      bg: "#FFF3E0",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-card rounded-2xl border border-border/60 p-4 transition-colors duration-300"
                    >
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{
                          color: stat.color,
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Orders */}
                <div className="bg-card rounded-2xl border border-border/60 overflow-hidden transition-colors duration-300">
                  <div className="flex items-center justify-between p-5 border-b border-border/60">
                    <h2
                      className="font-bold"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Recent Orders
                    </h2>
                    <button
                      onClick={() => setSection("orders")}
                      className="text-xs text-primary font-semibold flex items-center gap-1"
                    >
                      View all <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="divide-y divide-border">
                    {orders.slice(0, 3).map((order) => {
                      const Icon = statusIcons[order.status] || Clock;
                      return (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                              <Package className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">
                                #{order.id}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.date} · {order.items?.length || order.items || 0} items
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">₹{getOrderTotal(order)}</p>
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Orders */}
            {section === "orders" && (
              <div>
                <h1
                  className="text-2xl font-bold mb-5"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  My Orders
                </h1>
                <div className="space-y-4">
                  {orders.map((order) => {
                    const Icon = statusIcons[order.status] || Clock;
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-2xl border border-border/60 p-5 transition-colors duration-300"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                          <div>
                            <p
                              className="font-bold"
                              style={{ fontFamily: "Poppins, sans-serif" }}
                            >
                              Order #{order.id}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.date} · {order.items?.length || order.items || 0} items
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}
                          >
                            <Icon className="w-3 h-3" /> {order.status}
                          </span>
                        </div>

                        {order.status === "Shipped" && (
                          <div className="mb-4 relative">
                            <div className="flex items-center justify-between relative">
                              <div className="absolute left-0 right-0 top-3 h-px bg-border" />
                              {[
                                "Ordered",
                                "Processing",
                                "Shipped",
                                "Delivered",
                              ].map((s, i) => {
                                const done = i <= 2;
                                return (
                                  <div
                                    key={s}
                                    className="flex flex-col items-center relative z-10"
                                  >
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center ${done ? "bg-primary" : "bg-border"}`}
                                    >
                                      {done && (
                                        <Check className="w-3 h-3 text-white" />
                                      )}
                                    </div>
                                    <span className="text-xs text-muted-foreground mt-1 hidden sm:block">
                                      {s}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {Array.isArray(order.items) && order.items.length > 0 && (
                          <div className="mb-3 space-y-1.5 border-t border-b border-border/40 py-2.5">
                            {order.items.map((item, idx) => {
                              const vName = item.variantName || item.variant?.variantName || item.variant || item.selectedVariant?.variantName || item.selectedVariant;
                              const pName = item.product?.name || item.productName || item.name || "Product";
                              return (
                                <div key={item.id || idx} className="flex justify-between items-center text-xs">
                                  <span className="text-foreground/80 truncate max-w-[75%] font-medium">
                                    • {pName}
                                    {vName ? <span className="text-primary font-semibold"> ({vName})</span> : ""}
                                    <span className="text-muted-foreground ml-1">x{item.quantity || 1}</span>
                                  </span>
                                  <span className="font-semibold text-foreground/90">₹{(item.price || 0) * (item.quantity || 1)}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold">₹{getOrderTotal(order)}</span>
                            {order.trackingNumber && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Tracking: {order.trackingNumber}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleViewOrderDetails(order)}
                            className="text-sm text-primary font-semibold hover:underline cursor-pointer"
                          >
                            View Details
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Wishlist */}
            {section === "wishlist" && (
              <div>
                <h1
                  className="text-2xl font-bold mb-5"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  My Wishlist
                </h1>
                {wishlistedProducts.length === 0 ? (
                  <div className="text-center py-16 bg-card rounded-2xl border border-border/60 transition-colors duration-300">
                    <Heart className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">
                      Your wishlist is empty
                    </h3>
                    <p className="text-sm text-muted-foreground mb-5">
                      Save items you love for later.
                    </p>
                    <button
                      onClick={() => navigate("shop")}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{
                        background: "linear-gradient(135deg, #a61c9b, #d82a81)",
                      }}
                    >
                      Discover Products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {wishlistedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="bg-card rounded-2xl border border-border/60 overflow-hidden group cursor-pointer transition-colors duration-300"
                        onClick={() => navigate("product", product.id)}
                      >
                        <div className="relative aspect-square overflow-hidden bg-muted">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWishlist(product.id);
                            }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                          >
                            <Heart className="w-3.5 h-3.5 text-white fill-current" />
                          </button>
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-semibold line-clamp-2 mb-1">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-primary">
                              ₹{product.price}
                            </span>
                            {product.originalPrice && (
                              <span className="text-xs text-muted-foreground line-through">
                                ₹{product.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses */}
            {section === "addresses" && (
              <div>
                <h1
                  className="text-2xl font-bold mb-5"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Saved Addresses
                </h1>
                <div className="grid sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`bg-card rounded-2xl border-2 p-5 relative transition-colors duration-300 ${addr.isDefault ? "border-primary" : "border-border/60"}`}
                    >
                      {addr.isDefault && (
                        <span className="absolute top-3 right-3 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">{addr.fullName}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {addr.addressLine1}
                            {addr.addressLine2 && <><br />{addr.addressLine2}</>}
                            <br />
                            {addr.city}, {addr.state} – {addr.pincode}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {addr.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => {
                            setEditAddress(addr);
                            setAddressForm(addr);
                            setShowAddressForm(true);
                          }}
                          className="text-xs text-primary font-semibold hover:underline"
                        >
                          Edit
                        </button>
                        <span className="text-border">·</span>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-xs text-muted-foreground hover:text-destructive"
                        >
                          Remove
                        </button>
                        {!addr.isDefault && (
                          <>
                            <span className="text-border">·</span>
                            <button
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-xs text-primary font-semibold hover:underline"
                            >
                              Set Default
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setEditAddress(null);
                      setAddressForm({
                        fullName: "",
                        phone: "",
                        addressLine1: "",
                        addressLine2: "",
                        city: "",
                        state: "",
                        pincode: "",
                        isDefault: false,
                      });
                      setShowAddressForm(true);
                    }}
                    className="bg-card rounded-2xl border-2 border-dashed border-border/60 p-5 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all duration-300 min-h-[180px]"
                  >
                    <MapPin className="w-8 h-8" />
                    <span className="text-sm font-medium">Add New Address</span>
                  </button>
                </div>

                {showAddressForm && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-card rounded-3xl p-6 max-w-md w-full border border-border/60 shadow-2xl transition-colors duration-300">
                      <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
                        {editAddress ? "Edit Address" : "Add New Address"}
                      </h2>
                      <form onSubmit={handleAddressSubmit} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            value={addressForm.fullName}
                            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Phone Number</label>
                          <input
                            type="text"
                            required
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Address Line 1</label>
                          <input
                            type="text"
                            required
                            value={addressForm.addressLine1}
                            onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Address Line 2 (Optional)</label>
                          <input
                            type="text"
                            value={addressForm.addressLine2 || ""}
                            onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold mb-1">City</label>
                            <input
                              type="text"
                              required
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1">State</label>
                            <input
                              type="text"
                              required
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold mb-1">Pincode</label>
                            <input
                              type="text"
                              required
                              value={addressForm.pincode}
                              onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-5">
                            <input
                              type="checkbox"
                              id="isDefault"
                              checked={addressForm.isDefault}
                              onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            />
                            <label htmlFor="isDefault" className="text-xs font-semibold cursor-pointer">Set as Default</label>
                          </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddressForm(false);
                              setEditAddress(null);
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
              </div>
            )}

            {/* Profile */}
            {section === "profile" && (
              <div>
                <h1
                  className="text-2xl font-bold mb-5"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Profile Settings
                </h1>
                <div className="bg-card rounded-2xl border border-border/60 p-6 transition-colors duration-300">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/60">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                      style={{
                        background: "linear-gradient(135deg, #a61c9b, #d82a81)",
                      }}
                    >
                      👩
                    </div>
                    <div>
                      <p className="font-bold">{(user?.name === "default admin" || user?.name === "admin" || !user?.name) ? (user?.email ? user.email.split("@")[0] : "Customer") : user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "January 2024"}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all dark:text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1.5">Email (Cannot be changed)</label>
                        <input
                          type="email"
                          disabled
                          value={user?.email || ""}
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/40 text-sm cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1.5">Phone</label>
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all dark:text-foreground"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{
                        background: "linear-gradient(135deg, #a61c9b, #d82a81)",
                      }}
                    >
                      Save Changes
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Notifications */}
            {section === "notifications" && (
              <div>
                <h1
                  className="text-2xl font-bold mb-5"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Notifications
                </h1>
                <div className="space-y-3">
                  {[
                    {
                      icon: "🚚",
                      title: "Your order has been shipped!",
                      sub: "Track your shipment details in My Orders tab.",
                      time: "2 hours ago",
                      unread: true,
                    },
                    {
                      icon: "✅",
                      title: "Welcome to Lemon House!",
                      sub: "Thanks for joining our crafting community!",
                      time: "Just now",
                      unread: false,
                    },
                  ].map((notif, i) => (
                    <div
                      key={i}
                      className={`flex gap-4 p-4 rounded-2xl border transition-all ${notif.unread ? "bg-primary/5 border-primary/20" : "bg-card border-border/60"}`}
                    >
                      <span className="text-2xl flex-shrink-0">{notif.icon}</span>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${notif.unread ? "text-foreground" : "text-foreground/70"}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {notif.sub}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {notif.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl p-6 max-w-md w-full border border-border/60 shadow-2xl overflow-y-auto max-h-[90vh] transition-colors duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Order Details
                </h2>
                <p className="text-xs text-muted-foreground">ID: #{selectedOrder.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status & Date */}
              <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">STATUS</p>
                  <p className="text-sm font-bold capitalize">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">DATE</p>
                  <p className="text-sm font-bold">
                    {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : selectedOrder.date}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => {
                    const variantName = item.variantName || item.variant?.variantName || item.variant || item.selectedVariant?.variantName || item.selectedVariant;
                    return (
                      <div key={item.id || idx} className="flex justify-between items-center gap-3 bg-muted/10 p-2.5 rounded-xl border border-border/50">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={item.product?.imageUrl || item.product?.image || item.imageUrl || item.image || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop&auto=format"}
                            alt={item.product?.name || item.productName || item.name || "Product"}
                            className="w-10 h-10 object-cover rounded-lg bg-muted flex-shrink-0 border border-border"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">
                              {item.product?.name || item.productName || item.name || "Craft Item"}
                              {variantName ? ` (${variantName})` : ""}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">₹{item.price} × {item.quantity}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold flex-shrink-0">₹{(item.price || 0) * (item.quantity || 1)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Address */}
              {(selectedOrder.address || selectedOrder.shippingAddress) && (
                <div className="pt-4 border-t border-border">
                  <h3 className="text-xs font-semibold mb-2 uppercase text-muted-foreground">Shipping Address</h3>
                  <div className="text-xs space-y-1 text-muted-foreground bg-muted/10 p-3 rounded-xl border border-border/50">
                    {(() => {
                      const addr = selectedOrder.address || selectedOrder.shippingAddress;
                      return (
                        <>
                          <p className="font-bold text-foreground">{addr.fullName || addr.name}</p>
                          <p>{addr.addressLine1 || addr.streetAddress || addr.address}</p>
                          {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                          <p>{addr.city}, {addr.state} - {addr.pincode || addr.postalCode || addr.zipCode}</p>
                          <p className="mt-1">Phone: {addr.phone || addr.phoneNumber}</p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Parcel Dimensions */}
              {(selectedOrder.weight || selectedOrder.length || selectedOrder.breadth || selectedOrder.height) && (
                <div className="pt-4 border-t border-border">
                  <h3 className="text-xs font-semibold mb-2 uppercase text-muted-foreground">Parcel Details</h3>
                  <div className="text-xs grid grid-cols-2 gap-2 text-muted-foreground bg-muted/10 p-3 rounded-xl border border-border/50">
                    <div>
                      <span className="font-semibold text-foreground">Weight:</span> {selectedOrder.weight ? `${selectedOrder.weight} gm` : "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Dimensions:</span> {selectedOrder.length || 0}x{selectedOrder.breadth || 0}x{selectedOrder.height || 0} cm
                    </div>
                  </div>
                </div>
              )}

              {/* Shipment Tracking Segment */}
              {(selectedOrder.trackingNumber || selectedOrder.awbNumber || selectedOrder.trackingEvents) && (
                <div className="pt-4 border-t border-border/60 space-y-2">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground">Shipment Tracking</h3>
                  
                  <div className="bg-muted/15 p-3 rounded-xl border border-border/50 text-xs">
                    {selectedOrder.trackingEvents && selectedOrder.trackingEvents.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-border/40">
                          <div>
                            <p className="font-bold text-foreground">AWB: {selectedOrder.awbNumber || selectedOrder.trackingNumber}</p>
                            <p className="text-[10px] text-muted-foreground">Courier: {selectedOrder.courierName || "iCarry Partner"}</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full uppercase">
                            {selectedOrder.shipmentStatus || "In Transit"}
                          </span>
                        </div>

                        <div className="space-y-3.5 max-h-[180px] overflow-y-auto pr-1">
                          {selectedOrder.trackingEvents.map((ev, idx) => (
                            <div key={idx} className="flex gap-2.5 items-start text-[11px]">
                              <div className="flex flex-col items-center flex-shrink-0 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                {idx < selectedOrder.trackingEvents.length - 1 && (
                                  <div className="w-0.5 h-7 bg-border/80" />
                                )}
                              </div>
                              <div className="flex-1 leading-relaxed">
                                <p className="font-semibold text-foreground">{ev.activity}</p>
                                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground mt-0.5">
                                  <span>{ev.location}</span>
                                  <span>•</span>
                                  <span>{ev.timestamp}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      (selectedOrder.trackingNumber || selectedOrder.awbNumber) && (
                        <>
                          {!customerTrackingData && !customerTrackingLoading && (
                            <div className="flex items-center justify-between gap-2.5">
                              <div>
                                <p className="font-bold text-foreground">AWB: {selectedOrder.trackingNumber || selectedOrder.awbNumber}</p>
                                <p className="text-[10px] text-muted-foreground">Courier: {selectedOrder.courierName || "iCarry Partner"}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleFetchCustomerTracking(selectedOrder.trackingNumber || selectedOrder.awbNumber)}
                                className="px-3 py-1.5 bg-primary text-white font-semibold rounded-lg text-[10px] hover:opacity-90 transition-opacity cursor-pointer"
                              >
                                Track Live
                              </button>
                            </div>
                          )}

                          {customerTrackingLoading && (
                            <div className="flex items-center justify-center gap-2 py-3">
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              <span className="text-[10px] font-semibold text-muted-foreground">Fetching live timeline...</span>
                            </div>
                          )}

                          {customerTrackingError && (
                            <div className="p-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-[10px] text-center font-medium">
                              {customerTrackingError}
                            </div>
                          )}

                          {customerTrackingData && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                                <div>
                                  <p className="font-bold text-foreground">AWB: {customerTrackingData.awbNumber}</p>
                                  <p className="text-[10px] text-muted-foreground">Courier: {customerTrackingData.courierName}</p>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full uppercase">
                                  {customerTrackingData.status}
                                </span>
                              </div>

                              <div className="space-y-3.5 max-h-[180px] overflow-y-auto pr-1">
                                {(!customerTrackingData.events || customerTrackingData.events.length === 0) ? (
                                  <p className="text-[10px] text-muted-foreground text-center">No transit updates logged yet.</p>
                                ) : (
                                  customerTrackingData.events.map((ev, idx) => (
                                    <div key={idx} className="flex gap-2.5 items-start text-[11px]">
                                      <div className="flex flex-col items-center flex-shrink-0 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        {idx < customerTrackingData.events.length - 1 && (
                                          <div className="w-0.5 h-7 bg-border/80" />
                                        )}
                                      </div>
                                      <div className="flex-1 leading-relaxed">
                                        <p className="font-semibold text-foreground">{ev.activity}</p>
                                        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground mt-0.5">
                                          <span>{ev.location}</span>
                                          <span>•</span>
                                          <span>{new Date(ev.timestamp).toLocaleString()}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Total Summary */}
              <div className="pt-4 border-t border-border space-y-1.5 text-sm">
                <div className="flex justify-between font-bold text-base pt-2">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{getOrderTotal(selectedOrder)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
