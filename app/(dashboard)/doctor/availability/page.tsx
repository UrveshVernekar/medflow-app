"use client";

import { useState, useEffect, useCallback } from "react";
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

  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: { slots: [] },
  });

  // Load initial data
  useEffect(() => {
    getMyAvailabilityAction().then((res) => {
      if (res.success && res.slots) {
        form.reset({ slots: res.slots });
        setHasUnsavedChanges(false);
      }
    });
  }, [form]);

  // Auto-save with debounce (optional but nice UX)
  const saveAvailability = useCallback(async () => {
    setIsLoading(true);
    const data = form.getValues();

    const formData = new FormData();
    formData.append("slots", JSON.stringify(data.slots));

    const result = await updateAvailabilityAction({}, formData);

    if (result.success) {
      toast.success("✅ Schedule saved successfully");
      setHasUnsavedChanges(false);
    } else {
      toast.error(result.error || "Failed to save schedule");
    }
    setIsLoading(false);
  }, [form]);

  // Watch for changes and mark as unsaved
  const watchedSlots = form.watch("slots");

  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [watchedSlots]);

  const onManualSave = async () => {
    await saveAvailability();
  };

  // Toggle day
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

  // Update time
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Availability</h1>
          <p className="text-muted-foreground">
            Set your weekly recurring schedule. Changes are saved when you click
            Save.
          </p>
        </div>
        <Button
          onClick={onManualSave}
          disabled={isLoading || !hasUnsavedChanges}
        >
          {isLoading
            ? "Saving..."
            : hasUnsavedChanges
              ? "Save Changes"
              : "Saved"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Working Hours</CardTitle>
          <CardDescription>
            Toggle days on/off and adjust your start and end times.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
            {daysList.map((day) => {
              const slot = watchedSlots.find((s) => s.dayOfWeek === day.value);
              const isEnabled = !!slot;

              return (
                <div
                  key={day.value}
                  className="flex flex-col sm:flex-row sm:items-center gap-6 border-b pb-6 last:border-b-0 last:pb-0"
                >
                  <div className="w-40 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={() => toggleDay(day.value)}
                      />
                      <Label className="font-medium text-base cursor-pointer">
                        {day.label}
                      </Label>
                    </div>
                  </div>

                  {isEnabled && slot && (
                    <div className="flex flex-wrap gap-6">
                      <div className="flex flex-col gap-1.5 min-w-[140px]">
                        <Label className="text-xs text-muted-foreground">
                          Start Time
                        </Label>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) =>
                            updateTime(day.value, "startTime", e.target.value)
                          }
                          className="border border-input rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 min-w-[140px]">
                        <Label className="text-xs text-muted-foreground">
                          End Time
                        </Label>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) =>
                            updateTime(day.value, "endTime", e.target.value)
                          }
                          className="border border-input rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  )}

                  {isEnabled && (
                    <div className="text-sm text-muted-foreground self-end sm:self-center">
                      {slot?.startTime} — {slot?.endTime}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              💡 Tip: Toggle days on/off and adjust times, then click{" "}
              <strong>Save Changes</strong>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
