// app/(dashboard)/doctor/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDoctorDashboardStats } from "@/features/appointments/appointment.actions";
import DoctorDashboardClient from "./DoctorDashboardClient";
import { LayoutDashboard } from "lucide-react";

export default async function DoctorPage() {
  const session = await auth();

  if (session?.user.role !== "doctor") {
    redirect("/login");
  }

  // Fetch Data Natively on the Server!
  const stats = await getDoctorDashboardStats(session.user.id!);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-zinc-50 to-teal-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <LayoutDashboard className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tighter text-zinc-900 dark:text-white">
                Dashboard Overview
              </h1>

              <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-lg max-w-md">
                Welcome back, Dr. {session.user.name?.split(" ")[0] || "Doctor"}. Here is what's happening.
              </p>
            </div>
          </div>
        </div>

        {/* Client Component rendering the Graphs */}
        <DoctorDashboardClient stats={stats as any} />

      </div>
    </div>
  );
}
