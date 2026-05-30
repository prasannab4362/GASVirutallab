"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/actions/auth-actions";
import { Shield, User, GraduationCap, Lock, Mail, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "MENTOR" | "ADMIN">("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", selectedRole);

    try {
      const res = await loginAction(null, formData);
      if (res && !res.success) {
        setError(res.error || "Failed to log in.");
        setIsLoading(false);
      } else if (res && res.success && res.redirectUrl) {
        router.push(res.redirectUrl);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const getRoleInfo = () => {
    switch (selectedRole) {
      case "STUDENT":
        return {
          title: "Student Portal",
          desc: "Access fellowship tasks, upload assignments, and track attendance.",
          defaultUser: "student@gas.ai / student123"
        };
      case "MENTOR":
        return {
          title: "Mentor Workspace",
          desc: "Review submissions, grade tasks, and sync with your cohorts.",
          defaultUser: "mentor@gas.ai / mentor123"
        };
      case "ADMIN":
        return {
          title: "Platform Console",
          desc: "Manage programs, enroll mentors, and audit system activities.",
          defaultUser: "admin@gas.ai / admin123"
        };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border border-zinc-200/60 dark:border-zinc-800">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-lg shadow-blue-500/20 mb-4">
            G
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-55">
            GAS Virtual AI Lab
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to access your digital workspace.
          </p>
        </div>

        {/* Role Tab Selector */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl">
          {(["STUDENT", "MENTOR", "ADMIN"] as const).map((role) => {
            const isSel = selectedRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setSelectedRole(role);
                  setError(null);
                }}
                className={`py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex flex-col items-center gap-1.5 ${
                  isSel
                    ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                }`}
              >
                {role === "STUDENT" && <GraduationCap className="w-4 h-4" />}
                {role === "MENTOR" && <User className="w-4 h-4" />}
                {role === "ADMIN" && <Shield className="w-4 h-4" />}
                <span>{role.charAt(0) + role.slice(1).toLowerCase()}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Portal Info Card */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/35 rounded-2xl border border-zinc-100 dark:border-zinc-800/40">
          <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">{roleInfo.title}</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 leading-relaxed">{roleInfo.desc}</p>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 w-fit px-2 py-0.5 rounded-md font-mono">
            Demo account: {roleInfo.defaultUser}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-950/40 animate-scale-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:ring-blue-600/20 dark:focus:border-blue-500 text-sm transition-all"
                  placeholder="name@gas.ai"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:ring-blue-600/20 dark:focus:border-blue-500 text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
