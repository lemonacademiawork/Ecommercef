import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { LandingPage } from "./components/LandingPage";
import { ShopPage } from "./components/ShopPage";
import { ProductDetailPage } from "./components/ProductDetailPage";
import { CartSidebar } from "./components/CartSidebar";
import { CheckoutPage } from "./components/CheckoutPage";
import { CustomerDashboard } from "./components/CustomerDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { LoginPage, RegisterPage } from "./components/AuthPages";
import { AboutPage } from "./components/AboutPage";
import { ContactPage } from "./components/ContactPage";
import { CartItem, Product } from "./data";
import { Toaster } from "sonner";
import { toast } from "sonner";

type Page = 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'dashboard' | 'admin' | 'login' | 'register' | 'about' | 'contact';

const NO_NAVBAR_FOOTER: Page[] = ['login', 'register', 'admin'];

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [productId, setProductId] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = (p: Page, id?: string) => {
    setPage(p);
    if (id) setProductId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product, qty: number = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { ...product, quantity: qty }];
    });
    toast.success(`${product.name} added to cart!`, {
      description: `₹${product.price}`,
      duration: 2000,
    });
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      setCartItems(prev => prev.filter(i => i.id !== id));
    } else {
      setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
    }
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
    toast.info('Item removed from cart');
  };

  const handleToggleWishlist = (id: string) => {
    setWishlist(prev => {
      if (prev.includes(id)) {
        toast.info('Removed from wishlist');
        return prev.filter(i => i !== id);
      }
      toast.success('Added to wishlist!');
      return [...prev, id];
    });
  };

  const handleLogin = (adminLogin = false) => {
    setIsLoggedIn(true);
    setIsAdmin(adminLogin);
    navigate(adminLogin ? 'admin' : 'home');
    toast.success(adminLogin ? 'Welcome back, Admin!' : 'Welcome back, Priya! 👋');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate('home');
    toast.info('You\'ve been signed out.');
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
        {page === 'home' && (
          <LandingPage
            navigate={navigate}
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {page === 'shop' && (
          <ShopPage
            navigate={navigate}
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            searchQuery={searchQuery}
          />
        )}

        {page === 'product' && (
          <ProductDetailPage
            productId={productId}
            navigate={navigate}
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {page === 'checkout' && (
          <CheckoutPage
            items={cartItems}
            navigate={navigate}
            onOrderComplete={handleOrderComplete}
          />
        )}

        {page === 'dashboard' && isLoggedIn && (
          <CustomerDashboard
            navigate={navigate}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onLogout={handleLogout}
          />
        )}

        {page === 'dashboard' && !isLoggedIn && (
          <LoginPage navigate={navigate} onLogin={handleLogin} />
        )}

        {page === 'admin' && isAdmin && <AdminDashboard />}
        {page === 'admin' && !isAdmin && <LoginPage navigate={navigate} onLogin={handleLogin} />}

        {page === 'login' && <LoginPage navigate={navigate} onLogin={handleLogin} />}
        {page === 'register' && <RegisterPage navigate={navigate} onLogin={handleLogin} />}

        {page === 'about' && <AboutPage navigate={navigate} />}
        {page === 'contact' && <ContactPage />}
      </main>

      {showNavFooter && <Footer navigate={navigate} />}
    </div>
  );
}
