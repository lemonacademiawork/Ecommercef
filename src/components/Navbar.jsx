import { useState } from "react";
import logoImg from "@/assets/logo.png";
import {
  ShoppingCart,
  Heart,
  Search,
  Menu,
  X,
  User,
  Package,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function Navbar({
  currentPage,
  navigate,
  cartItems,
  wishlistCount,
  isLoggedIn,
  isAdmin,
  onCartOpen,
  onLogout,
  searchQuery,
  onSearchChange,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const navLinks = [
    { label: "Home", page: "home" },
    { label: "Shop", page: "shop" },
    { label: "About", page: "about" },
    { label: "Contact", page: "contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 group"
          >
            <img
              src={logoImg}
              alt="Lemon House Logo"
              className="w-10 h-10 object-contain"
            />
            <div className="hidden sm:block">
              <span
                className="text-xl font-bold"
                style={{ fontFamily: "Poppins, sans-serif", color: "#bd127c" }}
              >
                Lemon
              </span>
              <span
                className="text-xl font-bold"
                style={{ fontFamily: "Poppins, sans-serif", color: "#1b5e20" }}
              >
                House
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => navigate(link.page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === link.page
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => navigate("admin")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === "admin"
                    ? "bg-accent/10 text-accent"
                    : "text-foreground/70 hover:text-accent hover:bg-accent/10"
                }`}
              >
                Admin
              </button>
            )}
          </nav>

          {/* Search Bar (desktop) */}
          <div className="hidden lg:flex items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search crafts, supplies..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (e.target.value) navigate("shop");
              }}
              className="pl-9 pr-4 py-2 rounded-xl text-sm border border-border bg-muted/30 w-56 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Mobile Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors text-foreground/70"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => navigate("dashboard")}
              className="relative p-2 rounded-xl hover:bg-muted transition-colors text-foreground/70"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={onCartOpen}
              className="relative p-2 rounded-xl hover:bg-muted transition-colors text-foreground/70"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* User Menu */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl border border-border shadow-xl overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-border">
                        <p className="text-sm font-semibold">Priya Sharma</p>
                        <p className="text-xs text-muted-foreground">
                          priya@example.com
                        </p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate("dashboard");
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                        >
                          <Package className="w-4 h-4 text-primary" /> My Orders
                        </button>
                        <button
                          onClick={() => {
                            navigate("dashboard");
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                        >
                          <Settings className="w-4 h-4 text-primary" /> Settings
                        </button>
                        <button
                          onClick={() => {
                            onLogout();
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => navigate("login")}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #7b1fa2, #e91e63)",
                }}
              >
                Sign In
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden pb-3"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search crafts, supplies..."
                  value={searchQuery}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    if (e.target.value) navigate("shop");
                  }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-border pb-3 pt-2"
            >
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => {
                    navigate(link.page);
                    setMobileOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    currentPage === link.page
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  {link.label}
                </button>
              ))}
              {!isLoggedIn && (
                <button
                  onClick={() => {
                    navigate("login");
                    setMobileOpen(false);
                  }}
                  className="w-full mt-2 px-4 py-3 rounded-xl text-sm font-semibold text-white"
                  style={{
                    background: "linear-gradient(135deg, #7b1fa2, #e91e63)",
                  }}
                >
                  Sign In
                </button>
              )}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
