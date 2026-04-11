"use client";

import { Activity, Lock, User, Stethoscope } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function LoginScreen() {
  const { login } = useAuth();
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("RN");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      setLoading(true);
      setTimeout(() => {
        login(userName, role);
      }, 500);
    }
  };

  const quickLogin = (name: string, userRole: string) => {
    setLoading(true);
    setTimeout(() => {
      login(name, userRole);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Sentinel</h1>
          </div>
          <p className="text-slate-400 text-sm">Clinical Intelligence for Handoff</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* User Name Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Your Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Clinical Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "RN", label: "RN" },
                  { id: "MD", label: "MD" },
                  { id: "NP", label: "NP" },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    disabled={loading}
                    className={cn(
                      "py-2 rounded-lg font-medium transition text-sm",
                      role === r.id
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={!userName.trim() || loading}
              className={cn(
                "w-full py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-2",
                userName.trim() && !loading
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Quick Access */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-500 mb-3 text-center uppercase tracking-wider">Quick Access</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => quickLogin("Kaye Miller", "RN")}
                disabled={loading}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition disabled:opacity-50"
              >
                Load RN Kaye
              </button>
              <button
                onClick={() => quickLogin("Dr. Leslie", "MD")}
                disabled={loading}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition disabled:opacity-50"
              >
                Load MD Leslie
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mb-2">
            <Stethoscope className="w-4 h-4" />
            <span>Hospital-Grade Clinical System</span>
          </div>
          <p className="text-slate-600 text-xs">
            HIPAA-compliant • High-Performance • Mission-Critical
          </p>
        </div>
      </div>
    </div>
  );
}
