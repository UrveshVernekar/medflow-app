import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserCheck } from "lucide-react";
import GlobalPatientsList from "./GlobalPatientsList";

export default async function AdminPatientsPage() {
  const session = await auth();

  if (session?.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-zinc-50 to-teal-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <UserCheck className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tighter text-zinc-900 dark:text-white">
                Global Patient Registry
              </h1>

              <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-lg max-w-md">
                System-wide database of all registered EMR patients.
              </p>
            </div>
          </div>
        </div>

        {/* The Client Registry rendering here */}
        <GlobalPatientsList />

      </div>
    </div>
  );
}
