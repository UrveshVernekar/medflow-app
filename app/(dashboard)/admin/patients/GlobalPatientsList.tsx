"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getGlobalPatientsList } from "@/features/patients/patient.actions";
import { Search, UserCircle2, Phone, Mail, History, CalendarPlus } from "lucide-react";

type GlobalPatientData = {
  patient_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  gender: string | null;
  contact_number: string | null;
  total_visits: number;
  created_at: string;
};

export default function GlobalPatientsList() {
  const [patients, setPatients] = useState<GlobalPatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getGlobalPatientsList();
        setPatients(data as unknown as GlobalPatientData[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredPatients = patients.filter((p) => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) || 
           (p.email && p.email.toLowerCase().includes(search.toLowerCase())) ||
           (p.contact_number && p.contact_number.includes(search));
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-8 w-8 rounded-full border-4 border-zinc-200 border-t-blue-600 animate-spin transition-all" />
        <p className="text-zinc-500 font-medium">Loading global registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-2">
      {/* Search Filter */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-zinc-400" />
        </div>
        <Input 
          type="text"
          placeholder="Search global registry by name, email, or phone..." 
          className="pl-10 py-6 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800 focus-visible:ring-blue-500 rounded-2xl shadow-sm text-base"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {patients.length === 0 ? (
        <Card className="border-dashed bg-zinc-50/50 dark:bg-zinc-900/50 shadow-none border-zinc-200 dark:border-zinc-800 mt-6">
          <CardContent className="py-20 text-center flex flex-col items-center">
            <div className="h-14 w-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <UserCircle2 className="h-6 w-6 text-zinc-400" />
            </div>
            <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
              No Patients Found
            </p>
            <p className="text-zinc-500 text-sm mt-1 max-w-sm">
              The global registry is currently completely empty. Patient accounts must be created first.
            </p>
          </CardContent>
        </Card>
      ) : filteredPatients.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 italic">No patients match your search.</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredPatients.map((patient) => {
            const dateObj = new Date(patient.created_at);
            const regDateStr = dateObj.toLocaleDateString("en-IN", { 
              month: "short", day: "numeric", year: "numeric" 
            });

            return (
              <Card 
                key={patient.patient_id}
                className="group overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300"
              >
                <CardContent className="p-0">
                  {/* Header / Identity Stripe */}
                  <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/50 bg-gradient-to-br from-zinc-50/50 to-transparent dark:from-zinc-800/20">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4 items-center">
                        <div className="h-12 w-12 rounded-full border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <UserCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 line-clamp-1">
                            {patient.first_name || "New Patient"} {patient.last_name || ""}
                          </h3>
                          <Badge variant="secondary" className="px-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-500 capitalize font-medium text-[10px]">
                            {patient.gender || "Unregistered Profile"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                        <span className="truncate">{patient.email || "No email available"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
                        <span>{patient.contact_number || "No contact info"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl p-3 flex flex-col items-center justify-center border border-indigo-100/50 dark:border-indigo-900/20">
                        <History className="h-4 w-4 text-indigo-500 mb-1" />
                        <p className="text-xl font-bold text-indigo-700 dark:text-indigo-400 leading-none">{patient.total_visits}</p>
                        <p className="text-[10px] uppercase tracking-wider text-indigo-600/70 font-semibold mt-1">Total Records</p>
                      </div>
                      <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-3 flex flex-col items-center justify-center border border-blue-100/50 dark:border-blue-900/20">
                         <CalendarPlus className="h-4 w-4 text-blue-500 mb-1" />
                         <p className="text-[13px] font-bold text-blue-700 dark:text-blue-400 mt-0.5">{regDateStr}</p>
                         <p className="text-[10px] uppercase tracking-wider text-blue-600/70 font-semibold mt-1">Registered</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
