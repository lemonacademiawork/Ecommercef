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
  isAdmin,
  user,
  onCartOpen,
  onLogout,
  searchQuery,
  onSearchChange,
}) {
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className={`min-h-screen flex flex-col bg-background transition-colors duration-300 ${currentPage !== "checkout" ? "pb-16 md:pb-0" : ""}`}>
      <Navbar
        currentPage={currentPage}
        navigate={navigate}
        cartItems={cartItems}
        wishlistCount={wishlistCount}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
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
      {currentPage !== "checkout" && (
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
            onClick={() => navigate(isAdmin ? "admin" : "dashboard")}
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
            onClick={() => navigate(isAdmin ? "admin" : "dashboard")}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-all cursor-pointer ${
              currentPage === "dashboard" ? "text-primary scale-105" : "text-foreground/60 hover:text-primary"
            }`}
          >
            <User className="w-5 h-5" />
            <span>{isAdmin ? "Admin" : "Account"}</span>
          </button>
        </div>
      )}

      {/* Floating WhatsApp Support Button */}
      <a
        href="https://wa.link/98z5wj"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-6 right-5 z-50 flex items-center gap-2 px-3.5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer"
        title="Chat on WhatsApp Support"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.002 3.66 3.745-.983zm12.383-7.534c-.287-.143-1.696-.837-1.958-.933-.263-.095-.455-.143-.647.143-.192.286-.743.933-.911 1.124-.168.19-.336.214-.623.071-1.687-.843-2.8-1.5-3.916-3.415-.297-.511.297-.474.848-1.574.096-.19.048-.357-.024-.5-.072-.143-.647-1.557-.887-2.131-.233-.559-.47-.483-.647-.492-.167-.008-.359-.008-.551-.008-.192 0-.503.072-.767.357-.263.286-1.007.984-1.007 2.4 0 1.416 1.031 2.784 1.175 2.975.144.191 2.03 3.103 4.919 4.35.686.297 1.222.474 1.639.607.69.22 1.317.189 1.813.115.553-.083 1.696-.693 1.935-1.362.239-.669.239-1.24.168-1.362-.072-.123-.264-.195-.551-.338z"/>
        </svg>
        <span className="hidden sm:inline text-xs font-bold">WhatsApp Support</span>
      </a>
    </div>
  );
}
