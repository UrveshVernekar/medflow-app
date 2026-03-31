// app/(dashboard)/admin/doctors/page.tsx
import { getDoctors } from "@/features/doctors/doctor.service";
import { getDepartments } from "@/features/departments/department.service";
import DoctorTable from "./DoctorTable";
import CreateDoctorDialog from "./CreateDoctorDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Filter, X } from "lucide-react";

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const departmentId = resolvedSearchParams.department;

  const [doctors, departments] = await Promise.all([
    getDoctors(departmentId),
    getDepartments(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-zinc-50 to-teal-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tighter text-zinc-900 dark:text-white">
                Doctors
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-lg max-w-md">
                Manage doctor profiles, specializations, and department
                assignments
              </p>
            </div>
          </div>

          <CreateDoctorDialog departments={departments} />
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-3xl overflow-hidden">
          <CardHeader className="px-10 pt-10 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-2xl">
                All Doctors
                {departmentId && (
                  <span className="text-blue-600 dark:text-blue-400 text-base font-normal ml-2">
                    • Filtered by department
                  </span>
                )}
              </CardTitle>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Showing{" "}
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {doctors.length}
                </span>{" "}
                doctors
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-10">
            {/* Modern Filter Bar */}
            <div className="mb-10">
              <form className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400">
                    <Filter className="h-4 w-4" />
                  </div>
                  <select
                    name="department"
                    defaultValue={departmentId || ""}
                    className="w-full h-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-12 pr-5 text-base focus-visible:border-blue-600 focus-visible:ring-blue-600/30 transition-all appearance-none"
                  >
                    <option value="">All Departments</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  className="h-14 px-10 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg shadow-blue-500/25 transition-all"
                >
                  <Filter className="mr-2 h-5 w-5" />
                  Apply Filter
                </Button>

                {departmentId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 px-8 rounded-2xl border-zinc-200 dark:border-zinc-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                    asChild
                  >
                    <a href="/admin/doctors">
                      <X className="mr-2 h-5 w-5" />
                      Clear Filter
                    </a>
                  </Button>
                )}
              </form>
            </div>

            <DoctorTable doctors={doctors as unknown as any[]} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
