import { useState, useEffect } from "react";
import { Users, Mail, Phone, Calendar, UserCheck } from "lucide-react";
import { api } from "../../services/api";


export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.admin.listAllUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error("Failed to load users list", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading customers directory...</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            label: "Total Customers",
            value: users.length,
            color: "#1565C0",
            bg: "#E3F2FD",
            Icon: Users,
          },
          {
            label: "Active Accounts",
            value: users.filter(u => u.active !== false).length,
            color: "#2E7D32",
            bg: "#E8F5E9",
            Icon: UserCheck,
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
              {users.map((user) => {
                const isActive = user.active !== false;
                return (
                  <tr
                    key={user.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-muted-foreground">
                      #{user.id}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      <div className="flex items-center gap-2">
                        {user.name}
                        {user.role && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${user.role === "ADMIN" || user.role === "ROLE_ADMIN"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-600"
                              }`}
                          >
                            {user.role.replace("ROLE_", "")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground flex items-center gap-1.5 py-3.5">
                      <Mail className="w-3.5 h-3.5" /> {user.email}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.phone || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                          }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
