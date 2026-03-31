"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerAction } from "@/features/auth/auth.actions";
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
  User,
  Shield,
  UserCheck,
  ShieldCheck,
} from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"admin" | "doctor" | "patient" | "">("");
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!role) return;

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("role", role);

    const res = await registerAction(formData);

    if (res?.error) {
      toast.error(res.error, {
        description: "Please check your details and try again.",
      });
    } else {
      toast.success("Account created successfully!", {
        description: "You can now sign in with your credentials.",
        duration: 4000,
      });

      // Smooth redirect after success
      startTransition(() => {
        router.push("/login");
        // Optional: router.refresh(); if you want to refresh data
      });
    }

    setLoading(false);
  }

  const isSubmitting = loading || isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4 overflow-hidden relative">
      {/* Background patterns remain the same */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f610_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#14b8a610_0.5px,transparent_1px)] [background-size:80px_80px]" />

      <div className="grid lg:grid-cols-12 gap-8 max-w-7xl w-full items-center">
        {/* LEFT SIDE - Hero (unchanged) */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between min-h-[640px] p-12 relative">
          {/* ... your existing left side content ... */}
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
                  HIPAA Compliant • Secure Registration
                </span>
              </div>

              <h2 className="text-6xl font-semibold tracking-tighter leading-none text-zinc-900 dark:text-white">
                Join MedFlow.
                <br />
                Transform care.
              </h2>
              <p className="mt-8 text-xl text-zinc-600 dark:text-zinc-400 max-w-md">
                Create your account to access powerful tools for patient
                management, clinical workflows, and hospital operations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8 text-sm text-zinc-500 dark:text-zinc-400">
            <div>Trusted by 120+ hospitals</div>
            <div className="flex items-center gap-1.5">
              <div className="h-px w-8 bg-zinc-300 dark:bg-zinc-700" />
              ISO 27001 Certified
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Form */}
        <div className="lg:col-span-5 flex justify-center">
          <Card className="w-full max-w-md border border-white/60 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-10 space-y-8">
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center lg:hidden">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                  Create your account
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-[15px]">
                  Get started with MedFlow EMR
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email, Password, Role Selector fields remain exactly the same as your latest version */}
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
                      disabled={isSubmitting}
                      className="pl-11 h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 focus-visible:border-blue-600 focus-visible:ring-blue-600/30 text-base"
                    />
                  </div>
                </div>

                {/* PASSWORD - unchanged */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-zinc-700 dark:text-zinc-300 font-medium"
                  >
                    Create password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      disabled={isSubmitting}
                      className="pl-11 pr-12 h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 focus-visible:border-blue-600 focus-visible:ring-blue-600/30 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Minimum 8 characters
                  </p>
                </div>

                {/* ROLE SELECTOR - unchanged but disabled during submit */}
                <div className="space-y-3">
                  <Label className="text-zinc-700 dark:text-zinc-300 font-medium">
                    I am registering as a
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        value: "admin",
                        label: "Admin",
                        sub: "Hospital staff",
                        icon: Shield,
                      },
                      {
                        value: "doctor",
                        label: "Doctor",
                        sub: "Practitioner",
                        icon: UserCheck,
                      },
                      {
                        value: "patient",
                        label: "Patient",
                        sub: "Individual",
                        icon: User,
                      },
                    ].map(({ value, label, sub, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRole(value as any)}
                        disabled={isSubmitting}
                        className={`group p-4 rounded-2xl border transition-all duration-200 flex flex-col items-center gap-3 hover:shadow-md ${
                          role === value
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-950/50 shadow-sm"
                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-xl transition-colors ${
                            role === value
                              ? "bg-blue-600 text-white"
                              : "bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700"
                          }`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-sm">{label}</div>
                          <div className="text-[10px] text-zinc-500">{sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {!role && (
                    <p className="text-xs text-amber-600 dark:text-amber-500 text-center">
                      Please select your role to continue
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || !role}
                  className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.985]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="ml-3 h-5 w-5 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider and Login link remain the same */}
              <div className="relative flex items-center justify-center text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                <span className="px-6">Secure &amp; Private</span>
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
              </div>

              <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer unchanged */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-zinc-500 dark:text-zinc-500 flex items-center gap-4">
        © {new Date().getFullYear()} MedFlow • All rights reserved
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline">Privacy Policy</span>
      </div>
    </div>
  );
}
