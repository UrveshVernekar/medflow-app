import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/sidebar";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role as "admin" | "doctor" | "patient";
  const displayName = session.user.name || (role === "doctor" ? "Doctor" : role === "admin" ? "Admin" : "Patient");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar with User Profile context */}
      <AppSidebar role={role} user={session.user} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar displaying current logged in user */}
        <header className="h-16 border-b border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl flex items-center justify-between px-6 lg:px-10 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest hidden sm:inline">
              MedFlow EMR Network • Operational
            </span>
          </div>

          {/* User Account Quick Pill */}
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-sm group"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {displayName}
                </span>
                <Badge className="capitalize text-[10px] px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-none font-bold">
                  {role}
                </Badge>
              </div>
            </Link>
          </div>
        </header>

        {/* Scrollable Main View */}
        <main className="flex-1 overflow-auto p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
