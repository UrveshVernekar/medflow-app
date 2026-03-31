"use client";

import { useState } from "react";
import { registerAction } from "@/features/auth/auth.actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await registerAction(formData);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("User created successfully");
    }

    setLoading(false);
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-[350px] space-y-4">
        <h1 className="text-xl font-semibold">Register</h1>

        <Input name="email" placeholder="Email" required />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          required
        />

        {/* Temporary role selector (for dev/testing) */}
        <select name="role" className="w-full border rounded-md p-2" required>
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="doctor">Doctor</option>
          <option value="patient">Patient</option>
        </select>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating..." : "Register"}
        </Button>
      </form>
    </div>
  );
}
