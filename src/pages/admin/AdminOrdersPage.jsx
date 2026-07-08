import { useState, useEffect } from "react";
import { ChevronDown, Eye, X } from "lucide-react";
import { api } from "../../services/api";

const statusColors = {
  Processing: "bg-yellow-100 text-yellow-700",
  Shipped: "bg-blue-100 text-blue-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
};

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const orderRes = await api.admin.listAllOrders();
      if (orderRes.success && orderRes.data) {
        setOrders(orderRes.data);
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.admin.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error("Failed to update status: " + err.message);
    }
  };

  const handleViewOrderDetails = async (order) => {
    try {
      const res = await api.admin.getOrderDetails(order.id);
      if (res.success && res.data) {
        setSelectedOrder(res.data);
      } else {
        setSelectedOrder(order);
      }
    } catch (err) {
      // fallback to current order object if api fails
      setSelectedOrder(order);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading orders list...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        Orders Management
      </h1>

      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: "#f8f9fc" }}>
              <tr>
                {[
                  "Order ID",
                  "Date",
                  "Items Count",
                  "Total Amount",
                  "Status",
                  "Actions",
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
                  <td className="px-4 py-3 font-semibold text-primary">
                    #{order.id}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.date}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-medium">
                    {order.items?.length || order.items || 0} items
                  </td>
                  <td className="px-4 py-3 font-bold text-foreground">
                    ₹{order.totalAmount || order.total || order.amount}
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative inline-block">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-semibold pl-3 pr-8 py-1.5 rounded-full border-0 cursor-pointer appearance-none ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}
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
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-muted-foreground" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleViewOrderDetails(order)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted font-medium transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details drawer/modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
          <div className="bg-white h-screen max-w-md w-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-250">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                <div>
                  <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Order Details
                  </h2>
                  <p className="text-xs text-muted-foreground">ID: #{selectedOrder.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Status card */}
                <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">STATUS</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{selectedOrder.status}</p>
                  </div>
                  <div className="relative">
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                      className={`text-xs font-semibold pl-3 pr-8 py-1.5 rounded-full border-0 cursor-pointer appearance-none ${statusColors[selectedOrder.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {["Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Ordered Items</h3>
                  <div className="space-y-3.5">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex gap-3 justify-between items-start">
                        <div className="flex gap-2.5">
                          <img
                            src={item.product?.imageUrl || item.product?.image || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop&auto=format"}
                            alt={item.product?.name || "Product"}
                            className="w-11 h-11 object-cover rounded-lg bg-muted flex-shrink-0 border border-border"
                          />
                          <div>
                            <p className="text-xs font-bold text-foreground line-clamp-1">{item.product?.name || "Craft Item"}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">₹{item.price} × {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-xs font-bold">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping info */}
                {selectedOrder.address && (
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-sm font-semibold mb-2">Shipping Address</h3>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <p className="font-semibold text-foreground">{selectedOrder.address.fullName || selectedOrder.address.name}</p>
                      <p>{selectedOrder.address.streetAddress || selectedOrder.address.addressLine1}</p>
                      <p>{selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.postalCode || selectedOrder.address.zipCode}</p>
                      <p>Phone: {selectedOrder.address.phoneNumber || selectedOrder.address.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Total Footer */}
            <div className="pt-4 border-t border-border mt-6 flex justify-between items-center">
              <span className="text-sm font-semibold text-muted-foreground">TOTAL AMOUNT</span>
              <span className="text-xl font-extrabold text-primary">₹{selectedOrder.totalAmount || selectedOrder.total || selectedOrder.amount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
