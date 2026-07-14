import { useState, useEffect } from "react";
import { Settings, Save, Bell, Sliders, MapPin } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "sonner";

export function AdminSettingsPage() {
  const [shopName, setShopName] = useState("Lemon House");
  const [alertEmail, setAlertEmail] = useState("admin@lemonhouse.in");
  const [currency, setCurrency] = useState("INR (₹)");
  const [maintenance, setMaintenance] = useState(false);
  const [saving, setSaving] = useState(false);

  const [warehouseAddress, setWarehouseAddress] = useState({
    id: null,
    contactPerson: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "IN",
  });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("icarry_warehouse_address");
    if (saved) {
      try {
        setWarehouseAddress(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved warehouse address:", e);
      }
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Store settings updated successfully.");
    }, 800);
  };

  const handleSaveWarehouseAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const res = await api.shipping.savePickupAddress(warehouseAddress);
      
      if (res.success && res.message === "Validation failed") {
        const errorDetails = typeof res.data === "object" 
          ? Object.entries(res.data).map(([k, v]) => `${k}: ${v}`).join(", ") 
          : "";
        throw new Error(`Validation failed. ${errorDetails || "Please check address fields."}`);
      }

      if (res.success && res.data) {
        const updatedAddress = { ...warehouseAddress, id: res.data };
        setWarehouseAddress(updatedAddress);
        localStorage.setItem("icarry_warehouse_address", JSON.stringify(updatedAddress));
        localStorage.setItem("icarry_pickup_address_id", res.data);
        toast.success("Warehouse Pickup Address registered with iCarry! ID: " + res.data);
      } else {
        throw new Error(res.message || "Failed to save warehouse pickup address.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setSavingAddress(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1
        className="text-2xl font-bold"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        Console Settings
      </h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile/General section */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
            <Sliders className="w-4 h-4 text-primary" /> General Store Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold mb-1">Store Display Name</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Currency Symbol</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-white"
              >
                <option>INR (₹)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
            <Bell className="w-4 h-4 text-primary" /> Notification Alerts
          </h2>
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold mb-1">Notification Email</label>
              <input
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border text-sm"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Receipts and system notifications will be copied to this email address.
              </p>
            </div>
          </div>
        </div>



        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #a61c9b, #d82a81)",
            }}
          >
            <Save className="w-4 h-4" /> {saving ? "Saving Changes..." : "Save Settings"}
          </button>
        </div>
      </form>

      {/* iCarry Pickup Address Section */}
      <form onSubmit={handleSaveWarehouseAddress} className="space-y-6 mt-6">
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
            <MapPin className="w-4 h-4 text-primary" /> Warehouse Pickup Address (iCarry)
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Register or update your store's primary dispatch warehouse in the iCarry system. This is required for calculating estimates and booking courier pickups.
          </p>

          {warehouseAddress.id && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs flex justify-between items-center font-medium">
              <span>iCarry Address ID: <strong>{warehouseAddress.id}</strong></span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(warehouseAddress.id);
                  toast.success("Address ID copied to clipboard!");
                }}
                className="text-[10px] text-green-700 bg-white hover:bg-green-100 border border-green-300 px-2 py-1 rounded-md cursor-pointer"
              >
                Copy
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold mb-1">Contact Person *</label>
              <input
                type="text"
                required
                value={warehouseAddress.contactPerson}
                onChange={(e) => setWarehouseAddress({ ...warehouseAddress, contactPerson: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                placeholder="Warehouse Manager"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={warehouseAddress.phone}
                onChange={(e) => setWarehouseAddress({ ...warehouseAddress, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                placeholder="e.g. 9876543210"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1">Address Line 1 *</label>
              <input
                type="text"
                required
                value={warehouseAddress.addressLine1}
                onChange={(e) => setWarehouseAddress({ ...warehouseAddress, addressLine1: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                placeholder="Plot / House No, Street name"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1">Address Line 2 (Optional)</label>
              <input
                type="text"
                value={warehouseAddress.addressLine2 || ""}
                onChange={(e) => setWarehouseAddress({ ...warehouseAddress, addressLine2: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                placeholder="Locality / Area"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">City *</label>
              <input
                type="text"
                required
                value={warehouseAddress.city}
                onChange={(e) => setWarehouseAddress({ ...warehouseAddress, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                placeholder="e.g. Pune"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">State *</label>
              <input
                type="text"
                required
                value={warehouseAddress.state}
                onChange={(e) => setWarehouseAddress({ ...warehouseAddress, state: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                placeholder="e.g. Maharashtra"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Pincode *</label>
              <input
                type="text"
                required
                value={warehouseAddress.pincode}
                onChange={(e) => setWarehouseAddress({ ...warehouseAddress, pincode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                placeholder="e.g. 411001"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Country *</label>
              <input
                type="text"
                required
                value={warehouseAddress.country}
                onChange={(e) => setWarehouseAddress({ ...warehouseAddress, country: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                placeholder="e.g. IN"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingAddress}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #a61c9b, #d82a81)",
              }}
            >
              <Save className="w-4 h-4" /> {savingAddress ? "Saving Address..." : "Register/Update Pickup Address"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
