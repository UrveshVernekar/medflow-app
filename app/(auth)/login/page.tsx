"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/features/auth/auth.actions";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import {
  Stethoscope,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await loginAction(formData);

    if (res?.error) {
      toast.error(res.error);
      setLoading(false);
      return;
    }

    if (res?.success && res.role) {
      toast.success("Welcome back to MedFlow!");

      const targetPath =
        res.role === "admin"
          ? "/admin"
          : res.role === "doctor"
            ? "/doctor"
            : res.role === "patient"
              ? "/patient"
              : "/";

      router.push(targetPath);
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4 overflow-hidden relative">
      {/* Subtle background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f610_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#14b8a610_0.5px,transparent_1px)] [background-size:80px_80px]" />

      <div className="grid lg:grid-cols-12 gap-8 max-w-7xl w-full items-center">
        {/* LEFT SIDE - Hero / Branding */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between min-h-[640px] p-12 relative">
          <div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center shadow-xl">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-semibold tracking-tighter text-zinc-900 dark:text-white">
                  MedFlow
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 -mt-1">
                  EMR Platform
                </p>
              </div>
            </div>

            <div className="mt-20 max-w-lg">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm border border-white/50 dark:border-zinc-700 mb-6">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  HIPAA Compliant • Secure Access
                </span>
              </div>

              <h2 className="text-6xl font-semibold tracking-tighter leading-none text-zinc-900 dark:text-white">
                Healthcare,
                <br />
                reimagined.
              </h2>
              <p className="mt-8 text-xl text-zinc-600 dark:text-zinc-400 max-w-md">
                Secure access to patient records, appointments, and clinical
                tools in one unified platform.
              </p>
            </div>
          </div>

          {/* Trust signals */}
          <div className="flex items-center gap-8 text-sm text-zinc-500 dark:text-zinc-400">
            <div>Trusted by 120+ hospitals</div>
            <div className="flex items-center gap-1.5">
              <div className="h-px w-8 bg-zinc-300 dark:bg-zinc-700" />
              ISO 27001 Certified
            </div>
          </div>

          {/* Decorative subtle icons */}
          <div className="absolute bottom-12 right-12 opacity-10">
            <Stethoscope className="h-32 w-32" />
          </div>
        </div>

        {/* RIGHT SIDE - Login Form */}
        <div className="lg:col-span-5 flex justify-center">
          <Card className="w-full max-w-md border border-white/60 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-10 space-y-8">
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center lg:hidden">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                  Welcome back
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-[15px]">
                  Sign in to continue to your dashboard
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* EMAIL */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-zinc-700 dark:text-zinc-300 font-medium"
                  >
                    Email address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@hospital.com"
                      required
                      className="pl-11 h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 focus-visible:border-blue-600 focus-visible:ring-blue-600/30 text-base"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label
                      htmlFor="password"
                      className="text-zinc-700 dark:text-zinc-300 font-medium"
                    >
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />

                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="pl-11 pr-12 h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 focus-visible:border-blue-600 focus-visible:ring-blue-600/30 text-base"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.985]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center justify-center text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                <span className="px-6">Secure login</span>
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
              </div>

              {/* Register link */}
              <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                Don’t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 transition-colors"
                >
                  Create a free account
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-zinc-500 dark:text-zinc-500 flex items-center gap-4">
        © {new Date().getFullYear()} MedFlow • All rights reserved
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline">Privacy &amp; Security</span>
      </div>
    </div>
  );
}
