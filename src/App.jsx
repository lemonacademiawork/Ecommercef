import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { ShopPage } from "./pages/ShopPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartSidebar } from "./components/CartSidebar";
import { CheckoutPage } from "./pages/CheckoutPage";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import OAuthSuccess from "./components/OAuthSuccess";
import OAuthFailure from "./components/OAuthFailure";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { api } from "./services/api";

// Layouts
import { CustomerLayout } from "./layouts/CustomerLayout";
import { AdminLayout } from "./layouts/AdminLayout";

// Admin Pages
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminCategoriesPage } from "./pages/admin/AdminCategoriesPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";

// Route helper to extract parameter for ProductDetail
const ProductDetailRouteWrapper = ({ navigate, onAddToCart, wishlist, onToggleWishlist }) => {
  const { id } = useParams();
  return (
    <ProductDetailPage
      productId={id}
      navigate={navigate}
      onAddToCart={onAddToCart}
      wishlist={wishlist}
      onToggleWishlist={onToggleWishlist}
    />
  );
};

export default function App() {
  const [page, setPage] = useState(() => localStorage.getItem("currentPage") || "home");
  const [productId, setProductId] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Clean up dark mode if previously set
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("theme");
  }, []);

  const reactNavigator = useNavigate();
  const location = useLocation();

  const navigate = (p, id, search = "") => {
    let path = "/";
    if (p === "home") path = "/";
    else if (p === "shop") path = "/shop";
    else if (p === "product") path = `/product/${id}`;
    else if (p === "checkout") path = "/checkout";
    else if (p === "dashboard") path = "/dashboard";
    else if (p === "login") path = "/login";
    else if (p === "register") path = "/register";
    else if (p === "about") path = "/about";
    else if (p === "contact") path = "/contact";
    else if (p === "admin") path = "/admin/dashboard";

    reactNavigator(path + search);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Sync state-based page variable with route pathname to keep active states correct
  useEffect(() => {
    let p = "home";
    if (location.pathname === "/") p = "home";
    else if (location.pathname.startsWith("/shop")) p = "shop";
    else if (location.pathname.startsWith("/product")) p = "product";
    else if (location.pathname.startsWith("/checkout")) p = "checkout";
    else if (location.pathname.startsWith("/dashboard")) p = "dashboard";
    else if (location.pathname.startsWith("/about")) p = "about";
    else if (location.pathname.startsWith("/contact")) p = "contact";
    else if (location.pathname.startsWith("/admin")) p = "admin";
    else if (location.pathname === "/login") p = "login";
    else if (location.pathname === "/register") p = "register";
    
    setPage(p);
    localStorage.setItem("currentPage", p);
  }, [location.pathname]);

  // Recover session on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token) {
      // Direct session recovery for admins to avoid calling profile/cart endpoints
      if (role && (role.toUpperCase() === "ADMIN" || role.toUpperCase() === "ROLE_ADMIN")) {
        try {
          const storedUserStr = localStorage.getItem("user");
          if (storedUserStr) {
            const storedUser = JSON.parse(storedUserStr);
            setUser(storedUser);
            setIsLoggedIn(true);
            setIsAdmin(true);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to parse stored admin user profile:", e);
        }
      }

      api.auth.getProfile()
        .then((res) => {
          if (res.success && res.data) {
            const storedAuthStr = localStorage.getItem("auth");
            let storedRole = localStorage.getItem("role");
            if (storedAuthStr) {
              try {
                const storedAuth = JSON.parse(storedAuthStr);
                if (storedAuth && storedAuth.role) {
                  storedRole = storedRole || storedAuth.role;
                }
              } catch (e) {
                console.error("Failed to parse stored auth", e);
              }
            }
            const profileRole = res.data.role || (res.data.roles && res.data.roles[0]);
            const finalRole = profileRole || storedRole || "CUSTOMER";

            const isUserAdmin = finalRole && (
              finalRole.toUpperCase() === "ADMIN" || 
              finalRole.toUpperCase() === "ROLE_ADMIN" ||
              (res.data.roles && (
                res.data.roles.map(r => r.toUpperCase()).includes("ADMIN") || 
                res.data.roles.map(r => r.toUpperCase()).includes("ROLE_ADMIN")
              ))
            );

            const updatedUser = {
              ...res.data,
              role: finalRole,
              roles: res.data.roles || [finalRole],
            };

            setUser(updatedUser);
            setIsLoggedIn(true);
            setIsAdmin(!!isUserAdmin);
            if (!isUserAdmin) {
              fetchCart();
            }
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Session recovery failed", err);
          handleLogout();
          setLoading(false);
        });
    } else {
      // Load local guest cart if present
      const guestCart = localStorage.getItem("guestCart");
      if (guestCart) {
        try {
          setCartItems(JSON.parse(guestCart));
        } catch (e) {
          console.error("Failed to parse guest cart", e);
        }
      }
      setLoading(false);
    }
  }, []);

  const fetchCart = () => {
    Promise.all([
      api.cart.getCart(),
      api.products.listProducts({ all: true }).catch(() => ({ success: false, data: [] }))
    ])
      .then(([cartRes, prodRes]) => {
        if (cartRes.success && cartRes.data) {
          const items = cartRes.data.items || cartRes.data || [];
          const catalog = prodRes.success && prodRes.data ? prodRes.data : [];
          
          const mappedItems = items.map((item) => {
            const prodId = item.product?.id || item.productId;
            const catProd = catalog.find(p => p.id === prodId);
            return {
              id: prodId || item.id,
              cartItemId: item.id || item.cartItemId,
              name: item.product?.name || catProd?.name || item.productName || item.name,
              price: item.product?.price || catProd?.price || item.price,
              image: item.product?.imageUrl || catProd?.imageUrl || item.imageUrl || item.image || item.product?.image,
              quantity: item.quantity,
              weight: catProd?.weight || item.product?.weight || item.weight || 0,
              length: catProd?.length || item.product?.length || item.length || 0,
              breadth: catProd?.breadth || item.product?.breadth || item.breadth || 0,
              height: catProd?.height || item.product?.height || item.height || 0,
            };
          });
          setCartItems(mappedItems);
        }
      })
      .catch((err) => console.error("Error fetching cart", err));
  };

  const handleAddToCart = async (product, qty = 1) => {
    if (isLoggedIn) {
      try {
        await api.cart.addToCart(product.id, qty);
        fetchCart();
      } catch (err) {
        console.error("Failed to add to cart: " + err.message);
      }
    } else {
      setCartItems((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        let next;
        if (existing) {
          next = prev.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + qty } : i
          );
        } else {
          next = [...prev, { ...product, quantity: qty }];
        }
        localStorage.setItem("guestCart", JSON.stringify(next));
        return next;
      });
    }
  };

  const handleUpdateQuantity = async (id, qty, cartItemId) => {
    if (isLoggedIn) {
      try {
        const targetItemId = cartItemId || cartItems.find((i) => i.id === id)?.cartItemId;
        if (!targetItemId) {
          throw new Error("Cart item identifier not found");
        }
        if (qty <= 0) {
          await api.cart.removeCartItem(targetItemId);
        } else {
          await api.cart.updateCartItem(targetItemId, qty);
        }
        fetchCart();
      } catch (err) {
        console.error("Failed to update quantity: " + err.message);
      }
    } else {
      setCartItems((prev) => {
        let next;
        if (qty <= 0) {
          next = prev.filter((i) => i.id !== id);
        } else {
          next = prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i));
        }
        localStorage.setItem("guestCart", JSON.stringify(next));
        return next;
      });
    }
  };

  const handleRemoveFromCart = async (id, cartItemId) => {
    if (isLoggedIn) {
      try {
        const targetItemId = cartItemId || cartItems.find((i) => i.id === id)?.cartItemId;
        if (!targetItemId) {
          throw new Error("Cart item identifier not found");
        }
        await api.cart.removeCartItem(targetItemId);
        fetchCart();
      } catch (err) {
        console.error("Failed to remove item: " + err.message);
      }
    } else {
      setCartItems((prev) => {
        const next = prev.filter((i) => i.id !== id);
        localStorage.setItem("guestCart", JSON.stringify(next));
        return next;
      });
    }
  };

  const handleToggleWishlist = (id) => {
    setWishlist((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      return [...prev, id];
    });
  };

  const handleLogin = async (token, role, userProfile) => {
    const isUserAdmin = (role && (role.toUpperCase() === "ADMIN" || role.toUpperCase() === "ROLE_ADMIN")) || 
                        (userProfile.role && (userProfile.role.toUpperCase() === "ADMIN" || userProfile.role.toUpperCase() === "ROLE_ADMIN")) || 
                        (userProfile.roles && (
                          userProfile.roles.map(r => r.toUpperCase()).includes("ADMIN") || 
                          userProfile.roles.map(r => r.toUpperCase()).includes("ROLE_ADMIN")
                        ));

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify(userProfile));
    localStorage.setItem("auth", JSON.stringify({ token, role, user: userProfile }));

    setIsLoggedIn(true);
    setIsAdmin(!!isUserAdmin);
    setUser(userProfile);

    // Sync guest cart to backend (only for non-admin customers)
    const guestCart = localStorage.getItem("guestCart");
    if (guestCart && !isUserAdmin) {
      try {
        const items = JSON.parse(guestCart);
        for (const item of items) {
          await api.cart.addToCart(item.id, item.quantity);
        }
        localStorage.removeItem("guestCart");
      } catch (err) {
        console.error("Error syncing guest cart:", err);
      }
    }

    if (!isUserAdmin) {
      fetchCart();
    }
    const params = new URLSearchParams(location.search);
    const redirect = params.get("redirect");
    if (redirect) {
      navigate(redirect);
    } else {
      navigate(isUserAdmin ? "admin" : "home");
    }
  };

  const handleLogout = () => {
    const role = localStorage.getItem("role");
    const isAdminUser = (role && (role.toUpperCase() === "ADMIN" || role.toUpperCase() === "ROLE_ADMIN")) || location.pathname.startsWith("/admin");

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("auth");
    localStorage.removeItem("guestCart");
    localStorage.removeItem("currentPage");
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUser(null);
    setCartItems([]);

    if (isAdminUser) {
      reactNavigator("/admin/login");
    } else {
      navigate("home");
    }
    toast.info("You've been signed out.");
  };

  const handleOrderComplete = () => {
    setCartItems([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster position="top-right" richColors closeButton />

      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        navigate={navigate}
      />

      <Routes>
        {/* Customer Routes with Layout */}
        <Route
          element={
            <CustomerLayout
              currentPage={page}
              navigate={navigate}
              cartItems={cartItems}
              wishlistCount={wishlist.length}
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              user={user}
              onCartOpen={() => setCartOpen(true)}
              onLogout={handleLogout}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          }
        >
          <Route
            path="/"
            element={
              <LandingPage
                navigate={navigate}
                onAddToCart={handleAddToCart}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
              />
            }
          />
          <Route
            path="/shop"
            element={
              <ShopPage
                navigate={navigate}
                onAddToCart={handleAddToCart}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                searchQuery={searchQuery}
              />
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProductDetailRouteWrapper
                navigate={navigate}
                onAddToCart={handleAddToCart}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              isLoggedIn ? (
                isAdmin ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <CheckoutPage
                    items={cartItems}
                    navigate={navigate}
                    onOrderComplete={handleOrderComplete}
                  />
                )
              ) : (
                <Navigate to="/login?redirect=checkout" replace />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isLoggedIn ? (
                isAdmin ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <CustomerDashboard
                    navigate={navigate}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                    onLogout={handleLogout}
                    user={user}
                    setUser={setUser}
                  />
                )
              ) : (
                <Navigate to="/login?redirect=dashboard" replace />
              )
            }
          />
          <Route path="/about" element={<AboutPage navigate={navigate} />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Standalone Customer Auth */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to={isAdmin ? "/admin/dashboard" : "/"} replace />
            ) : (
              <LoginPage navigate={navigate} onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/register"
          element={
            isLoggedIn ? (
              <Navigate to={isAdmin ? "/admin/dashboard" : "/"} replace />
            ) : (
              <RegisterPage navigate={navigate} onLogin={handleLogin} />
            )
          }
        />
        <Route path="/oauth-success" element={<OAuthSuccess onLogin={handleLogin} />} />
        <Route path="/oauth-failure" element={<OAuthFailure />} />

        {/* Standalone Admin Auth */}
        <Route
          path="/admin/login"
          element={
            isLoggedIn && isAdmin ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <AdminLoginPage onLogin={handleLogin} />
            )
          }
        />

        {/* Protected Admin Routes with Layout */}
        <Route element={<AdminLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Fallback Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
