import { useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import {
  BarChart2,
  Package,
  Users,
  ShoppingBag,
  Layers,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import logoImg from "../assets/logo.png";

export function AdminLayout({ isLoggedIn, isAdmin, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8f9fc]">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-20">
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
          <span className="text-xs bg-[#fbeaf5] text-[#a61c9b] px-2 py-0.5 rounded-full font-medium ml-1">
            Admin
          </span>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-xl hover:bg-muted text-foreground/75 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Backdrop for Mobile Sidebar */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white z-50 border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-56 lg:h-screen lg:sticky lg:top-0 lg:z-10 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex flex-col">
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
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-muted text-foreground/75 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="p-3 flex-1 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-0.5">
            {navItems.map(({ path, label, Icon }) => {
              const isActive = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => handleNavClick(path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
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
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-red-50 transition-colors mt-auto cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 overflow-auto lg:h-screen">
        <Outlet />
      </main>
    </div>
  );
}
