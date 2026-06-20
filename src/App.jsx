import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { LandingPage } from "./pages/LandingPage";
import { ShopPage } from "./pages/ShopPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartSidebar } from "./components/CartSidebar";
import { CheckoutPage } from "./pages/CheckoutPage";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { api } from "./services/api";

const NO_NAVBAR_FOOTER = ["login", "register", "admin"];

export default function App() {
  const [page, setPage] = useState("home");
  const [productId, setProductId] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = (p, id) => {
    setPage(p);
    if (id) setProductId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Recover session on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.auth.getProfile()
        .then((res) => {
          if (res.success && res.data) {
            setUser(res.data);
            setIsLoggedIn(true);
            setIsAdmin(res.data.roles.includes("ADMIN") || res.data.roles.includes("ROLE_ADMIN"));
            fetchCart();
          }
        })
        .catch((err) => {
          console.error("Session recovery failed", err);
          handleLogout();
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
    }
  }, []);

  const fetchCart = () => {
    api.cart.getCart()
      .then((res) => {
        if (res.success && res.data) {
          const items = res.data.items || res.data || [];
          const mappedItems = items.map((item) => ({
            id: item.product?.id || item.productId || item.id,
            cartItemId: item.id || item.cartItemId,
            name: item.product?.name || item.productName || item.name,
            price: item.product?.price || item.price,
            image: item.product?.imageUrl || item.imageUrl || item.image || item.product?.image,
            quantity: item.quantity,
          }));
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
        toast.success(`${product.name} added to cart!`, {
          description: `₹${product.price}`,
          duration: 2000,
        });
      } catch (err) {
        toast.error("Failed to add to cart: " + err.message);
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
      toast.success(`${product.name} added to cart!`, {
        description: `₹${product.price}`,
        duration: 2000,
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
        toast.error("Failed to update quantity: " + err.message);
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
        toast.info("Item removed from cart");
      } catch (err) {
        toast.error("Failed to remove item: " + err.message);
      }
    } else {
      setCartItems((prev) => {
        const next = prev.filter((i) => i.id !== id);
        localStorage.setItem("guestCart", JSON.stringify(next));
        return next;
      });
      toast.info("Item removed from cart");
    }
  };

  const handleToggleWishlist = (id) => {
    setWishlist((prev) => {
      if (prev.includes(id)) {
        toast.info("Removed from wishlist");
        return prev.filter((i) => i !== id);
      }
      toast.success("Added to wishlist!");
      return [...prev, id];
    });
  };

  const handleLogin = async (token, role, userProfile) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
    setIsAdmin(role === "ROLE_ADMIN");
    setUser(userProfile);

    // Sync guest cart to backend
    const guestCart = localStorage.getItem("guestCart");
    if (guestCart) {
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

    fetchCart();
    navigate(role === "ROLE_ADMIN" ? "admin" : "home");
    toast.success(`Welcome back, ${userProfile.name}! 👋`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("guestCart");
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUser(null);
    setCartItems([]);
    navigate("home");
    toast.info("You've been signed out.");
  };

  const handleOrderComplete = () => {
    setCartItems([]);
  };

  const showNavFooter = !NO_NAVBAR_FOOTER.includes(page);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster position="top-right" richColors />

      {showNavFooter && (
        <Navbar
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
      )}

      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        navigate={navigate}
      />

      <main className="flex-1">
        {page === "home" && (
          <LandingPage
            navigate={navigate}
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {page === "shop" && (
          <ShopPage
            navigate={navigate}
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            searchQuery={searchQuery}
          />
        )}

        {page === "product" && (
          <ProductDetailPage
            productId={productId}
            navigate={navigate}
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {page === "checkout" && (
          <CheckoutPage
            items={cartItems}
            navigate={navigate}
            onOrderComplete={handleOrderComplete}
          />
        )}

        {page === "dashboard" && isLoggedIn && (
          <CustomerDashboard
            navigate={navigate}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onLogout={handleLogout}
            user={user}
            setUser={setUser}
          />
        )}

        {page === "dashboard" && !isLoggedIn && (
          <LoginPage navigate={navigate} onLogin={handleLogin} />
        )}

        {page === "admin" && isAdmin && <AdminDashboard />}
        {page === "admin" && !isAdmin && (
          <LoginPage navigate={navigate} onLogin={handleLogin} />
        )}

        {page === "login" && (
          <LoginPage navigate={navigate} onLogin={handleLogin} />
        )}
        {page === "register" && (
          <RegisterPage navigate={navigate} onLogin={handleLogin} />
        )}

        {page === "about" && <AboutPage navigate={navigate} />}
        {page === "contact" && <ContactPage />}
      </main>

      {showNavFooter && <Footer navigate={navigate} />}
    </div>
  );
}
