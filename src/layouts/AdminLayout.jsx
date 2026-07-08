import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import {
  BarChart2,
  Package,
  Users,
  ShoppingBag,
  Layers,
  Settings,
  LogOut,
} from "lucide-react";
import logoImg from "../assets/logo.png";

export function AdminLayout({ isLoggedIn, isAdmin, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Guard: check localStorage first to prevent flash redirects during session recovery
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isLocalStorageAdmin = role === "ADMIN" || role === "ROLE_ADMIN";

  if (!token || !isLocalStorageAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", Icon: BarChart2 },
    { path: "/admin/products", label: "Products", Icon: Package },
    { path: "/admin/categories", label: "Categories", Icon: Layers },
    { path: "/admin/orders", label: "Orders", Icon: ShoppingBag },
    { path: "/admin/users", label: "Users", Icon: Users },
    { path: "/admin/settings", label: "Settings", Icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[#f8f9fc]">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 h-screen sticky top-0 bg-white border-r border-border flex flex-col z-10">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <img
              src={logoImg}
              alt="Lemon House Logo"
              className="w-8 h-8 object-contain"
            />
            <span
              className="font-bold text-sm"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <span style={{ color: "#bd127c" }}>Lemon</span>
              <span style={{ color: "#1b5e20" }}>House</span>
            </span>
          </div>
          <span className="text-xs text-muted-foreground mt-0.5 block">
            Admin Panel
          </span>
        </div>
        <nav className="p-3 flex-1 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-0.5">
            {navItems.map(({ path, label, Icon }) => {
              const isActive = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              onLogout();
              navigate("/admin/login");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-red-50 transition-colors mt-auto"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-6 overflow-auto h-screen">
        <Outlet />
      </main>
    </div>
  );
}
