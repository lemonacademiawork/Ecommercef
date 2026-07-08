import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import logoImg from "../../assets/logo.png";
import { api } from "../../services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export function AdminLoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email is required!");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address!");
      return;
    }
    if (!password) {
      toast.error("Password is required!");
      return;
    }

    try {
      const response = await api.admin.login(email, password);
      if (response.success && response.data) {
        const { token, role, email: userEmail, name, fullName } = response.data;
        
        if (role !== "ADMIN" && role !== "ROLE_ADMIN") {
          toast.error("Access Denied: You do not have administrator privileges.");
          return;
        }

        const userProfile = {
          name: fullName || name || "Admin",
          email: userEmail,
          role: role,
          roles: [role],
        };
        
        onLogin(token, role, userProfile);
        navigate("/admin/dashboard");
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred during login");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8f9fc]">
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #4a148c 0%, #a61c9b 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20px 20px, white 2px, transparent 2px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 text-center text-white px-10">
          <img
            src={logoImg}
            alt="Lemon House Logo"
            className="w-24 h-24 object-contain mx-auto mb-6 rounded-full shadow-md bg-white/10 p-1"
          />
          <h2
            className="text-4xl font-extrabold mb-3"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Console Control
          </h2>
          <p className="text-white/80 text-lg max-w-sm mx-auto">
            Administrative portal to manage products, categories, orders, customers and settings.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Logo for mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img
              src={logoImg}
              alt="Lemon House Logo"
              className="w-9 h-9 object-contain"
            />
            <span
              className="text-xl font-bold"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <span style={{ color: "#bd127c" }}>Lemon</span>
              <span style={{ color: "#1b5e20" }}>House</span>
            </span>
          </div>

          <h1
            className="text-2xl font-bold mb-1"
            style={{ fontFamily: "Poppins, sans-serif", color: "#a61c9b" }}
          >
            Admin Access
          </h1>
          <p className="text-muted-foreground text-sm mb-7">
            Please sign in to access the control panel.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="admin@lemonhouse.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-sm">Remember session</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90 shadow-lg shadow-primary/25"
              style={{
                background: "linear-gradient(135deg, #4a148c, #a61c9b)",
              }}
            >
              Sign In to Console <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
