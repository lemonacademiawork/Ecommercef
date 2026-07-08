import { useNavigate, useSearchParams } from "react-router";
import { motion } from "motion/react";

export default function OAuthFailure() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get("error") || "Google authentication failed";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FFFDF7" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white border border-border shadow-xl text-center space-y-6"
      >
        <div className="flex justify-center">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full text-destructive" style={{ backgroundColor: "rgba(220, 38, 38, 0.1)", color: "#dc2626" }}>
            <span className="text-2xl">⚠️</span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Poppins, sans-serif", color: "#dc2626" }}>
            Login Failed
          </h2>
          <div className="p-4 rounded-2xl text-sm font-medium border text-red-700 bg-red-50 border-red-200" style={{ backgroundColor: "#fef2f2", borderColor: "#fca5a5", color: "#b91c1c" }}>
            {error}
          </div>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="w-full py-3 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90 shadow-lg cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #7b1fa2, #e91e63)",
            boxShadow: "0 10px 15px -3px rgba(233, 30, 99, 0.25)"
          }}
        >
          Back to Login
        </button>
      </motion.div>
    </div>
  );
}
