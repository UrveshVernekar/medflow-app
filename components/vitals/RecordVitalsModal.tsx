"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { HeartPulse } from "lucide-react";
import { recordVitalSignsAction } from "@/features/vitals/vital.actions";

type Props = {
  patientId: string;
  patientName: string;
  onSuccess?: () => void;
  triggerText?: string;
};

export default function RecordVitalsModal({
  patientId,
  patientName,
  onSuccess,
  triggerText = "Record Vitals",
}: Props) {
  const [open, setOpen] = useState(false);
  const [systolic, setSystolic] = useState("120");
  const [diastolic, setDiastolic] = useState("80");
  const [heartRate, setHeartRate] = useState("72");
  const [spO2, setSpO2] = useState("98");
  const [temp, setTemp] = useState("37.0");
  const [respRate, setRespRate] = useState("16");
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const res = await recordVitalSignsAction({
        patientId,
        bloodPressureSystolic: Number(systolic),
        bloodPressureDiastolic: Number(diastolic),
        heartRate: Number(heartRate),
        spO2: Number(spO2),
        temperatureCelsius: Number(temp),
        respiratoryRate: respRate ? Number(respRate) : undefined,
        weightKg: weight ? Number(weight) : undefined,
        heightCm: height ? Number(height) : undefined,
      });

      if (res.success) {
        toast.success(`Vitals recorded for ${patientName}`);
        setOpen(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Failed to record vital signs");
      }
    } catch {
      toast.error("Error submitting vital signs");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-teal-200 dark:border-teal-900 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30">
          <HeartPulse className="w-4 h-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl p-8 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-rose-500" />
            Record Vital Signs for {patientName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold">BP Systolic (mmHg) *</Label>
              <Input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                required
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">BP Diastolic (mmHg) *</Label>
              <Input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                required
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Heart Rate (bpm) *</Label>
              <Input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                required
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">SpO2 Oxygen (%) *</Label>
              <Input
                type="number"
                value={spO2}
                onChange={(e) => setSpO2(e.target.value)}
                required
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Temperature (°C) *</Label>
              <Input
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                required
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Respiratory Rate (bpm)</Label>
              <Input
                type="number"
                value={respRate}
                onChange={(e) => setRespRate(e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Weight (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Height (cm)</Label>
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl px-6">
              {submitting ? "Saving..." : "Save Vital Signs"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
