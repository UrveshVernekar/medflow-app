import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PatientPage() {
  const session = await auth();

  if (session?.user.role !== "patient") {
    redirect("/login");
  }

  return <div>Patient Dashboard</div>;
}
