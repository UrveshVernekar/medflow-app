"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, ShieldCheck, Mail, Calendar, Save, Stethoscope, Briefcase, Award } from "lucide-react";
import { updateUserProfileDetailsAction } from "@/features/profile/profile.actions";

type ProfileProps = {
  data: {
    user: {
      id: string;
      email: string;
      role: string;
      firstName: string;
      lastName: string;
      createdAt: Date | string | null;
    };
    doctor: {
      id: string;
      specialization: string;
      licenseNumber: string;
      yearsOfExperience: number;
      departmentName: string;
    } | null;
    patient: {
      id: string;
      gender: string;
      contactNumber: string;
      address: string;
    } | null;
  };
};

export default function ProfileClient({ data }: ProfileProps) {
  const { user, doctor, patient } = data;
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [contactNumber, setContactNumber] = useState(patient?.contactNumber || "");
  const [address, setAddress] = useState(patient?.address || "");
  const [submitting, setSubmitting] = useState(false);

  const displayName = `${firstName} ${lastName}`.trim() || (user.role === "doctor" ? "Doctor Account" : "User Account");
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("contactNumber", contactNumber);
      formData.append("address", address);

      const res = await updateUserProfileDetailsAction(formData);
      if (res.success) {
        toast.success("Profile details updated successfully!");
      } else {
        toast.error(res.error || "Failed to update profile.");
      }
    } catch {
      toast.error("An error occurred while updating profile.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Profile Header Identity Card */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-zinc-50 to-blue-50/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 backdrop-blur-2xl rounded-3xl overflow-hidden">
        <CardContent className="p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-600 to-teal-600 text-white font-bold text-3xl flex items-center justify-center shadow-xl shrink-0">
              {initials}
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  {displayName}
                </h1>
                <Badge className="w-fit mx-auto sm:mx-0 uppercase px-3 py-1 bg-blue-600 text-white font-bold text-xs shadow-sm">
                  {user.role}
                </Badge>
              </div>

              <p className="text-zinc-600 dark:text-zinc-400 font-medium flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                {user.email}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-4 pt-2 text-xs font-semibold text-zinc-500">
                <span className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> HIPAA Audited Profile
                </span>
                <span className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                  <Calendar className="w-4 h-4 text-teal-500" /> Member since {user.createdAt ? new Date(user.createdAt).getFullYear() : "2026"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Specific Professional / Patient Card */}
      {doctor && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Specialization</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{doctor.specialization}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">License Number</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{doctor.licenseNumber}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Experience</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{doctor.yearsOfExperience} Years ({doctor.departmentName})</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Profile Form */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-lg rounded-3xl">
        <CardHeader className="px-8 pt-8 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Account Details &amp; Personal Info
          </CardTitle>
          <CardDescription>Update your account information and contact preferences.</CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-semibold">First Name</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className="mt-1.5 rounded-xl py-5"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold">Last Name</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className="mt-1.5 rounded-xl py-5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-semibold">Email Address (Read Only)</Label>
                <Input
                  value={user.email}
                  disabled
                  className="mt-1.5 rounded-xl py-5 bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed opacity-80"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold">User Role (Read Only)</Label>
                <Input
                  value={user.role.toUpperCase()}
                  disabled
                  className="mt-1.5 rounded-xl py-5 bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed opacity-80 font-bold"
                />
              </div>
            </div>

            {user.role === "patient" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <Label className="text-sm font-semibold">Contact Number</Label>
                  <Input
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+1-555-0199"
                    className="mt-1.5 rounded-xl py-5"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold">Residential Address</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Street Name, City"
                    className="mt-1.5 rounded-xl py-5"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-xl px-8 h-12 shadow-lg shadow-blue-500/20 font-semibold"
              >
                <Save className="w-4 h-4 mr-2" />
                {submitting ? "Saving Changes..." : "Save Profile Details"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
