// app/doctor/availability/page.tsx
"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Clock, Calendar, Save, AlertCircle, CheckCircle2 } from "lucide-react";

import { availabilitySchema } from "@/features/doctors/doctor-availability.schema";
import type { AvailabilityFormValues } from "@/features/doctors/doctor-availability.types";
import {
  getMyAvailabilityAction,
  updateAvailabilityAction,
} from "@/features/doctors/doctor-availability.actions";

const daysList = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
] as const;

export default function DoctorAvailabilityPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSave, setAutoSave] = useState(true); // Enabled by default in modern UIs
  const [isPending, startTransition] = useTransition();

  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: { slots: [] },
  });

  // Load initial availability
  useEffect(() => {
    getMyAvailabilityAction().then((res) => {
      if (res.success && res.slots) {
        form.reset({ slots: res.slots });
        setHasUnsavedChanges(false);
      }
    });
  }, [form]);

  const watchedSlots = form.watch("slots");

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [watchedSlots]);

  const saveAvailability = useCallback(async () => {
    setIsLoading(true);

    const data = form.getValues();
    const formData = new FormData();
    formData.append("slots", JSON.stringify(data.slots));

    const result = await updateAvailabilityAction({}, formData);

    if (result.success) {
      toast.success("Availability updated", {
        description: "Your weekly schedule has been saved successfully.",
        action: {
          label: "Dismiss",
          onClick: () => {},
        },
      });
      setHasUnsavedChanges(false);
    } else {
      toast.error(result.error || "Failed to update availability");
    }

    setIsLoading(false);
  }, [form]);

  const onManualSave = async () => {
    await saveAvailability();
  };

  // Auto-save with debounce
  useEffect(() => {
    if (!autoSave || !hasUnsavedChanges) return;

    const timeout = setTimeout(() => {
      saveAvailability();
    }, 1500);

    return () => clearTimeout(timeout);
  }, [watchedSlots, autoSave, hasUnsavedChanges, saveAvailability]);

  // Toggle day availability
  const toggleDay = (dayOfWeek: number) => {
    const current = form.getValues("slots");
    const exists = current.findIndex((s) => s.dayOfWeek === dayOfWeek);

    if (exists >= 0) {
      form.setValue(
        "slots",
        current.filter((s) => s.dayOfWeek !== dayOfWeek),
      );
    } else {
      form.setValue("slots", [
        ...current,
        { dayOfWeek: dayOfWeek as any, startTime: "09:00", endTime: "17:00" },
      ]);
    }
  };

  // Update start or end time
  const updateTime = (
    dayOfWeek: number,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    const current = form.getValues("slots");
    const index = current.findIndex((s) => s.dayOfWeek === dayOfWeek);

    if (index >= 0) {
      const updated = [...current];
      updated[index] = { ...updated[index], [field]: value };
      form.setValue("slots", updated);
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const minutes = eh * 60 + em - (sh * 60 + sm);
    if (minutes <= 0) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ""}`.trim();
  };

  const isSubmitting = isLoading || isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-zinc-50 to-teal-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tighter text-zinc-900 dark:text-white">
                My Availability
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-2 max-w-lg text-lg">
                Set your recurring weekly schedule. This determines when
                patients can book appointments with you.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 px-5 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
              <Label
                htmlFor="auto-save"
                className="cursor-pointer text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Auto-save changes
              </Label>
            </div>

            <Button
              onClick={onManualSave}
              disabled={isSubmitting || !hasUnsavedChanges}
              size="lg"
              className="h-12 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.985]"
            >
              {isSubmitting ? (
                <>Saving...</>
              ) : hasUnsavedChanges ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Schedule
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  All Saved
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Schedule Card */}
        <Card className="border-0 shadow-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-3xl overflow-hidden">
          <CardHeader className="px-10 pt-10 pb-8 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  Weekly Recurring Schedule
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Toggle days and set your working hours. These repeat every
                  week.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-10 space-y-6">
            {watchedSlots.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-950/50">
                <AlertCircle className="h-16 w-16 text-zinc-400 mb-6" />
                <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                  No availability set
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mt-3 max-w-sm">
                  Toggle at least one day below to start receiving appointment
                  requests.
                </p>
              </div>
            )}

            <div className="space-y-5">
              {daysList.map((day) => {
                const slot = watchedSlots.find(
                  (s) => s.dayOfWeek === day.value,
                );
                const isEnabled = !!slot;
                const duration = slot
                  ? calculateDuration(slot.startTime, slot.endTime)
                  : "";

                return (
                  <div
                    key={day.value}
                    className={`rounded-3xl border p-8 transition-all duration-300 group ${
                      isEnabled
                        ? "border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/40 dark:to-zinc-900 shadow-sm"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                      {/* Day Selector */}
                      <div className="lg:w-72 flex-shrink-0">
                        <div className="flex items-center gap-6">
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={() => toggleDay(day.value)}
                            className="scale-110 data-[state=checked]:bg-blue-600"
                          />
                          <div>
                            <Label className="text-2xl font-semibold tracking-tight cursor-pointer select-none text-zinc-900 dark:text-white">
                              {day.label}
                            </Label>
                            {isEnabled && duration && (
                              <p className="text-emerald-600 dark:text-emerald-500 font-medium mt-1 flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4" />
                                {duration}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Time Pickers */}
                      {isEnabled && slot && (
                        <div className="flex flex-1 flex-wrap gap-x-10 gap-y-6">
                          <div className="flex-1 min-w-[200px]">
                            <Label className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-medium mb-2 block">
                              START TIME
                            </Label>
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) =>
                                updateTime(
                                  day.value,
                                  "startTime",
                                  e.target.value,
                                )
                              }
                              disabled={isSubmitting}
                              className="w-full h-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 text-base focus-visible:border-blue-600 focus-visible:ring-blue-600/30 transition-all"
                            />
                          </div>

                          <div className="flex-1 min-w-[200px]">
                            <Label className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-medium mb-2 block">
                              END TIME
                            </Label>
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) =>
                                updateTime(day.value, "endTime", e.target.value)
                              }
                              disabled={isSubmitting}
                              className="w-full h-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 text-base focus-visible:border-blue-600 focus-visible:ring-blue-600/30 transition-all"
                            />
                          </div>

                          {duration && (
                            <div className="self-end pb-2 text-sm font-medium text-emerald-600 dark:text-emerald-500">
                              {duration} per day
                            </div>
                          )}
                        </div>
                      )}

                      {!isEnabled && (
                        <div className="lg:ml-auto text-sm text-zinc-500 dark:text-zinc-400 italic">
                          Not available on {day.label.toLowerCase()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Pro Tip Card */}
        <Card className="bg-white/70 dark:bg-zinc-900/70 border border-dashed border-zinc-300 dark:border-zinc-700">
          <CardContent className="p-10">
            <div className="flex gap-6">
              <div className="text-4xl mt-1">💡</div>
              <div className="space-y-3">
                <p className="font-semibold text-xl text-zinc-900 dark:text-white">
                  Pro Tip
                </p>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Leave buffer time between appointments in your booking engine.
                  Consider setting slightly shorter hours on busy days to avoid
                  burnout and maintain work-life balance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
