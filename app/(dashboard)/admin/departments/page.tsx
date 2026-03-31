// app/(dashboard)/admin/departments/page.tsx
import { getDepartments } from "@/features/departments/department.service";
import {
  createDepartmentAction,
  deleteDepartmentAction,
} from "@/features/departments/department.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Building2, AlertCircle } from "lucide-react";

export default async function DepartmentsPage() {
  const departments = await getDepartments();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-zinc-50 to-teal-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tighter text-zinc-900 dark:text-white">
                Departments
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-lg max-w-md">
                Manage hospital departments and medical specialties
              </p>
            </div>
          </div>

          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Total Departments:{" "}
            <span className="font-semibold text-zinc-900 dark:text-white">
              {departments.length}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Add New Department - Prominent Card */}
          <div className="lg:col-span-5">
            <Card className="border-0 shadow-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-3xl overflow-hidden h-full">
              <CardHeader className="px-10 pt-10 pb-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      Add New Department
                    </CardTitle>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
                      Create a new medical department or specialty
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-10 pb-10">
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    await createDepartmentAction(formData);
                  }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-zinc-700 dark:text-zinc-300 font-medium"
                    >
                      Department Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g. Cardiology, Neurology, Pediatrics"
                      required
                      className="h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 focus-visible:border-blue-600 focus-visible:ring-blue-600/30 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-zinc-700 dark:text-zinc-300 font-medium"
                    >
                      Description{" "}
                      <span className="text-xs text-zinc-500 font-normal">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="description"
                      name="description"
                      placeholder="Brief description of the department"
                      className="h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 focus-visible:border-blue-600 focus-visible:ring-blue-600/30 text-base"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 transition-all shadow-lg shadow-blue-500/25 active:scale-[0.985]"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Department
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Departments List */}
          <div className="lg:col-span-7">
            <Card className="border-0 shadow-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-3xl overflow-hidden">
              <CardHeader className="px-10 pt-10 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <CardTitle className="flex items-center justify-between text-2xl">
                  All Departments
                  <span className="text-base font-normal text-zinc-500 dark:text-zinc-400">
                    ({departments.length})
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-10">
                {departments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <AlertCircle className="h-16 w-16 text-zinc-400 mb-6" />
                    <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                      No departments yet
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-3 max-w-sm">
                      Start by adding your first department using the form on
                      the left.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {departments.map((dept: any) => (
                      <div
                        key={dept.id}
                        className="group flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 p-7 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all duration-200"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-xl text-zinc-900 dark:text-white tracking-tight">
                            {dept.name}
                          </h3>
                          {dept.description && (
                            <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-[15px] line-clamp-2">
                              {dept.description}
                            </p>
                          )}
                        </div>

                        {/* Delete Button */}
                        <form
                          action={async () => {
                            "use server";
                            await deleteDepartmentAction(dept.id);
                          }}
                          className="ml-6 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Helpful Note */}
        <div className="text-center text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          Departments help organize doctors and services. Once created, you can
          assign doctors to specific departments.
        </div>
      </div>
    </div>
  );
}
