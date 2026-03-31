"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/features/auth/auth.actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
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
      toast.success("Logged in successfully!");

      // Force navigation + clear cache
      const targetPath =
        res.role === "admin"
          ? "/admin"
          : res.role === "doctor"
            ? "/doctor"
            : res.role === "patient"
              ? "/patient"
              : "/";

      // This combination usually forces proper navigation
      router.push(targetPath);
      router.refresh(); // ← Important: forces middleware + session check
    }

    setLoading(false);
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-[350px] space-y-4">
        <h1 className="text-xl font-semibold">Login</h1>

        <Input name="email" placeholder="Email" required />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          required
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}
