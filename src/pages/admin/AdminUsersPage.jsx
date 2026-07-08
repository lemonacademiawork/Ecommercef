import { useState, useEffect } from "react";
import { Users, Mail, Phone, Calendar, UserCheck } from "lucide-react";
import { api } from "../../services/api";


export function AdminUsersPage() {
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await api.admin.getDashboardMetrics();
        if (res.success && res.data) {
          setTotalCount(res.data.totalUsers || 0);
        }
      } catch (err) {
        console.error("Failed to load user metrics", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading customers metrics...</p>
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
        Customers Directory
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Total Customers",
            value: totalCount || mockCustomers.length,
            color: "#1565C0",
            bg: "#E3F2FD",
            Icon: Users,
          },
          {
            label: "Active Session Users",
            value: mockCustomers.filter(c => c.status === "Active").length,
            color: "#2E7D32",
            bg: "#E8F5E9",
            Icon: UserCheck,
          },
          {
            label: "Registration Growth",
            value: "+24% MoM",
            color: "#E65100",
            bg: "#FFF3E0",
            Icon: Calendar,
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-2xl border border-border p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: kpi.bg }}
              >
                <kpi.Icon
                  className="w-5 h-5"
                  style={{ color: kpi.color }}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    color: kpi.color,
                  }}
                >
                  {kpi.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border">
          <h2 className="font-bold text-sm text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>
            Customer Accounts
          </h2>
          <p className="text-xs text-muted-foreground">List of registered user profiles on the platform.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: "#f8f9fc" }}>
              <tr>
                {["ID", "Name", "Email", "Phone Number", "Joined Date", "Status"].map((h) => (
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
              {mockCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-muted-foreground">
                    #{customer.id}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {customer.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground flex items-center gap-1.5 py-3.5">
                    <Mail className="w-3.5 h-3.5" /> {customer.email}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {customer.phone}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {customer.joined}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${customer.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                    >
                      {customer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
