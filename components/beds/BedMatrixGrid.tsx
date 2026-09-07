"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateBedStatusAction } from "@/features/beds/bed.actions";
import { toast } from "sonner";
import { Activity, UserPlus } from "lucide-react";

type Bed = {
  id: string;
  bedNumber: string;
  status: "available" | "occupied" | "sanitizing" | "maintenance";
  assignedPatientId: string | null;
  assignedPatientName: string | null;
  assignedAt: Date | string | null;
};

type Ward = {
  id: string;
  name: string;
  wardType: string;
  totalBeds: number;
  beds: Bed[];
};

export default function BedMatrixGrid({ initialWards }: { initialWards: Ward[] }) {
  const [wards, setWards] = useState<Ward[]>(initialWards || []);
  const [loadingBedId, setLoadingBedId] = useState<string | null>(null);

  // Subscribe to SSE real-time stream
  useEffect(() => {
    const eventSource = new EventSource("/api/beds/stream");

    eventSource.onmessage = (event) => {
      try {
        const liveWards = JSON.parse(event.data);
        setWards(liveWards);
      } catch (err) {
        console.error("Failed to parse live bed stream", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleStatusChange = async (
    bedId: string,
    newStatus: "available" | "occupied" | "sanitizing" | "maintenance"
  ) => {
    setLoadingBedId(bedId);
    try {
      const res = await updateBedStatusAction(bedId, newStatus);
      if (res.success) {
        toast.success(`Bed status updated to ${newStatus.toUpperCase()}`);
        setWards((prev) =>
          prev.map((w) => ({
            ...w,
            beds: w.beds.map((b) =>
              b.id === bedId ? { ...b, status: newStatus } : b
            ),
          }))
        );
      } else {
        toast.error(res.error || "Failed to update bed");
      }
    } catch {
      toast.error("Error updating bed status");
    } finally {
      setLoadingBedId(null);
    }
  };

  const getStatusBadge = (status: Bed["status"]) => {
    switch (status) {
      case "available":
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold">AVAILABLE</Badge>;
      case "occupied":
        return <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-semibold">OCCUPIED</Badge>;
      case "sanitizing":
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold">SANITIZING</Badge>;
      case "maintenance":
        return <Badge className="bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20 font-semibold">MAINTENANCE</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Live Stream Indicator Header */}
      <div className="flex items-center justify-between bg-zinc-900 text-white p-5 rounded-2xl shadow-lg border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Real-Time Ward & ICU Bed Matrix</h3>
            <p className="text-xs text-zinc-400">Live SSE synchronization active. Bed transitions update in real time across the facility.</p>
          </div>
        </div>
      </div>

      {/* Ward Cards */}
      <div className="grid gap-8">
        {wards.map((ward) => {
          const availableCount = ward.beds.filter((b) => b.status === "available").length;
          const occupiedCount = ward.beds.filter((b) => b.status === "occupied").length;

          return (
            <Card key={ward.id} className="border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-md rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-teal-600" />
                      {ward.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Type: <span className="font-medium text-zinc-700 dark:text-zinc-300">{ward.wardType}</span> • Total Capacity: {ward.totalBeds} Beds
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                      🟢 {availableCount} Available
                    </span>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                      🔴 {occupiedCount} Occupied
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {ward.beds.map((bed) => (
                    <div
                      key={bed.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                        bed.status === "available"
                          ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/50"
                          : bed.status === "occupied"
                          ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/50"
                          : bed.status === "sanitizing"
                          ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/50"
                          : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100">{bed.bedNumber}</span>
                        {getStatusBadge(bed.status)}
                      </div>

                      {/* Assigned Patient Info */}
                      <div>
                        {bed.status === "occupied" ? (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Patient</p>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {bed.assignedPatientName || "Assigned Patient"}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500 italic">No patient assigned</p>
                        )}
                      </div>

                      {/* Quick Action Controls */}
                      <div className="pt-3 border-t border-zinc-200/50 dark:border-zinc-800 flex gap-2">
                        {bed.status === "occupied" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs font-medium border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-400"
                            disabled={loadingBedId === bed.id}
                            onClick={() => handleStatusChange(bed.id, "sanitizing")}
                          >
                            Discharge &amp; Clean
                          </Button>
                        )}
                        {bed.status === "sanitizing" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs font-medium border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-400"
                            disabled={loadingBedId === bed.id}
                            onClick={() => handleStatusChange(bed.id, "available")}
                          >
                            Mark Ready
                          </Button>
                        )}
                        {bed.status === "available" && (
                          <Button
                            size="sm"
                            className="w-full text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                            disabled={loadingBedId === bed.id}
                            onClick={() => handleStatusChange(bed.id, "occupied")}
                          >
                            <UserPlus className="w-3.5 h-3.5 mr-1" />
                            Occupy Bed
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
