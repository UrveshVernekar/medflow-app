"use client";

import { updatePatientProfile } from "@/features/patients/patient.actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PatientProfilePage() {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const res = await updatePatientProfile(formData);

    if (res?.error) toast.error(res.error);
    else toast.success("Profile updated");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Complete Profile</h1>

      <Input name="first_name" placeholder="First Name" required />
      <Input name="last_name" placeholder="Last Name" required />

      <select name="gender" required>
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>

      <Input name="contact_number" placeholder="Contact Number" required />
      <Input name="address" placeholder="Address" />

      <Button type="submit">Save</Button>
    </form>
  );
}
