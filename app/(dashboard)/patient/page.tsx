// app/(dashboard)/patient/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeartPlus, Clock, FileText, Plus } from "lucide-react";
import { getUpcomingAppointmentsForPatient } from "@/features/appointments/appointment.service";
import { getPatientDashboardStats } from "@/features/appointments/appointment.actions";
import PatientDashboardClient from "./PatientDashboardClient";

export default async function PatientDashboard() {
  const session = await auth();

  if (session?.user?.role !== "patient") {
    redirect("/login");
  }

  const upcoming = await getUpcomingAppointmentsForPatient(session.user.id!);
  const stats = await getPatientDashboardStats(session.user.id!);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-zinc-50 to-teal-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* PAGE HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <HeartPlus className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tighter text-zinc-900 dark:text-white">
                Welcome back, {session.user?.name || "Patient"} 👋
              </h1>

              <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-lg max-w-md">
                Manage your health journey with MedFlow
              </p>
            </div>
          </div>

          {/* PLACEHOLDER */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* QUICK BOOK APPOINTMENT CARD */}
          <Card className="hover:shadow-lg transition-all border-teal-200 hover:border-teal-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Plus className="h-8 w-8 text-blue-600" />
                <div>
                  <CardTitle className="text-xl">Book Appointment</CardTitle>
                  <CardDescription>
                    Find a doctor and slot instantly
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                className="w-full text-zinc-100 h-12 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg shadow-blue-500/25 transition-all"
                size="lg"
              >
                <a href="/patient/appointments?book=true">Start Booking</a>
              </Button>
            </CardContent>
          </Card>

          {/* UPCOMING APPOINTMENTS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" /> Upcoming
                </CardTitle>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/patient/appointments">View all</a>
              </Button>
            </CardHeader>
            <CardContent>
              {upcoming.length > 0 ? (
                <div className="space-y-4">
                  {upcoming.slice(0, 2).map((apt: any) => (
                    <div key={apt.id} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium">{apt.doctorName}</p>
                        <p className="text-blue-600 text-xs">
                          {new Date(
                            apt.appointment_datetime,
                          ).toLocaleDateString("en-IN", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {new Date(apt.appointment_datetime).toLocaleTimeString(
                          "en-IN",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                          },
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm py-8 text-center">
                  No upcoming appointments yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* QUICK MEDICAL RECORDS */}
          <Card className="hover:shadow-lg transition-all border-teal-200 hover:border-teal-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <CardTitle className="text-xl">Medical Records</CardTitle>
                  <CardDescription>
                    Your history &amp; documents
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <a href="/patient/medical-records">View Records</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Analytics UI injected here */}
        <PatientDashboardClient stats={stats as any} />

      </div>
    </div>
  );
}
