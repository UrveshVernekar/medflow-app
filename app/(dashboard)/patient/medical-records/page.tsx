import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPatientPrescriptionsAction } from "@/features/prescriptions/prescription.actions";
import { getPatientVitalsHistoryAction } from "@/features/vitals/vital.actions";
import VitalsTrendChart from "@/components/vitals/VitalsTrendChart";
import { FileText, Pill, HeartPulse, Stethoscope, CalendarDays } from "lucide-react";

export default async function MedicalRecordsPage() {
  const session = await auth();

  if (session?.user.role !== "patient") {
    redirect("/login");
  }

  const scriptsRes = await getPatientPrescriptionsAction();
  const vitalsRes = await getPatientVitalsHistoryAction();

  const prescriptions = scriptsRes.prescriptions || [];
  const vitalsHistory = vitalsRes.history || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-zinc-50 to-teal-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* PAGE HEADER */}
        <div className="flex items-start gap-5">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-600 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-semibold tracking-tighter text-zinc-900 dark:text-white">
              My Clinical Medical Records
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-lg max-w-md">
              View your electronic prescriptions, active medications, and vital signs trend history.
            </p>
          </div>
        </div>

        {/* SECTION 1: VITAL SIGNS TREND */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-rose-500" />
            Physiological Vital Signs History
          </h2>
          <VitalsTrendChart history={vitalsHistory} />
        </div>

        {/* SECTION 2: DIGITAL E-PRESCRIPTIONS */}
        <div className="space-y-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Pill className="h-6 w-6 text-teal-600" />
              Digital E-Prescriptions ({prescriptions.length})
            </h2>
          </div>

          {prescriptions.length === 0 ? (
            <Card className="border-dashed bg-zinc-50/50 dark:bg-zinc-900/50 shadow-none border-zinc-200 dark:border-zinc-800">
              <CardContent className="py-16 text-center text-zinc-500 italic">
                No active or past electronic prescriptions issued yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {prescriptions.map((script) => (
                <Card
                  key={script.id}
                  className="border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl shadow-md rounded-3xl overflow-hidden"
                >
                  <CardHeader className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge className="bg-teal-600 text-white font-semibold text-[10px] uppercase mb-2">
                          ACTIVE PRESCRIPTION
                        </Badge>
                        <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                          {script.diagnosis}
                        </CardTitle>
                        <CardDescription className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                          <Stethoscope className="w-3.5 h-3.5" /> {script.doctorName} ({script.specialization})
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1 justify-end">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {script.issuedAt
                            ? new Date(script.issuedAt).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Recent"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-4">
                    {/* Prescription Items List */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Prescribed Medications</p>
                      {script.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-1"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                              💊 {item.medicationName}
                            </span>
                            <Badge variant="outline" className="text-xs font-semibold">
                              {item.dosage}
                            </Badge>
                          </div>
                          <div className="text-xs text-zinc-600 dark:text-zinc-400 flex flex-wrap gap-x-4">
                            <span>Frequency: <strong>{item.frequency}</strong></span>
                            <span>Duration: <strong>{item.duration}</strong></span>
                          </div>
                          {item.instructions && (
                            <p className="text-xs italic text-zinc-500 mt-1">
                              Note: {item.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {script.notes && (
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 italic">
                        Doctor Advice: &quot;{script.notes}&quot;
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
