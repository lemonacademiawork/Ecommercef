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
    else if (p === "shop") {
      if (id) {
        path = `/shop?category=${encodeURIComponent(id)}`;
      } else {
        path = "/shop";
      }
    }
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
    const authStr = localStorage.getItem("auth");
    const userStr = localStorage.getItem("user");

    let storedRole = role;
    let storedUser = null;

    try {
      if (userStr) storedUser = JSON.parse(userStr);
      if (!storedRole && authStr) {
        const auth = JSON.parse(authStr);
        if (auth?.role) storedRole = auth.role;
      }
    } catch (e) {
      console.error("Error parsing stored auth/user:", e);
    }

    const isStoredAdmin = (storedRole && (storedRole.toUpperCase() === "ADMIN" || storedRole.toUpperCase() === "ROLE_ADMIN")) ||
                          (storedUser?.role && (storedUser.role.toUpperCase() === "ADMIN" || storedUser.role.toUpperCase() === "ROLE_ADMIN")) ||
                          (storedUser?.roles && (
                            storedUser.roles.map(r => r.toUpperCase()).includes("ADMIN") ||
                            storedUser.roles.map(r => r.toUpperCase()).includes("ROLE_ADMIN")
                          ));

    if (token) {
      if (isStoredAdmin) {
        const adminUser = {
          name: (storedUser?.name && storedUser.name !== "default admin" && storedUser.name !== "admin") ? storedUser.name : "Administrator",
          email: storedUser?.email || "admin@lemonhouse.in",
          role: "ADMIN",
          roles: ["ADMIN"],
        };
        setUser(adminUser);
        setIsLoggedIn(true);
        setIsAdmin(true);
        localStorage.setItem("role", "ADMIN");
        localStorage.setItem("user", JSON.stringify(adminUser));
        setLoading(false);
        return;
      }

      api.auth.getProfile()
        .then((res) => {
          if (res.success && res.data) {
            const profileRole = res.data.role || (res.data.roles && res.data.roles[0]);
            const finalRole = profileRole || storedRole || "CUSTOMER";

            const isUserAdmin = finalRole && (
              finalRole.toUpperCase() === "ADMIN" || 
              finalRole.toUpperCase() === "ROLE_ADMIN"
            );

            const updatedUser = {
              ...res.data,
              name: (res.data.name && res.data.name.toLowerCase() !== "default admin" && res.data.name.toLowerCase() !== "admin")
                ? res.data.name
                : (res.data.email || "Customer"),
              role: isUserAdmin ? "ADMIN" : finalRole,
              roles: isUserAdmin ? ["ADMIN"] : (res.data.roles || [finalRole]),
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

  const fetchCart = async () => {
    try {
      const [cartRes, prodRes] = await Promise.all([
        api.cart.getCart().catch((e) => {
          console.error("api.cart.getCart error:", e);
          return { success: false, data: null };
        }),
        api.products.listProducts({ all: true }).catch(() => ({ success: false, data: [] }))
      ]);

      if (cartRes && cartRes.success && cartRes.data) {
        let items = [];
        if (Array.isArray(cartRes.data)) {
          items = cartRes.data;
        } else if (Array.isArray(cartRes.data.items)) {
          items = cartRes.data.items;
        } else if (Array.isArray(cartRes.data.cartItems)) {
          items = cartRes.data.cartItems;
        } else if (cartRes.data.cart && Array.isArray(cartRes.data.cart.items)) {
          items = cartRes.data.cart.items;
        }

        if (items.length > 0) {
          const catalog = prodRes.success && prodRes.data ? prodRes.data : [];
          const mappedItems = items.map((item) => {
            const prodId = item.product?.id || item.productId || item.id;
            const catProd = catalog.find(p => String(p.id) === String(prodId));
            return {
              id: prodId,
              cartItemId: item.id || item.cartItemId || `${prodId}-${item.variantId || item.variant?.id || ''}`,
              name: item.product?.name || catProd?.name || item.productName || item.name || "Craft Supply",
              price: item.variant ? (item.variant.discountedPrice || item.variant.price) : (item.product?.price || catProd?.price || item.price || 0),
              image: item.product?.imageUrl || item.product?.image || catProd?.image || catProd?.imageUrl || item.imageUrl || item.image || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop&auto=format",
              quantity: item.quantity || 1,
              weight: catProd?.weight || item.product?.weight || item.weight || 0,
              length: catProd?.length || item.product?.length || item.length || 0,
              breadth: catProd?.breadth || item.product?.breadth || item.breadth || 0,
              height: catProd?.height || item.product?.height || item.height || 0,
              variantId: item.variantId || item.variant?.id,
              variantName: item.variantName || item.variant?.variantName || item.variant?.name,
              variant: item.variant,
              uniqueKey: (item.id || item.cartItemId) || `${prodId}-${item.variantId || item.variant?.id || ''}`,
            };
          });
          setCartItems(mappedItems);
        }
      }
    } catch (err) {
      console.error("Error fetching cart", err);
    }
  };

  const handleAddToCart = async (product, qty = 1, variantId = null) => {
    if (!product) return;
    const prodId = product.id || product.productId;
    const uniqueKey = prodId + (variantId ? `-${variantId}` : "");

    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i.uniqueKey === uniqueKey || (String(i.id) === String(prodId) && String(i.variantId) === String(variantId))
      );
      let next;
      if (existing) {
        next = prev.map((i) =>
          (i.uniqueKey === uniqueKey || (String(i.id) === String(prodId) && String(i.variantId) === String(variantId)))
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      } else {
        next = [
          ...prev,
          {
            ...product,
            id: prodId,
            cartItemId: uniqueKey,
            quantity: qty,
            variantId,
            uniqueKey,
            name: product.name || "Craft Supply",
            image: product.image || product.imageUrl || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop&auto=format",
            price: product.price || 0,
          },
        ];
      }
      localStorage.setItem("guestCart", JSON.stringify(next));
      return next;
    });

    toast.success(`${product.name || "Product"} added to cart!`);
    setCartOpen(true);

    if (isLoggedIn) {
      try {
        await api.cart.addToCart(prodId, qty, variantId);
        await fetchCart();
      } catch (err) {
        console.warn("Backend cart sync error:", err);
      }
    }
  };

  const handleUpdateQuantity = async (id, qty, cartItemId) => {
    setCartItems((prev) => {
      let next;
      if (qty <= 0) {
        next = prev.filter((i) =>
          cartItemId ? (i.cartItemId === cartItemId || i.uniqueKey === cartItemId) : String(i.id) !== String(id)
        );
      } else {
        next = prev.map((i) =>
          (cartItemId ? (i.cartItemId === cartItemId || i.uniqueKey === cartItemId) : String(i.id) === String(id))
            ? { ...i, quantity: qty }
            : i
        );
      }
      localStorage.setItem("guestCart", JSON.stringify(next));
      return next;
    });

    if (isLoggedIn) {
      try {
        const targetItemId = cartItemId || cartItems.find((i) => String(i.id) === String(id))?.cartItemId;
        if (targetItemId) {
          if (qty <= 0) {
            await api.cart.removeCartItem(targetItemId);
          } else {
            await api.cart.updateCartItem(targetItemId, qty);
          }
        }
      } catch (err) {
        console.warn("Backend update quantity sync error:", err);
      }
    }
  };

  const handleRemoveFromCart = async (id, cartItemId) => {
    setCartItems((prev) => {
      const next = prev.filter((i) =>
        cartItemId ? (i.cartItemId === cartItemId || i.uniqueKey === cartItemId) : String(i.id) !== String(id)
      );
      localStorage.setItem("guestCart", JSON.stringify(next));
      return next;
    });
    toast.info("Item removed from cart");

    if (isLoggedIn) {
      try {
        const targetItemId = cartItemId || cartItems.find((i) => String(i.id) === String(id))?.cartItemId;
        if (targetItemId) {
          await api.cart.removeCartItem(targetItemId);
        }
      } catch (err) {
        console.warn("Backend remove item sync error:", err);
      }
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
          await api.cart.addToCart(item.id, item.quantity, item.variantId);
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
