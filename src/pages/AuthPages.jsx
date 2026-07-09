import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import logoImg from "../assets/logo.png";
import { api } from "../services/api";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router";

export function LoginPage({ navigate, onLogin }) {
  const location = useLocation();
  const search = location.search;
  const [loginMethod, setLoginMethod] = useState("password"); // "password" or "otp"
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  // OTP-specific states
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  const startResendTimer = () => {
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone) {
      toast.error("Phone number is required!");
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit phone number!");
      return;
    }
    try {
      toast.loading("Sending OTP...");
      const res = await api.auth.sendOtp(phone);
      toast.dismiss();
      if (res.success) {
        toast.success("OTP sent successfully!");
        setOtpSent(true);
        startResendTimer();
      } else {
        toast.error(res.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to send OTP: " + err.message);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    try {
      toast.loading("Resending OTP...");
      const res = await api.auth.resendOtp(phone);
      toast.dismiss();
      if (res.success) {
        toast.success("OTP resent successfully!");
        startResendTimer();
      } else {
        toast.error(res.message || "Failed to resend OTP");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to resend OTP: " + err.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("OTP is required!");
      return;
    }
    if (otp.length < 4) {
      toast.error("Please enter a valid OTP!");
      return;
    }
    try {
      toast.loading("Verifying OTP...");
      const response = await api.auth.verifyOtp(phone, otp);
      toast.dismiss();
      if (response.success && response.data) {
        const { token, role, email: userEmail, name } = response.data;
        localStorage.setItem("token", token);
        const profileRes = await api.auth.getProfile();
        if (profileRes.success && profileRes.data) {
          const profileRole = profileRes.data.role || (profileRes.data.roles && profileRes.data.roles[0]) || role;
          const userProfile = {
            ...profileRes.data,
            role: profileRole,
            roles: profileRes.data.roles || [profileRole],
          };
          onLogin(token, role, userProfile);
        } else {
          onLogin(token, role, { name, email: userEmail, role, roles: [role] });
        }
      } else {
        toast.error(response.message || "Invalid OTP");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Verification failed: " + err.message);
    }
  };

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
      toast.loading("Signing in...");
      const response = await api.auth.login(email, password);
      toast.dismiss();
      console.log("LOGIN RESPONSE", response.data);
      if (response.success && response.data) {
        const { token, role, email: userEmail, name } = response.data;
        localStorage.setItem("token", token);
        const profileRes = await api.auth.getProfile();
        if (profileRes.success && profileRes.data) {
          const profileRole = profileRes.data.role || (profileRes.data.roles && profileRes.data.roles[0]) || role;
          const userProfile = {
            ...profileRes.data,
            role: profileRole,
            roles: profileRes.data.roles || [profileRole],
          };
          onLogin(token, role, userProfile);
        } else {
          onLogin(token, role, { name, email: userEmail, role, roles: [role] });
        }
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (err) {
      toast.dismiss();
      toast.error(err.message || "An error occurred during login");
    }
  };

  const handleGoogleLogin = () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://ecommerce-b-production-70b5.up.railway.app";
      // Clean base URL to get the host root (without /api or trailing slash)
      let cleanUrl = baseUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
      const oauthUrl = `${cleanUrl}/oauth2/authorization/google`;
      window.location.href = oauthUrl;
    } catch (err) {
      toast.error("Google redirection error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#FFFDF7" }}>
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #7b1fa2 0%, #e91e63 100%)",
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
            className="w-24 h-24 object-contain mx-auto mb-6 rounded-full shadow-md"
          />
          <h2
            className="text-4xl font-extrabold mb-3"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Welcome Back!
          </h2>
          <p className="text-white/80 text-lg max-w-sm mx-auto">
            Your crafting journey continues here. Sign in to access your orders,
            wishlist, and more.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              {
                src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=150&h=150&fit=crop&auto=format",
                alt: "Embroidery",
              },
              {
                src: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=150&h=150&fit=crop&auto=format",
                alt: "Art",
              },
              {
                src: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=150&h=150&fit=crop&auto=format",
                alt: "Beads",
              },
            ].map((img) => (
              <div
                key={img.alt}
                className="aspect-square rounded-2xl overflow-hidden bg-white/10"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
            ))}
          </div>
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
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Sign In
          </h1>
          <p className="text-muted-foreground text-sm mb-7">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("register", null, search)}
              className="text-primary font-semibold hover:underline"
            >
              Create one
            </button>
          </p>

          {/* Login Method Toggle */}
          <div className="flex bg-muted p-1 rounded-xl mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setLoginMethod("password");
                setOtpSent(false);
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${loginMethod === "password"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Email Login
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("otp")}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${loginMethod === "otp"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Number Login
            </button>
          </div>

          {loginMethod === "password" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="you@example.com"
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
                  <span className="text-sm">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90 shadow-lg shadow-primary/25 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #7b1fa2, #e91e63)",
                }}
              >
                Sign In <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    disabled={otpSent}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-muted"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {otpSent && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-semibold">
                      Enter OTP
                    </label>
                    <button
                      type="button"
                      disabled={timer > 0}
                      onClick={handleResendOtp}
                      className="text-xs text-primary font-semibold hover:underline disabled:text-muted-foreground cursor-pointer"
                    >
                      {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="Enter 6-digit OTP"
                    />
                  </div>
                </div>
              )}

              {otpSent && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground font-semibold hover:underline cursor-pointer"
                  >
                    Change Phone Number
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90 shadow-lg shadow-primary/25 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #7b1fa2, #e91e63)",
                }}
              >
                {otpSent ? "Verify & Sign In" : "Send OTP"} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground">
                or sign in with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors w-full col-span-2 cursor-pointer"
            >
              <span>🌐</span> Google
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


export function RegisterPage({ navigate, onLogin }) {
  const location = useLocation();
  const search = location.search;
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Full Name is required!");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Email is required!");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address!");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Phone Number is required!");
      return;
    }
    if (form.phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit phone number!");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match!");
      return;
    }
    try {
      const response = await api.auth.register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      if (response.success) {
        toast.success("Account created successfully!");
        // Log in the user immediately
        const loginResponse = await api.auth.login(form.email, form.password);
        if (loginResponse.success && loginResponse.data) {
          const { token, role, email: userEmail, name } = loginResponse.data;
          localStorage.setItem("token", token);
          const profileRes = await api.auth.getProfile();
          if (profileRes.success && profileRes.data) {
            const profileRole = profileRes.data.role || (profileRes.data.roles && profileRes.data.roles[0]) || role;
            const userProfile = {
              ...profileRes.data,
              role: profileRole,
              roles: profileRes.data.roles || [profileRole],
            };
            onLogin(token, role, userProfile);
          } else {
            onLogin(token, role, { name, email: userEmail, role, roles: [role] });
          }
        } else {
          navigate("login");
        }
      } else {
        toast.error(response.message || "Registration failed");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred during registration");
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#FFFDF7" }}>
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)",
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
            className="w-24 h-24 object-contain mx-auto mb-6 rounded-full shadow-md"
          />
          <h2
            className="text-4xl font-extrabold mb-3"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Start Creating!
          </h2>
          <p className="text-white/80 text-lg max-w-sm mx-auto">
            Join 50,000+ crafters and get access to premium supplies, exclusive
            deals, and a vibrant community.
          </p>
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {[
              "Free Delivery",
              "Easy Returns",
              "Exclusive Deals",
              "Craft Community",
              "Premium Supplies",
            ].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full bg-white/20 text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
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
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Create Account
          </h1>
          <p className="text-muted-foreground text-sm mb-7">
            Already have an account?{" "}
            <button
              onClick={() => navigate("login", null, search)}
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </button>
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {[
              {
                label: "Full Name",
                key: "name",
                type: "text",
                Icon: User,
                placeholder: "Priya Sharma",
              },
              {
                label: "Email",
                key: "email",
                type: "email",
                Icon: Mail,
                placeholder: "you@example.com",
              },
              {
                label: "Phone Number",
                key: "phone",
                type: "tel",
                Icon: Phone,
                placeholder: "+91 98765 43210",
              },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-semibold mb-1.5">
                  {f.label}
                </label>
                <div className="relative">
                  <f.Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={f.type}
                    value={form[f.key]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                    }
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder={f.placeholder}
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Create a strong password"
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

            <div>
              <label className="block text-sm font-semibold mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, confirm: e.target.value }))
                  }
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Repeat your password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90 mt-2 shadow-lg shadow-accent/25"
              style={{
                background: "linear-gradient(135deg, #1b5e20, #2e7d32)",
              }}
            >
              Create Account <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

