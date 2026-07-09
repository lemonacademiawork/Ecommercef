import { Outlet } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Home, ShoppingBag, Heart, ShoppingCart, User } from "lucide-react";

export function CustomerLayout({
  currentPage,
  navigate,
  cartItems,
  wishlistCount,
  isLoggedIn,
  user,
  onCartOpen,
  onLogout,
  searchQuery,
  onSearchChange,
}) {
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0 transition-colors duration-300">
      <Navbar
        currentPage={currentPage}
        navigate={navigate}
        cartItems={cartItems}
        wishlistCount={wishlistCount}
        isLoggedIn={isLoggedIn}
        isAdmin={false} // Customer side has no Admin navigation
        user={user}
        onCartOpen={onCartOpen}
        onLogout={onLogout}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer navigate={navigate} />

      {/* Mobile Sticky Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-border/60 z-40 flex items-center justify-around pb-safe transition-colors">
        <button
          onClick={() => navigate("home")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-all cursor-pointer ${
            currentPage === "home" ? "text-primary scale-105" : "text-foreground/60 hover:text-primary"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => navigate("shop")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-all cursor-pointer ${
            currentPage === "shop" ? "text-primary scale-105" : "text-foreground/60 hover:text-primary"
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Shop</span>
        </button>
        <button
          onClick={() => navigate("dashboard")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-all cursor-pointer ${
            currentPage === "dashboard" ? "text-primary scale-105" : "text-foreground/60 hover:text-primary"
          }`}
        >
          <Heart className="w-5 h-5" />
          <span>Wishlist</span>
        </button>
        <button
          onClick={onCartOpen}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-foreground/60 hover:text-primary relative transition-all cursor-pointer"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 right-2.5 w-4 h-4 bg-primary text-white text-[9px] rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </button>
        <button
          onClick={() => navigate("dashboard")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-all cursor-pointer ${
            currentPage === "dashboard" ? "text-primary scale-105" : "text-foreground/60 hover:text-primary"
          }`}
        >
          <User className="w-5 h-5" />
          <span>Account</span>
        </button>
      </div>
    </div>
  );
}
