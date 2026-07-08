import { Outlet } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

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
  return (
    <div className="min-h-screen flex flex-col bg-background">
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
    </div>
  );
}
