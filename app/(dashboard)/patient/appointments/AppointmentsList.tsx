// app/(dashboard)/patient/appointments/AppointmentsList.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPatientAppointments } from "@/features/appointments/appointment.actions";

type Props = {
  type: "upcoming" | "past";
  userId: string;
};

export default function AppointmentsList({ type, userId }: Props) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, [userId, type]);

  if (loading) {
    return (
      <p className="text-muted-foreground py-12 text-center">
        Loading appointments...
      </p>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No {type} appointments found
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((apt) => (
        <Card key={apt.id}>
          <CardContent className="p-6 flex justify-between items-start">
            <div>
              <p className="font-semibold">{apt.doctorName || "Doctor"}</p>
              <p className="text-sm text-teal-600">
                {new Date(apt.appointment_datetime).toLocaleDateString(
                  "en-IN",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "Asia/Kolkata",
                  },
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {apt.notes || "No notes"}
              </p>
            </div>
            <div className="text-right">
              <Badge
                className="uppercase"
                variant={apt.status === "confirmed" ? "default" : "secondary"}
              >
                {apt.status}
              </Badge>
              <p className="text-sm text-teal-600 mt-3">
                {new Date(apt.appointment_datetime).toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: "Asia/Kolkata", // ← This was missing
                  },
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
