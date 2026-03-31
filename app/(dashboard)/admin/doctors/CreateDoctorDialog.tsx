// CreateDoctorDialog.tsx
"use client";

import { useState, useActionState, useEffect } from "react";
import { createDoctorAction } from "@/features/doctors/doctor.actions";
import { SPECIALIZATIONS } from "@/config/specializations";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export default function CreateDoctorDialog({
  departments,
}: {
  departments: any[];
}) {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (_: any, formData: FormData) => {
      const result = await createDoctorAction(formData);
      return result;
    },
    null,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Doctor created successfully!", {
        description: "The new doctor profile has been added.",
      });
      setOpen(false);
      // Refresh data without full reload
      window.location.reload(); // You can replace this with revalidatePath later
    } else if (state?.error) {
      toast.error("Failed to create doctor", {
        description: state.error,
      });
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-12 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg shadow-blue-500/25 transition-all">
          <Plus className="mr-2 h-5 w-5" />
          Add New Doctor
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add New Doctor</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="doctor@hospital.com"
                required
                disabled={isPending}
                className="h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 focus-visible:border-blue-600 focus-visible:ring-blue-600/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={isPending}
                className="h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 focus-visible:border-blue-600 focus-visible:ring-blue-600/30"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <select
                  id="specialization"
                  name="specialization"
                  required
                  disabled={isPending}
                  className="h-14 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 text-base focus-visible:border-blue-600 focus-visible:ring-blue-600/30"
                >
                  <option value="">Select Specialization</option>
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department_id">Department</Label>
                <select
                  id="department_id"
                  name="department_id"
                  required
                  disabled={isPending}
                  className="h-14 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 text-base focus-visible:border-blue-600 focus-visible:ring-blue-600/30"
                >
                  <option value="">Select Department</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="license_number">License Number</Label>
                <Input
                  id="license_number"
                  name="license_number"
                  placeholder="LIC-12345"
                  required
                  disabled={isPending}
                  className="h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 focus-visible:border-blue-600 focus-visible:ring-blue-600/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="years_of_experience">Years of Experience</Label>
                <Input
                  id="years_of_experience"
                  name="years_of_experience"
                  type="number"
                  min="0"
                  placeholder="5"
                  required
                  disabled={isPending}
                  className="h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 focus-visible:border-blue-600 focus-visible:ring-blue-600/30"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 transition-all shadow-lg shadow-blue-500/25"
          >
            {isPending ? "Creating Doctor..." : "Create Doctor"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
