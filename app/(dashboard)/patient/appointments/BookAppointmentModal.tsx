// app/(dashboard)/patient/appointments/BookAppointmentModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, User, Clock, ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";
import {
  getDoctorsForBooking,
  getAvailableSlotsForDoctor,
  bookAppointment,
  getAllDepartments,
} from "@/features/appointments/appointment.actions";
import { SPECIALIZATIONS } from "@/config/specializations";

export default function BookAppointmentModal({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // STEP 1 STATES
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");

  // STEP 2 STATES
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const loadData = async () => {
        try {
          const [docsData, depsData] = await Promise.all([
            getDoctorsForBooking(),
            getAllDepartments(),
          ]);
          setDoctors(docsData);
          setDepartments(depsData);
        } catch (e) {
          toast.error("Failed to load doctors");
        }
      };
      loadData();
    }
  }, [open]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesSearch =
        !searchTerm ||
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept =
        selectedDepartment === "all" ||
        doctor.department === selectedDepartment;
      const matchesSpec =
        selectedSpecialization === "all" ||
        doctor.specialization === selectedSpecialization;

      return matchesSearch && matchesDept && matchesSpec;
    });
  }, [doctors, searchTerm, selectedDepartment, selectedSpecialization]);

  const handleDoctorSelect = async (doctor: any) => {
    setSelectedDoctor(doctor);
    setStep(2);
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    await loadSlots(doctor.id, today);
  };

  const loadSlots = async (doctorId: string, dateStr: string) => {
    try {
      const slots = await getAvailableSlotsForDoctor(doctorId, dateStr);
      setAvailableSlots(slots);
      setSelectedSlot("");
    } catch (e) {
      toast.error("Failed to load slots");
      setAvailableSlots([]);
    }
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    setSelectedDate(dateStr);
    if (selectedDoctor) await loadSlots(selectedDoctor.id, dateStr);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !selectedSlot || !selectedDate) return;

    setLoading(true);
    try {
      const fullDateTime = `${selectedDate}T${selectedSlot}:00`;
      await bookAppointment({
        userId,
        doctorId: selectedDoctor.id,
        appointmentDatetime: fullDateTime,
        notes: notes.trim() || undefined,
      });

      toast.success("Appointment booked successfully! 🎉");
      setOpen(false);
      window.dispatchEvent(new Event("appointment_booked"));

      setStep(1);
      setSelectedDoctor(null);
      setSelectedDate("");
      setAvailableSlots([]);
      setSelectedSlot("");
      setNotes("");
      setSearchTerm("");
      setSelectedDepartment("all");
      setSelectedSpecialization("all");
    } catch (err: any) {
      toast.error(err.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-zinc-100 h-12 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg shadow-blue-500/25 transition-all">
          <Plus className="mr-2 h-5 w-5" />
          Book New Appointment
        </Button>
      </DialogTrigger>

      <DialogContent className="!max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-3 text-xl">
            {step === 1 ? (
              "Find a Doctor"
            ) : (
              <>
                <ArrowLeft
                  className="h-5 w-5 cursor-pointer hover:text-teal-600"
                  onClick={() => setStep(1)}
                />
                Book with Dr. {selectedDoctor?.name}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: DOCTOR SELECTION */}
          {step === 1 && (
            <div className="space-y-6">
              {/* FILTERS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Search Doctor</Label>
                  <div className="relative mt-1.5">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Name or specialization..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Department</Label>
                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Specialization</Label>
                  <Select
                    value={selectedSpecialization}
                    onValueChange={setSelectedSpecialization}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="All Specializations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specializations</SelectItem>
                      {SPECIALIZATIONS.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* DOCTOR CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => (
                    <Card
                      key={doctor.id}
                      className="cursor-pointer hover:border-teal-500 hover:shadow-md transition-all"
                      onClick={() => handleDoctorSelect(doctor)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-900/30 p-3 rounded-2xl">
                            <User className="h-8 w-8 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-lg">
                              Dr. {doctor.name}
                            </p>
                            <p className="text-blue-400 font-medium">
                              {doctor.specialization}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              {doctor.department} • {doctor.yearsOfExperience}{" "}
                              years
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="col-span-full text-center text-muted-foreground py-12">
                    No doctors match your filters
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: DATES + SLOTS + NOTES */}
          {step === 2 && selectedDoctor && (
            <div className="space-y-8">
              <div>
                <Label>Select Date</Label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full mt-2 p-4 border border-input rounded-2xl focus:outline-none focus:border-blue-500 bg-background"
                />
              </div>

              <div>
                <Label className="mb-3 block">Available Slots</Label>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-80 overflow-y-auto pr-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-4 border rounded-2xl text-center transition-all flex flex-col items-center gap-1 ${
                          selectedSlot === slot
                            ? "border-blue-500 bg-blue-200/10 text-blue-500"
                            : "hover:border-blue-400"
                        }`}
                      >
                        <Clock className="h-5 w-5" />
                        <span className="font-medium text-sm">{slot}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground py-12 text-center">
                    No slots available on this date
                  </p>
                )}
              </div>

              <div>
                <Label>Additional Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any symptoms or special requests..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer with Confirm Button - Always visible */}
        {step === 2 && (
          <div className="p-6 border-t bg-background flex gap-3">
            <Button
              variant="outline"
              className="flex-1 dark:text-zinc-100 h-12 px-8 rounded-md transition-all"
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={!selectedSlot || loading}
              className="flex-1 text-zinc-100 h-12 px-8 rounded-md bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg shadow-blue-500/25 transition-all"
            >
              {loading ? "Booking..." : "Confirm & Book Appointment"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
