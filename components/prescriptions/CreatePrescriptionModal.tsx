"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, ShieldAlert, Pill, CheckCircle2, AlertTriangle } from "lucide-react";
import { createPrescriptionAction, checkPrescriptionSafetyAction } from "@/features/prescriptions/prescription.actions";
import type { DrugSafetyWarning } from "@/lib/openfda";

type Item = {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

type Props = {
  patientId: string;
  patientName: string;
  appointmentId?: string;
  triggerText?: string;
};

export default function CreatePrescriptionModal({
  patientId,
  patientName,
  appointmentId,
  triggerText = "Issue E-Prescription",
}: Props) {
  const [open, setOpen] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([
    { medicationName: "", dosage: "", frequency: "Once daily", duration: "7 days", instructions: "" },
  ]);
  const [isCheckingSafety, setIsCheckingSafety] = useState(false);
  const [safetyWarnings, setSafetyWarnings] = useState<DrugSafetyWarning[]>([]);
  const [hasSafetyChecked, setHasSafetyChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { medicationName: "", dosage: "", frequency: "Once daily", duration: "7 days", instructions: "" },
    ]);
    setHasSafetyChecked(false);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
    setHasSafetyChecked(false);
  };

  const updateItem = (index: number, field: keyof Item, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
    setHasSafetyChecked(false);
  };

  const handleSafetyCheck = async () => {
    const medList = items.map((i) => i.medicationName).filter(Boolean);
    if (medList.length === 0) {
      toast.error("Please enter at least one medication name.");
      return;
    }

    setIsCheckingSafety(true);
    try {
      const res = await checkPrescriptionSafetyAction(patientId, medList);
      if (res.success && res.safetyResult) {
        setSafetyWarnings(res.safetyResult.warnings);
        setHasSafetyChecked(true);
        if (res.safetyResult.hasWarnings) {
          toast.warning("FDA Safety & Allergy Alert Triggered!");
        } else {
          toast.success("No adverse drug interactions or allergy conflicts detected.");
        }
      }
    } catch {
      toast.error("Failed to perform drug safety check.");
    } finally {
      setIsCheckingSafety(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!diagnosis.trim()) {
      toast.error("Diagnosis is required.");
      return;
    }

    const validItems = items.filter((i) => i.medicationName.trim() && i.dosage.trim());
    if (validItems.length === 0) {
      toast.error("Please provide valid medication details.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createPrescriptionAction({
        patientId,
        appointmentId,
        diagnosis,
        notes,
        items: validItems,
      });

      if (res.success) {
        toast.success("E-Prescription issued successfully!");
        setOpen(false);
        setDiagnosis("");
        setNotes("");
        setItems([{ medicationName: "", dosage: "", frequency: "Once daily", duration: "7 days", instructions: "" }]);
        setSafetyWarnings([]);
        setHasSafetyChecked(false);
      } else {
        toast.error(res.error || "Failed to issue prescription");
      }
    } catch {
      toast.error("An error occurred while creating prescription.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-medium shadow-md">
          <Pill className="w-4 h-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-8 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Pill className="h-6 w-6 text-teal-600" />
            Issue E-Prescription for {patientName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Diagnosis & Notes */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="font-semibold text-sm">Diagnosis / Clinical Impression *</Label>
              <Input
                placeholder="e.g. Acute Bronchitis, Essential Hypertension"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                required
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label className="font-semibold text-sm">Doctor Notes &amp; Lifestyle Advice</Label>
              <Input
                placeholder="e.g. Low sodium diet, monitor BP daily"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
          </div>

          {/* Medications Section */}
          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <Label className="text-base font-bold text-zinc-900 dark:text-zinc-100">Prescribed Medications</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="rounded-xl">
                <Plus className="w-4 h-4 mr-1" /> Add Medication
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Item #{index + 1}</span>
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="h-7 w-7 text-rose-500 hover:text-rose-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">Medication Name *</Label>
                    <Input
                      placeholder="e.g. Amoxicillin, Lisinopril"
                      value={item.medicationName}
                      onChange={(e) => updateItem(index, "medicationName", e.target.value)}
                      className="mt-1 text-sm rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Dosage *</Label>
                    <Input
                      placeholder="e.g. 500mg"
                      value={item.dosage}
                      onChange={(e) => updateItem(index, "dosage", e.target.value)}
                      className="mt-1 text-sm rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Frequency</Label>
                    <Input
                      placeholder="e.g. Twice daily"
                      value={item.frequency}
                      onChange={(e) => updateItem(index, "frequency", e.target.value)}
                      className="mt-1 text-sm rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Duration</Label>
                    <Input
                      placeholder="e.g. 7 days"
                      value={item.duration}
                      onChange={(e) => updateItem(index, "duration", e.target.value)}
                      className="mt-1 text-sm rounded-xl"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* OpenFDA Drug Safety Check Button & Results Banner */}
          <div className="space-y-4 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSafetyCheck}
              disabled={isCheckingSafety}
              className="w-full bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl font-semibold"
            >
              <ShieldAlert className="w-4 h-4 mr-2" />
              {isCheckingSafety ? "Querying OpenFDA API & Allergy Database..." : "Run OpenFDA & Allergy Safety Check"}
            </Button>

            {hasSafetyChecked && (
              <div className="space-y-2">
                {safetyWarnings.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-sm flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>No drug-drug interactions or allergy contraindications detected for this patient.</span>
                  </div>
                ) : (
                  safetyWarnings.map((warn, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl text-sm border flex items-start gap-3 ${
                        warn.severity === "critical"
                          ? "bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200 border-rose-300 dark:border-rose-800"
                          : "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 border-amber-300 dark:border-amber-800"
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">{warn.title}</p>
                        <p className="mt-1 leading-relaxed">{warn.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl shadow-lg px-6"
            >
              {submitting ? "Signing & Issuing..." : "Confirm & Issue E-Prescription"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
