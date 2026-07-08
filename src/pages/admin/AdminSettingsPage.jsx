import { useState } from "react";
import { Settings, Save, Bell, Shield, Sliders } from "lucide-react";

export function AdminSettingsPage() {
  const [shopName, setShopName] = useState("Lemon House");
  const [alertEmail, setAlertEmail] = useState("admin@lemonhouse.in");
  const [currency, setCurrency] = useState("INR (₹)");
  const [maintenance, setMaintenance] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
    }, 800);
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
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
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

        {/* Maintenance / Safety Section */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
            <Shield className="w-4 h-4 text-primary" /> Maintenance & Control
          </h2>
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-semibold">Store Maintenance Mode</p>
              <p className="text-[10px] text-muted-foreground max-w-sm mt-0.5">
                Temporarily disable the store front-end for users. Admin dashboard access will remain active.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={maintenance}
                onChange={(e) => setMaintenance(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
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
    </div>
  );
}
