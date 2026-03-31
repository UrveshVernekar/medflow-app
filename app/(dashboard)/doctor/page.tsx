import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DoctorPage() {
  const session = await auth();

  if (session?.user.role !== "doctor") {
    redirect("/login");
  }

  return <div>Doctor Dashboard</div>;
}
