// app/(dashboard)/doctor/appointments/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListPlus } from "lucide-react";
import AppointmentsList from "./AppointmentsList";

export default async function DoctorAppointmentsPage() {
  const session = await auth();

  if (session?.user?.role !== "doctor") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-zinc-50 to-teal-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* PAGE HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <ListPlus className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tighter text-zinc-900 dark:text-white">
                My Appointments
              </h1>

              <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-lg max-w-md">
                Manage your patient schedule
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            <AppointmentsList type="upcoming" userId={session.user.id!} />
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            <AppointmentsList type="past" userId={session.user.id!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
