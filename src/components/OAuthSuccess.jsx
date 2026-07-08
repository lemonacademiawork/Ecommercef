import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { api } from "../services/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";

export default function OAuthSuccess({ onLogin }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      toast.error("Authentication failed: No token provided.");
      setStatus("error");
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    // 1. Store JWT token in localStorage (and make sure API requests include it)
    localStorage.setItem("token", token);

    // 2. Fetch profile to resolve roles and complete login session flow
    api.auth.getProfile()
      .then((res) => {
        if (res.success && res.data) {
          const profileRole = res.data.role || (res.data.roles && res.data.roles[0]) || "CUSTOMER";
          const userProfile = {
            ...res.data,
            role: profileRole,
            roles: res.data.roles || [profileRole],
          };
          
          if (onLogin) {
            // Complete login state update & guest cart sync
            onLogin(token, profileRole, userProfile);
          } else {
            navigate("/dashboard");
          }
        } else {
          throw new Error("Unable to retrieve user profile details.");
        }
      })
      .catch((err) => {
        console.error("OAuth profile retrieval failed:", err);
        localStorage.removeItem("token");
        toast.error("Profile retrieval failed: " + err.message);
        setStatus("error");
        setTimeout(() => navigate("/login"), 3000);
      });
  }, [searchParams, onLogin, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FFFDF7" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white border border-border shadow-xl text-center space-y-6"
      >
        <div className="flex justify-center">
          {status === "loading" ? (
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full text-primary animate-pulse" style={{ backgroundColor: "rgba(123, 31, 162, 0.1)", color: "#7b1fa2" }}>
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full text-destructive animate-bounce" style={{ backgroundColor: "rgba(220, 38, 38, 0.1)", color: "#dc2626" }}>
              <span>⚠️</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
            {status === "loading" ? "Logging in, please wait..." : "Authentication Failed"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {status === "loading"
              ? "We are finalizing your Google secure session. Please wait..."
              : "We couldn't retrieve your session details. Redirecting you back to login..."}
          </p>
        </div>

        {status === "loading" && (
          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#e5e7eb" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #7b1fa2, #e91e63)" }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
