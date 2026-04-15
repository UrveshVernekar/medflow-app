// app/(dashboard)/patient/appointments/AppointmentsList.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getPatientAppointments, cancelAppointmentAction } from "@/features/appointments/appointment.actions";
import { CalendarDays, Clock, FileText, Stethoscope } from "lucide-react";
import { toast } from "sonner";

type Props = {
  type: "upcoming" | "past";
  userId: string;
};

export default function AppointmentsList({ type, userId }: Props) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (appointmentId: string) => {
    setCancellingId(appointmentId);
    try {
      await cancelAppointmentAction(appointmentId);
      toast.success("Appointment cancelled successfully!");
      window.dispatchEvent(new Event("appointment_booked"));
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel appointment");
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getPatientAppointments(userId, type);
        setAppointments(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    const handleRefresh = () => {
      fetchData();
    };

    window.addEventListener("appointment_booked", handleRefresh);
    return () => {
      window.removeEventListener("appointment_booked", handleRefresh);
    };
  }, [userId, type]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-8 w-8 rounded-full border-4 border-zinc-200 border-t-teal-600 animate-spin transition-all" />
        <p className="text-zinc-500 font-medium">Loading your appointments...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card className="border-dashed bg-zinc-50/50 dark:bg-zinc-900/50 shadow-none border-zinc-200 dark:border-zinc-800">
        <CardContent className="py-20 text-center flex flex-col items-center">
          <div className="h-14 w-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <CalendarDays className="h-6 w-6 text-zinc-400" />
          </div>
          <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
            No {type} appointments found
          </p>
          <p className="text-zinc-500 text-sm mt-1 max-w-sm">
            {type === "upcoming" 
              ? "You don't have any scheduled visits. Book an appointment to get started!" 
              : "You have no past appointment history to display."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 mt-6">
      {appointments.map((apt) => {
        const dateObj = new Date(apt.appointment_datetime);
        const day = dateObj.toLocaleDateString("en-IN", { day: "numeric", timeZone: "Asia/Kolkata" });
        const month = dateObj.toLocaleDateString("en-IN", { month: "short", timeZone: "Asia/Kolkata" });
        const time = dateObj.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });
        
        return (
          <Card 
            key={apt.id} 
            className="group overflow-hidden border-zinc-200 dark:border-zinc-800 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-teal-200 dark:hover:border-teal-900/50 hover:-translate-y-0.5 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl"
          >
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                
                {/* Visual Date Badge (Left Side) */}
                <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 p-6 flex sm:flex-col items-center sm:justify-center border-b sm:border-b-0 sm:border-r border-zinc-100 dark:border-zinc-800 min-w-[120px] gap-3 sm:gap-1">
                  <div className="text-center group-hover:scale-105 transition-transform duration-300">
                    <p className="text-teal-600 dark:text-teal-400 font-bold text-3xl leading-none">{day}</p>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm mt-1 uppercase tracking-widest">{month}</p>
                  </div>
                  <div className="ml-auto sm:ml-0 flex items-center gap-1.5 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-full shadow-sm sm:mt-3 border border-zinc-100 dark:border-zinc-700">
                    <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{time}</span>
                  </div>
                </div>

                {/* Main Content Info */}
                <div className="flex-1 p-6 flex flex-col sm:flex-row justify-between gap-6">
                  
                  <div className="space-y-4 flex-1">
                    {/* Doctor Overview */}
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800/50 flex items-center justify-center shrink-0">
                        <Stethoscope className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 line-clamp-1">
                          Dr. {apt.doctorName || "Unknown Doctor"}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{apt.email || "Doctor"}</p>
                      </div>
                    </div>

                    {/* Notes Section */}
                    {apt.notes && (
                      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3.5 text-sm border border-zinc-100 dark:border-zinc-800 relative z-10 flex gap-2.5">
                        <FileText className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                        <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
                          "{apt.notes}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions & Status */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-zinc-100 dark:border-zinc-800 sm:border-l sm:pl-6">
                    <Badge
                      className={`whitespace-nowrap px-3 py-1 uppercase tracking-wider text-[10px] font-bold ${
                        apt.status === "confirmed"
                          ? "bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-900"
                          : apt.status === "cancelled"
                          ? "bg-red-50 text-red-700 hover:bg-red-100 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900"
                          : "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900"
                      }`}
                      variant="outline"
                    >
                      {apt.status}
                    </Badge>
                    
                    {type === "upcoming" && apt.status !== "cancelled" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="mt-0 sm:mt-3 h-8 px-4 text-xs font-medium rounded-lg shadow-sm"
                            disabled={cancellingId === apt.id}
                          >
                            {cancellingId === apt.id ? "Cancelling..." : "Cancel"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel your appointment with Dr. {apt.doctorName || "Unknown"} on {day} {month} at {time}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleCancel(apt.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Yes, Cancel
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>

                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
