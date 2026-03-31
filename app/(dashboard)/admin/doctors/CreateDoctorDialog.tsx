"use client";

import { useState } from "react";
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

export default function CreateDoctorDialog({ departments }: any) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const res = await createDoctorAction(formData);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Doctor created");
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Doctor</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Doctor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input name="email" placeholder="Email" required />
          <Input
            name="password"
            type="password"
            placeholder="password"
            required
          />

          <select name="specialization" required>
            {SPECIALIZATIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select name="department_id" required>
            {departments.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <Input name="license_number" placeholder="License" required />
          <Input
            name="years_of_experience"
            type="number"
            placeholder="Experience"
            required
          />

          <Button type="submit" className="w-full">
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
